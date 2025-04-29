import { Card, CardContent } from "@/components/ui/card";
import { useHealthData, useHealthDataRange } from "@/hooks/useHealthData";
import { Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend 
} from "chart.js";
import { sleepChartConfig } from "@/lib/chartUtils";
import { Terminal, Moon, Utensils } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BehaviorPatterns() {
  const { data: healthData } = useHealthData();
  
  // Get past week's data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  const { data: weekData } = useHealthDataRange(1, startDate, endDate);
  
  // Sample sleep data
  const sleepData = [7.2, 6.8, 7.5, 6.5, 8.1, 8.4, 7.2];
  const { data, options } = sleepChartConfig(sleepData);
  
  return (
    <>
      <h3 className="font-semibold text-lg mb-3">Identified Patterns</h3>
      <div className="space-y-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 mr-3">
                <Terminal className="text-primary h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">Workout Pattern</h4>
                <p className="text-xs text-neutral-800">3-4 times weekly, primarily evenings</p>
              </div>
            </div>
            <div className="flex space-x-1 mb-3">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div key={index} className="flex-1">
                  <div className="text-xs text-center mb-1">{day}</div>
                  <div className="h-16 bg-neutral-100 rounded-md flex items-end justify-center p-1">
                    <div 
                      className={`w-full ${
                        [0, 2, 4, 5].includes(index) ? "bg-primary" : "bg-neutral-200"
                      } rounded-sm`} 
                      style={{ 
                        height: `${
                          [0, 2, 4, 5].includes(index) 
                            ? [70, 60, 80, 90][Math.floor(index/2)] 
                            : [10, 20, 15][index % 3]
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm">
              You're most likely to work out on Friday and Saturday evenings. These sessions average 42 minutes.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary/10 mr-3">
                <Moon className="text-secondary h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">Sleep Pattern</h4>
                <p className="text-xs text-neutral-800">Average 7.2 hours per night</p>
              </div>
            </div>
            <div className="h-32">
              <Bar data={data} options={options} />
            </div>
            <p className="text-sm mt-2">
              Your sleep quality correlates strongly with physical activity. Days with 8,000+ steps show 23% better sleep quality.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent/10 mr-3">
                <Utensils className="text-accent h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold">Nutrition Pattern</h4>
                <p className="text-xs text-neutral-800">Based on activity correlation</p>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Workout days</span>
              <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">Higher protein intake</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Rest days</span>
              <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full">Higher carb intake</span>
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-200">
              <p className="text-sm">
                We've detected nutrition patterns that coincide with your workout schedule. Optimizing this balance could improve recovery.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
