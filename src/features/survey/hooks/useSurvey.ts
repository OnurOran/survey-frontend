import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { SurveyDetailDto } from '@/src/types';

/**
 * Hook to fetch a single survey by ID
 */
export function useSurvey(surveyId: number | undefined) {
  return useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      if (!surveyId) return null;
      const response = await apiClient.get<SurveyDetailDto>(`/surveys/${surveyId}`);
      return response.data;
    },
    enabled: !!surveyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
