import { useMutation } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { logError } from '@/src/lib/errors';

/**
 * Hook to complete a survey participation
 */
export function useCompleteParticipation() {
  return useMutation({
    mutationFn: async (participationId: string) => {
      await apiClient.patch(`/participations/${participationId}/complete`);
    },
    onError: (error) => {
      logError(error, 'Complete Participation');
    },
  });
}
