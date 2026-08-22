import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createReportSchema,
  updateReportSchema,
  reportFiltersSchema,
  commentSchema,
  flagSchema,
  paginationSchema,
} from '@radar-quito/validation';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Public()
  @Get()
  findMany(@Query(new ZodValidationPipe(reportFiltersSchema)) query: {
    page: number;
    limit: number;
    category?: string;
    status?: string;
    west?: number;
    south?: number;
    east?: number;
    north?: number;
    dateFrom?: string;
    dateTo?: string;
  }) {
    return this.reportsService.findMany(query);
  }

  @Get('me')
  getMyReports(
    @CurrentUser() user: { id: string },
    @Query(new ZodValidationPipe(paginationSchema)) query: { page: number; limit: number },
  ) {
    return this.reportsService.getMyReports(user.id, query.page, query.limit);
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createReportSchema)) dto: {
      title: string;
      description: string;
      categoryId: string;
      latitude: number;
      longitude: number;
      priority?: string;
      address?: string;
      incidentDate?: string;
    },
    @CurrentUser() user: { id: string },
  ) {
    return this.reportsService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateReportSchema)) dto: {
      title?: string;
      description?: string;
      categoryId?: string;
      priority?: string;
      address?: string;
    },
    @CurrentUser() user: { id: string },
  ) {
    return this.reportsService.update(id, dto, user.id);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.reportsService.confirm(id, user.id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(commentSchema)) dto: { content: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.reportsService.addComment(id, user.id, dto.content);
  }

  @Post(':id/flag')
  flag(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(flagSchema)) dto: { reason: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.reportsService.flag(id, user.id, dto.reason);
  }
}
