import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MenuItem } from './entities/menu-item.entity';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';

import { Category } from '../categories/entities/category.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuItem,
      Category,
      OrderItem,
    ]),
  ],
controllers: [
    MenuItemsController,
  ],
providers: [
    MenuItemsService,
  ],
})
export class MenuItemsModule {}
