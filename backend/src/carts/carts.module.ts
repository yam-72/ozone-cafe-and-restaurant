import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

import { MenuItem } from '../menu-items/entities/menu-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      MenuItem,
    ]),
  ],

  controllers: [
    CartsController,
  ],

  providers: [
    CartsService,
  ],
})
export class CartsModule {}
