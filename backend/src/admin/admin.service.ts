import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity';
import {
  MenuItem,
} from '../menu-items/entities/menu-item.entity';
import {
  Order,
  OrderStatus,
} from '../orders/entities/order.entity';
import {
  Reservation,
  ReservationStatus,
} from '../reservations/entities/reservation.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(MenuItem)
    private readonly menuItemsRepository: Repository<MenuItem>,

    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
  ) {}

  async getDashboardStats() {
    const [
      totalCustomers,
      activeCustomers,
      inactiveCustomers,

      totalMenuItems,
      availableMenuItems,
      unavailableMenuItems,

      totalOrders,

      pendingOrders,
      confirmedOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      cancelledOrders,

      totalReservations,
      pendingReservations,
      confirmedReservations,
      rejectedReservations,
      cancelledReservations,
      completedReservations,

      revenueResult,
    ] = await Promise.all([
      this.usersRepository.count({
        where: {
          role: UserRole.USER,
        },
      }),

      this.usersRepository.count({
        where: {
          role: UserRole.USER,
          isActive: true,
        },
      }),

      this.usersRepository.count({
        where: {
          role: UserRole.USER,
          isActive: false,
        },
      }),

      this.menuItemsRepository.count(),

      this.menuItemsRepository.count({
        where: {
          isAvailable: true,
        },
      }),

      this.menuItemsRepository.count({
        where: {
          isAvailable: false,
        },
      }),

      this.ordersRepository.count(),

      this.ordersRepository.count({
        where: {
          status: OrderStatus.PENDING,
        },
      }),

      this.ordersRepository.count({
        where: {
          status: OrderStatus.CONFIRMED,
        },
      }),

      this.ordersRepository.count({
        where: {
          status: OrderStatus.PREPARING,
        },
      }),

      this.ordersRepository.count({
        where: {
          status: OrderStatus.READY,
        },
      }),

      this.ordersRepository.count({
        where: {
          status: OrderStatus.COMPLETED,
        },
      }),

      this.ordersRepository.count({
        where: {
          status: OrderStatus.CANCELLED,
        },
      }),

      this.reservationsRepository.count(),

      this.reservationsRepository.count({
        where: {
          status: ReservationStatus.PENDING,
        },
      }),

      this.reservationsRepository.count({
        where: {
          status: ReservationStatus.CONFIRMED,
        },
      }),

      this.reservationsRepository.count({
        where: {
          status: ReservationStatus.REJECTED,
        },
      }),

      this.reservationsRepository.count({
        where: {
          status: ReservationStatus.CANCELLED,
        },
      }),

      this.reservationsRepository.count({
        where: {
          status: ReservationStatus.COMPLETED,
        },
      }),

      this.ordersRepository
        .createQueryBuilder('order')
        .select(
          'COALESCE(SUM(order.totalAmount), 0)',
          'total',
        )
        .where(
          'order.status != :status',
          {
            status: OrderStatus.CANCELLED,
          },
        )
        .getRawOne(),
    ]);

    return {
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        inactive: inactiveCustomers,
      },

      menu: {
        total: totalMenuItems,
        available: availableMenuItems,
        unavailable: unavailableMenuItems,
      },

      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        preparing: preparingOrders,
        ready: readyOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },

      reservations: {
        total: totalReservations,
        pending: pendingReservations,
        confirmed: confirmedReservations,
        rejected: rejectedReservations,
        cancelled: cancelledReservations,
        completed: completedReservations,
      },

      revenue: {
        total: Number(revenueResult?.total ?? 0),
      },
    };
  }
}
