import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';

interface DepartmentStatsResponse {
  departmentId: string;
  totalSurveys: number;
  activeSurveys: number;
  totalParticipations: number;
  surveys: unknown[]; // Ignored for now
}

/**
 * Hook to fetch department dashboard stats
 * Auto-resolves to authenticated user's department from JWT
 * For Managers only
 */
export function useDepartmentStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['dashboard', 'department'],
    queryFn: async () => {
      const response = await apiClient.get<DepartmentStatsResponse>('/Dashboard/department');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled ?? true,
  });
}
