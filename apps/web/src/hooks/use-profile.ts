import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  bio: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get<UserProfile>('/users/me'),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      apiClient.patch<UserProfile>('/users/me', data),
    onSuccess: () => {
      queryClient.setQueryData(['profile'], (old: UserProfile | undefined) => old);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}