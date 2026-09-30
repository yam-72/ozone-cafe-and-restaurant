import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';

import { SessionsService } from './sessions.service';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

import { Roles } from './decorators/roles.decorator';

import {
  UserRole,
} from '../users/entities/user.entity';

@Controller('admin/sessions')
@Roles(UserRole.ADMIN)
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
  ) {}

  @Get()
  async findAll() {
    return this.sessionsService.findAll();
  }

  @Delete(':id')
  async revoke(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Req()
    request: any,
  ) {
    return this.sessionsService.revoke(
      id,
      request.user.id,
    );
  }
}
