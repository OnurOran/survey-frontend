import { useMutation } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { SubmitAnswerRequest } from '@/src/types';
import { logError } from '@/src/lib/errors';

interface SubmitAnswerParams {
  participationId: string;
  answer: SubmitAnswerRequest;
}

/**
 * Hook to submit an answer for a question
 */
export function useSubmitAnswer() {
  return useMutation({
    mutationFn: async ({ participationId, answer }: SubmitAnswerParams) => {
      // Convert to PascalCase for C# backend
      const request = {
        QuestionId: answer.questionId,
        TextValue: answer.textValue || null,
        OptionIds: answer.optionIds || [],
      };
      await apiClient.post(`/participations/${participationId}/answers`, request);
    },
    onError: (error) => {
      logError(error, 'Submit Answer');
    },
  });
}
