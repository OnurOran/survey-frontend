import { useMutation } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { StartParticipationRequest } from '@/src/types';
import { logError } from '@/src/lib/errors';

/**
 * Hook to start a survey participation
 * Returns participationId
 * @param slug - Survey slug in format: "{slug}-{surveyNumber}" (e.g., "musteri-memnuniyet-anketi-42")
 */
export function useStartParticipation() {
  return useMutation({
    mutationFn: async (slug: string) => {
      const request: StartParticipationRequest = {
        Slug: slug,
      };
      const response = await apiClient.post<string>('/participations/start', request);
      return response.data;
    },
    onError: (error) => {
      logError(error, 'Start Participation');
    },
  });
}
