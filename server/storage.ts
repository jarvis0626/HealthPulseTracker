import {
  users, type User, type InsertUser,
  healthData, type HealthData, type InsertHealthData,
  healthGoals, type HealthGoals, type InsertHealthGoals,
  predictions, type Prediction, type InsertPrediction,
  financialData, type FinancialData, type InsertFinancialData,
  financialGoals, type FinancialGoals, type InsertFinancialGoals,
  moodData, type MoodData, type InsertMoodData,
  prayerData, type PrayerData, type InsertPrayerData,
  behaviorPatterns, type BehaviorPatterns, type InsertBehaviorPatterns,
  connectedDevices, type ConnectedDevices, type InsertConnectedDevices
} from "@shared/schema";
import { db, eq, and, between, desc, logDbOperation } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store for authentication
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Health data methods
  getHealthData(userId: number, date?: Date): Promise<HealthData | undefined>;
  getHealthDataRange(userId: number, startDate: Date, endDate: Date): Promise<HealthData[]>;
  createHealthData(data: InsertHealthData): Promise<HealthData>;
  updateHealthData(id: number, data: Partial<InsertHealthData>): Promise<HealthData | undefined>;
  
  // Health goals methods
  getHealthGoals(userId: number): Promise<HealthGoals | undefined>;
  createHealthGoals(goals: InsertHealthGoals): Promise<HealthGoals>;
  updateHealthGoals(id: number, goals: Partial<InsertHealthGoals>): Promise<HealthGoals | undefined>;
  
  // Financial data methods
  getFinancialData(userId: number, startDate?: Date, endDate?: Date): Promise<FinancialData[]>;
  createFinancialData(data: InsertFinancialData): Promise<FinancialData>;
  getFinancialSummary(userId: number, period: 'day' | 'week' | 'month' | 'year'): Promise<any>;
  
  // Financial goals methods
  getFinancialGoals(userId: number): Promise<FinancialGoals[]>;
  createFinancialGoal(goal: InsertFinancialGoals): Promise<FinancialGoals>;
  updateFinancialGoal(id: number, goal: Partial<InsertFinancialGoals>): Promise<FinancialGoals | undefined>;
  
  // Mood data methods
  getMoodData(userId: number, date?: Date): Promise<MoodData | undefined>;
  getMoodDataRange(userId: number, startDate: Date, endDate: Date): Promise<MoodData[]>;
  createMoodData(data: InsertMoodData): Promise<MoodData>;
  
  // Prayer data methods
  getPrayerData(userId: number, date?: Date): Promise<PrayerData[]>;
  createPrayerData(data: InsertPrayerData): Promise<PrayerData>;
  updatePrayerData(id: number, data: Partial<InsertPrayerData>): Promise<PrayerData | undefined>;
  
  // Behavior patterns methods
  getBehaviorPatterns(userId: number, patternType?: string): Promise<BehaviorPatterns[]>;
  createBehaviorPattern(pattern: InsertBehaviorPatterns): Promise<BehaviorPatterns>;
  updateBehaviorPattern(id: number, pattern: Partial<InsertBehaviorPatterns>): Promise<BehaviorPatterns | undefined>;
  
  // Connected devices methods
  getConnectedDevices(userId: number): Promise<ConnectedDevices[]>;
  createConnectedDevice(device: InsertConnectedDevices): Promise<ConnectedDevices>;
  updateConnectedDevice(id: number, device: Partial<InsertConnectedDevices>): Promise<ConnectedDevices | undefined>;
  
  // Prediction methods
  getPredictions(userId: number, predictionType?: string): Promise<Prediction[]>;
  getPredictionsByDate(userId: number, date: Date): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  confirmPrediction(id: number): Promise<Prediction | undefined>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      logDbOperation('Error getting user', { id, error });
      throw error;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      logDbOperation('Error getting user by username', { username, error });
      throw error;
    }
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (error) {
      logDbOperation('Error creating user', { userData, error });
      throw error;
    }
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      logDbOperation('Error updating user', { id, userData, error });
      throw error;
    }
  }
  
  // Health data methods
  async getHealthData(userId: number, date?: Date): Promise<HealthData | undefined> {
    try {
      let query = db.select().from(healthData).where(eq(healthData.userId, userId));
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.where(
          between(healthData.date, startOfDay, endOfDay)
        );
      }
      
      const [data] = await query.orderBy(desc(healthData.date)).limit(1);
      return data;
    } catch (error) {
      logDbOperation('Error getting health data', { userId, date, error });
      throw error;
    }
  }
  
  async getHealthDataRange(userId: number, startDate: Date, endDate: Date): Promise<HealthData[]> {
    try {
      const data = await db
        .select()
        .from(healthData)
        .where(
          and(
            eq(healthData.userId, userId),
            between(healthData.date, startDate, endDate)
          )
        )
        .orderBy(healthData.date);
      return data;
    } catch (error) {
      logDbOperation('Error getting health data range', { userId, startDate, endDate, error });
      throw error;
    }
  }
  
  async createHealthData(data: InsertHealthData): Promise<HealthData> {
    try {
      const [healthDataItem] = await db.insert(healthData).values(data).returning();
      return healthDataItem;
    } catch (error) {
      logDbOperation('Error creating health data', { data, error });
      throw error;
    }
  }
  
  async updateHealthData(id: number, data: Partial<InsertHealthData>): Promise<HealthData | undefined> {
    try {
      const [updatedData] = await db
        .update(healthData)
        .set(data)
        .where(eq(healthData.id, id))
        .returning();
      return updatedData;
    } catch (error) {
      logDbOperation('Error updating health data', { id, data, error });
      throw error;
    }
  }
  
  // Health goals methods
  async getHealthGoals(userId: number): Promise<HealthGoals | undefined> {
    try {
      const [goals] = await db
        .select()
        .from(healthGoals)
        .where(eq(healthGoals.userId, userId));
      return goals;
    } catch (error) {
      logDbOperation('Error getting health goals', { userId, error });
      throw error;
    }
  }
  
  async createHealthGoals(goals: InsertHealthGoals): Promise<HealthGoals> {
    try {
      const [healthGoalsItem] = await db.insert(healthGoals).values(goals).returning();
      return healthGoalsItem;
    } catch (error) {
      logDbOperation('Error creating health goals', { goals, error });
      throw error;
    }
  }
  
  async updateHealthGoals(id: number, goals: Partial<InsertHealthGoals>): Promise<HealthGoals | undefined> {
    try {
      const [updatedGoals] = await db
        .update(healthGoals)
        .set(goals)
        .where(eq(healthGoals.id, id))
        .returning();
      return updatedGoals;
    } catch (error) {
      logDbOperation('Error updating health goals', { id, goals, error });
      throw error;
    }
  }
  
  // Financial data methods
  async getFinancialData(userId: number, startDate?: Date, endDate?: Date): Promise<FinancialData[]> {
    try {
      let query = db.select().from(financialData).where(eq(financialData.userId, userId));
      
      if (startDate && endDate) {
        query = query.where(
          between(financialData.date, startDate, endDate)
        );
      }
      
      const data = await query.orderBy(desc(financialData.date));
      return data;
    } catch (error) {
      logDbOperation('Error getting financial data', { userId, startDate, endDate, error });
      throw error;
    }
  }
  
  async createFinancialData(data: InsertFinancialData): Promise<FinancialData> {
    try {
      const [financialDataItem] = await db.insert(financialData).values(data).returning();
      return financialDataItem;
    } catch (error) {
      logDbOperation('Error creating financial data', { data, error });
      throw error;
    }
  }
  
  async getFinancialSummary(userId: number, period: 'day' | 'week' | 'month' | 'year'): Promise<any> {
    try {
      // In a real app, we'd use SQL aggregations here
      // For now, we'll compute the summary in application code
      const today = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'day':
          startDate = new Date(today);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(today);
          startDate.setMonth(today.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(today);
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      const transactions = await this.getFinancialData(userId, startDate, today);
      
      // Calculate totals
      let income = 0;
      let expenses = 0;
      const categories: Record<string, number> = {};
      
      for (const transaction of transactions) {
        if (transaction.isIncome) {
          income += Number(transaction.amount);
        } else {
          expenses += Number(transaction.amount);
          
          // Track expense by category
          if (transaction.category) {
            if (!categories[transaction.category]) {
              categories[transaction.category] = 0;
            }
            categories[transaction.category] += Number(transaction.amount);
          }
        }
      }
      
      return {
        period,
        income,
        expenses,
        net: income - expenses,
        categories,
        transactionCount: transactions.length
      };
    } catch (error) {
      logDbOperation('Error getting financial summary', { userId, period, error });
      throw error;
    }
  }
  
  // Financial goals methods
  async getFinancialGoals(userId: number): Promise<FinancialGoals[]> {
    try {
      const goals = await db
        .select()
        .from(financialGoals)
        .where(eq(financialGoals.userId, userId))
        .orderBy(financialGoals.priority);
      return goals;
    } catch (error) {
      logDbOperation('Error getting financial goals', { userId, error });
      throw error;
    }
  }
  
  async createFinancialGoal(goal: InsertFinancialGoals): Promise<FinancialGoals> {
    try {
      const [financialGoal] = await db.insert(financialGoals).values(goal).returning();
      return financialGoal;
    } catch (error) {
      logDbOperation('Error creating financial goal', { goal, error });
      throw error;
    }
  }
  
  async updateFinancialGoal(id: number, goal: Partial<InsertFinancialGoals>): Promise<FinancialGoals | undefined> {
    try {
      const [updatedGoal] = await db
        .update(financialGoals)
        .set(goal)
        .where(eq(financialGoals.id, id))
        .returning();
      return updatedGoal;
    } catch (error) {
      logDbOperation('Error updating financial goal', { id, goal, error });
      throw error;
    }
  }
  
  // Mood data methods
  async getMoodData(userId: number, date?: Date): Promise<MoodData | undefined> {
    try {
      let query = db.select().from(moodData).where(eq(moodData.userId, userId));
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.where(
          between(moodData.date, startOfDay, endOfDay)
        );
      }
      
      const [data] = await query.orderBy(desc(moodData.date)).limit(1);
      return data;
    } catch (error) {
      logDbOperation('Error getting mood data', { userId, date, error });
      throw error;
    }
  }
  
  async getMoodDataRange(userId: number, startDate: Date, endDate: Date): Promise<MoodData[]> {
    try {
      const data = await db
        .select()
        .from(moodData)
        .where(
          and(
            eq(moodData.userId, userId),
            between(moodData.date, startDate, endDate)
          )
        )
        .orderBy(moodData.date);
      return data;
    } catch (error) {
      logDbOperation('Error getting mood data range', { userId, startDate, endDate, error });
      throw error;
    }
  }
  
  async createMoodData(data: InsertMoodData): Promise<MoodData> {
    try {
      const [moodDataItem] = await db.insert(moodData).values(data).returning();
      return moodDataItem;
    } catch (error) {
      logDbOperation('Error creating mood data', { data, error });
      throw error;
    }
  }
  
  // Prayer data methods
  async getPrayerData(userId: number, date?: Date): Promise<PrayerData[]> {
    try {
      let query = db.select().from(prayerData).where(eq(prayerData.userId, userId));
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query.where(
          between(prayerData.date, startOfDay, endOfDay)
        );
      }
      
      const data = await query.orderBy(prayerData.scheduledTime);
      return data;
    } catch (error) {
      logDbOperation('Error getting prayer data', { userId, date, error });
      throw error;
    }
  }
  
  async createPrayerData(data: InsertPrayerData): Promise<PrayerData> {
    try {
      const [prayerDataItem] = await db.insert(prayerData).values(data).returning();
      return prayerDataItem;
    } catch (error) {
      logDbOperation('Error creating prayer data', { data, error });
      throw error;
    }
  }
  
  async updatePrayerData(id: number, data: Partial<InsertPrayerData>): Promise<PrayerData | undefined> {
    try {
      const [updatedData] = await db
        .update(prayerData)
        .set(data)
        .where(eq(prayerData.id, id))
        .returning();
      return updatedData;
    } catch (error) {
      logDbOperation('Error updating prayer data', { id, data, error });
      throw error;
    }
  }
  
  // Behavior patterns methods
  async getBehaviorPatterns(userId: number, patternType?: string): Promise<BehaviorPatterns[]> {
    try {
      let query = db.select().from(behaviorPatterns).where(eq(behaviorPatterns.userId, userId));
      
      if (patternType) {
        query = query.where(eq(behaviorPatterns.patternType, patternType));
      }
      
      const patterns = await query.orderBy(desc(behaviorPatterns.confidence));
      return patterns;
    } catch (error) {
      logDbOperation('Error getting behavior patterns', { userId, patternType, error });
      throw error;
    }
  }
  
  async createBehaviorPattern(pattern: InsertBehaviorPatterns): Promise<BehaviorPatterns> {
    try {
      const [behaviorPattern] = await db.insert(behaviorPatterns).values(pattern).returning();
      return behaviorPattern;
    } catch (error) {
      logDbOperation('Error creating behavior pattern', { pattern, error });
      throw error;
    }
  }
  
  async updateBehaviorPattern(id: number, pattern: Partial<InsertBehaviorPatterns>): Promise<BehaviorPatterns | undefined> {
    try {
      const [updatedPattern] = await db
        .update(behaviorPatterns)
        .set(pattern)
        .where(eq(behaviorPatterns.id, id))
        .returning();
      return updatedPattern;
    } catch (error) {
      logDbOperation('Error updating behavior pattern', { id, pattern, error });
      throw error;
    }
  }
  
  // Connected devices methods
  async getConnectedDevices(userId: number): Promise<ConnectedDevices[]> {
    try {
      const devices = await db
        .select()
        .from(connectedDevices)
        .where(eq(connectedDevices.userId, userId));
      return devices;
    } catch (error) {
      logDbOperation('Error getting connected devices', { userId, error });
      throw error;
    }
  }
  
  async createConnectedDevice(device: InsertConnectedDevices): Promise<ConnectedDevices> {
    try {
      const [connectedDevice] = await db.insert(connectedDevices).values(device).returning();
      return connectedDevice;
    } catch (error) {
      logDbOperation('Error creating connected device', { device, error });
      throw error;
    }
  }
  
  async updateConnectedDevice(id: number, device: Partial<InsertConnectedDevices>): Promise<ConnectedDevices | undefined> {
    try {
      const [updatedDevice] = await db
        .update(connectedDevices)
        .set(device)
        .where(eq(connectedDevices.id, id))
        .returning();
      return updatedDevice;
    } catch (error) {
      logDbOperation('Error updating connected device', { id, device, error });
      throw error;
    }
  }
  
  // Prediction methods
  async getPredictions(userId: number, predictionType?: string): Promise<Prediction[]> {
    try {
      let query = db.select().from(predictions).where(eq(predictions.userId, userId));
      
      if (predictionType) {
        query = query.where(eq(predictions.predictionType, predictionType));
      }
      
      const userPredictions = await query.orderBy(desc(predictions.date));
      return userPredictions;
    } catch (error) {
      logDbOperation('Error getting predictions', { userId, predictionType, error });
      throw error;
    }
  }
  
  async getPredictionsByDate(userId: number, date: Date): Promise<Prediction[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const userPredictions = await db
        .select()
        .from(predictions)
        .where(
          and(
            eq(predictions.userId, userId),
            between(predictions.date, startOfDay, endOfDay)
          )
        )
        .orderBy(predictions.date);
      
      return userPredictions;
    } catch (error) {
      logDbOperation('Error getting predictions by date', { userId, date, error });
      throw error;
    }
  }
  
  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    try {
      const [newPrediction] = await db.insert(predictions).values(prediction).returning();
      return newPrediction;
    } catch (error) {
      logDbOperation('Error creating prediction', { prediction, error });
      throw error;
    }
  }
  
  async confirmPrediction(id: number): Promise<Prediction | undefined> {
    try {
      const [updatedPrediction] = await db
        .update(predictions)
        .set({ confirmed: true })
        .where(eq(predictions.id, id))
        .returning();
      return updatedPrediction;
    } catch (error) {
      logDbOperation('Error confirming prediction', { id, error });
      throw error;
    }
  }
}

// Create a temporary in-memory storage for development until the DB is fully set up
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private healthData: Map<number, HealthData>;
  private healthGoals: Map<number, HealthGoals>;
  private predictions: Map<number, Prediction>;
  private sessionStore: session.SessionStore;
  
  currentUserId: number;
  currentHealthDataId: number;
  currentHealthGoalsId: number;
  currentPredictionId: number;

  constructor() {
    this.users = new Map();
    this.healthData = new Map();
    this.healthGoals = new Map();
    this.predictions = new Map();
    this.sessionStore = new session.MemoryStore();
    
    this.currentUserId = 1;
    this.currentHealthDataId = 1;
    this.currentHealthGoalsId = 1;
    this.currentPredictionId = 1;
    
    // Initialize with a demo user
    this.createUser({
      username: "johndoe",
      password: "password123",
      fullName: "John Doe",
      email: "john.doe@example.com",
      age: 32,
      height: 180,
      weight: 79,
      bloodType: "A+"
    });
    
    this.createHealthGoals({
      userId: 1,
      dailySteps: 10000,
      weeklyWorkouts: 4,
      sleepQuality: 85
    });
    
    // Add demo health data
    const today = new Date();
    
    this.createHealthData({
      userId: 1,
      date: today,
      steps: 8254,
      calories: 425,
      heartRate: 72,
      activeMinutes: 120,
      sleepDuration: 7.2,
      sleepQuality: 76,
      deepSleep: 1.7,
      activityTypes: {
        walking: 45,
        running: 25,
        cycling: 20,
        other: 10
      },
      heartRateZones: {
        resting: 120,
        fatBurn: 35,
        cardio: 18,
        peak: 5
      }
    });
    
    // Add a prediction
    this.createPrediction({
      userId: 1,
      date: today,
      predictionType: "activity",
      category: "exercise",
      predictedValue: "Evening Run at 6:30 PM",
      confidence: 89,
      details: "Your past 14 evening routines suggest high likelihood",
      factors: ["past routine", "weather", "calendar"],
      impact: "positive",
      recommendations: ["Prepare your running shoes", "Stay hydrated"],
      confirmed: false
    });
    
    this.createPrediction({
      userId: 1,
      date: today,
      predictionType: "sleep",
      category: "rest",
      predictedValue: "Sleep at 11:15 PM",
      confidence: 72,
      details: "Your past week's sleep pattern suggests this is optimal",
      factors: ["past sleep patterns", "screen time", "activity level"],
      impact: "positive",
      recommendations: ["Avoid caffeine after 3pm", "Reduce screen time before bed"],
      confirmed: false
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Health data methods
  async getHealthData(userId: number, date?: Date): Promise<HealthData | undefined> {
    if (!date) {
      // Return the most recent health data for the user
      const userHealthData = Array.from(this.healthData.values())
        .filter(data => data.userId === userId)
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      return userHealthData[0];
    }
    
    const dateStr = date.toDateString();
    return Array.from(this.healthData.values()).find(
      (data) => data.userId === userId && data.date.toDateString() === dateStr
    );
  }
  
  async getHealthDataRange(userId: number, startDate: Date, endDate: Date): Promise<HealthData[]> {
    return Array.from(this.healthData.values()).filter(
      (data) => data.userId === userId && 
                data.date >= startDate && 
                data.date <= endDate
    );
  }
  
  async createHealthData(data: InsertHealthData): Promise<HealthData> {
    const id = this.currentHealthDataId++;
    const healthData: HealthData = { ...data, id };
    this.healthData.set(id, healthData);
    return healthData;
  }
  
  async updateHealthData(id: number, data: Partial<InsertHealthData>): Promise<HealthData | undefined> {
    const existingData = this.healthData.get(id);
    if (!existingData) return undefined;
    
    const updatedData: HealthData = { ...existingData, ...data };
    this.healthData.set(id, updatedData);
    return updatedData;
  }
  
  // Health goals methods
  async getHealthGoals(userId: number): Promise<HealthGoals | undefined> {
    return Array.from(this.healthGoals.values()).find(
      (goals) => goals.userId === userId
    );
  }
  
  async createHealthGoals(goals: InsertHealthGoals): Promise<HealthGoals> {
    const id = this.currentHealthGoalsId++;
    const healthGoals: HealthGoals = { ...goals, id };
    this.healthGoals.set(id, healthGoals);
    return healthGoals;
  }
  
  async updateHealthGoals(id: number, goals: Partial<InsertHealthGoals>): Promise<HealthGoals | undefined> {
    const existingGoals = this.healthGoals.get(id);
    if (!existingGoals) return undefined;
    
    const updatedGoals: HealthGoals = { ...existingGoals, ...goals };
    this.healthGoals.set(id, updatedGoals);
    return updatedGoals;
  }
  
  // Simplified implementations for new methods (in-memory only)
  async getFinancialData(): Promise<FinancialData[]> { return []; }
  async createFinancialData(data: any): Promise<FinancialData> { return data as any; }
  async getFinancialSummary(): Promise<any> { return {}; }
  async getFinancialGoals(): Promise<FinancialGoals[]> { return []; }
  async createFinancialGoal(goal: any): Promise<FinancialGoals> { return goal as any; }
  async updateFinancialGoal(): Promise<FinancialGoals | undefined> { return undefined; }
  async getMoodData(): Promise<MoodData | undefined> { return undefined; }
  async getMoodDataRange(): Promise<MoodData[]> { return []; }
  async createMoodData(data: any): Promise<MoodData> { return data as any; }
  async getPrayerData(): Promise<PrayerData[]> { return []; }
  async createPrayerData(data: any): Promise<PrayerData> { return data as any; }
  async updatePrayerData(): Promise<PrayerData | undefined> { return undefined; }
  async getBehaviorPatterns(): Promise<BehaviorPatterns[]> { return []; }
  async createBehaviorPattern(pattern: any): Promise<BehaviorPatterns> { return pattern as any; }
  async updateBehaviorPattern(): Promise<BehaviorPatterns | undefined> { return undefined; }
  async getConnectedDevices(): Promise<ConnectedDevices[]> { return []; }
  async createConnectedDevice(device: any): Promise<ConnectedDevices> { return device as any; }
  async updateConnectedDevice(): Promise<ConnectedDevices | undefined> { return undefined; }
  
  // Prediction methods
  async getPredictions(userId: number, predictionType?: string): Promise<Prediction[]> {
    let predictions = Array.from(this.predictions.values()).filter(
      (prediction) => prediction.userId === userId
    );
    
    if (predictionType) {
      predictions = predictions.filter(p => p.predictionType === predictionType);
    }
    
    return predictions;
  }
  
  async getPredictionsByDate(userId: number, date: Date): Promise<Prediction[]> {
    const dateStr = date.toDateString();
    return Array.from(this.predictions.values()).filter(
      (prediction) => prediction.userId === userId && 
                      prediction.date.toDateString() === dateStr
    );
  }
  
  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const newPrediction: Prediction = { ...prediction, id };
    this.predictions.set(id, newPrediction);
    return newPrediction;
  }
  
  async confirmPrediction(id: number): Promise<Prediction | undefined> {
    const prediction = this.predictions.get(id);
    if (!prediction) return undefined;
    
    const updatedPrediction: Prediction = { ...prediction, confirmed: true };
    this.predictions.set(id, updatedPrediction);
    return updatedPrediction;
  }
}

// Use DatabaseStorage in production, MemStorage for development/testing
export const storage = new DatabaseStorage();
