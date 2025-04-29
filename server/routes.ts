import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertHealthDataSchema, 
  insertHealthGoalsSchema, 
  insertPredictionSchema,
  insertFinancialDataSchema,
  insertFinancialGoalsSchema,
  insertMoodDataSchema,
  insertPrayerDataSchema,
  insertBehaviorPatternsSchema,
  insertConnectedDevicesSchema
} from "@shared/schema";
import {
  identifyBehaviorPatterns,
  generatePredictions,
  predictWithML,
  PatternType,
  PredictionType
} from "./behavioral-analysis";
import { setupAuth } from "./auth";
import { registerTriggerRoutes } from "./trigger";

// Error handler for async functions
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Register trigger routes for manual operations
  registerTriggerRoutes(app);
  
  // API routes
  const apiRouter = app;
  
  // User routes
  apiRouter.get("/api/user/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }));
  
  apiRouter.post("/api/user", asyncHandler(async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  }));
  
  apiRouter.put("/api/user/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Don't allow password updates through this endpoint
    const { password, ...updateData } = req.body;
    
    try {
      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password: pwd, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  }));
  
  // Health data routes
  apiRouter.get("/api/health-data/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const { startDate, endDate } = req.query;
    
    if (startDate && endDate) {
      try {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        const data = await storage.getHealthDataRange(userId, start, end);
        res.json(data);
      } catch (error) {
        res.status(400).json({ message: "Invalid date format" });
      }
    } else {
      // Return most recent data
      const data = await storage.getHealthData(userId);
      
      if (!data) {
        return res.status(404).json({ message: "Health data not found" });
      }
      
      res.json(data);
    }
  }));
  
  apiRouter.post("/api/health-data", asyncHandler(async (req: Request, res: Response) => {
    try {
      const healthData = insertHealthDataSchema.parse(req.body);
      const data = await storage.createHealthData(healthData);
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create health data" });
    }
  }));
  
  apiRouter.put("/api/health-data/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid health data ID" });
    }
    
    try {
      const updatedData = await storage.updateHealthData(id, req.body);
      if (!updatedData) {
        return res.status(404).json({ message: "Health data not found" });
      }
      
      res.json(updatedData);
    } catch (error) {
      res.status(500).json({ message: "Failed to update health data" });
    }
  }));
  
  // Health goals routes
  apiRouter.get("/api/health-goals/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const goals = await storage.getHealthGoals(userId);
    if (!goals) {
      return res.status(404).json({ message: "Health goals not found" });
    }
    
    res.json(goals);
  }));
  
  apiRouter.post("/api/health-goals", asyncHandler(async (req: Request, res: Response) => {
    try {
      const healthGoals = insertHealthGoalsSchema.parse(req.body);
      const goals = await storage.createHealthGoals(healthGoals);
      res.status(201).json(goals);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create health goals" });
    }
  }));
  
  apiRouter.put("/api/health-goals/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid goals ID" });
    }
    
    try {
      const updatedGoals = await storage.updateHealthGoals(id, req.body);
      if (!updatedGoals) {
        return res.status(404).json({ message: "Health goals not found" });
      }
      
      res.json(updatedGoals);
    } catch (error) {
      res.status(500).json({ message: "Failed to update health goals" });
    }
  }));
  
  // Financial data routes
  apiRouter.get("/api/financial-data/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    try {
      const financialData = await storage.getFinancialData(userId, startDate, endDate);
      res.json(financialData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get financial data" });
    }
  }));
  
  apiRouter.post("/api/financial-data", asyncHandler(async (req: Request, res: Response) => {
    try {
      const financialData = insertFinancialDataSchema.parse(req.body);
      const data = await storage.createFinancialData(financialData);
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create financial data" });
    }
  }));
  
  apiRouter.get("/api/financial-summary/:userId/:period", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const period = req.params.period as 'day' | 'week' | 'month' | 'year';
    if (!['day', 'week', 'month', 'year'].includes(period)) {
      return res.status(400).json({ message: "Invalid period. Use 'day', 'week', 'month', or 'year'" });
    }
    
    try {
      const summary = await storage.getFinancialSummary(userId, period);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to get financial summary" });
    }
  }));
  
  // Financial goals routes
  apiRouter.get("/api/financial-goals/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const goals = await storage.getFinancialGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get financial goals" });
    }
  }));
  
  apiRouter.post("/api/financial-goals", asyncHandler(async (req: Request, res: Response) => {
    try {
      const financialGoals = insertFinancialGoalsSchema.parse(req.body);
      const goal = await storage.createFinancialGoal(financialGoals);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create financial goal" });
    }
  }));
  
  // Mood data routes
  apiRouter.get("/api/mood-data/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    
    try {
      const moodData = await storage.getMoodData(userId, date);
      
      if (!moodData) {
        return res.status(404).json({ message: "Mood data not found" });
      }
      
      res.json(moodData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mood data" });
    }
  }));
  
  apiRouter.get("/api/mood-data/:userId/range", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const startDateParam = req.query.startDate as string;
    const endDateParam = req.query.endDate as string;
    
    if (!startDateParam || !endDateParam) {
      return res.status(400).json({ message: "startDate and endDate query parameters are required" });
    }
    
    try {
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);
      
      const moodData = await storage.getMoodDataRange(userId, startDate, endDate);
      res.json(moodData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mood data range" });
    }
  }));
  
  apiRouter.post("/api/mood-data", asyncHandler(async (req: Request, res: Response) => {
    try {
      const moodData = insertMoodDataSchema.parse(req.body);
      const data = await storage.createMoodData(moodData);
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create mood data" });
    }
  }));
  
  // Prayer data routes
  apiRouter.get("/api/prayer-data/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    
    try {
      const prayerData = await storage.getPrayerData(userId, date);
      res.json(prayerData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get prayer data" });
    }
  }));
  
  apiRouter.post("/api/prayer-data", asyncHandler(async (req: Request, res: Response) => {
    try {
      const prayerData = insertPrayerDataSchema.parse(req.body);
      const data = await storage.createPrayerData(prayerData);
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create prayer data" });
    }
  }));
  
  apiRouter.put("/api/prayer-data/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prayer data ID" });
    }
    
    try {
      const updatedPrayerData = await storage.updatePrayerData(id, req.body);
      
      if (!updatedPrayerData) {
        return res.status(404).json({ message: "Prayer data not found" });
      }
      
      res.json(updatedPrayerData);
    } catch (error) {
      res.status(500).json({ message: "Failed to update prayer data" });
    }
  }));
  
  // Behavior patterns routes
  apiRouter.get("/api/behavior-patterns/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const patternType = req.query.type as string | undefined;
    
    try {
      const patterns = await storage.getBehaviorPatterns(userId, patternType);
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ message: "Failed to get behavior patterns" });
    }
  }));
  
  apiRouter.post("/api/behavior-patterns/analyze/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // Run behavior pattern analysis
      const patterns = await identifyBehaviorPatterns(userId);
      res.json({ success: true, patternCount: patterns.length, patterns });
    } catch (error) {
      console.error("Error analyzing behavior patterns:", error);
      res.status(500).json({ message: "Failed to analyze behavior patterns" });
    }
  }));
  
  // Connected devices routes
  apiRouter.get("/api/devices/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const devices = await storage.getConnectedDevices(userId);
      res.json(devices);
    } catch (error) {
      res.status(500).json({ message: "Failed to get connected devices" });
    }
  }));
  
  apiRouter.post("/api/devices", asyncHandler(async (req: Request, res: Response) => {
    try {
      const deviceData = insertConnectedDevicesSchema.parse(req.body);
      const device = await storage.createConnectedDevice(deviceData);
      res.status(201).json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create connected device" });
    }
  }));
  
  // Prediction routes
  apiRouter.get("/api/predictions/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const predictionType = req.query.type as string | undefined;
    
    try {
      // If date is provided, get predictions for that date
      if (req.query.date) {
        const predictions = await storage.getPredictionsByDate(userId, date!);
        return res.json(predictions);
      }
      
      // Otherwise return predictions filtered by type if provided
      const predictions = await storage.getPredictions(userId, predictionType);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get predictions" });
    }
  }));
  
  apiRouter.post("/api/generate-predictions/:userId", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // Generate predictions using behavioral analysis
      const predictions = await generatePredictions(userId);
      
      if (!predictions || predictions.length === 0) {
        return res.status(404).json({
          message: "Could not generate predictions. Not enough data available.",
          success: false
        });
      }
      
      res.status(201).json({
        success: true,
        count: predictions.length,
        predictions
      });
    } catch (error) {
      console.error("Error generating predictions:", error);
      res.status(500).json({ message: "Failed to generate predictions" });
    }
  }));
  
  apiRouter.post("/api/predict/:userId/:dataType", asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const dataType = req.params.dataType;
    if (!['activity', 'sleep', 'mood', 'financial'].includes(dataType)) {
      return res.status(400).json({ message: "Invalid prediction data type" });
    }
    
    try {
      // Use ML to make a specific prediction
      const prediction = await predictWithML(userId, dataType);
      res.json(prediction);
    } catch (error) {
      console.error("Error making ML prediction:", error);
      res.status(500).json({ message: "Failed to generate ML prediction" });
    }
  }));
  
  apiRouter.post("/api/predictions/:id/confirm", asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid prediction ID" });
    }
    
    try {
      const confirmedPrediction = await storage.confirmPrediction(id);
      if (!confirmedPrediction) {
        return res.status(404).json({ message: "Prediction not found" });
      }
      
      res.json(confirmedPrediction);
    } catch (error) {
      res.status(500).json({ message: "Failed to confirm prediction" });
    }
  }));

  // Error handling middleware (should be at the end)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  });

  const httpServer = createServer(app);
  return httpServer;
}
