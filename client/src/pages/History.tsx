import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoute, Link } from "wouter";
import DateRangeSelector from "@/components/history/DateRangeSelector";
import MetricsOverview from "@/components/history/MetricsOverview";
import DetailCharts from "@/components/history/DetailCharts";

export default function History() {
  const [_, params] = useRoute("/user/:id");
  const userId = params?.id ? parseInt(params.id) : 1;
  
  // Get date range for this week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start of week (Monday)
  
  const [startDate, setStartDate] = useState(startOfWeek);
  const [endDate, setEndDate] = useState(today);
  
  const handlePeriodChange = (period: "week" | "month" | "year") => {
    const end = new Date();
    const start = new Date();
    
    if (period === "week") {
      start.setDate(end.getDate() - 6);
    } else if (period === "month") {
      start.setMonth(end.getMonth() - 1);
    } else if (period === "year") {
      start.setFullYear(end.getFullYear() - 1);
    }
    
    setStartDate(start);
    setEndDate(end);
  };
  
  return (
    <>
      {/* App Status Bar */}
      <div className="bg-primary text-white px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-semibold">HealthPredict</div>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-3 text-neutral-800 p-0 h-auto">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h2 className="font-semibold text-xl">Health History</h2>
          </div>
          
          <DateRangeSelector onPeriodChange={handlePeriodChange} />
          <MetricsOverview startDate={startDate} endDate={endDate} />
          <DetailCharts startDate={startDate} endDate={endDate} />
        </div>
      </div>
    </>
  );
}
