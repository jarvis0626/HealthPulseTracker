import * as tf from '@tensorflow/tfjs';
import { Prediction, HealthData } from '@shared/schema';

// Simple TensorFlow.js prediction model
export async function createPredictionModel(
  healthData: HealthData[]
): Promise<tf.LayersModel> {
  // Sort health data by date
  const sortedData = [...healthData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Extract features for prediction (steps, calories, heart rate, sleep)
  const features = sortedData.map(data => [
    data.steps || 0, 
    data.calories || 0, 
    data.heartRate || 0,
    data.sleepDuration || 0
  ]);
  
  // Create a simple sequential model
  const model = tf.sequential();
  
  // Add layers
  model.add(tf.layers.dense({ 
    units: 8, 
    activation: 'relu', 
    inputShape: [4] 
  }));
  model.add(tf.layers.dense({ 
    units: 4, 
    activation: 'relu' 
  }));
  model.add(tf.layers.dense({ 
    units: 4
  }));
  
  // Compile the model
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'meanSquaredError'
  });
  
  // Create training data
  // Simple approach: predict next day based on current day
  const xs = tf.tensor2d(features.slice(0, -1));
  const ys = tf.tensor2d(features.slice(1));
  
  // Train the model if we have enough data
  if (features.length > 1) {
    await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      shuffle: true,
    });
  }
  
  return model;
}

export async function predictNextActivity(
  model: tf.LayersModel,
  latestData: HealthData
): Promise<{
  steps: number;
  calories: number;
  heartRate: number;
  sleepDuration: number;
  confidence: number;
}> {
  // Create input tensor from latest data
  const input = tf.tensor2d([
    [
      latestData.steps || 0,
      latestData.calories || 0,
      latestData.heartRate || 0,
      latestData.sleepDuration || 0
    ]
  ]);
  
  // Make prediction
  const predictedTensor = model.predict(input) as tf.Tensor;
  const predicted = await predictedTensor.array() as number[][];
  
  // Calculate confidence (simplified - just a dummy value for now between 70-95)
  const confidence = Math.floor(70 + Math.random() * 25);
  
  return {
    steps: Math.round(predicted[0][0]),
    calories: Math.round(predicted[0][1]),
    heartRate: Math.round(predicted[0][2]),
    sleepDuration: parseFloat(predicted[0][3].toFixed(1)),
    confidence
  };
}

export function determineActivityType(
  healthData: HealthData
): { activityType: string; predictedTime: string } {
  // Simple logic to determine activity type based on patterns
  const hour = new Date().getHours();
  
  if (healthData.steps && healthData.steps > 5000) {
    if (hour >= 16 && hour <= 19) {
      return { activityType: "Evening Run", predictedTime: "6:30 PM" };
    } else if (hour >= 6 && hour <= 9) {
      return { activityType: "Morning Walk", predictedTime: "7:30 AM" };
    }
  }
  
  if (healthData.sleepDuration) {
    return { activityType: "Sleep Schedule", predictedTime: "11:15 PM" };
  }
  
  return { activityType: "General Activity", predictedTime: "2:00 PM" };
}
