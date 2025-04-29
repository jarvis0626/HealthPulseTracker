import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHealthData, useHealthDataRange } from "@/hooks/useHealthData";
import { Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from "chart.js";
import { activityChartConfig } from "@/lib/chartUtils";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ActivityTrends() {
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("day");
  const { data: todayData } = useHealthData();
  
  // Prepare date range for queries
  const endDate = new Date();
  const startDate = new Date();
  if (timeframe === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (timeframe === "month") {
    startDate.setDate(startDate.getDate() - 30);
  }
  
  const { data: rangeData } = useHealthDataRange(
    1,
    timeframe !== "day" ? startDate : undefined,
    timeframe !== "day" ? endDate : undefined
  );
  
  // Prepare chart data based on timeframe
  let chartData: number[] = [];
  
  if (timeframe === "day" && todayData) {
    // For day view, we'll simulate hourly data based on total steps
    const totalSteps = todayData.steps || 0;
    chartData = [
      Math.round(totalSteps * 0.15), // 6AM
      Math.round(totalSteps * 0.29), // 9AM
      Math.round(totalSteps * 0.46), // 12PM
      Math.round(totalSteps * 0.63), // 3PM
      Math.round(totalSteps * 0.91), // 6PM
      totalSteps // 9PM
    ];
  } else if (rangeData && rangeData.length) {
    // For week/month view, use actual data
    // This is simplified - in a real app you'd aggregate by day
    chartData = rangeData.map(d => d.steps || 0);
  }
  
  const { data, options } = activityChartConfig(chartData);
  
  return (
    <div className="p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Activity Trends</h3>
        <div className="flex space-x-2">
          <Button 
            variant={timeframe === "day" ? "default" : "outline"}
            size="sm" 
            className={`rounded-full px-3 py-1 h-auto ${
              timeframe === "day" 
                ? "bg-primary/10 text-primary" 
                : "bg-neutral-100 text-neutral-800"
            }`}
            onClick={() => setTimeframe("day")}
          >
            Day
          </Button>
          <Button 
            variant={timeframe === "week" ? "default" : "outline"}
            size="sm" 
            className={`rounded-full px-3 py-1 h-auto ${
              timeframe === "week" 
                ? "bg-primary/10 text-primary" 
                : "bg-neutral-100 text-neutral-800"
            }`}
            onClick={() => setTimeframe("week")}
          >
            Week
          </Button>
          <Button 
            variant={timeframe === "month" ? "default" : "outline"}
            size="sm" 
            className={`rounded-full px-3 py-1 h-auto ${
              timeframe === "month" 
                ? "bg-primary/10 text-primary" 
                : "bg-neutral-100 text-neutral-800"
            }`}
            onClick={() => setTimeframe("month")}
          >
            Month
          </Button>
        </div>
      </div>
      
      <Card className="bg-white rounded-lg p-2 h-56">
        <CardContent className="p-0 h-full">
          <Line data={data} options={options} />
        </CardContent>
      </Card>
    </div>
  );
}
