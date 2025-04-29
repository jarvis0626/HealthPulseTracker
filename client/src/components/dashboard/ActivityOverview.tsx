import { useHealthData } from "@/hooks/useHealthData";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Footprints, Heart, Flame } from "lucide-react";

export default function ActivityOverview() {
  const { data: healthData, isLoading, error } = useHealthData();
  
  if (isLoading) {
    return (
      <div className="px-4 pt-2 pb-4">
        <h3 className="font-semibold text-neutral-800 mb-3">Today's Activity</h3>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((index) => (
            <Card key={index} className="bg-neutral-100">
              <CardContent className="p-3 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-gray-200 animate-pulse"></div>
                <span className="text-xs text-neutral-800 bg-gray-200 animate-pulse w-12 h-3"></span>
                <span className="font-semibold text-sm bg-gray-200 animate-pulse w-8 h-4 mt-1"></span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="px-4 pt-2 pb-4">
        <h3 className="font-semibold text-neutral-800 mb-3">Today's Activity</h3>
        <Card className="bg-red-50 p-3">
          <CardContent className="p-0 text-red-500 text-sm">
            Unable to load activity data. Please try again.
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="px-4 pt-2 pb-4">
      <h3 className="font-semibold text-neutral-800 mb-3">Today's Activity</h3>
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-neutral-100">
          <CardContent className="p-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-primary/10">
              <Footprints className="text-primary h-5 w-5" />
            </div>
            <span className="text-xs text-neutral-800">Steps</span>
            <span className="font-semibold text-sm">
              {healthData?.steps?.toLocaleString() || '0'}
            </span>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-100">
          <CardContent className="p-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-accent/10">
              <Flame className="text-accent h-5 w-5" />
            </div>
            <span className="text-xs text-neutral-800">Calories</span>
            <span className="font-semibold text-sm">
              {healthData?.calories?.toLocaleString() || '0'}
            </span>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-100">
          <CardContent className="p-3 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-secondary/10">
              <Heart className="text-secondary h-5 w-5" />
            </div>
            <span className="text-xs text-neutral-800">Heart Rate</span>
            <span className="font-semibold text-sm">
              {healthData?.heartRate || '0'} bpm
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
