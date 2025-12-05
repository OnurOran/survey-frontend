import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/lib/api';
import type { SurveyReportDto, ParticipantResponseDto } from '@/src/types';

export function useSurveyReport(surveyId: string | undefined) {
  return useQuery({
    queryKey: ['survey-report', surveyId],
    queryFn: async () => {
      if (!surveyId) throw new Error('Survey ID is required');
      const response = await apiClient.get<SurveyReportDto>(`/surveys/${surveyId}/report`);
      return response.data;
    },
    enabled: !!surveyId,
  });
}

export function useParticipantResponse(surveyId: string | undefined, participantName: string | undefined) {
  return useQuery({
    queryKey: ['participant-response', surveyId, participantName],
    queryFn: async () => {
      if (!surveyId || !participantName) throw new Error('Survey ID and participant name are required');
      const response = await apiClient.get<ParticipantResponseDto>(`/surveys/${surveyId}/report/participant`, {
        params: { participantName },
      });
      return response.data;
    },
    enabled: !!surveyId && !!participantName && participantName.length > 0,
  });
}
