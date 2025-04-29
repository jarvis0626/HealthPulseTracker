import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";

// Default user ID (would come from auth in a real app)
const DEFAULT_USER_ID = 1;

export default function UserDetails() {
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/user/${DEFAULT_USER_ID}`]
  });
  
  if (isLoading) {
    return (
      <Card className="bg-white animate-pulse mb-4">
        <CardContent className="p-4">
          <div className="h-24 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }
  
  const initials = user?.fullName
    ? user.fullName.split(' ').map(name => name[0]).join('')
    : 'U';
  
  return (
    <Card className="bg-white mb-4">
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
            {initials}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user?.fullName || 'User'}</h3>
            <p className="text-sm text-neutral-800">{user?.email || 'user@example.com'}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto bg-neutral-100 p-2 rounded-full h-auto w-auto"
          >
            <Pencil className="h-4 w-4 text-neutral-800" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <h4 className="text-xs text-neutral-800 mb-1">Age</h4>
            <p className="font-medium">{user?.age || 0} years</p>
          </div>
          <div>
            <h4 className="text-xs text-neutral-800 mb-1">Height</h4>
            <p className="font-medium">
              {user?.height 
                ? `${Math.floor(user.height / 30.48)}'${Math.round((user.height % 30.48) / 2.54)}'' (${user.height} cm)` 
                : 'Not set'}
            </p>
          </div>
          <div>
            <h4 className="text-xs text-neutral-800 mb-1">Weight</h4>
            <p className="font-medium">
              {user?.weight 
                ? `${Math.round(user.weight * 2.20462)} lbs (${user.weight} kg)` 
                : 'Not set'}
            </p>
          </div>
          <div>
            <h4 className="text-xs text-neutral-800 mb-1">Blood Type</h4>
            <p className="font-medium">{user?.bloodType || 'Not set'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
