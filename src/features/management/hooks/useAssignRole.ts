import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/api';
import { AssignRoleToUserCommand } from '@/src/types';
import { toast } from 'sonner';
import { parseApiError, logError } from '@/src/lib/errors';

/**
 * Hook to assign a role to a user
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignRoleToUserCommand) => {
      const response = await apiClient.post('/departmentrole/assign', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate department users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['department-users'] });
      toast.success('Rol başarıyla atandı');
    },
    onError: (error) => {
      logError(error, 'Assign Role');
      const message = parseApiError(error);
      toast.error(message);
    },
  });
}
