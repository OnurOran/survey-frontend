import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { ParticipationStatusResult } from '@/src/types';
import { logError } from '@/src/lib/errors';

/**
 * Hook to check if user has already participated/completed a survey
 */
export function useParticipationStatus(surveyId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['participationStatus', surveyId],
    queryFn: async () => {
      const response = await apiClient.get<ParticipationStatusResult>(`/participations/status/${surveyId}`);
      return response.data;
    },
    enabled,
    retry: false,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the result
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
