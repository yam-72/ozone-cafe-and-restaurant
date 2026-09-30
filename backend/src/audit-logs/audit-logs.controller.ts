import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { AuditLogsService } from './audit-logs.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin/audit-logs')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get()
  async findAll() {
    return this.auditLogsService.findAll();
  }

  @Get('recent')
  async findRecent() {
    return this.auditLogsService.findRecent(50);
  }
}
