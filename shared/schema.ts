import { pgTable, text, serial, integer, timestamp, real, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  age: integer("age"),
  height: real("height"),
  weight: real("weight"),
  bloodType: text("blood_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthData = pgTable("health_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  steps: integer("steps"),
  calories: integer("calories"),
  heartRate: integer("heart_rate"),
  activeMinutes: integer("active_minutes"),
  sleepDuration: real("sleep_duration"),
  sleepQuality: integer("sleep_quality"),
  deepSleep: real("deep_sleep"),
  activityTypes: json("activity_types").$type<{
    walking: number,
    running: number,
    cycling: number,
    other: number
  }>(),
  heartRateZones: json("heart_rate_zones").$type<{
    resting: number,
    fatBurn: number,
    cardio: number,
    peak: number
  }>(),
});

export const healthGoals = pgTable("health_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dailySteps: integer("daily_steps"),
  weeklyWorkouts: integer("weekly_workouts"),
  sleepQuality: integer("sleep_quality"),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  activityType: text("activity_type").notNull(),
  predictedTime: text("predicted_time"),
  confidence: integer("confidence"),
  details: text("details"),
  confirmed: boolean("confirmed").default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertHealthDataSchema = createInsertSchema(healthData).omit({
  id: true,
});

export const insertHealthGoalsSchema = createInsertSchema(healthGoals).omit({
  id: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHealthData = z.infer<typeof insertHealthDataSchema>;
export type HealthData = typeof healthData.$inferSelect;

export type InsertHealthGoals = z.infer<typeof insertHealthGoalsSchema>;
export type HealthGoals = typeof healthGoals.$inferSelect;

export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;
