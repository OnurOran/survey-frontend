import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { SurveyListItemDto } from '@/src/types';

/**
 * Hook to fetch department surveys
 * Calls GET /api/Surveys/department
 * Auto-resolves to user's department from JWT
 */
export function useSurveys() {
  return useQuery({
    queryKey: ['surveys', 'department'],
    queryFn: async () => {
      const response = await apiClient.get<SurveyListItemDto[]>('/Surveys/department');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
