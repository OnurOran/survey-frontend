import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { ParticipationStatusResult } from '@/src/types';
import { logError } from '@/src/lib/errors';

/**
 * Hook to check if user has already participated/completed a survey
 * @param slug - Survey slug in format: "{slug}-{surveyNumber}" (e.g., "musteri-memnuniyet-anketi-42")
 */
export function useParticipationStatus(slug: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['participationStatus', slug],
    queryFn: async () => {
      const response = await apiClient.get<ParticipationStatusResult>(`/participations/status/${slug}`);
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
