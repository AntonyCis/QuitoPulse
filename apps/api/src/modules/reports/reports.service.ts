import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  reports,
  reportImages,
  reportConfirmations,
  reportComments,
  reportFlags,
  categories,
} from '../../lib/drizzle/schema';
import * as schema from '../../lib/drizzle/schema';
import { eq, and, desc, sql, count, gte, lte } from 'drizzle-orm';
import { CreateReportDto, UpdateReportDto, ReportQueryDto } from './dto/reports.dto';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findMany(query: ReportQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(reports.status, 'APPROVED')];

    if (query.category) {
      conditions.push(eq(reports.status, 'APPROVED'));
    }

    if (query.dateFrom) {
      conditions.push(gte(reports.createdAt, new Date(query.dateFrom)));
    }

    if (query.dateTo) {
      conditions.push(lte(reports.createdAt, new Date(query.dateTo)));
    }

    // Geospatial bounding box filter
    if (query.west !== undefined && query.south !== undefined && query.east !== undefined && query.north !== undefined) {
      conditions.push(
        sql`ST_Within(
          ST_SetSRID(ST_MakePoint(${reports.longitude}, ${reports.latitude}), 4326),
          ST_MakeEnvelope(${query.west}, ${query.south}, ${query.east}, ${query.north}, 4326)
        )`
      );
    }

    const where = and(...conditions);

    // Get total count
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(reports)
      .where(where);

    const total = totalResult?.count ?? 0;

    // Get reports with category info
    const items = await this.db
      .select({
        id: reports.id,
        title: reports.title,
        description: reports.description,
        categoryId: reports.categoryId,
        categoryName: categories.name,
        categoryLabel: categories.label,
        categoryColor: categories.color,
        creatorId: reports.creatorId,
        status: reports.status,
        priority: reports.priority,
        latitude: reports.latitude,
        longitude: reports.longitude,
        address: reports.address,
        incidentDate: reports.incidentDate,
        confirmationCount: reports.confirmationCount,
        viewCount: reports.viewCount,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
      })
      .from(reports)
      .leftJoin(categories, eq(reports.categoryId, categories.id))
      .where(where)
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const [report] = await this.db
      .select({
        id: reports.id,
        title: reports.title,
        description: reports.description,
        categoryId: reports.categoryId,
        categoryName: categories.name,
        categoryLabel: categories.label,
        categoryColor: categories.color,
        creatorId: reports.creatorId,
        status: reports.status,
        priority: reports.priority,
        latitude: reports.latitude,
        longitude: reports.longitude,
        address: reports.address,
        incidentDate: reports.incidentDate,
        confirmationCount: reports.confirmationCount,
        viewCount: reports.viewCount,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
      })
      .from(reports)
      .leftJoin(categories, eq(reports.categoryId, categories.id))
      .where(eq(reports.id, id))
      .limit(1);

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    // Increment view count
    await this.db
      .update(reports)
      .set({ viewCount: sql`${reports.viewCount} + 1` })
      .where(eq(reports.id, id));

    // Get images
    const images = await this.db
      .select()
      .from(reportImages)
      .where(eq(reportImages.reportId, id))
      .orderBy(reportImages.sortOrder);

    // Get comments
    const comments = await this.db
      .select()
      .from(reportComments)
      .where(eq(reportComments.reportId, id))
      .orderBy(desc(reportComments.createdAt))
      .limit(20);

    return { ...report, images, comments };
  }

  async create(dto: CreateReportDto, creatorId: string) {
    const [created] = await this.db
      .insert(reports)
      .values({
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        incidentDate: dto.incidentDate ? new Date(dto.incidentDate) : undefined,
        creatorId,
        status: 'PENDING',
        priority: dto.priority || 'MEDIUM',
      })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateReportDto, userId: string) {
    const [existing] = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Reporte no encontrado');
    }

    if (existing.creatorId !== userId) {
      throw new ForbiddenException('No puedes editar este reporte');
    }

    if (existing.status !== 'PENDING') {
      throw new ForbiddenException('Solo puedes editar reportes pendientes');
    }

    const [updated] = await this.db
      .update(reports)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();

    return updated;
  }

  async confirm(reportId: string, userId: string) {
    const [existing] = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Reporte no encontrado');
    }

    // Check if already confirmed
    const [alreadyConfirmed] = await this.db
      .select()
      .from(reportConfirmations)
      .where(
        and(
          eq(reportConfirmations.reportId, reportId),
          eq(reportConfirmations.userId, userId),
        ),
      )
      .limit(1);

    if (alreadyConfirmed) {
      // Unconfirm
      await this.db
        .delete(reportConfirmations)
        .where(
          and(
            eq(reportConfirmations.reportId, reportId),
            eq(reportConfirmations.userId, userId),
          ),
        );

      await this.db
        .update(reports)
        .set({ confirmationCount: sql`${reports.confirmationCount} - 1` })
        .where(eq(reports.id, reportId));

      return { confirmed: false };
    }

    // Confirm
    await this.db.insert(reportConfirmations).values({ reportId, userId });
    await this.db
      .update(reports)
      .set({ confirmationCount: sql`${reports.confirmationCount} + 1` })
      .where(eq(reports.id, reportId));

    return { confirmed: true };
  }

  async addComment(reportId: string, userId: string, content: string) {
    const [existing] = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Reporte no encontrado');
    }

    const [comment] = await this.db
      .insert(reportComments)
      .values({ reportId, userId, content })
      .returning();

    return comment;
  }

  async flag(reportId: string, userId: string, reason: string) {
    const [existing] = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Reporte no encontrado');
    }

    const [flag] = await this.db
      .insert(reportFlags)
      .values({ reportId, userId, reason })
      .returning();

    return flag;
  }

  async getMyReports(creatorId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.creatorId, creatorId));

    const total = totalResult?.count ?? 0;

    const items = await this.db
      .select({
        id: reports.id,
        title: reports.title,
        status: reports.status,
        categoryLabel: categories.label,
        categoryColor: categories.color,
        createdAt: reports.createdAt,
        confirmationCount: reports.confirmationCount,
      })
      .from(reports)
      .leftJoin(categories, eq(reports.categoryId, categories.id))
      .where(eq(reports.creatorId, creatorId))
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
