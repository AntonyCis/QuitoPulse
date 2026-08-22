import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

interface Category {
  id: string;
  name: string;
  label: string;
  color: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get<Category[]>('/categories'),
  });
}
