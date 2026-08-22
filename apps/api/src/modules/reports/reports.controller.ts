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
import {
  CreateReportDto,
  UpdateReportDto,
  ReportQueryDto,
  CreateCommentDto,
  CreateFlagDto,
} from './dto/reports.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Public()
  @Get()
  findMany(@Query() query: ReportQueryDto) {
    return this.reportsService.findMany(query);
  }

  @Get('me')
  getMyReports(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getMyReports(
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reportsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateReportDto, @CurrentUser() user: { id: string }) {
    return this.reportsService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
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
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.reportsService.addComment(id, user.id, dto.content);
  }

  @Post(':id/flag')
  flag(
    @Param('id') id: string,
    @Body() dto: CreateFlagDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.reportsService.flag(id, user.id, dto.reason);
  }
}
