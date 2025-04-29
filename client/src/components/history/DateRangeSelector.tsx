import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Period = "week" | "month" | "year";
type DateSelectorProps = {
  onPeriodChange: (period: Period) => void;
};

export default function DateRangeSelector({ onPeriodChange }: DateSelectorProps) {
  const [period, setPeriod] = useState<Period>("week");
  
  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };
  
  // Generate week dates
  const today = new Date();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDates = [];
  
  // Find the Monday of the current week
  const monday = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday
  monday.setDate(diff);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push({
      dayName: weekDays[i],
      dayNumber: date.getDate(),
      date: date,
      isToday: date.toDateString() === today.toDateString()
    });
  }
  
  return (
    <Card className="bg-white rounded-lg p-4 mb-4">
      <CardContent className="p-0">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Select Period</h3>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1 rounded-full text-xs h-auto ${
                period === "week" 
                  ? "bg-primary text-white" 
                  : "bg-neutral-100 text-neutral-800"
              }`}
              onClick={() => handlePeriodChange("week")}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1 rounded-full text-xs h-auto ${
                period === "month" 
                  ? "bg-primary text-white" 
                  : "bg-neutral-100 text-neutral-800"
              }`}
              onClick={() => handlePeriodChange("month")}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 py-1 rounded-full text-xs h-auto ${
                period === "year" 
                  ? "bg-primary text-white" 
                  : "bg-neutral-100 text-neutral-800"
              }`}
              onClick={() => handlePeriodChange("year")}
            >
              Year
            </Button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {weekDates.map((date, index) => (
            <div key={index} className="text-center">
              <div className="text-xs mb-1">{date.dayName}</div>
              <div 
                className={`h-8 w-8 mx-auto flex items-center justify-center text-xs rounded-full ${
                  date.isToday ? "bg-primary text-white" : ""
                }`}
              >
                {date.dayNumber}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
