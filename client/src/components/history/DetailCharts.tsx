import { Card, CardContent } from "@/components/ui/card";
import { useHealthDataRange } from "@/hooks/useHealthData";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement 
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { 
  activityDistributionChartConfig, 
  heartRateZonesChartConfig, 
  sleepAnalysisChartConfig 
} from "@/lib/chartUtils";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

type DetailChartsProps = {
  startDate: Date;
  endDate: Date;
};

export default function DetailCharts({ startDate, endDate }: DetailChartsProps) {
  const { data: healthData, isLoading } = useHealthDataRange(1, startDate, endDate);
  
  // Use first health data entry for activity types distribution
  const activityTypes = healthData && healthData.length > 0 && healthData[0].activityTypes
    ? [
        healthData[0].activityTypes.walking,
        healthData[0].activityTypes.running,
        healthData[0].activityTypes.cycling,
        healthData[0].activityTypes.other
      ]
    : [45, 25, 20, 10]; // Default values
  
  const { data: distributionData, options: distributionOptions } = activityDistributionChartConfig(activityTypes);
  
  // Heart rate zones (using default values)
  const { data: heartRateData, options: heartRateOptions } = heartRateZonesChartConfig();
  
  // Sleep analysis (using default values)
  const { data: sleepData, options: sleepOptions } = sleepAnalysisChartConfig();
  
  // Calculate sleep metrics
  const avgSleep = healthData
    ? healthData.reduce((sum, data) => sum + (data.sleepDuration || 0), 0) / (healthData.filter(d => d.sleepDuration).length || 1)
    : 7.2;
  
  const avgQuality = healthData
    ? healthData.reduce((sum, data) => sum + (data.sleepQuality || 0), 0) / (healthData.filter(d => d.sleepQuality).length || 1)
    : 76;
  
  const avgDeepSleep = healthData
    ? healthData.reduce((sum, data) => sum + (data.deepSleep || 0), 0) / (healthData.filter(d => d.deepSleep).length || 1)
    : 1.7;
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-40 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card className="bg-white">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Activity Distribution</h3>
          <div className="h-40">
            <Doughnut data={distributionData} options={distributionOptions} />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Heart Rate Zones</h3>
          <div className="h-40">
            <Bar data={heartRateData} options={heartRateOptions} />
          </div>
          <div className="grid grid-cols-4 gap-1 mt-3">
            <div className="text-center">
              <div className="h-2 bg-blue-200 rounded-full mx-4 mb-1"></div>
              <span className="text-xs">Resting</span>
            </div>
            <div className="text-center">
              <div className="h-2 bg-green-300 rounded-full mx-4 mb-1"></div>
              <span className="text-xs">Fat Burn</span>
            </div>
            <div className="text-center">
              <div className="h-2 bg-yellow-300 rounded-full mx-4 mb-1"></div>
              <span className="text-xs">Cardio</span>
            </div>
            <div className="text-center">
              <div className="h-2 bg-red-400 rounded-full mx-4 mb-1"></div>
              <span className="text-xs">Peak</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Sleep Analysis</h3>
          <div className="h-40">
            <Bar data={sleepData} options={sleepOptions} />
          </div>
          <div className="flex justify-between mt-3 text-xs text-neutral-800">
            <div>
              <div className="font-medium">Average Sleep</div>
              <div>{avgSleep.toFixed(1)}h</div>
            </div>
            <div>
              <div className="font-medium">Sleep Quality</div>
              <div>{Math.round(avgQuality)}%</div>
            </div>
            <div>
              <div className="font-medium">Deep Sleep</div>
              <div>{avgDeepSleep.toFixed(1)}h</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
