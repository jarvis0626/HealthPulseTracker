import { 
  users, type User, type InsertUser,
  healthData, type HealthData, type InsertHealthData,
  healthGoals, type HealthGoals, type InsertHealthGoals,
  predictions, type Prediction, type InsertPrediction
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Health data methods
  getHealthData(userId: number, date: Date): Promise<HealthData | undefined>;
  getHealthDataRange(userId: number, startDate: Date, endDate: Date): Promise<HealthData[]>;
  createHealthData(data: InsertHealthData): Promise<HealthData>;
  
  // Health goals methods
  getHealthGoals(userId: number): Promise<HealthGoals | undefined>;
  createHealthGoals(goals: InsertHealthGoals): Promise<HealthGoals>;
  updateHealthGoals(id: number, goals: Partial<InsertHealthGoals>): Promise<HealthGoals | undefined>;
  
  // Prediction methods
  getPredictions(userId: number): Promise<Prediction[]>;
  getPredictionsByDate(userId: number, date: Date): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  confirmPrediction(id: number): Promise<Prediction | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private healthData: Map<number, HealthData>;
  private healthGoals: Map<number, HealthGoals>;
  private predictions: Map<number, Prediction>;
  
  currentUserId: number;
  currentHealthDataId: number;
  currentHealthGoalsId: number;
  currentPredictionId: number;

  constructor() {
    this.users = new Map();
    this.healthData = new Map();
    this.healthGoals = new Map();
    this.predictions = new Map();
    
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
      activityType: "Evening Run",
      predictedTime: "6:30 PM",
      confidence: 89,
      details: "Your past 14 evening routines",
      confirmed: false
    });
    
    this.createPrediction({
      userId: 1,
      date: today,
      activityType: "Sleep Schedule",
      predictedTime: "11:15 PM",
      confidence: 72,
      details: "Your past week's sleep pattern",
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
  
  // Health data methods
  async getHealthData(userId: number, date: Date): Promise<HealthData | undefined> {
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
  
  // Prediction methods
  async getPredictions(userId: number): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(
      (prediction) => prediction.userId === userId
    );
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

export const storage = new MemStorage();
