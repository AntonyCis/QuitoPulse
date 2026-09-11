import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportImagesService } from './report-images.service';
import { ReportImagesController } from './report-images.controller';
import { DatabaseModule } from '../../database/database.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [ReportsController, ReportImagesController],
  providers: [ReportsService, ReportImagesService],
  exports: [ReportsService],
})
export class ReportsModule {}
