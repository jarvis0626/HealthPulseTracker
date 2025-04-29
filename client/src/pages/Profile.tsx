import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoute, Link } from "wouter";
import UserDetails from "@/components/profile/UserDetails";
import HealthGoals from "@/components/profile/HealthGoals";
import AppSettings from "@/components/profile/AppSettings";

export default function Profile() {
  const [_, params] = useRoute("/user/:id");
  const userId = params?.id ? parseInt(params.id) : 1;
  
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
            <h2 className="font-semibold text-xl">My Profile</h2>
          </div>
          
          <UserDetails />
          <HealthGoals />
          <AppSettings />
        </div>
      </div>
    </>
  );
}
