import { useMutation } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { StartParticipationRequest } from '@/src/types';
import { logError } from '@/src/lib/errors';

/**
 * Hook to start a survey participation
 * Returns participationId
 */
export function useStartParticipation() {
  return useMutation({
    mutationFn: async (surveyId: string) => {
      const request: StartParticipationRequest = {
        SurveyId: surveyId,
      };
      const response = await apiClient.post<string>('/participations/start', request);
      return response.data;
    },
    onError: (error) => {
      logError(error, 'Start Participation');
    },
  });
}
