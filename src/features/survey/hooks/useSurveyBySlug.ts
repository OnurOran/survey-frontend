import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { SurveyDetailDto } from '@/src/types';

/**
 * Hook to fetch a single survey by slug
 * @param slug - Survey slug in format: "{slug}-{surveyNumber}" (e.g., "musteri-memnuniyet-anketi-42")
 */
export function useSurveyBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['survey', 'by-slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await apiClient.get<SurveyDetailDto>(`/surveys/by-slug/${slug}`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
