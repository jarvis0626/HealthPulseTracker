import { Express, Request, Response } from "express";
import { identifyBehaviorPatterns, generatePredictions } from "./behavioral-analysis";
import { seedDatabase } from "./seed";
import { logDbOperation } from "./db";

// Register routes for manually triggering data operations
export function registerTriggerRoutes(app: Express) {
  
  // Route to trigger database seeding
  app.post("/api/trigger/seed", async (req: Request, res: Response) => {
    try {
      logDbOperation("Manually triggering database seed");
      await seedDatabase();
      res.status(200).json({ success: true, message: "Database seeded successfully" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ success: false, message: "Failed to seed database", error: (error as Error).message });
    }
  });
  
  // Route to trigger behavior analysis for a user
  app.post("/api/trigger/analyze/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }
      
      logDbOperation("Manually triggering behavior analysis", { userId });
      const patterns = await identifyBehaviorPatterns(userId);
      
      res.status(200).json({ 
        success: true, 
        message: "Behavior patterns analyzed successfully", 
        patternCount: patterns.length,
        patterns 
      });
    } catch (error) {
      console.error("Error analyzing behavior patterns:", error);
      res.status(500).json({ success: false, message: "Failed to analyze behavior patterns", error: (error as Error).message });
    }
  });
  
  // Route to trigger prediction generation for a user
  app.post("/api/trigger/predict/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }
      
      logDbOperation("Manually triggering prediction generation", { userId });
      const predictions = await generatePredictions(userId);
      
      res.status(200).json({ 
        success: true, 
        message: "Predictions generated successfully", 
        predictionCount: predictions.length,
        predictions 
      });
    } catch (error) {
      console.error("Error generating predictions:", error);
      res.status(500).json({ success: false, message: "Failed to generate predictions", error: (error as Error).message });
    }
  });
  
  // Route to trigger both analysis and prediction for a user
  app.post("/api/trigger/full-analysis/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ success: false, message: "Invalid user ID" });
      }
      
      logDbOperation("Manually triggering full analysis", { userId });
      
      // First analyze behavior patterns
      const patterns = await identifyBehaviorPatterns(userId);
      
      // Then generate predictions based on those patterns
      const predictions = await generatePredictions(userId);
      
      res.status(200).json({ 
        success: true, 
        message: "Full analysis completed successfully", 
        patternCount: patterns.length,
        predictionCount: predictions.length,
        patterns,
        predictions 
      });
    } catch (error) {
      console.error("Error performing full analysis:", error);
      res.status(500).json({ success: false, message: "Failed to perform full analysis", error: (error as Error).message });
    }
  });
}