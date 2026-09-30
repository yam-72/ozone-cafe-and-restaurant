import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Cart } from './cart.entity';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'cart_id',
    type: 'int',
  })
  cartId: number;

  @Column({
    name: 'menu_item_id',
    type: 'int',
  })
  menuItemId: number;

  @Column({
    type: 'int',
    default: 1,
  })
  quantity: number;

  @ManyToOne(
    () => Cart,
    (cart) => cart.items,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'cart_id',
  })
  cart: Cart;

  @ManyToOne(
    () => MenuItem,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'menu_item_id',
  })
  menuItem: MenuItem;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;
}
