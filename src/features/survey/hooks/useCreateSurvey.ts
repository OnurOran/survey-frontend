import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { CreateSurveyRequest } from '@/src/types';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

/**
 * Hook to create a new survey
 * Returns the survey ID from the Location header
 */
export function useCreateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSurveyRequest) => {
      const response = await apiClient.post('/surveys', data);
      // Extract survey ID from Location header
      const location = response.headers['location'];
      if (location) {
        const surveyId = location.split('/').pop();
        return surveyId;
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Anket başarıyla oluşturuldu');
    },
    onError: (error) => {
      logError(error, 'Create Survey');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
