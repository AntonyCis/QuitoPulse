import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export interface ReportDetail {
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
  images: ReportImage[];
  comments: ReportComment[];
}

interface ReportImage {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  filename: string;
  mimeType: string;
  fileSize: number;
  sortOrder: number;
}

interface ReportComment {
  id: string;
  reportId: string;
  userId: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
}

export function useReportDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => apiClient.get<ReportDetail>(`/reports/${id}`),
    enabled: !!id,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, content }: { reportId: string; content: string }) =>
      apiClient.post<ReportComment>(`/reports/${reportId}/comments`, { content }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
}
