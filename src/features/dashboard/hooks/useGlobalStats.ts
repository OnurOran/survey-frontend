import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';

interface GlobalStatsResponse {
  totalSurveys: number;
  activeSurveys: number;
  totalParticipations: number;
  surveys: unknown[]; // Ignored for now
}

/**
 * Hook to fetch global dashboard stats
 * For Super Admin only
 */
export function useGlobalStats() {
  return useQuery({
    queryKey: ['dashboard', 'global'],
    queryFn: async () => {
      const response = await apiClient.get<GlobalStatsResponse>('/Dashboard/global');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
