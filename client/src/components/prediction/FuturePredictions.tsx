import { Card, CardContent } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";
import { forecastChartConfig } from "@/lib/chartUtils";
import { ChartLine } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function FuturePredictions() {
  // Sample forecast data
  const actual = [6500, 2000, 7800, 3200, 9400, 8200, 4500];
  const predicted = [7000, 2200, 8500, 3500, 10500, 9000, 5000];
  
  const { data, options } = forecastChartConfig(actual, predicted);
  
  return (
    <>
      <h3 className="font-semibold text-lg mt-6 mb-3">Future Predictions</h3>
      <div className="space-y-4">
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="flex justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 mr-3">
                  <ChartLine className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Weekly Activity Forecast</h4>
                </div>
              </div>
            </div>
            <div className="h-36">
              <Line data={data} options={options} />
            </div>
            <p className="text-sm mt-2">
              Based on your patterns, we predict next week will include 4 workout sessions with a 15% increase in intensity.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
