import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AppSettings() {
  const [healthDataAccess, setHealthDataAccess] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState("realtime");
  const { toast } = useToast();
  
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };
  
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">App Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="health-data-toggle" className="font-medium">Health Data Access</Label>
              <p className="text-xs text-neutral-800">Allow app to access your health data</p>
            </div>
            <Switch 
              id="health-data-toggle" 
              checked={healthDataAccess}
              onCheckedChange={setHealthDataAccess}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notification-toggle" className="font-medium">Notifications</Label>
              <p className="text-xs text-neutral-800">Enable push notifications</p>
            </div>
            <Switch 
              id="notification-toggle" 
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme-toggle" className="font-medium">Dark Mode</Label>
              <p className="text-xs text-neutral-800">Switch between light and dark mode</p>
            </div>
            <Switch 
              id="theme-toggle" 
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sync-select" className="font-medium">Data Synchronization</Label>
              <p className="text-xs text-neutral-800">Sync frequency with health devices</p>
            </div>
            <Select
              value={syncFrequency}
              onValueChange={setSyncFrequency}
            >
              <SelectTrigger id="sync-select" className="w-28 h-8 text-sm bg-neutral-100">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-neutral-200 space-y-3">
          <Button variant="outline" className="w-full">
            Privacy Policy
          </Button>
          <Button variant="outline" className="w-full">
            Terms of Service
          </Button>
          <Button 
            variant="destructive" 
            className="w-full bg-error/10 text-error hover:bg-error/20"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
