import { useState } from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHealthData } from "@/hooks/useHealthData";
import ActivityOverview from "@/components/dashboard/ActivityOverview";
import ActivityTrends from "@/components/dashboard/ActivityTrends";
import BehaviorPredictions from "@/components/dashboard/BehaviorPredictions";
import HealthInsights from "@/components/dashboard/HealthInsights";
import { useRoute, Link } from "wouter";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [_, params] = useRoute("/user/:id");
  const userId = params?.id ? parseInt(params.id) : 1;
  
  const { data: user, isLoading } = useHealthData(userId);
  
  const formatDate = (date: Date) => {
    return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };
  
  const prevDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  
  const nextDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  // Get user initials
  const initials = "JD"; // Would come from user data
  
  return (
    <>
      {/* App Status Bar */}
      <div className="bg-primary text-white px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-semibold">HealthPredict</div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80 h-auto w-auto p-0">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80 h-auto w-auto p-0">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* User Profile Summary */}
        <div className="flex items-center p-4 border-b border-neutral-200">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
          <div className="ml-4">
            <h2 className="font-semibold text-lg">John Doe</h2>
            <p className="text-sm text-neutral-800">Your wellness score: <span className="font-semibold text-primary">82/100</span></p>
          </div>
          <div className="ml-auto">
            <Link href="/profile">
              <Button className="bg-primary text-white rounded-full px-4 py-1 h-auto text-sm">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Date Selector */}
        <div className="px-4 py-3 flex justify-between items-center">
          <Button variant="ghost" size="sm" className="text-neutral-800 p-0 h-auto" onClick={prevDate}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <h3 className="font-semibold">{formatDate(currentDate)}</h3>
          <Button variant="ghost" size="sm" className="text-neutral-800 p-0 h-auto" onClick={nextDate}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="m9 18 6-6-6-6"/></svg>
          </Button>
        </div>
        
        {/* Components */}
        <ActivityOverview />
        <ActivityTrends />
        <BehaviorPredictions />
        <HealthInsights />
      </div>
    </>
  );
}
