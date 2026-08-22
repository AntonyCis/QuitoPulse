import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido'),
});

export type RefreshInput = z.infer<typeof refreshSchema>;

const reportCategoryEnum = z.enum([
  'TRAFFIC',
  'ACCIDENT',
  'ROAD_CLOSURE',
  'CONSTRUCTION',
  'EVENT',
  'PUBLIC_SAFETY',
  'URBAN_PROBLEM',
  'OTHER',
]);

const reportPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createReportSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(2000),
  category: reportCategoryEnum,
  priority: reportPriorityEnum.default('MEDIUM'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  incidentDate: z.string().datetime().optional(),
  address: z.string().max(500).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

export const updateReportSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  category: reportCategoryEnum.optional(),
  priority: reportPriorityEnum.optional(),
  address: z.string().max(500).optional(),
});

export type UpdateReportInput = z.infer<typeof updateReportSchema>;

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const geoBboxSchema = z.object({
  west: z.coerce.number().min(-180).max(180),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  north: z.coerce.number().min(-90).max(90),
});

export type GeoBboxInput = z.infer<typeof geoBboxSchema>;

export const reportFiltersSchema = z.object({
  category: reportCategoryEnum.optional(),
  status: z.enum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(0).max(50000).optional(),
  west: z.coerce.number().min(-180).max(180).optional(),
  south: z.coerce.number().min(-90).max(90).optional(),
  east: z.coerce.number().min(-180).max(180).optional(),
  north: z.coerce.number().min(-90).max(90).optional(),
}).merge(paginationSchema);

export type ReportFiltersInput = z.infer<typeof reportFiltersSchema>;

export const confirmReportSchema = z.object({
  reportId: z.string().uuid(),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'El comentario no puede estar vacío').max(1000),
});

export type CommentInput = z.infer<typeof commentSchema>;

export const flagSchema = z.object({
  reason: z.string().min(5, 'La razón debe tener al menos 5 caracteres').max(500),
});

export type FlagInput = z.infer<typeof flagSchema>;

export const moderationActionSchema = z.object({
  action: z.enum([
    'APPROVE',
    'REJECT',
    'RECLASSIFY',
    'HIDE',
    'REQUEST_INFO',
    'RESOLVE',
    'REOPEN',
  ]),
  reason: z.string().max(1000).optional(),
  newCategoryId: z.string().uuid().optional(),
});

export type ModerationActionInput = z.infer<typeof moderationActionSchema>;
