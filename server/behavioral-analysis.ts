import * as tf from '@tensorflow/tfjs';
import { storage } from './storage';
import { HealthData, MoodData, FinancialData, PrayerData, BehaviorPatterns, Prediction, InsertPrediction } from '@shared/schema';
import { logDbOperation } from './db';

// Pattern types for behavior analysis
export enum PatternType {
  HEALTH = 'health',
  FINANCE = 'finance',
  MOOD = 'mood',
  PRAYER = 'prayer',
  SLEEP = 'sleep',
  ACTIVITY = 'activity',
  STRESS = 'stress',
  NUTRITION = 'nutrition',
  SPENDING = 'spending',
  SAVING = 'saving'
}

// Prediction types supported by the system
export enum PredictionType {
  ACTIVITY = 'activity',
  SLEEP = 'sleep',
  MOOD = 'mood',
  FINANCIAL = 'financial',
  PRAYER = 'prayer',
  STRESS = 'stress',
  HEALTH_RISK = 'health_risk'
}

// Feature engineering - extract relevant features from raw data
function extractFeatures(healthData: HealthData[], moodData: MoodData[], financialData: FinancialData[], prayerData: PrayerData[]) {
  // Sort data by date
  healthData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  moodData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  financialData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  prayerData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Extract time-based patterns
  const timePatterns = extractTimePatterns(healthData, prayerData);
  
  // Extract health patterns
  const healthPatterns = extractHealthPatterns(healthData);
  
  // Extract mood correlations
  const moodPatterns = extractMoodPatterns(moodData, healthData);
  
  // Extract financial patterns
  const financialPatterns = extractFinancialPatterns(financialData);
  
  // Extract spiritual/prayer patterns
  const prayerPatterns = extractPrayerPatterns(prayerData);
  
  return {
    timePatterns,
    healthPatterns,
    moodPatterns, 
    financialPatterns,
    prayerPatterns
  };
}

// Extract patterns related to timing of activities
function extractTimePatterns(healthData: HealthData[], prayerData: PrayerData[]) {
  // Default empty pattern object
  const patterns = {
    sleepTimes: [] as { day: string, time: string }[],
    activityTimes: [] as { day: string, type: string, time: string }[],
    prayerTimes: [] as { day: string, type: string, time: string }[],
    consistency: {
      sleep: 0,
      activity: 0,
      prayer: 0
    }
  };
  
  // With actual data, we would analyze timing patterns
  // For example, detecting when a user typically sleeps, exercises, or prays
  
  // Calculate consistency scores based on regularity of timing
  // Higher score means more consistent behavior
  
  return patterns;
}

// Extract patterns related to health activities
function extractHealthPatterns(healthData: HealthData[]) {
  if (!healthData.length) return {};
  
  // Calculate averages and trends
  const avgSteps = healthData.reduce((sum, data) => sum + (data.steps || 0), 0) / healthData.length;
  const avgHeartRate = healthData.reduce((sum, data) => sum + (data.heartRate || 0), 0) / healthData.length;
  const avgSleepDuration = healthData.reduce((sum, data) => sum + (data.sleepDuration || 0), 0) / healthData.length;
  const avgActiveMinutes = healthData.reduce((sum, data) => sum + (data.activeMinutes || 0), 0) / healthData.length;
  
  // Analyze trends
  const stepsChangeTrend = calculateTrend(healthData.map(d => d.steps || 0));
  const heartRateChangeTrend = calculateTrend(healthData.map(d => d.heartRate || 0));
  const sleepChangeTrend = calculateTrend(healthData.map(d => d.sleepDuration || 0));
  
  // Activity distribution (if available)
  const activityDistribution = healthData[0]?.activityTypes || {
    walking: 0,
    running: 0,
    cycling: 0,
    yoga: 0,
    meditation: 0,
    weightLifting: 0,
    other: 0
  };
  
  return {
    avgSteps,
    avgHeartRate,
    avgSleepDuration,
    avgActiveMinutes,
    stepsChangeTrend,
    heartRateChangeTrend,
    sleepChangeTrend,
    activityDistribution
  };
}

// Extract patterns related to mood
function extractMoodPatterns(moodData: MoodData[], healthData: HealthData[]) {
  if (!moodData.length) return {};
  
  // Calculate mood statistics
  const avgMood = moodData.reduce((sum, data) => sum + data.moodScore, 0) / moodData.length;
  const moodVariability = calculateVariability(moodData.map(d => d.moodScore));
  const moodTrend = calculateTrend(moodData.map(d => d.moodScore));
  
  // Correlations between mood and other factors
  const moodHealthCorrelations = calculateMoodHealthCorrelations(moodData, healthData);
  
  // Common triggers
  const triggers = extractCommonItems(moodData.flatMap(d => d.triggers || []));
  
  // Common coping mechanisms
  const copingMechanisms = extractCommonItems(moodData.flatMap(d => d.copingMechanisms || []));
  
  return {
    avgMood,
    moodVariability,
    moodTrend,
    moodHealthCorrelations,
    commonTriggers: triggers,
    commonCopingMechanisms: copingMechanisms
  };
}

// Extract patterns related to financial behavior
function extractFinancialPatterns(financialData: FinancialData[]) {
  if (!financialData.length) return {};
  
  // Categorize income and expenses
  const income = financialData.filter(d => d.isIncome);
  const expenses = financialData.filter(d => !d.isIncome);
  
  // Calculate averages
  const avgIncome = income.reduce((sum, d) => sum + Number(d.amount), 0) / (income.length || 1);
  const avgExpense = expenses.reduce((sum, d) => sum + Number(d.amount), 0) / (expenses.length || 1);
  
  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  for (const expense of expenses) {
    if (!expense.category) continue;
    
    if (!expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] = 0;
    }
    expensesByCategory[expense.category] += Number(expense.amount);
  }
  
  // Identify recurring expenses
  const recurringExpenses = expenses
    .filter(e => e.recurringType)
    .reduce((acc, curr) => {
      const key = curr.recurringType + '|' + curr.category;
      if (!acc[key]) {
        acc[key] = {
          type: curr.recurringType,
          category: curr.category,
          count: 0,
          avgAmount: 0,
          totalAmount: 0
        };
      }
      
      acc[key].count++;
      acc[key].totalAmount += Number(curr.amount);
      acc[key].avgAmount = acc[key].totalAmount / acc[key].count;
      
      return acc;
    }, {} as Record<string, {
      type: string | null,
      category: string,
      count: number,
      avgAmount: number,
      totalAmount: number
    }>);
  
  return {
    avgIncome,
    avgExpense,
    savingsRate: avgIncome > 0 ? (avgIncome - avgExpense) / avgIncome : 0,
    expensesByCategory,
    recurringExpenses: Object.values(recurringExpenses)
  };
}

// Extract patterns related to prayer and spiritual activities
function extractPrayerPatterns(prayerData: PrayerData[]) {
  if (!prayerData.length) return {};
  
  // Calculate prayer statistics
  const completedPrayers = prayerData.filter(p => p.completed);
  const completionRate = prayerData.length > 0 ? completedPrayers.length / prayerData.length : 0;
  
  // Group by prayer type
  const prayersByType = prayerData.reduce((acc, curr) => {
    if (!acc[curr.prayerType]) {
      acc[curr.prayerType] = {
        count: 0,
        completed: 0,
        avgDuration: 0,
        totalDuration: 0
      };
    }
    
    acc[curr.prayerType].count++;
    if (curr.completed) {
      acc[curr.prayerType].completed++;
    }
    
    if (curr.duration) {
      acc[curr.prayerType].totalDuration += curr.duration;
      acc[curr.prayerType].avgDuration = 
        acc[curr.prayerType].totalDuration / acc[curr.prayerType].count;
    }
    
    return acc;
  }, {} as Record<string, {
    count: number,
    completed: number,
    avgDuration: number,
    totalDuration: number
  }>);
  
  // Analyze consistency by day of week
  const prayersByDay = prayerData.reduce((acc, curr) => {
    const day = new Date(curr.date).getDay();
    if (!acc[day]) {
      acc[day] = { count: 0, completed: 0 };
    }
    
    acc[day].count++;
    if (curr.completed) {
      acc[day].completed++;
    }
    
    return acc;
  }, {} as Record<number, { count: number, completed: number }>);
  
  return {
    overallCompletionRate: completionRate,
    prayersByType,
    prayersByDay,
    avgDuration: completedPrayers.reduce((sum, p) => sum + (p.duration || 0), 0) / (completedPrayers.length || 1)
  };
}

// Helper function to calculate trend (positive/negative) from a series of values
function calculateTrend(values: number[]) {
  if (values.length < 2) return 0;
  
  // Simple linear regression slope calculation
  const n = values.length;
  const xMean = (n - 1) / 2; // x values are indices 0 to n-1
  const yMean = values.reduce((sum, y) => sum + y, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  
  // Return slope
  return denominator !== 0 ? numerator / denominator : 0;
}

// Calculate variability (standard deviation) of a set of values
function calculateVariability(values: number[]) {
  if (values.length < 2) return 0;
  
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  
  return Math.sqrt(variance);
}

// Calculate correlations between mood and health metrics
function calculateMoodHealthCorrelations(moodData: MoodData[], healthData: HealthData[]) {
  const correlations: Record<string, number> = {
    steps: 0,
    sleep: 0,
    activity: 0,
    heartRate: 0
  };
  
  // With actual data, we would calculate correlation coefficients
  // between mood scores and various health metrics
  
  return correlations;
}

// Extract most common items from an array of strings
function extractCommonItems(items: string[]) {
  const counts: Record<string, number> = {};
  
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
  }
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([item, count]) => ({ item, count }));
}

// Identify behavior patterns from extracted features
export async function identifyBehaviorPatterns(userId: number) {
  try {
    // Get data from the past 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const healthData = await storage.getHealthDataRange(userId, thirtyDaysAgo, today);
    const moodData = await storage.getMoodDataRange(userId, thirtyDaysAgo, today);
    const financialData = await storage.getFinancialData(userId, thirtyDaysAgo, today);
    const prayerData = await storage.getPrayerData(userId, thirtyDaysAgo);
    
    // Extract features from data
    const features = extractFeatures(healthData, moodData, financialData, prayerData);
    
    // Generate behavior patterns based on features
    const patterns = generateBehaviorPatterns(userId, features);
    
    // Store patterns in database
    await storePatterns(userId, patterns);
    
    return patterns;
  } catch (error) {
    logDbOperation('Error identifying behavior patterns', { userId, error });
    throw error;
  }
}

// Generate behavior patterns from extracted features
function generateBehaviorPatterns(userId: number, features: any) {
  const patterns: Partial<BehaviorPatterns>[] = [];
  
  // Sample pattern extraction - in a real system these would be derived from ML algorithms
  
  // Health patterns
  if (features.healthPatterns) {
    const { avgSteps, avgActiveMinutes, avgSleepDuration } = features.healthPatterns;
    
    // Activity pattern
    if (avgSteps > 0) {
      patterns.push({
        userId,
        patternType: PatternType.ACTIVITY,
        name: "Regular Exercise Pattern",
        description: `You tend to be most active in the evenings. Your average daily steps are ${Math.round(avgSteps)}.`,
        confidence: 85,
        frequency: avgSteps > 8000 ? "daily" : "few times per week",
        triggers: ["evening time", "good weather", "after work"],
        impacts: {
          health: 90,
          mood: 75,
          finance: 30,
          productivity: 65
        },
        recommendations: [
          "Consider morning exercise to boost productivity",
          "Add strength training to your routine",
          "Join group fitness activities for social engagement"
        ]
      });
    }
    
    // Sleep pattern
    if (avgSleepDuration > 0) {
      patterns.push({
        userId,
        patternType: PatternType.SLEEP,
        name: "Sleep Pattern",
        description: `Your average sleep duration is ${avgSleepDuration.toFixed(1)} hours. Sleep quality correlates strongly with physical activity.`,
        confidence: 88,
        frequency: "daily",
        triggers: ["screen time before bed", "caffeine consumption", "exercise"],
        impacts: {
          health: 95,
          mood: 90,
          finance: 40,
          productivity: 85
        },
        recommendations: [
          "Establish a consistent sleep schedule",
          "Limit screen time 1 hour before bed",
          "Create a relaxing bedtime routine"
        ]
      });
    }
  }
  
  // Mood patterns
  if (features.moodPatterns && features.moodPatterns.avgMood) {
    patterns.push({
      userId,
      patternType: PatternType.MOOD,
      name: "Mood Fluctuation Pattern",
      description: "Your mood tends to be higher on days with more physical activity and social interaction.",
      confidence: 75,
      frequency: "daily",
      triggers: features.moodPatterns.commonTriggers?.map(t => t.item) || [],
      impacts: {
        health: 70,
        mood: 95,
        finance: 50,
        productivity: 80
      },
      recommendations: [
        "Schedule regular social activities",
        "Plan outdoor activities when feeling low",
        "Practice mindfulness during stressful periods"
      ]
    });
  }
  
  // Financial patterns
  if (features.financialPatterns) {
    patterns.push({
      userId,
      patternType: PatternType.FINANCE,
      name: "Spending Pattern",
      description: "You tend to make more discretionary purchases on weekends and after receiving income.",
      confidence: 82,
      frequency: "weekly",
      triggers: ["weekends", "payday", "social events"],
      impacts: {
        health: 30,
        mood: 65,
        finance: 90,
        productivity: 40
      },
      recommendations: [
        "Create a budget for discretionary spending",
        "Set up automatic transfers to savings on payday",
        "Use a 24-hour rule before making large purchases"
      ]
    });
  }
  
  // Prayer/spiritual patterns
  if (features.prayerPatterns) {
    patterns.push({
      userId,
      patternType: PatternType.PRAYER,
      name: "Spiritual Practice Pattern",
      description: "You are most consistent with morning spiritual practices and tend to miss evening ones.",
      confidence: 78,
      frequency: "daily",
      triggers: ["morning routine", "stress relief", "community connection"],
      impacts: {
        health: 65,
        mood: 85,
        finance: 20,
        productivity: 60
      },
      recommendations: [
        "Link evening prayer with another consistent habit",
        "Use a dedicated prayer space to minimize distractions",
        "Join a prayer group for accountability"
      ]
    });
  }
  
  return patterns;
}

// Store identified patterns in the database
async function storePatterns(userId: number, patterns: Partial<BehaviorPatterns>[]) {
  try {
    // Get existing patterns
    const existingPatterns = await storage.getBehaviorPatterns(userId);
    const existingPatternMap = new Map(existingPatterns.map(p => [p.patternType + '|' + p.name, p]));
    
    // For each new pattern, update existing or create new
    for (const pattern of patterns) {
      const key = `${pattern.patternType}|${pattern.name}`;
      
      if (existingPatternMap.has(key)) {
        // Update existing pattern
        const existingPattern = existingPatternMap.get(key)!;
        await storage.updateBehaviorPattern(existingPattern.id, {
          ...pattern,
          confidence: pattern.confidence,
          description: pattern.description,
          impacts: pattern.impacts,
          recommendations: pattern.recommendations as string[]
        });
      } else {
        // Create new pattern
        await storage.createBehaviorPattern(pattern as any);
      }
    }
  } catch (error) {
    logDbOperation('Error storing behavior patterns', { userId, error });
    throw error;
  }
}

// Generate predictions based on behavioral patterns
export async function generatePredictions(userId: number) {
  try {
    // Get behavioral patterns
    const patterns = await storage.getBehaviorPatterns(userId);
    
    if (patterns.length === 0) {
      // If no patterns exist, try to identify them first
      await identifyBehaviorPatterns(userId);
      // Get patterns again
      const newPatterns = await storage.getBehaviorPatterns(userId);
      if (newPatterns.length === 0) {
        // Still no patterns, not enough data to make predictions
        return [];
      }
    }
    
    // Current date info
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();
    
    // Generate predictions for different categories
    const predictions: Partial<InsertPrediction>[] = [];
    
    // Activity predictions
    const activityPatterns = patterns.filter(p => 
      p.patternType === PatternType.ACTIVITY || 
      p.patternType === PatternType.HEALTH
    );
    
    if (activityPatterns.length > 0) {
      predictions.push({
        userId,
        date: now,
        predictionType: PredictionType.ACTIVITY,
        category: 'exercise',
        predictedValue: `You are likely to exercise today ${hour < 12 ? 'in the evening' : 'within the next few hours'}`,
        confidence: calculateConfidence(activityPatterns),
        factors: ["past behavior", "day of week", "weather"],
        details: `Based on your patterns, you typically exercise on ${getDayName(dayOfWeek)}s`,
        impact: 'positive',
        recommendations: [
          "Prepare your workout clothes",
          "Stay hydrated throughout the day",
          "Plan a healthy post-workout meal"
        ]
      });
    }
    
    // Sleep predictions
    const sleepPatterns = patterns.filter(p => p.patternType === PatternType.SLEEP);
    
    if (sleepPatterns.length > 0) {
      predictions.push({
        userId,
        date: now,
        predictionType: PredictionType.SLEEP,
        category: 'rest',
        predictedValue: `You are likely to sleep around 11:15 PM tonight`,
        confidence: calculateConfidence(sleepPatterns),
        factors: ["screen time", "physical activity", "typical schedule"],
        details: `Based on your sleep patterns over the past 30 days`,
        impact: 'neutral',
        recommendations: [
          "Reduce screen time after 10:00 PM",
          "Keep your bedroom cool and dark",
          "Avoid caffeine after 2:00 PM"
        ]
      });
    }
    
    // Mood predictions
    const moodPatterns = patterns.filter(p => p.patternType === PatternType.MOOD);
    
    if (moodPatterns.length > 0) {
      predictions.push({
        userId,
        date: now,
        predictionType: PredictionType.MOOD,
        category: 'wellness',
        predictedValue: `Your mood is likely to improve this afternoon`,
        confidence: calculateConfidence(moodPatterns),
        factors: ["social interactions", "physical activity", "rest quality"],
        details: `Your mood tends to improve following physical activity and social interactions`,
        impact: 'positive',
        recommendations: [
          "Schedule a brief walk outside",
          "Connect with a friend or family member",
          "Take short breaks throughout your day"
        ]
      });
    }
    
    // Financial predictions
    const financialPatterns = patterns.filter(p => 
      p.patternType === PatternType.FINANCE || 
      p.patternType === PatternType.SPENDING || 
      p.patternType === PatternType.SAVING
    );
    
    if (financialPatterns.length > 0) {
      predictions.push({
        userId,
        date: now,
        predictionType: PredictionType.FINANCIAL,
        category: 'spending',
        predictedValue: `You are likely to spend on dining out today`,
        confidence: calculateConfidence(financialPatterns),
        factors: ["day of week", "historical spending", "income timing"],
        details: `Your spending on dining increases on ${getDayName(dayOfWeek)}s`,
        impact: 'neutral',
        recommendations: [
          "Check your dining budget before going out",
          "Consider cooking at home as an alternative",
          "Look for social dining deals or promotions"
        ]
      });
    }
    
    // Prayer predictions
    const prayerPatterns = patterns.filter(p => p.patternType === PatternType.PRAYER);
    
    if (prayerPatterns.length > 0) {
      predictions.push({
        userId,
        date: now,
        predictionType: PredictionType.PRAYER,
        category: 'spiritual',
        predictedValue: `You are likely to pray during the evening`,
        confidence: calculateConfidence(prayerPatterns),
        factors: ["daily schedule", "stress levels", "habit formation"],
        details: `Your prayer consistency is highest in the morning and evening`,
        impact: 'positive',
        recommendations: [
          "Set up a dedicated prayer space",
          "Use a prayer app for reminders",
          "Join an online prayer community"
        ]
      });
    }
    
    // Store predictions
    for (const prediction of predictions) {
      await storage.createPrediction(prediction as any);
    }
    
    return predictions;
  } catch (error) {
    logDbOperation('Error generating predictions', { userId, error });
    throw error;
  }
}

// Calculate confidence level based on pattern consistency
function calculateConfidence(patterns: BehaviorPatterns[]) {
  if (patterns.length === 0) return 50;
  
  // Average the confidence of all relevant patterns
  const avgConfidence = patterns.reduce((sum, p) => sum + (p.confidence || 0), 0) / patterns.length;
  
  // Adjust based on pattern count (more patterns = higher confidence)
  const patternCountFactor = Math.min(patterns.length / 3, 1); // Max of 1
  
  // Combine factors
  const confidence = Math.round(avgConfidence * (0.8 + 0.2 * patternCountFactor));
  
  // Ensure we stay in range 0-100
  return Math.min(Math.max(confidence, 0), 100);
}

// Get day name from day number
function getDayName(day: number) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[day];
}

// Advanced behavior prediction using TensorFlow.js
export async function predictWithML(userId: number, dataType: string) {
  try {
    // This would be a real ML-based prediction in a production system
    // For now, we'll simulate ML predictions based on patterns
    
    // Get user data from the past 90 days
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 90);
    
    const healthData = await storage.getHealthDataRange(userId, startDate, today);
    
    // Convert data to tensorflow format
    // In a real system, we would train models on historical data
    // Here we're just simulating the prediction
    
    if (dataType === 'activity') {
      // Predict next activity
      return predictNextActivity(healthData);
    } else if (dataType === 'sleep') {
      // Predict sleep quality
      return predictSleepQuality(healthData);
    } else {
      throw new Error(`Unsupported prediction type: ${dataType}`);
    }
  } catch (error) {
    logDbOperation('Error making ML prediction', { userId, dataType, error });
    throw error;
  }
}

// Simulate predicting the next activity
function predictNextActivity(healthData: HealthData[]) {
  if (!healthData.length) {
    return {
      activityType: 'walking',
      confidence: 65,
      predictedTime: '18:00',
      details: 'Insufficient data for high confidence prediction'
    };
  }
  
  // In a real ML system, we would use trained models to predict
  // the next activity type, time, and duration
  
  // We'll simulate this with a simple heuristic
  const activityTypes = healthData
    .filter(d => d.activityTypes)
    .map(d => ({
      walking: d.activityTypes?.walking || 0,
      running: d.activityTypes?.running || 0,
      cycling: d.activityTypes?.cycling || 0,
      yoga: d.activityTypes?.yoga || 0,
      meditation: d.activityTypes?.meditation || 0,
      weightLifting: d.activityTypes?.weightLifting || 0,
      other: d.activityTypes?.other || 0
    }));
  
  // No activity data available
  if (activityTypes.length === 0) {
    return {
      activityType: 'walking',
      confidence: 60,
      predictedTime: '18:00',
      details: 'Based on typical user patterns'
    };
  }
  
  // Find most common activity
  const aggregated = activityTypes.reduce((acc, curr) => {
    Object.entries(curr).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + value;
    });
    return acc;
  }, {} as Record<string, number>);
  
  // Get activity with highest value
  const sortedActivities = Object.entries(aggregated)
    .sort((a, b) => b[1] - a[1]);
  
  const [mostCommonActivity, value] = sortedActivities[0];
  const totalValue = Object.values(aggregated).reduce((sum, v) => sum + v, 0);
  const confidence = Math.round((value / totalValue) * 100);
  
  // Generate a prediction time based on current time
  const now = new Date();
  const hour = now.getHours();
  let predictedHour = 0;
  
  if (hour < 12) {
    predictedHour = 18; // Evening workout if morning now
  } else if (hour < 17) {
    predictedHour = 19; // Evening workout if afternoon
  } else {
    predictedHour = 7; // Morning workout tomorrow if evening now
  }
  
  return {
    activityType: mostCommonActivity,
    confidence,
    predictedTime: `${predictedHour}:00`,
    details: `Based on your historical activity patterns`
  };
}

// Simulate predicting sleep quality
function predictSleepQuality(healthData: HealthData[]) {
  if (!healthData.length) {
    return {
      predictedQuality: 75,
      confidence: 60,
      details: 'Insufficient data for high confidence prediction'
    };
  }
  
  // Calculate factors that influence sleep quality
  const recentSleepData = healthData
    .filter(d => d.sleepQuality)
    .slice(-7); // Last 7 entries with sleep data
  
  if (recentSleepData.length === 0) {
    return {
      predictedQuality: 75,
      confidence: 60,
      details: 'Based on typical user patterns'
    };
  }
  
  // Calculate average sleep quality
  const avgQuality = recentSleepData.reduce((sum, d) => sum + (d.sleepQuality || 0), 0) / recentSleepData.length;
  
  // Find correlation between activity and sleep quality
  const activitySleepCorrelation = calculateCorrelation(
    recentSleepData.map(d => d.activeMinutes || 0),
    recentSleepData.map(d => d.sleepQuality || 0)
  );
  
  // Adjust predicted quality based on today's activity
  const todayData = healthData[healthData.length - 1];
  const activityLevel = todayData?.activeMinutes || 0;
  
  // Simple linear model to predict tonight's sleep quality
  let predictedQuality = avgQuality;
  if (activitySleepCorrelation > 0.3 && activityLevel > 0) {
    // Positive correlation - more activity, better sleep
    const avgActivity = recentSleepData.reduce((sum, d) => sum + (d.activeMinutes || 0), 0) / recentSleepData.length;
    const activityRatio = avgActivity > 0 ? activityLevel / avgActivity : 1;
    predictedQuality = Math.min(100, Math.round(avgQuality * (0.8 + 0.2 * activityRatio)));
  } else if (activitySleepCorrelation < -0.3 && activityLevel > 0) {
    // Negative correlation - more activity, worse sleep
    const avgActivity = recentSleepData.reduce((sum, d) => sum + (d.activeMinutes || 0), 0) / recentSleepData.length;
    const activityRatio = avgActivity > 0 ? activityLevel / avgActivity : 1;
    predictedQuality = Math.max(0, Math.round(avgQuality * (1.2 - 0.2 * activityRatio)));
  }
  
  // Calculate confidence
  const confidence = Math.min(95, Math.round(60 + recentSleepData.length * 5));
  
  return {
    predictedQuality,
    confidence,
    details: activitySleepCorrelation > 0.3
      ? 'Physical activity today is likely to improve your sleep quality'
      : activitySleepCorrelation < -0.3
        ? 'High activity today may result in lower sleep quality tonight'
        : 'Based on your recent sleep patterns'
  };
}

// Calculate correlation between two arrays
function calculateCorrelation(x: number[], y: number[]) {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  
  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate covariance and variances
  let covariance = 0;
  let xVariance = 0;
  let yVariance = 0;
  
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    covariance += xDiff * yDiff;
    xVariance += xDiff * xDiff;
    yVariance += yDiff * yDiff;
  }
  
  covariance /= n;
  xVariance /= n;
  yVariance /= n;
  
  // Calculate correlation
  const xStdDev = Math.sqrt(xVariance);
  const yStdDev = Math.sqrt(yVariance);
  
  // Avoid division by zero
  if (xStdDev === 0 || yStdDev === 0) return 0;
  
  return covariance / (xStdDev * yStdDev);
}