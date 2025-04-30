import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { HealthData, InsertHealthData, HealthGoals, InsertHealthGoals } from "@shared/schema";

// Default user ID (would come from auth in a real app)
const DEFAULT_USER_ID = 1;

// Get today's health data
export function useHealthData(userId = DEFAULT_USER_ID) {
  return useQuery<HealthData>({
    queryKey: [`/api/health-data/${userId}`],
  });
}

// Get health data for a date range
export function useHealthDataRange(
  userId = DEFAULT_USER_ID,
  startDate?: Date,
  endDate?: Date
) {
  const queryEnabled = !!(startDate && endDate);
  const formattedStart = startDate?.toISOString();
  const formattedEnd = endDate?.toISOString();
  
  return useQuery<HealthData[]>({
    queryKey: [
      `/api/health-data/${userId}`,
      { startDate: formattedStart, endDate: formattedEnd },
    ],
    enabled: queryEnabled,
    select: (data) => {
      // If data is an array, return it; if it's a single object, wrap it in an array
      if (Array.isArray(data)) {
        return data;
      } else if (data) {
        return [data];
      }
      return [];
    }
  });
}

// Create health data
export function useCreateHealthData() {
  const mutation = useMutation({
    mutationFn: async (data: InsertHealthData) => {
      const response = await apiRequest("POST", "/api/health-data", data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/health-data"] });
    },
  });
  
  return mutation;
}

// Get health goals
export function useHealthGoals(userId = DEFAULT_USER_ID) {
  return useQuery<HealthGoals>({
    queryKey: [`/api/health-goals/${userId}`],
  });
}

// Create health goals
export function useCreateHealthGoals() {
  const mutation = useMutation({
    mutationFn: async (data: InsertHealthGoals) => {
      const response = await apiRequest("POST", "/api/health-goals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-goals"] });
    },
  });
  
  return mutation;
}

// Update health goals
export function useUpdateHealthGoals() {
  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertHealthGoals> }) => {
      const response = await apiRequest("PUT", `/api/health-goals/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-goals"] });
    },
  });
  
  return mutation;
}

// Import queryClient for cache invalidation
import { queryClient } from "@/lib/queryClient";
