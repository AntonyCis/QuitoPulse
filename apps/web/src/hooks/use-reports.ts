import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export interface ReportListItem {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  categoryLabel: string;
  categoryColor: string;
  creatorId: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  address: string | null;
  incidentDate: string | null;
  confirmationCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReportsResponse {
  items: ReportListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ReportFilters {
  west?: number;
  south?: number;
  east?: number;
  north?: number;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useReports(filters: ReportFilters) {
  const params: Record<string, string | number> = {};

  if (filters.west !== undefined) params.west = filters.west;
  if (filters.south !== undefined) params.south = filters.south;
  if (filters.east !== undefined) params.east = filters.east;
  if (filters.north !== undefined) params.north = filters.north;
  if (filters.category) params.category = filters.category;
  if (filters.status) params.status = filters.status;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => apiClient.get<ReportsResponse>('/reports', params),
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      categoryId: string;
      latitude: number;
      longitude: number;
      priority?: string;
      address?: string;
      incidentDate?: string;
    }) => apiClient.post<ReportListItem>('/reports', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useConfirmReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) =>
      apiClient.post<{ confirmed: boolean }>(`/reports/${reportId}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
