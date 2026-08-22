import { z } from 'zod';

export const adminUpdateRoleSchema = z.object({
  role: z.enum(['USER', 'MODERATOR', 'ADMIN']),
});

export const adminUpdateReportStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'IN_REVIEW', 'RESOLVED']),
  moderatorId: z.string().uuid(),
  reason: z.string().max(1000).optional(),
});

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
});

export type AdminUpdateRoleInput = z.infer<typeof adminUpdateRoleSchema>;
export type AdminUpdateReportStatusInput = z.infer<typeof adminUpdateReportStatusSchema>;
export type AdminPaginationInput = z.infer<typeof adminPaginationSchema>;
