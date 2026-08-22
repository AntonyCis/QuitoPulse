import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { reportImages, reports } from '../../lib/drizzle/schema';
import * as schema from '../../lib/drizzle/schema';
import { eq } from 'drizzle-orm';
import { StorageService } from '../storage/storage.service';

interface ConfirmImageDto {
  key: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  thumbnailUrl?: string;
}

@Injectable()
export class ReportImagesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly storageService: StorageService,
  ) {}

  async confirmImage(reportId: string, dto: ConfirmImageDto) {
    const [report] = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }

    const url = this.storageService.getFileUrl(dto.key);

    const [image] = await this.db
      .insert(reportImages)
      .values({
        reportId,
        url,
        thumbnailUrl: dto.thumbnailUrl || null,
        filename: dto.filename,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
      })
      .returning();

    return image;
  }

  async deleteImage(imageId: string, userId: string) {
    const [image] = await this.db
      .select({
        id: reportImages.id,
        reportId: reportImages.reportId,
        url: reportImages.url,
        creatorId: reports.creatorId,
      })
      .from(reportImages)
      .innerJoin(reports, eq(reportImages.reportId, reports.id))
      .where(eq(reportImages.id, imageId))
      .limit(1);

    if (!image) {
      throw new NotFoundException('Imagen no encontrada');
    }

    if (image.creatorId !== userId) {
      throw new NotFoundException('No puedes eliminar esta imagen');
    }

    await this.db.delete(reportImages).where(eq(reportImages.id, imageId));

    return { message: 'Imagen eliminada' };
  }

  async getByReportId(reportId: string) {
    return this.db
      .select()
      .from(reportImages)
      .where(eq(reportImages.reportId, reportId))
      .orderBy(reportImages.sortOrder);
  }
}
