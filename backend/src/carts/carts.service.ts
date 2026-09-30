import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
} from 'typeorm';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';

import { MenuItem } from '../menu-items/entities/menu-item.entity';

import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,

    @InjectRepository(MenuItem)
    private readonly menuItemsRepository: Repository<MenuItem>,
  ) {}

  /**
   * Get the user's cart.
   * If the user does not have a cart,
   * create an empty one.
   */
  async getCart(userId: number) {
    let cart =
      await this.cartsRepository.findOne({
        where: {
          userId,
        },
        relations: {
          items: {
            menuItem: true,
          },
        },
      });

    if (!cart) {
      cart =
        this.cartsRepository.create({
          userId,
        });

      cart =
        await this.cartsRepository.save(cart);

      cart.items = [];
    }

    return this.buildCartResponse(cart);
  }

  /**
   * Add a menu item to the cart.
   */
  async addItem(
    userId: number,
    data: AddCartItemDto,
  ) {
    const menuItem =
      await this.menuItemsRepository.findOne({
        where: {
          id: data.menuItemId,
        },
      });

    if (!menuItem) {
      throw new NotFoundException(
        `Menu item with ID ${data.menuItemId} not found`,
      );
    }

    if (!menuItem.isAvailable) {
      throw new BadRequestException(
        `${menuItem.name} is currently unavailable`,
      );
    }

    let cart =
      await this.cartsRepository.findOne({
        where: {
          userId,
        },
      });

    if (!cart) {
      cart =
        this.cartsRepository.create({
          userId,
        });

      cart =
        await this.cartsRepository.save(cart);
    }

    let cartItem =
      await this.cartItemsRepository.findOne({
        where: {
          cartId: cart.id,
          menuItemId: data.menuItemId,
        },
      });

    if (cartItem) {
      cartItem.quantity += data.quantity;
    } else {
      cartItem =
        this.cartItemsRepository.create({
          cartId: cart.id,
          menuItemId: data.menuItemId,
          quantity: data.quantity,
        });
    }

    await this.cartItemsRepository.save(
      cartItem,
    );

    return this.getCart(userId);
  }

  /**
   * Update the quantity of a cart item.
   */
  async updateItem(
    userId: number,
    cartItemId: number,
    data: UpdateCartItemDto,
  ) {
    const cart =
      await this.cartsRepository.findOne({
        where: {
          userId,
        },
      });

    if (!cart) {
      throw new NotFoundException(
        'Cart not found',
      );
    }

    const cartItem =
      await this.cartItemsRepository.findOne({
        where: {
          id: cartItemId,
          cartId: cart.id,
        },
      });

    if (!cartItem) {
      throw new NotFoundException(
        'Cart item not found',
      );
    }

    const menuItem =
      await this.menuItemsRepository.findOne({
        where: {
          id: cartItem.menuItemId,
        },
      });

    if (!menuItem) {
      throw new NotFoundException(
        'Menu item not found',
      );
    }

    if (!menuItem.isAvailable) {
      throw new BadRequestException(
        `${menuItem.name} is currently unavailable`,
      );
    }

    cartItem.quantity =
      data.quantity;

    await this.cartItemsRepository.save(
      cartItem,
    );

    return this.getCart(userId);
  }

  /**
   * Remove one item from the cart.
   */
  async removeItem(
    userId: number,
    cartItemId: number,
  ) {
    const cart =
      await this.cartsRepository.findOne({
        where: {
          userId,
        },
      });

    if (!cart) {
      throw new NotFoundException(
        'Cart not found',
      );
    }

    const cartItem =
      await this.cartItemsRepository.findOne({
        where: {
          id: cartItemId,
          cartId: cart.id,
        },
      });

    if (!cartItem) {
      throw new NotFoundException(
        'Cart item not found',
      );
    }

    await this.cartItemsRepository.remove(
      cartItem,
    );

    return this.getCart(userId);
  }

  /**
   * Remove everything from the cart.
   */
  async clearCart(userId: number) {
    const cart =
      await this.cartsRepository.findOne({
        where: {
          userId,
        },
      });

    if (!cart) {
      return {
        message: 'Cart is already empty',
      };
    }

    await this.cartItemsRepository.delete({
      cartId: cart.id,
    });

    return {
      message: 'Cart cleared successfully',
    };
  }

  /**
   * Calculate cart totals using
   * prices stored in the database.
   */
  private buildCartResponse(
    cart: Cart,
  ) {
    const items = cart.items ?? [];

    const total = items.reduce(
      (sum, item) => {
        return (
          sum +
          Number(item.menuItem.price) *
            item.quantity
        );
      },
      0,
    );

    return {
      id: cart.id,

      items: items.map((item) => ({
        id: item.id,

        quantity: item.quantity,

        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          description:
            item.menuItem.description,
          price: Number(
            item.menuItem.price,
          ),
          imageUrl:
            item.menuItem.imageUrl,
          isAvailable:
            item.menuItem.isAvailable,
        },

        subtotal:
          Number(item.menuItem.price) *
          item.quantity,
      })),

      total,
    };
  }
}
