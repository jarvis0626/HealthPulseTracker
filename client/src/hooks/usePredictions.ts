import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Prediction, InsertPrediction } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

// Default user ID (would come from auth in a real app)
const DEFAULT_USER_ID = 1;

// Get predictions
export function usePredictions(userId = DEFAULT_USER_ID, date?: Date) {
  const formattedDate = date?.toISOString();
  
  return useQuery<Prediction[]>({
    queryKey: [
      `/api/predictions/${userId}`,
      { date: formattedDate },
    ],
  });
}

// Generate predictions
export function useGeneratePredictions() {
  const mutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/generate-predictions/${userId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictions"] });
    },
  });
  
  return mutation;
}

// Confirm prediction
export function useConfirmPrediction() {
  const mutation = useMutation({
    mutationFn: async (predictionId: number) => {
      const response = await apiRequest("POST", `/api/predictions/${predictionId}/confirm`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/predictions"] });
    },
  });
  
  return mutation;
}
