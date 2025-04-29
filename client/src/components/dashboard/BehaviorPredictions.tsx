import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePredictions, useConfirmPrediction } from "@/hooks/usePredictions";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Bed, Smile, Heart, DollarSign } from "lucide-react";

export default function BehaviorPredictions() {
  const { data: predictions, isLoading, error } = usePredictions();
  const confirmMutation = useConfirmPrediction();
  const { toast } = useToast();
  
  const handleConfirm = (id: number) => {
    confirmMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Prediction confirmed",
          description: "Your activity has been confirmed.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to confirm prediction. Please try again.",
          variant: "destructive",
        });
      }
    });
  };
  
  const getActivityIcon = (type: string | null) => {
    // Safeguard against null or undefined values
    if (!type) {
      return <Terminal className="text-primary h-5 w-5" />;
    }
    
    const typeStr = type.toLowerCase();
    if (typeStr.includes("run") || typeStr.includes("activity")) {
      return <Terminal className="text-primary h-5 w-5" />;
    } else if (typeStr.includes("sleep")) {
      return <Bed className="text-secondary h-5 w-5" />;
    } else if (typeStr.includes("mood")) {
      return <Smile className="text-yellow-500 h-5 w-5" />;
    } else if (typeStr.includes("prayer") || typeStr.includes("spiritual")) {
      return <Heart className="text-red-500 h-5 w-5" />; 
    } else if (typeStr.includes("financ")) {
      return <DollarSign className="text-green-500 h-5 w-5" />;
    }
    // Add more icons as needed
    return <Terminal className="text-primary h-5 w-5" />;
  };
  
  if (isLoading) {
    return (
      <div className="px-4 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Behavior Predictions</h3>
          <Button variant="ghost" size="sm" className="text-primary">View All</Button>
        </div>
        
        <div className="space-y-4">
          {[1, 2].map((index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="px-4 pt-6 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Behavior Predictions</h3>
          <Button variant="ghost" size="sm" className="text-primary">View All</Button>
        </div>
        
        <Card className="bg-red-50">
          <CardContent className="p-4 text-red-500 text-sm">
            Unable to load predictions. Please try again.
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Behavior Predictions</h3>
        <Button variant="ghost" size="sm" className="text-primary">View All</Button>
      </div>
      
      <div className="space-y-4">
        {predictions && predictions.length > 0 ? (
          predictions.map((prediction) => (
            <Card key={prediction.id} className="bg-white">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 mr-3">
                      {getActivityIcon(prediction.predictionType)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{prediction.category}</h4>
                      <p className="text-xs text-neutral-800">
                        {prediction.predictedValue && prediction.predictedValue.slice(0, 30)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xs ${
                      (prediction.confidence || 0) > 80 
                        ? "text-green-500" 
                        : (prediction.confidence || 0) > 60 
                        ? "text-amber-500" 
                        : "text-red-500"
                    } font-medium`}>
                      {prediction.confidence || 0}% confidence
                    </span>
                    <div className="w-16 h-2 bg-neutral-200 rounded-full mt-1">
                      <div 
                        className={`h-2 ${
                          (prediction.confidence || 0) > 80 
                            ? "bg-green-500" 
                            : (prediction.confidence || 0) > 60 
                            ? "bg-amber-500" 
                            : "bg-red-500"
                        } rounded-full`} 
                        style={{ width: `${prediction.confidence || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between items-center">
                  <div className="text-xs text-neutral-800">
                    <span className="font-medium">Based on:</span> {prediction.details}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-primary p-0 h-auto"
                    onClick={() => handleConfirm(prediction.id)}
                    disabled={prediction.confirmed || confirmMutation.isPending}
                  >
                    {prediction.confirmed ? "Confirmed" : "Confirm"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-sm text-gray-500">
              No predictions available yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
