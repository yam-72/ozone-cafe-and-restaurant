import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Order,
  OrderStatus,
} from './entities/order.entity';

import { OrderItem } from './entities/order-item.entity';

import { MenuItem } from '../menu-items/entities/menu-item.entity';

import { User } from '../users/entities/user.entity';

import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../carts/entities/cart-item.entity';

import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class OrdersService {
 constructor(
  @InjectRepository(Order)
  private readonly orderRepository: Repository<Order>,

  @InjectRepository(OrderItem)
  private readonly orderItemRepository: Repository<OrderItem>,

  @InjectRepository(MenuItem)
  private readonly menuItemRepository: Repository<MenuItem>,

  @InjectRepository(User)
  private readonly userRepository: Repository<User>,

  @InjectRepository(Cart)
  private readonly cartRepository: Repository<Cart>,

  @InjectRepository(CartItem)
  private readonly cartItemRepository: Repository<CartItem>,
) {}

async createFromCart(
  userId: number,
  checkoutDto: CheckoutDto,
) {
  const user = await this.userRepository.findOne({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const cart = await this.cartRepository.findOne({
    where: {
      userId,
    },
    relations: {
      items: {
        menuItem: true,
      },
    },
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new BadRequestException(
      'Your cart is empty',
    );
  }

  let totalAmount = 0;

  const orderItemsData: Array<{
    menuItemId: number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }> = [];

  for (const cartItem of cart.items) {
    const menuItem = cartItem.menuItem;

    if (!menuItem) {
      throw new NotFoundException(
        `Menu item with ID ${cartItem.menuItemId} not found`,
      );
    }

    if (!menuItem.isAvailable) {
      throw new BadRequestException(
        `${menuItem.name} is currently unavailable`,
      );
    }

    const unitPrice = Number(menuItem.price);

    const subtotal =
      unitPrice * cartItem.quantity;

    totalAmount += subtotal;

    orderItemsData.push({
      menuItemId: menuItem.id,
      quantity: cartItem.quantity,
      unitPrice,
      subtotal,
    });
  }

  const order = this.orderRepository.create({
    userId,
    totalAmount,
    status: OrderStatus.PENDING,
    customerName: checkoutDto.customerName,
    customerPhone: checkoutDto.customerPhone,
    deliveryAddress:
      checkoutDto.deliveryAddress ?? null,
  });

  const savedOrder =
    await this.orderRepository.save(order);

  const orderItems =
    orderItemsData.map((item) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      }),
    );

  await this.orderItemRepository.save(
    orderItems,
  );

  await this.cartItemRepository.delete({
    cartId: cart.id,
  });

  return this.findOneForUser(
    savedOrder.id,
    userId,
  );
}

  async findMyOrders(userId: number) {
    return this.orderRepository.find({
      where: {
        userId,
      },
      relations: {
        items: {
          menuItem: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneForUser(
    orderId: number,
    userId: number,
  ) {
    const order =
      await this.orderRepository.findOne({
        where: {
          id: orderId,
          userId,
        },
        relations: {
          items: {
            menuItem: true,
          },
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    return order;
  }
  async findAllForAdmin() {
  return this.orderRepository.find({
    relations: {
      user: true,
      items: {
        menuItem: true,
      },
    },
    order: {
      createdAt: 'DESC',
    },
  });
}

async findOneForAdmin(orderId: number) {
  const order = await this.orderRepository.findOne({
    where: {
      id: orderId,
    },
    relations: {
      user: true,
      items: {
        menuItem: true,
      },
    },
  });

  if (!order) {
    throw new NotFoundException(
      `Order with ID ${orderId} not found`,
    );
  }

  return order;
}

async updateStatus(
  orderId: number,
  status: OrderStatus,
) {
  const order = await this.orderRepository.findOne({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new NotFoundException(
      `Order with ID ${orderId} not found`,
    );
  }

  order.status = status;

  await this.orderRepository.save(order);

  return this.findOneForAdmin(orderId);
}
async getAdminStats() {
  const totalOrders =
    await this.orderRepository.count();

  const pendingOrders =
    await this.orderRepository.count({
      where: {
        status: OrderStatus.PENDING,
      },
    });

  const completedOrders =
    await this.orderRepository.count({
      where: {
        status: OrderStatus.COMPLETED,
      },
    });

  const cancelledOrders =
    await this.orderRepository.count({
      where: {
        status: OrderStatus.CANCELLED,
      },
    });

  const revenueResult =
    await this.orderRepository
      .createQueryBuilder('order')
      .select(
        'COALESCE(SUM(order.total_amount), 0)',
        'totalRevenue',
      )
      .where(
        'order.status = :status',
        {
          status: OrderStatus.COMPLETED,
        },
      )
      .getRawOne();

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue: Number(
      revenueResult.totalRevenue,
    ),
  };
}
}
