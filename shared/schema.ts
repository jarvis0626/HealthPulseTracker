import { pgTable, text, serial, integer, timestamp, real, json, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  profileImage: text("profile_image"),
});

export const usersRelations = relations(users, ({ many }) => ({
  healthData: many(healthData),
  healthGoals: many(healthGoals),
  predictions: many(predictions),
  financialData: many(financialData),
  moodData: many(moodData),
  prayerData: many(prayerData),
  behaviorPatterns: many(behaviorPatterns),
  devices: many(connectedDevices),
}));

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
  stressLevel: integer("stress_level"),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  oxygenSaturation: integer("oxygen_saturation"),
  hydrationLevel: real("hydration_level"),
  activityTypes: json("activity_types").$type<{
    walking: number,
    running: number,
    cycling: number,
    yoga: number,
    meditation: number,
    weightLifting: number,
    other: number
  }>(),
  heartRateZones: json("heart_rate_zones").$type<{
    resting: number,
    fatBurn: number,
    cardio: number,
    peak: number
  }>(),
  nutritionData: json("nutrition_data").$type<{
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
    fiber: number,
    sugar: number,
    waterIntake: number
  }>(),
});

export const healthDataRelations = relations(healthData, ({ one }) => ({
  user: one(users, {
    fields: [healthData.userId],
    references: [users.id],
  }),
}));

export const healthGoals = pgTable("health_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  dailySteps: integer("daily_steps"),
  weeklyWorkouts: integer("weekly_workouts"),
  sleepQuality: integer("sleep_quality"),
  targetWeight: real("target_weight"),
  targetCalories: integer("target_calories"),
  targetWaterIntake: real("target_water_intake"),
  targetProtein: real("target_protein"),
  targetFat: real("target_fat"),
  targetCarbs: real("target_carbs"),
  targetStressLevel: integer("target_stress_level"),
  targetActivityMinutes: integer("target_activity_minutes"),
});

export const healthGoalsRelations = relations(healthGoals, ({ one }) => ({
  user: one(users, {
    fields: [healthGoals.userId],
    references: [users.id],
  }),
}));

export const financialData = pgTable("financial_data", {
  id: serial("id").primaryKey(), 
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  isIncome: boolean("is_income").default(false),
  transactionType: text("transaction_type"),
  merchant: text("merchant"),
  recurringType: text("recurring_type"),
  budgetCategory: text("budget_category"),
});

export const financialDataRelations = relations(financialData, ({ one }) => ({
  user: one(users, {
    fields: [financialData.userId],
    references: [users.id],
  }),
}));

export const financialGoals = pgTable("financial_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  deadline: timestamp("deadline"),
  category: text("category"),
  priority: integer("priority"),
  notes: text("notes"),
  isCompleted: boolean("is_completed").default(false),
});

export const financialGoalsRelations = relations(financialGoals, ({ one }) => ({
  user: one(users, {
    fields: [financialGoals.userId],
    references: [users.id],
  }),
}));

export const moodData = pgTable("mood_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  moodScore: integer("mood_score").notNull(),
  energyLevel: integer("energy_level"),
  anxietyLevel: integer("anxiety_level"),
  stressLevel: integer("stress_level"),
  notes: text("notes"),
  activities: json("activities").$type<string[]>(),
  triggers: json("triggers").$type<string[]>(),
  copingMechanisms: json("coping_mechanisms").$type<string[]>(),
});

export const moodDataRelations = relations(moodData, ({ one }) => ({
  user: one(users, {
    fields: [moodData.userId],
    references: [users.id],
  }),
}));

export const prayerData = pgTable("prayer_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  prayerType: text("prayer_type").notNull(),
  completed: boolean("completed").default(false),
  scheduledTime: timestamp("scheduled_time"),
  completedTime: timestamp("completed_time"),
  duration: integer("duration"),
  location: text("location"),
  notes: text("notes"),
});

export const prayerDataRelations = relations(prayerData, ({ one }) => ({
  user: one(users, {
    fields: [prayerData.userId],
    references: [users.id],
  }),
}));

export const behaviorPatterns = pgTable("behavior_patterns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  patternType: text("pattern_type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  confidence: integer("confidence"),
  discoveryDate: timestamp("discovery_date").defaultNow(),
  frequency: text("frequency"),
  triggers: json("triggers").$type<string[]>(),
  impacts: json("impacts").$type<{
    health: number,
    finance: number,
    mood: number,
    productivity: number
  }>(),
  recommendations: json("recommendations").$type<string[]>(),
});

export const behaviorPatternsRelations = relations(behaviorPatterns, ({ one }) => ({
  user: one(users, {
    fields: [behaviorPatterns.userId],
    references: [users.id],
  }),
}));

export const connectedDevices = pgTable("connected_devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  deviceType: text("device_type").notNull(),
  deviceName: text("device_name").notNull(),
  deviceId: text("device_id").notNull(),
  lastSyncTime: timestamp("last_sync_time"),
  batteryLevel: integer("battery_level"),
  isActive: boolean("is_active").default(true),
  settings: json("settings"),
});

export const connectedDevicesRelations = relations(connectedDevices, ({ one }) => ({
  user: one(users, {
    fields: [connectedDevices.userId],
    references: [users.id],
  }),
}));

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  predictionType: text("prediction_type").notNull(),
  category: text("category").notNull(),
  predictedValue: text("predicted_value"),
  actualValue: text("actual_value"),
  confidence: integer("confidence"),
  factors: json("factors").$type<string[]>(),
  details: text("details"),
  confirmed: boolean("confirmed").default(false),
  impact: text("impact"),
  recommendations: json("recommendations").$type<string[]>(),
});

export const predictionsRelations = relations(predictions, ({ one }) => ({
  user: one(users, {
    fields: [predictions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
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

export const insertFinancialDataSchema = createInsertSchema(financialData).omit({
  id: true,
});

export const insertFinancialGoalsSchema = createInsertSchema(financialGoals).omit({
  id: true,
});

export const insertMoodDataSchema = createInsertSchema(moodData).omit({
  id: true,
});

export const insertPrayerDataSchema = createInsertSchema(prayerData).omit({
  id: true,
});

export const insertBehaviorPatternsSchema = createInsertSchema(behaviorPatterns).omit({
  id: true,
  discoveryDate: true,
});

export const insertConnectedDevicesSchema = createInsertSchema(connectedDevices).omit({
  id: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHealthData = z.infer<typeof insertHealthDataSchema>;
export type HealthData = typeof healthData.$inferSelect;

export type InsertHealthGoals = z.infer<typeof insertHealthGoalsSchema>;
export type HealthGoals = typeof healthGoals.$inferSelect;

export type InsertFinancialData = z.infer<typeof insertFinancialDataSchema>;
export type FinancialData = typeof financialData.$inferSelect;

export type InsertFinancialGoals = z.infer<typeof insertFinancialGoalsSchema>;
export type FinancialGoals = typeof financialGoals.$inferSelect;

export type InsertMoodData = z.infer<typeof insertMoodDataSchema>;
export type MoodData = typeof moodData.$inferSelect;

export type InsertPrayerData = z.infer<typeof insertPrayerDataSchema>;
export type PrayerData = typeof prayerData.$inferSelect;

export type InsertBehaviorPatterns = z.infer<typeof insertBehaviorPatternsSchema>;
export type BehaviorPatterns = typeof behaviorPatterns.$inferSelect;

export type InsertConnectedDevices = z.infer<typeof insertConnectedDevicesSchema>;
export type ConnectedDevices = typeof connectedDevices.$inferSelect;

export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictions.$inferSelect;
