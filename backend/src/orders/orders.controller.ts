import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

import { CheckoutDto } from './dto/checkout.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}

  @Post()
async create(
  @Req() request: any,
  @Body() checkoutDto: CheckoutDto,
) {
  const userId = request.user.id;

  return this.ordersService.createFromCart(
    userId,
    checkoutDto,
  );
}

  @Get('my-orders')
  async findMyOrders(
    @Req() request: any,
  ) {
    const userId = request.user.id;

    return this.ordersService.findMyOrders(
      userId,
    );
  }

// =========================
// ADMIN ORDER MANAGEMENT
// =========================

@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('admin/all')
async findAllForAdmin() {
  return this.ordersService.findAllForAdmin();
}

@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('admin/stats')
async getAdminStats() {
  return this.ordersService.getAdminStats();
}

@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('admin/:id')
async findOneForAdmin(
  @Param('id', ParseIntPipe) id: number,
) {
  return this.ordersService.findOneForAdmin(id);
}

@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Patch('admin/:id/status')
async updateStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateOrderStatusDto: UpdateOrderStatusDto,
) {
  return this.ordersService.updateStatus(
    id,
    updateOrderStatusDto.status,
  );
}

  // =========================
  // CUSTOMER ORDER DETAILS
  // =========================

  @Get(':id')
  async findOne(
    @Req() request: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = request.user.id;

    return this.ordersService.findOneForUser(
      id,
      userId,
    );
  }
}
