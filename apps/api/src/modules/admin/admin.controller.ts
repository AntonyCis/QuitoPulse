import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  adminUpdateRoleSchema,
  adminUpdateReportStatusSchema,
  adminUpdateReportPrioritySchema,
  adminPaginationSchema,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MODERATOR')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(
    @Query(new ZodValidationPipe(adminPaginationSchema)) query: {
      page: number;
      limit: number;
      search?: string;
    },
  ) {
    return this.adminService.getUsers(query.page, query.limit, query.search);
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateRoleSchema)) body: { role: string },
  ) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Patch('users/:id/toggle-active')
  toggleUserActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(id);
  }

  @Get('reports/pending')
  getPendingReports(
    @Query(new ZodValidationPipe(adminPaginationSchema)) query: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
    },
  ) {
    return this.adminService.getPendingReports(query.page, query.limit);
  }

  @Get('reports')
  getReports(
    @Query(new ZodValidationPipe(adminPaginationSchema)) query: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
    },
  ) {
    return this.adminService.getReports(query.page, query.limit, query.status);
  }

  @Patch('reports/:id/status')
  updateReportStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateReportStatusSchema)) body: {
      status: string;
      moderatorId: string;
      reason?: string;
    },
  ) {
    return this.adminService.updateReportStatus(id, body.status, body.moderatorId, body.reason);
  }

  @Patch('reports/:id/priority')
  updateReportPriority(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateReportPrioritySchema)) body: {
      priority: string;
      moderatorId: string;
    },
  ) {
    return this.adminService.updateReportPriority(id, body.priority, body.moderatorId);
  }

  @Get('flags/pending')
  getPendingFlags(
    @Query(new ZodValidationPipe(adminPaginationSchema)) query: {
      page: number;
      limit: number;
    },
  ) {
    return this.adminService.getPendingFlags(query.page, query.limit);
  }

  @Patch('flags/:id/dismiss')
  dismissFlag(@Param('id') id: string) {
    return this.adminService.dismissFlag(id);
  }
}
