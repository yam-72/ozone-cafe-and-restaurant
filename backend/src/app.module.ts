import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesModule } from './categories/categories.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CartsModule } from './carts/carts.module';
import { ReservationsModule } from './reservations/reservations.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        CategoriesModule,
        MenuItemsModule,
        OrdersModule,
        AuditLogsModule,
        UsersModule,
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(
          'DATABASE_HOST',
        ),
        port: configService.get<number>(
          'DATABASE_PORT',
        ),
        username: configService.get<string>(
          'DATABASE_USERNAME',
        ),
        password: configService.get<string>(
          'DATABASE_PASSWORD',
        ),
        database: configService.get<string>(
          'DATABASE_NAME',
        ),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    CategoriesModule,
    MenuItemsModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    CartsModule,
    ReservationsModule,
    AdminModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
