import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { SurveyDetailDto } from '@/src/types';

/**
 * Hook to fetch all surveys
 * Note: This assumes a GET /surveys endpoint exists.
 * If it doesn't exist in the backend, we may need to request it.
 */
export function useSurveys() {
  return useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      const response = await apiClient.get<SurveyDetailDto[]>('/surveys');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
