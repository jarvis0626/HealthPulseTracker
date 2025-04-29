import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHealthGoals, useUpdateHealthGoals } from "@/hooks/useHealthData";
import { useToast } from "@/hooks/use-toast";

export default function HealthGoals() {
  const { data: goals, isLoading } = useHealthGoals();
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateHealthGoals();
  const { toast } = useToast();
  
  // Form state
  const [dailySteps, setDailySteps] = useState<number | undefined>();
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<number | undefined>();
  const [sleepQuality, setSleepQuality] = useState<number | undefined>();
  
  // Initialize form values when data loads
  useState(() => {
    if (goals && !dailySteps && !weeklyWorkouts && !sleepQuality) {
      setDailySteps(goals.dailySteps);
      setWeeklyWorkouts(goals.weeklyWorkouts);
      setSleepQuality(goals.sleepQuality);
    }
  });
  
  const handleSubmit = () => {
    if (!goals) return;
    
    updateMutation.mutate({
      id: goals.id,
      data: {
        dailySteps,
        weeklyWorkouts,
        sleepQuality,
        userId: goals.userId
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Goals updated",
          description: "Your health goals have been updated successfully."
        });
        setIsEditing(false);
      },
      onError: () => {
        toast({
          title: "Update failed",
          description: "Failed to update health goals. Please try again.",
          variant: "destructive"
        });
      }
    });
  };
  
  if (isLoading) {
    return (
      <Card className="bg-white animate-pulse mb-4">
        <CardContent className="p-4">
          <div className="h-40 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate progress
  const stepsProgress = goals?.dailySteps ? (8000 / goals.dailySteps) * 100 : 0;
  const workoutsProgress = goals?.weeklyWorkouts ? (3 / goals.weeklyWorkouts) * 100 : 0;
  const sleepProgress = goals?.sleepQuality ? 76 : 0;
  
  if (isEditing) {
    return (
      <Card className="bg-white mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Health Goals</h3>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-auto py-1"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="text-xs h-auto py-1"
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Daily Steps Target</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-md text-sm"
                value={dailySteps || ''}
                onChange={(e) => setDailySteps(parseInt(e.target.value) || undefined)}
                min="1000"
                max="50000"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Weekly Workouts Target</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-md text-sm"
                value={weeklyWorkouts || ''}
                onChange={(e) => setWeeklyWorkouts(parseInt(e.target.value) || undefined)}
                min="1"
                max="14"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-1">Sleep Quality Target (%)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-md text-sm"
                value={sleepQuality || ''}
                onChange={(e) => setSleepQuality(parseInt(e.target.value) || undefined)}
                min="50"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Health Goals</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-primary font-medium h-auto p-0"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Daily Steps</span>
              <span className="text-xs">8,000 / {goals?.dailySteps?.toLocaleString() || 10000}</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full">
              <div 
                className="h-2 bg-primary rounded-full" 
                style={{ width: `${Math.min(stepsProgress, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Weekly Workouts</span>
              <span className="text-xs">3 / {goals?.weeklyWorkouts || 4}</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full">
              <div 
                className="h-2 bg-primary rounded-full" 
                style={{ width: `${Math.min(workoutsProgress, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Sleep Quality</span>
              <span className="text-xs">76%</span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full">
              <div 
                className="h-2 bg-secondary rounded-full" 
                style={{ width: `${Math.min(sleepProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
