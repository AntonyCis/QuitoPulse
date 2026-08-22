export enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RESOLVED = 'RESOLVED',
}

export enum ReportPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ReportCategorySlug {
  TRAFFIC = 'TRAFFIC',
  ACCIDENT = 'ACCIDENT',
  ROAD_CLOSURE = 'ROAD_CLOSURE',
  CONSTRUCTION = 'CONSTRUCTION',
  EVENT = 'EVENT',
  PUBLIC_SAFETY = 'PUBLIC_SAFETY',
  URBAN_PROBLEM = 'URBAN_PROBLEM',
  OTHER = 'OTHER',
}

export enum ModerationActionType {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  RECLASSIFY = 'RECLASSIFY',
  HIDE = 'HIDE',
  REQUEST_INFO = 'REQUEST_INFO',
  RESOLVE = 'RESOLVE',
  REOPEN = 'REOPEN',
}

export enum NotificationType {
  REPORT_APPROVED = 'REPORT_APPROVED',
  REPORT_REJECTED = 'REPORT_REJECTED',
  REPORT_CONFIRMED = 'REPORT_CONFIRMED',
  COMMENT_RECEIVED = 'COMMENT_RECEIVED',
  REPORT_RESOLVED = 'REPORT_RESOLVED',
}

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  label: string;
  color: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  creatorId: string;
  status: ReportStatus;
  priority: ReportPriority;
  latitude: number;
  longitude: number;
  address: string | null;
  incidentDate: string;
  confirmationCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportImage {
  id: string;
  reportId: string;
  url: string;
  thumbnailUrl: string | null;
  filename: string;
  mimeType: string;
  fileSize: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportConfirmation {
  id: string;
  reportId: string;
  userId: string;
  createdAt: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  userId: string;
  content: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFlag {
  id: string;
  reportId: string;
  userId: string;
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
}

export interface ModerationAction {
  id: string;
  reportId: string;
  moderatorId: string;
  action: ModerationActionType;
  reason: string | null;
  previousStatus: ReportStatus | null;
  newStatus: ReportStatus | null;
  previousCategoryId: string | null;
  newCategoryId: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
