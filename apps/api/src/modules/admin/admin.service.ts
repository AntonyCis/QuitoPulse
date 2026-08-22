import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  users,
  profiles,
  reports,
  categories,
  reportFlags,
  moderationActions,
} from '../../lib/drizzle/schema';
import * as schema from '../../lib/drizzle/schema';
import { eq, desc, sql, count, and } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getStats() {
    const [totalUsers] = await this.db
      .select({ count: count() })
      .from(users);

    const [activeUsers] = await this.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));

    const totalReports = await this.db
      .select({
        status: reports.status,
        count: count(),
      })
      .from(reports)
      .groupBy(reports.status);

    const statusCounts: Record<string, number> = {};
    for (const row of totalReports) {
      statusCounts[row.status] = row.count;
    }

    const [totalFlags] = await this.db
      .select({ count: count() })
      .from(reportFlags)
      .where(eq(reportFlags.status, 'PENDING'));

    const recentReports = await this.db
      .select({
        id: reports.id,
        title: reports.title,
        status: reports.status,
        categoryLabel: categories.label,
        categoryColor: categories.color,
        createdAt: reports.createdAt,
      })
      .from(reports)
      .leftJoin(categories, eq(reports.categoryId, categories.id))
      .orderBy(desc(reports.createdAt))
      .limit(5);

    return {
      users: {
        total: totalUsers?.count ?? 0,
        active: activeUsers?.count ?? 0,
      },
      reports: {
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        byStatus: statusCounts,
      },
      pendingFlags: totalFlags?.count ?? 0,
      recentReports,
    };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const offset = (page - 1) * limit;
    const conditions = [];

    if (search) {
      conditions.push(sql`${users.email} ILIKE ${'%' + search + '%'}`);
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(users)
      .where(where);

    const total = totalResult?.count ?? 0;

    const items = await this.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateUserRole(userId: string, role: string) {
    const [updated] = await this.db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }

  async toggleUserActive(userId: string) {
    const [existing] = await this.db
      .select({ isActive: users.isActive })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existing) return null;

    const [updated] = await this.db
      .update(users)
      .set({ isActive: !existing.isActive, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }

  async getPendingReports(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.status, 'PENDING'));

    const total = totalResult?.count ?? 0;

    const items = await this.db
      .select({
        id: reports.id,
        title: reports.title,
        description: reports.description,
        status: reports.status,
        priority: reports.priority,
        latitude: reports.latitude,
        longitude: reports.longitude,
        confirmationCount: reports.confirmationCount,
        createdAt: reports.createdAt,
        categoryLabel: categories.label,
        categoryColor: categories.color,
        creatorEmail: users.email,
      })
      .from(reports)
      .leftJoin(categories, eq(reports.categoryId, categories.id))
      .leftJoin(users, eq(reports.creatorId, users.id))
      .where(eq(reports.status, 'PENDING'))
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateReportStatus(
    reportId: string,
    newStatus: string,
    moderatorId: string,
    reason?: string,
  ) {
    const [existing] = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!existing) return null;

    const previousStatus = existing.status;

    await this.db
      .update(reports)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(reports.id, reportId));

    await this.db.insert(moderationActions).values({
      reportId,
      moderatorId,
      action: newStatus === 'APPROVED' ? 'APPROVE' : newStatus === 'REJECTED' ? 'REJECT' : 'RESOLVE',
      reason,
      previousStatus,
      newStatus,
    });

    // Send notification to report creator
    const statusLabels: Record<string, string> = {
      APPROVED: 'aprobado',
      REJECTED: 'rechazado',
      RESOLVED: 'resuelto',
      IN_REVIEW: 'en revisión',
    };

    const label = statusLabels[newStatus] || newStatus.toLowerCase();
    const title = `Tu reporte fue ${label}`;
    const message = `Tu reporte "${existing.title}" ha sido ${label}.`;

    // Send push notification (fire and forget)
    this.notificationsService.sendToUser(
      existing.creatorId,
      title,
      message,
      { reportId, status: newStatus },
    ).catch(() => {});

    // Save in-app notification
    this.notificationsService.saveInAppNotification(
      existing.creatorId,
      `REPORT_${newStatus}`,
      title,
      message,
      'report',
      reportId,
    ).catch(() => {});

    return { id: reportId, previousStatus, newStatus };
  }

  async getPendingFlags(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(reportFlags)
      .where(eq(reportFlags.status, 'PENDING'));

    const total = totalResult?.count ?? 0;

    const items = await this.db
      .select({
        id: reportFlags.id,
        reason: reportFlags.reason,
        status: reportFlags.status,
        createdAt: reportFlags.createdAt,
        reportId: reportFlags.reportId,
        reportTitle: reports.title,
        reporterEmail: users.email,
      })
      .from(reportFlags)
      .leftJoin(reports, eq(reportFlags.reportId, reports.id))
      .leftJoin(users, eq(reportFlags.userId, users.id))
      .where(eq(reportFlags.status, 'PENDING'))
      .orderBy(desc(reportFlags.createdAt))
      .limit(limit)
      .offset(offset);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async dismissFlag(flagId: string) {
    const [updated] = await this.db
      .update(reportFlags)
      .set({ status: 'DISMISSED', updatedAt: new Date() })
      .where(eq(reportFlags.id, flagId))
      .returning();

    return updated;
  }
}
