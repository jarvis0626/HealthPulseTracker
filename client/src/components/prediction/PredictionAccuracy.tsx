import { Card, CardContent } from "@/components/ui/card";
import { usePredictions } from "@/hooks/usePredictions";
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

export default function PredictionAccuracy() {
  const { data: predictions, isLoading } = usePredictions();
  
  // Simplified accuracy calculation
  // In a real app, you would compare predictions to actual activities
  const accuracy = 78;
  
  // Sample accuracy trend data
  const accuracyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Accuracy',
      data: [65, 70, 74, 78],
      borderColor: '#2ED47A',
      backgroundColor: 'rgba(46, 212, 122, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
    }]
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: false,
        max: 100,
        grid: { display: false }
      },
      x: {
        grid: { display: false }
      }
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg p-4 mb-4 animate-pulse">
        <CardContent className="p-0">
          <div className="h-48 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white rounded-lg p-4 mb-4">
      <CardContent className="p-0">
        <h3 className="font-semibold mb-2">Prediction Accuracy</h3>
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-neutral-100 relative flex items-center justify-center mr-4">
            <div 
              className="absolute inset-0 rounded-full border-4 border-green-500" 
              style={{ 
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
                transform: `rotate(${accuracy * 3.6}deg)`
              }}
            ></div>
            <span className="text-lg font-bold">{accuracy}%</span>
          </div>
          <div>
            <p className="text-sm">
              Your prediction model has been <span className="font-semibold text-green-500">{accuracy}% accurate</span> over the past 30 days.
            </p>
          </div>
        </div>
        <div className="h-28">
          <Line data={accuracyData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
