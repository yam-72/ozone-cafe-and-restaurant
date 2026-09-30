import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
  ) {}

  @Post()
  async create(
    @Req() request: any,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    return this.reservationsService.create(
      request.user.id,
      createReservationDto,
    );
  }

  @Get('my-reservations')
  async findMyReservations(
    @Req() request: any,
  ) {
    return this.reservationsService.findMyReservations(
      request.user.id,
    );
  }
  @Get('availability')
async getAvailability(
  @Query('date') date: string,
) {
  return this.reservationsService.getAvailability(
    date,
  );
}

  @Get(':id')
  async findOneForUser(
    @Req() request: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reservationsService.findOneForUser(
      id,
      request.user.id,
    );
  }

  @Delete(':id')
  async cancel(
    @Req() request: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reservationsService.cancel(
      id,
      request.user.id,
    );
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllForAdmin() {
    return this.reservationsService.findAllForAdmin();
  }

  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOneForAdmin(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.reservationsService.findOneForAdmin(
      id,
    );
  }

  @Patch('admin/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateStatusDto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(
      id,
      updateStatusDto,
    );
  }
}
