import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertHealthDataSchema, 
  insertHealthGoalsSchema, 
  insertPredictionSchema 
} from "@shared/schema";
import { createPredictionModel, predictNextActivity, determineActivityType } from "./prediction";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app;
  
  // User routes
  apiRouter.get("/api/user/:id", async (req: Request, res: Response) => {
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
  });
  
  apiRouter.post("/api/user", async (req: Request, res: Response) => {
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
  });
  
  // Health data routes
  apiRouter.get("/api/health-data/:userId", async (req: Request, res: Response) => {
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
      // Return today's data
      const today = new Date();
      const data = await storage.getHealthData(userId, today);
      
      if (!data) {
        return res.status(404).json({ message: "Health data not found" });
      }
      
      res.json(data);
    }
  });
  
  apiRouter.post("/api/health-data", async (req: Request, res: Response) => {
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
  });
  
  // Health goals routes
  apiRouter.get("/api/health-goals/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const goals = await storage.getHealthGoals(userId);
    if (!goals) {
      return res.status(404).json({ message: "Health goals not found" });
    }
    
    res.json(goals);
  });
  
  apiRouter.post("/api/health-goals", async (req: Request, res: Response) => {
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
  });
  
  apiRouter.put("/api/health-goals/:id", async (req: Request, res: Response) => {
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
  });
  
  // Prediction routes
  apiRouter.get("/api/predictions/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    
    try {
      const predictions = await storage.getPredictionsByDate(userId, date);
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get predictions" });
    }
  });
  
  apiRouter.post("/api/generate-predictions/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // Get last 7 days of health data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const healthData = await storage.getHealthDataRange(userId, startDate, endDate);
      
      if (healthData.length === 0) {
        return res.status(404).json({ message: "No health data available for prediction" });
      }
      
      // Create and train model
      const model = await createPredictionModel(healthData);
      
      // Make prediction using the latest data
      const latestData = healthData[healthData.length - 1];
      const prediction = await predictNextActivity(model, latestData);
      
      // Determine activity type
      const { activityType, predictedTime } = determineActivityType(latestData);
      
      // Create prediction record
      const newPrediction = await storage.createPrediction({
        userId,
        date: new Date(),
        activityType,
        predictedTime,
        confidence: prediction.confidence,
        details: `Based on your activity patterns over the last ${healthData.length} days`,
        confirmed: false
      });
      
      res.json(newPrediction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to generate prediction" });
    }
  });
  
  apiRouter.post("/api/predictions/:id/confirm", async (req: Request, res: Response) => {
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
  });

  const httpServer = createServer(app);
  return httpServer;
}
