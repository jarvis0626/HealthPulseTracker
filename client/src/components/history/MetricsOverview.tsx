import { Card, CardContent } from "@/components/ui/card";
import { useHealthDataRange } from "@/hooks/useHealthData";
import { ArrowUp, ArrowDown } from "lucide-react";

type MetricsOverviewProps = {
  startDate: Date;
  endDate: Date;
};

export default function MetricsOverview({ startDate, endDate }: MetricsOverviewProps) {
  const { data: healthData, isLoading } = useHealthDataRange(1, startDate, endDate);
  
  // Calculate metrics from health data
  const totalSteps = healthData?.reduce((sum, data) => sum + (data.steps || 0), 0) || 0;
  const totalCalories = healthData?.reduce((sum, data) => sum + (data.calories || 0), 0) || 0;
  const totalActiveMinutes = healthData?.reduce((sum, data) => sum + (data.activeMinutes || 0), 0) || 0;
  
  // Calculate average heart rate
  const heartRates = healthData?.filter(data => data.heartRate).map(data => data.heartRate as number) || [];
  const avgHeartRate = heartRates.length ? Math.round(heartRates.reduce((sum, rate) => sum + rate, 0) / heartRates.length) : 0;
  
  // For comparison with previous period (simplified)
  const stepsComparison = 12; // Percentage increase
  const caloriesComparison = 8; // Percentage increase
  const activeMinutesComparison = -3; // Percentage decrease
  const heartRateComparison = -2; // Percentage decrease (lower is better)
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[1, 2, 3, 4].map((index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <Card className="bg-white">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-neutral-800 mb-2">Total Steps</h4>
          <div className="flex items-end">
            <span className="text-2xl font-semibold mr-2">{totalSteps.toLocaleString()}</span>
            <span className="text-xs text-green-500 mb-1 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" /> {stepsComparison}%
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-neutral-800 mb-2">Calories Burned</h4>
          <div className="flex items-end">
            <span className="text-2xl font-semibold mr-2">{totalCalories.toLocaleString()}</span>
            <span className="text-xs text-green-500 mb-1 flex items-center">
              <ArrowUp className="h-3 w-3 mr-1" /> {caloriesComparison}%
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-neutral-800 mb-2">Active Minutes</h4>
          <div className="flex items-end">
            <span className="text-2xl font-semibold mr-2">{totalActiveMinutes.toLocaleString()}</span>
            <span className="text-xs text-red-500 mb-1 flex items-center">
              <ArrowDown className="h-3 w-3 mr-1" /> {Math.abs(activeMinutesComparison)}%
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-neutral-800 mb-2">Avg. Heart Rate</h4>
          <div className="flex items-end">
            <span className="text-2xl font-semibold mr-2">{avgHeartRate}</span>
            <span className="text-xs text-green-500 mb-1 flex items-center">
              <ArrowDown className="h-3 w-3 mr-1" /> {Math.abs(heartRateComparison)}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
