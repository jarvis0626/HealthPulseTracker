import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHealthData } from "@/hooks/useHealthData";
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
import { hrvChartConfig } from "@/lib/chartUtils";
import { HeartPulse, Lightbulb } from "lucide-react";

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

export default function HealthInsights() {
  const { data: healthData, isLoading } = useHealthData();
  
  // Sample HRV data
  const hrvData = [42, 45, 44, 48, 52, 54, 56];
  const { data, options } = hrvChartConfig(hrvData);
  
  if (isLoading) {
    return (
      <div className="px-4 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Health Insights</h3>
          <Button variant="ghost" size="sm" className="text-primary">View All</Button>
        </div>
        
        <div className="space-y-4">
          <Card className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-40 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Health Insights</h3>
        <Button variant="ghost" size="sm" className="text-primary">View All</Button>
      </div>
      
      <div className="space-y-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-accent/10 mr-3">
                  <HeartPulse className="text-accent h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Heart Rate Variability</h4>
                </div>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                Improved
              </span>
            </div>
            
            <div className="h-28">
              <Line data={data} options={options} />
            </div>
            
            <p className="text-sm mt-2">
              Your HRV is showing an upward trend, indicating improved recovery and stress management.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 mr-3">
                <Lightbulb className="text-primary h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Personalized Recommendation</h4>
                <p className="text-sm mt-1">
                  Based on your activity patterns, we recommend adding a 10-minute stretching session to your morning routine.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
