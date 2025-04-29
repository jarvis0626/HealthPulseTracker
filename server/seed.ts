import { 
  InsertUser, InsertHealthData, InsertHealthGoals, 
  InsertMoodData, InsertFinancialData, InsertPrayerData 
} from "@shared/schema";
import { storage } from "./storage";
import { hashPassword } from "./auth";

// Main seeding function
export async function seedDatabase() {
  console.log("Seeding database with sample data...");
  
  try {
    // Create demo user
    const user = await createDemoUser();
    console.log(`Created demo user with ID: ${user.id}`);
    
    // Create health data for the past 30 days
    await createHealthData(user.id);
    console.log("Created health data for the past 30 days");
    
    // Create health goals
    await createHealthGoals(user.id);
    console.log("Created health goals");
    
    // Create mood data
    await createMoodData(user.id);
    console.log("Created mood data");
    
    // Create financial data
    await createFinancialData(user.id);
    console.log("Created financial data");
    
    // Create prayer data
    await createPrayerData(user.id);
    console.log("Created prayer data");
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Create demo user
async function createDemoUser() {
  // Check if demo user already exists
  const existingUser = await storage.getUserByUsername("demo");
  if (existingUser) {
    return existingUser;
  }
  
  const userData: InsertUser = {
    username: "demo",
    password: await hashPassword("password123"),
    fullName: "Demo User",
    email: "demo@example.com",
    age: 32,
    height: 178.5,
    weight: 75.2,
    bloodType: "A+"
  };
  
  return await storage.createUser(userData);
}

// Create health data for the past 30 days
async function createHealthData(userId: number) {
  const today = new Date();
  
  // Create health data for each of the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate semi-random values
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dayOfWeek = date.getDay();
    
    // Base step counts - higher on weekends, lower on weekdays
    let steps = isWeekend 
      ? 8000 + Math.round(Math.random() * 4000) 
      : 6000 + Math.round(Math.random() * 3000);
      
    // Monday and Wednesday are typically workout days (more steps)
    if (dayOfWeek === 1 || dayOfWeek === 3) {
      steps += 2000 + Math.round(Math.random() * 1000);
    }
    
    // Calories burned approximately correlates with steps
    const calories = Math.round(steps * 0.05) + Math.round(Math.random() * 100);
    
    // Heart rate - slightly higher on workout days
    const heartRate = (dayOfWeek === 1 || dayOfWeek === 3 || isWeekend)
      ? 68 + Math.round(Math.random() * 8)
      : 62 + Math.round(Math.random() * 6);
    
    // Active minutes - correlates with steps
    const activeMinutes = Math.round(steps / 100) + Math.round(Math.random() * 10);
    
    // Sleep duration and quality - slightly worse on weekends
    const sleepDuration = isWeekend
      ? 6.5 + Math.random() * 1.5
      : 7 + Math.random() * 1.5;
      
    const sleepQuality = isWeekend
      ? 70 + Math.round(Math.random() * 15)
      : 75 + Math.round(Math.random() * 15);
      
    const deepSleep = sleepDuration * (0.2 + Math.random() * 0.1);
    
    // Stress level - higher during weekdays, lower on weekends
    const stressLevel = isWeekend
      ? 30 + Math.round(Math.random() * 20)
      : 50 + Math.round(Math.random() * 30);
    
    // Blood pressure - slightly higher on stressful days
    const bloodPressureSystolic = 110 + Math.round(stressLevel / 5) + Math.round(Math.random() * 10);
    const bloodPressureDiastolic = 70 + Math.round(stressLevel / 10) + Math.round(Math.random() * 8);
    
    // Oxygen saturation - generally stable around 97-99%
    const oxygenSaturation = 97 + Math.round(Math.random() * 2);
    
    // Hydration - better on active days
    const hydrationLevel = 60 + Math.round(activeMinutes / 5) + Math.round(Math.random() * 20);
    
    // Activity types
    // More walking on weekdays, more cardio on workout days, more variety on weekends
    const walkingPct = isWeekend ? 40 + Math.round(Math.random() * 20) : 60 + Math.round(Math.random() * 20);
    let runningPct = 0;
    let cyclingPct = 0;
    let yogaPct = 0;
    let meditationPct = 0;
    let weightLiftingPct = 0;
    
    if (dayOfWeek === 1) { // Monday - running day
      runningPct = 25 + Math.round(Math.random() * 10);
    } else if (dayOfWeek === 3) { // Wednesday - cycling day
      cyclingPct = 25 + Math.round(Math.random() * 10);
    } else if (dayOfWeek === 5) { // Friday - weights day
      weightLiftingPct = 25 + Math.round(Math.random() * 10);
    }
    
    if (isWeekend) {
      // More varied activities on weekends
      yogaPct = (dayOfWeek === 6) ? 15 + Math.round(Math.random() * 10) : 0; // Saturday yoga
      meditationPct = (dayOfWeek === 0) ? 15 + Math.round(Math.random() * 10) : 0; // Sunday meditation
    }
    
    // Ensure percentages add up to 100
    const allocatedPct = walkingPct + runningPct + cyclingPct + yogaPct + meditationPct + weightLiftingPct;
    const otherPct = 100 - allocatedPct;
    
    // Create health data entry
    const healthData: InsertHealthData = {
      userId,
      date,
      steps,
      calories,
      heartRate,
      activeMinutes,
      sleepDuration,
      sleepQuality,
      deepSleep,
      stressLevel,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      oxygenSaturation,
      hydrationLevel,
      activityTypes: {
        walking: walkingPct,
        running: runningPct,
        cycling: cyclingPct,
        yoga: yogaPct,
        meditation: meditationPct,
        weightLifting: weightLiftingPct,
        other: otherPct
      },
      heartRateZones: {
        resting: heartRate,
        fatBurn: heartRate + 20,
        cardio: heartRate + 40,
        peak: heartRate + 60
      },
      nutritionData: {
        calories: 2000 + Math.round(Math.random() * 500),
        protein: 80 + Math.round(Math.random() * 40),
        carbs: 200 + Math.round(Math.random() * 100),
        fat: 60 + Math.round(Math.random() * 30),
        fiber: 20 + Math.round(Math.random() * 10),
        sugar: 40 + Math.round(Math.random() * 20),
        waterIntake: 1.5 + Math.random()
      }
    };
    
    await storage.createHealthData(healthData);
  }
}

// Create health goals
async function createHealthGoals(userId: number) {
  const healthGoals: InsertHealthGoals = {
    userId,
    dailySteps: 10000,
    weeklyWorkouts: 4,
    sleepQuality: 85,
    targetWeight: 72,
    targetCalories: 2500,
    targetWaterIntake: 2.5,
    targetProtein: 120,
    targetFat: 70,
    targetCarbs: 250,
    targetStressLevel: 30,
    targetActivityMinutes: 60
  };
  
  await storage.createHealthGoals(healthGoals);
}

// Create mood data for the past 30 days
async function createMoodData(userId: number) {
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Mood tends to be better on weekends, worse on Mondays and during the week
    let moodBase = isWeekend ? 7 : 5;
    if (dayOfWeek === 1) moodBase = 4; // Monday blues
    
    // Add some random variation
    const moodScore = Math.min(10, Math.max(1, moodBase + Math.round(Math.random() * 4 - 2)));
    
    // Energy level - correlated with mood but more affected by sleep and physical activity
    // We'll simulate this without referencing the health data directly
    const energyLevel = Math.min(10, Math.max(1, moodBase + Math.round(Math.random() * 4 - 1)));
    
    // Anxiety level - inversely correlated with mood
    const anxietyLevel = Math.min(10, Math.max(1, 11 - moodScore + Math.round(Math.random() * 4 - 2)));
    
    // Stress level - higher during weekdays, especially Wednesday (middle of week)
    let stressBase = isWeekend ? 3 : 6;
    if (dayOfWeek === 3) stressBase = 7; // Wednesday is most stressful
    
    const stressLevel = Math.min(10, Math.max(1, stressBase + Math.round(Math.random() * 4 - 2)));
    
    // Activities that affected mood
    const activities = [];
    if (moodScore >= 7) {
      // Activities associated with good mood
      const goodMoodActivities = [
        "exercise", "time with family", "meditation", "outdoor activity", 
        "good sleep", "completed tasks", "social interaction", "hobby"
      ];
      
      // Add 1-3 random activities
      const activityCount = 1 + Math.floor(Math.random() * 3);
      for (let j = 0; j < activityCount; j++) {
        const activityIndex = Math.floor(Math.random() * goodMoodActivities.length);
        activities.push(goodMoodActivities[activityIndex]);
      }
    } else if (moodScore <= 4) {
      // Activities associated with bad mood
      const badMoodActivities = [
        "work stress", "poor sleep", "conflict", "health issue", 
        "financial worry", "bad weather", "loneliness", "excessive screen time"
      ];
      
      // Add 1-2 random activities
      const activityCount = 1 + Math.floor(Math.random() * 2);
      for (let j = 0; j < activityCount; j++) {
        const activityIndex = Math.floor(Math.random() * badMoodActivities.length);
        activities.push(badMoodActivities[activityIndex]);
      }
    }
    
    // Mood triggers
    const triggers = [];
    if (moodScore <= 5) {
      // Potential triggers for lower mood
      const moodTriggers = [
        "work deadline", "argument", "bad news", "physical discomfort",
        "poor weather", "insufficient sleep", "hunger", "traffic"
      ];
      
      // Add 0-2 random triggers
      const triggerCount = Math.floor(Math.random() * 3);
      for (let j = 0; j < triggerCount; j++) {
        const triggerIndex = Math.floor(Math.random() * moodTriggers.length);
        triggers.push(moodTriggers[triggerIndex]);
      }
    }
    
    // Coping mechanisms for stress/anxiety
    const copingMechanisms = [];
    if (stressLevel >= 6 || anxietyLevel >= 6) {
      const copingStrategies = [
        "deep breathing", "exercise", "talking to friend", "meditation",
        "taking a walk", "music", "reading", "mindfulness", "prayer"
      ];
      
      // Add 1-2 random coping mechanisms
      const copingCount = 1 + Math.floor(Math.random() * 2);
      for (let j = 0; j < copingCount; j++) {
        const copingIndex = Math.floor(Math.random() * copingStrategies.length);
        copingMechanisms.push(copingStrategies[copingIndex]);
      }
    }
    
    // Add mood data entry
    const moodData: InsertMoodData = {
      userId,
      date,
      moodScore,
      energyLevel,
      anxietyLevel,
      stressLevel,
      notes: generateMoodNote(moodScore, activities),
      activities,
      triggers,
      copingMechanisms
    };
    
    await storage.createMoodData(moodData);
  }
}

// Generate a natural language note about mood
function generateMoodNote(moodScore: number, activities: string[]): string {
  if (moodScore >= 8) {
    return `Had a great day today! ${activities.length > 0 ? 'Enjoyed ' + activities.join(' and ') + '.' : ''}`;
  } else if (moodScore >= 6) {
    return `Pretty good day overall. ${activities.length > 0 ? activities.join(' and ') + ' helped improve my mood.' : ''}`;
  } else if (moodScore >= 4) {
    return `Feeling okay, but not great. ${activities.length > 0 ? 'Dealing with ' + activities.join(' and ') + '.' : ''}`;
  } else {
    return `Tough day today. ${activities.length > 0 ? 'Struggled with ' + activities.join(' and ') + '.' : 'Hope tomorrow is better.'}`;
  }
}

// Create financial data for the past 30 days
async function createFinancialData(userId: number) {
  const today = new Date();
  
  // Create a "salary" deposit on the 1st of the month
  const currentMonth = today.getMonth();
  const firstOfMonth = new Date(today.getFullYear(), currentMonth, 1);
  
  // If the 1st happened in the last 30 days
  if ((today.getTime() - firstOfMonth.getTime()) / (1000 * 60 * 60 * 24) < 30) {
    const salary: InsertFinancialData = {
      userId,
      date: firstOfMonth,
      amount: "3500.00",
      category: "Income",
      description: "Monthly Salary",
      isIncome: true,
      transactionType: "deposit",
      merchant: "Employer Inc.",
      recurringType: "monthly",
      budgetCategory: "Income"
    };
    
    await storage.createFinancialData(salary);
  }
  
  // Regular expenses
  const regularExpenses = [
    {
      description: "Rent",
      amount: "1200.00",
      category: "Housing",
      day: 2, // 2nd of the month
      merchant: "Property Management",
      recurringType: "monthly",
      budgetCategory: "Housing"
    },
    {
      description: "Electricity Bill",
      amount: "85.00",
      category: "Utilities",
      day: 15,
      merchant: "Electric Company",
      recurringType: "monthly",
      budgetCategory: "Utilities"
    },
    {
      description: "Internet",
      amount: "60.00",
      category: "Utilities",
      day: 10,
      merchant: "ISP Provider",
      recurringType: "monthly",
      budgetCategory: "Utilities"
    },
    {
      description: "Phone Bill",
      amount: "45.00",
      category: "Utilities",
      day: 18,
      merchant: "Mobile Carrier",
      recurringType: "monthly",
      budgetCategory: "Utilities"
    },
    {
      description: "Gym Membership",
      amount: "35.00",
      category: "Health & Fitness",
      day: 5,
      merchant: "Fitness Club",
      recurringType: "monthly",
      budgetCategory: "Health"
    }
  ];
  
  // Add regular expenses that fall within the last 30 days
  for (const expense of regularExpenses) {
    const expenseDate = new Date(today.getFullYear(), currentMonth, expense.day);
    
    // If the expense date is in the past 30 days
    if ((today.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24) < 30 && 
        expenseDate.getTime() <= today.getTime()) {
      
      const regularExpense: InsertFinancialData = {
        userId,
        date: expenseDate,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        isIncome: false,
        transactionType: "payment",
        merchant: expense.merchant,
        recurringType: expense.recurringType,
        budgetCategory: expense.budgetCategory
      };
      
      await storage.createFinancialData(regularExpense);
    }
  }
  
  // Variable expenses throughout the month
  const variableExpenseCategories = [
    {
      category: "Groceries",
      budgetCategory: "Food",
      minAmount: 30,
      maxAmount: 120,
      merchants: ["Supermarket", "Grocery Store", "Whole Foods", "Local Market"]
    },
    {
      category: "Dining Out",
      budgetCategory: "Food",
      minAmount: 15,
      maxAmount: 80,
      merchants: ["Restaurant", "Cafe", "Fast Food", "Coffee Shop"]
    },
    {
      category: "Shopping",
      budgetCategory: "Personal",
      minAmount: 20,
      maxAmount: 200,
      merchants: ["Department Store", "Online Shopping", "Clothing Store", "Electronics Store"]
    },
    {
      category: "Transportation",
      budgetCategory: "Transportation",
      minAmount: 10,
      maxAmount: 50,
      merchants: ["Gas Station", "Ride Share", "Public Transit", "Parking"]
    },
    {
      category: "Entertainment",
      budgetCategory: "Discretionary",
      minAmount: 15,
      maxAmount: 100,
      merchants: ["Movie Theater", "Streaming Service", "Concert Venue", "App Store"]
    }
  ];
  
  // Generate 20-30 variable expenses over the past 30 days
  const expenseCount = 20 + Math.floor(Math.random() * 11);
  
  for (let i = 0; i < expenseCount; i++) {
    // Random date within the past 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const expenseDate = new Date(today);
    expenseDate.setDate(today.getDate() - daysAgo);
    
    // Random expense category
    const categoryIndex = Math.floor(Math.random() * variableExpenseCategories.length);
    const expenseCategory = variableExpenseCategories[categoryIndex];
    
    // Random amount within the category range
    const amount = expenseCategory.minAmount + 
      Math.round((expenseCategory.maxAmount - expenseCategory.minAmount) * Math.random() * 100) / 100;
      
    // Random merchant within the category
    const merchantIndex = Math.floor(Math.random() * expenseCategory.merchants.length);
    const merchant = expenseCategory.merchants[merchantIndex];
    
    const variableExpense: InsertFinancialData = {
      userId,
      date: expenseDate,
      amount: amount.toFixed(2),
      category: expenseCategory.category,
      description: `${merchant} purchase`,
      isIncome: false,
      transactionType: "purchase",
      merchant,
      recurringType: null,
      budgetCategory: expenseCategory.budgetCategory
    };
    
    await storage.createFinancialData(variableExpense);
  }
}

// Create prayer data for the past 30 days
async function createPrayerData(userId: number) {
  const today = new Date();
  
  // Define prayer types
  const prayerTypes = [
    "Morning Prayer",
    "Evening Prayer",
    "Gratitude",
    "Meditation",
    "Reading"
  ];
  
  // For each day in the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Morning prayer (more consistent)
    const morningPrayerTime = new Date(date);
    morningPrayerTime.setHours(6, 0, 0, 0);
    // Slightly later on weekends
    if (isWeekend) {
      morningPrayerTime.setHours(morningPrayerTime.getHours() + 1);
    }
    
    // Randomly miss some morning prayers (20% chance on weekdays, 10% on weekends)
    const skipMorningPrayer = Math.random() < (isWeekend ? 0.1 : 0.2);
    
    if (!skipMorningPrayer) {
      // Create morning prayer entry
      const morningPrayer: InsertPrayerData = {
        userId,
        date,
        prayerType: "Morning Prayer",
        completed: true,
        scheduledTime: morningPrayerTime,
        completedTime: new Date(morningPrayerTime.getTime() + Math.floor(Math.random() * 15) * 60000), // 0-15 min later
        duration: 10 + Math.floor(Math.random() * 10), // 10-20 minutes
        location: isWeekend ? "Bedroom" : "Study",
        notes: "Started the day with prayer and reflection."
      };
      
      await storage.createPrayerData(morningPrayer);
    }
    
    // Evening prayer (less consistent)
    const eveningPrayerTime = new Date(date);
    eveningPrayerTime.setHours(21, 0, 0, 0);
    
    // Randomly miss some evening prayers (30% chance on weekdays, 40% on Fridays/Saturdays)
    const skipEveningPrayer = Math.random() < (dayOfWeek === 5 || dayOfWeek === 6 ? 0.4 : 0.3);
    
    if (!skipEveningPrayer) {
      // Create evening prayer entry
      const eveningPrayer: InsertPrayerData = {
        userId,
        date,
        prayerType: "Evening Prayer",
        completed: true,
        scheduledTime: eveningPrayerTime,
        completedTime: new Date(eveningPrayerTime.getTime() + Math.floor(Math.random() * 30) * 60000), // 0-30 min later
        duration: 5 + Math.floor(Math.random() * 15), // 5-20 minutes
        location: "Bedroom",
        notes: "Reflected on the day with gratitude."
      };
      
      await storage.createPrayerData(eveningPrayer);
    }
    
    // Additional prayer/meditation activity on some days
    // More likely on weekends and Wednesdays
    if (isWeekend || dayOfWeek === 3) {
      const additionalPrayerChance = isWeekend ? 0.7 : 0.4;
      
      if (Math.random() < additionalPrayerChance) {
        // Pick a random additional prayer type
        const prayerTypeIndex = Math.floor(Math.random() * 3) + 2; // Index 2-4 from prayerTypes array
        const prayerType = prayerTypes[prayerTypeIndex];
        
        // Random time between 12pm and 6pm
        const additionalPrayerTime = new Date(date);
        additionalPrayerTime.setHours(12 + Math.floor(Math.random() * 6), 0, 0, 0);
        additionalPrayerTime.setMinutes(Math.floor(Math.random() * 60));
        
        const additionalPrayer: InsertPrayerData = {
          userId,
          date,
          prayerType,
          completed: true,
          scheduledTime: additionalPrayerTime,
          completedTime: additionalPrayerTime, // Assume completed as scheduled
          duration: 10 + Math.floor(Math.random() * 20), // 10-30 minutes
          location: Math.random() < 0.5 ? "Living Room" : "Outdoor Space",
          notes: `Extended time for ${prayerType.toLowerCase()} and reflection.`
        };
        
        await storage.createPrayerData(additionalPrayer);
      }
    }
    
    // Scheduled but missed prayer (to demonstrate behavior pattern)
    if (i % 7 === 4) { // Every 7 days, offset by 4 (typically Fridays)
      const missedPrayerTime = new Date(date);
      missedPrayerTime.setHours(15, 0, 0, 0); // 3pm
      
      const missedPrayer: InsertPrayerData = {
        userId,
        date,
        prayerType: "Meditation",
        completed: false,
        scheduledTime: missedPrayerTime,
        completedTime: null,
        duration: null,
        location: null,
        notes: "Scheduled but missed due to other commitments."
      };
      
      await storage.createPrayerData(missedPrayer);
    }
  }
}