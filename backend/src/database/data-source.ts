import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { Category } from '../categories/entities/category.entity.js';
import { MenuItem } from '../menu-items/entities/menu-item.entity.js';
import { User } from '../users/entities/user.entity.js';

import { PasswordResetToken } from '../auth/entities/password-reset-token.entity.js';
import { Session } from '../auth/entities/session.entity.js';

import { Order } from '../orders/entities/order.entity.js';
import { OrderItem } from '../orders/entities/order-item.entity.js';

import { AuditLog } from '../audit-logs/entities/audit-log.entity.js';

import { Cart } from '../carts/entities/cart.entity.js';
import { CartItem } from '../carts/entities/cart-item.entity.js';

import { Reservation } from '../reservations/entities/reservation.entity.js';

config();

export default new DataSource({
  type: 'postgres',

  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),

  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  entities: [
    Category,
    MenuItem,
    User,
    PasswordResetToken,
    Session,
    Order,
    OrderItem,
    AuditLog,
    Cart,
    CartItem,
    Reservation,
  ],

  migrations: [
    __dirname + '/migrations/*.js',
  ],

  synchronize: false,
});
