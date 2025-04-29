import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { eq, and, or, not, like, between, gt, gte, lt, lte, isNull, isNotNull, desc, asc } from 'drizzle-orm';

// Configure Neon to work with WebSockets
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a Drizzle client
export const db = drizzle({ client: pool, schema });

// Simple logging wrapper for database operations
export const logDbOperation = (operation: string, details?: any) => {
  console.log(`[DB] ${operation}${details ? ': ' + JSON.stringify(details) : ''}`);
};

// Utilities for common database operations
export const dbUtils = {
  async findById<T>(table: any, id: number): Promise<T | undefined> {
    try {
      const [result] = await db.select().from(table).where(eq(table.id, id));
      return result as T;
    } catch (error) {
      logDbOperation(`Error finding by ID ${id}`, error);
      throw error;
    }
  },
  
  async findByUserId<T>(table: any, userId: number): Promise<T[]> {
    try {
      const results = await db.select().from(table).where(eq(table.userId, userId));
      return results as T[];
    } catch (error) {
      logDbOperation(`Error finding by user ID ${userId}`, error);
      throw error;
    }
  }
};

// Export operators from drizzle-orm
export { eq, and, or, not, like, between, gt, gte, lt, lte, isNull, isNotNull, desc, asc };