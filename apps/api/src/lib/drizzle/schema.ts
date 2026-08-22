import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  doublePrecision,
  jsonb,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const roleEnum = ['USER', 'MODERATOR', 'ADMIN'] as const;
export type RoleType = (typeof roleEnum)[number];

export const reportStatusEnum = [
  'PENDING',
  'IN_REVIEW',
  'APPROVED',
  'REJECTED',
  'RESOLVED',
] as const;
export type ReportStatusType = (typeof reportStatusEnum)[number];

export const reportPriorityEnum = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type ReportPriorityType = (typeof reportPriorityEnum)[number];

export const moderationActionTypeEnum = [
  'APPROVE',
  'REJECT',
  'RECLASSIFY',
  'HIDE',
  'REQUEST_INFO',
  'RESOLVE',
  'REOPEN',
] as const;
export type ModerationActionTypeType = (typeof moderationActionTypeEnum)[number];

export const notificationTypeEnum = [
  'REPORT_APPROVED',
  'REPORT_REJECTED',
  'REPORT_CONFIRMED',
  'COMMENT_RECEIVED',
  'REPORT_RESOLVED',
] as const;
export type NotificationTypeType = (typeof notificationTypeEnum)[number];

export const reportFlagStatusEnum = ['PENDING', 'REVIEWED', 'DISMISSED'] as const;
export type ReportFlagStatusType = (typeof reportFlagStatusEnum)[number];

// ============================================
// TABLES
// ============================================

// --- Users ---
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: varchar('role', { length: 20 }).notNull().default('USER'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_users_email').on(table.email),
    index('idx_users_role').on(table.role),
  ],
);

// --- Profiles ---
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    displayName: varchar('display_name', { length: 100 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    bio: text('bio'),
    phone: varchar('phone', { length: 20 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_profiles_user').on(table.userId)],
);

// --- Categories ---
export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    label: varchar('label', { length: 100 }).notNull(),
    color: varchar('color', { length: 7 }).notNull(),
    icon: varchar('icon', { length: 50 }),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_categories_name').on(table.name),
    index('idx_categories_active').on(table.isActive),
  ],
);

// --- Reports ---
export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => users.id),
    status: varchar('status', { length: 20 }).notNull().default('PENDING'),
    priority: varchar('priority', { length: 20 }).notNull().default('MEDIUM'),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    // PostGIS point geometry — auto-generated from lat/lng via DB trigger
    location: text('location').default(sql`NULL`),
    address: varchar('address', { length: 500 }),
    incidentDate: timestamp('incident_date', { withTimezone: true }),
    confirmationCount: integer('confirmation_count').notNull().default(0),
    viewCount: integer('view_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_reports_category').on(table.categoryId),
    index('idx_reports_creator').on(table.creatorId),
    index('idx_reports_status').on(table.status),
    index('idx_reports_created').on(table.createdAt),
    index('idx_reports_incident_date').on(table.incidentDate),
    index('idx_reports_status_created').on(table.status, table.createdAt),
    index('idx_reports_category_status').on(table.categoryId, table.status),
    index('idx_reports_lat_lng').on(table.latitude, table.longitude),
  ],
);

// --- Report Images ---
export const reportImages = pgTable(
  'report_images',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    url: varchar('url', { length: 500 }).notNull(),
    thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
    filename: varchar('filename', { length: 255 }).notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_report_images_report').on(table.reportId),
  ],
);

// --- Report Confirmations ---
export const reportConfirmations = pgTable(
  'report_confirmations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_report_confirmations_report').on(table.reportId),
    index('idx_report_confirmations_user').on(table.userId),
    uniqueIndex('idx_report_confirmations_unique').on(table.reportId, table.userId),
  ],
);

// --- Report Comments ---
export const reportComments = pgTable(
  'report_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isHidden: boolean('is_hidden').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_report_comments_report').on(table.reportId),
    index('idx_report_comments_user').on(table.userId),
  ],
);

// --- Report Flags ---
export const reportFlags = pgTable(
  'report_flags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    reason: text('reason').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('PENDING'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_report_flags_report').on(table.reportId),
    index('idx_report_flags_user').on(table.userId),
    index('idx_report_flags_status').on(table.status),
  ],
);

// --- Moderation Actions ---
export const moderationActions = pgTable(
  'moderation_actions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.id, { onDelete: 'cascade' }),
    moderatorId: uuid('moderator_id')
      .notNull()
      .references(() => users.id),
    action: varchar('action', { length: 30 }).notNull(),
    reason: text('reason'),
    previousStatus: varchar('previous_status', { length: 20 }),
    newStatus: varchar('new_status', { length: 20 }),
    previousCategoryId: uuid('previous_category_id').references(() => categories.id),
    newCategoryId: uuid('new_category_id').references(() => categories.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_moderation_actions_report').on(table.reportId),
    index('idx_moderation_actions_moderator').on(table.moderatorId),
    index('idx_moderation_actions_created').on(table.createdAt),
  ],
);

// --- Audit Logs ---
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: uuid('entity_id'),
    metadata: jsonb('metadata'),
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_logs_user').on(table.userId),
    index('idx_audit_logs_entity').on(table.entityType, table.entityId),
    index('idx_audit_logs_action').on(table.action),
    index('idx_audit_logs_created').on(table.createdAt),
  ],
);

// --- Notifications ---
export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 30 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    message: text('message').notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: uuid('entity_id'),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_notifications_user').on(table.userId),
    index('idx_notifications_user_read').on(table.userId, table.isRead),
    index('idx_notifications_created').on(table.createdAt),
  ],
);

// --- Refresh Tokens ---
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_refresh_tokens_user').on(table.userId),
    index('idx_refresh_tokens_hash').on(table.tokenHash),
    index('idx_refresh_tokens_expires').on(table.expiresAt),
  ],
);
