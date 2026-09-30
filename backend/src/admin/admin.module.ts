import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

import { User } from '../users/entities/user.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Reservation } from '../reservations/entities/reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      MenuItem,
      Order,
      Reservation,
    ]),
  ],

  controllers: [
    AdminController,
  ],

  providers: [
    AdminService,
  ],
})
export class AdminModule {}
