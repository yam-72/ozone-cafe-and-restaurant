import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MenuItem } from './entities/menu-item.entity';
import { Category } from '../categories/entities/category.entity';

import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemQueryDto } from './dto/menu-item-query.dto';

import { OrderItem } from '../orders/entities/order-item.entity';

@Injectable()
export class MenuItemsService {
 constructor(
  @InjectRepository(MenuItem)
  private readonly menuItemsRepository: Repository<MenuItem>,

  @InjectRepository(Category)
  private readonly categoriesRepository: Repository<Category>,

  @InjectRepository(OrderItem)
  private readonly orderItemsRepository: Repository<OrderItem>,
) {}

  // Get all menu items
  // Supports search and filtering
  async findAll(): Promise<MenuItem[]> {
    return this.searchAndFilter({});
  }

  // Search and filter menu items
  async searchAndFilter(
    query: MenuItemQueryDto,
  ): Promise<MenuItem[]> {
    const queryBuilder =
      this.menuItemsRepository
        .createQueryBuilder('menuItem')
        .leftJoinAndSelect(
          'menuItem.category',
          'category',
        );

    // Search by menu item name or description
    if (query.search) {
      queryBuilder.andWhere(
        `(
          LOWER(menuItem.name) LIKE LOWER(:search)
          OR
          LOWER(menuItem.description) LIKE LOWER(:search)
        )`,
        {
          search: `%${query.search}%`,
        },
      );
    }

    // Filter by category
    if (query.categoryId) {
      queryBuilder.andWhere(
        'menuItem.categoryId = :categoryId',
        {
          categoryId: Number(query.categoryId),
        },
      );
    }

    // Filter by availability
    if (query.isAvailable !== undefined) {
      queryBuilder.andWhere(
        'menuItem.isAvailable = :isAvailable',
        {
          isAvailable: query.isAvailable === 'true',
        },
      );
    }

    // Filter by minimum price
    if (query.minPrice) {
      queryBuilder.andWhere(
        'menuItem.price >= :minPrice',
        {
          minPrice: Number(query.minPrice),
        },
      );
    }

    // Filter by maximum price
    if (query.maxPrice) {
      queryBuilder.andWhere(
        'menuItem.price <= :maxPrice',
        {
          maxPrice: Number(query.maxPrice),
        },
      );
    }

    // Newest menu items first
    queryBuilder.orderBy(
      'menuItem.createdAt',
      'DESC',
    );

    return queryBuilder.getMany();
  }

  // Get one menu item by ID
  async findOne(
    id: number,
  ): Promise<MenuItem> {
    const menuItem =
      await this.menuItemsRepository.findOne({
        where: { id },

        relations: {
          category: true,
        },
      });

    if (!menuItem) {
      throw new NotFoundException(
        `Menu item with ID ${id} not found`,
      );
    }

    return menuItem;
  }

  // Create menu item
  async create(
    data: CreateMenuItemDto,
  ): Promise<MenuItem> {
    // Check that the category exists
    const category =
      await this.categoriesRepository.findOne({
        where: {
          id: data.categoryId,
        },
      });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${data.categoryId} not found`,
      );
    }

    // Create the menu item
    const menuItem =
      this.menuItemsRepository.create({
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        imageUrl: data.imageUrl ?? null,
        isAvailable: data.isAvailable ?? true,
        categoryId: data.categoryId,
        category,
      });

    // Save it to the database
    const savedMenuItem =
      await this.menuItemsRepository.save(
        menuItem,
      );

    // Return the newly created item
    // with its category
    return this.findOne(
      savedMenuItem.id,
    );
  }

  // Update menu item
  async update(
    id: number,
    data: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    // Find the menu item
    const menuItem =
      await this.menuItemsRepository.findOne({
        where: { id },
      });

    if (!menuItem) {
      throw new NotFoundException(
        `Menu item with ID ${id} not found`,
      );
    }

    // Update name
    if (data.name !== undefined) {
      menuItem.name = data.name;
    }

    // Update description
    if (data.description !== undefined) {
      menuItem.description = data.description;
    }

    // Update price
    if (data.price !== undefined) {
      menuItem.price = data.price;
    }

    // Update image URL
    if (data.imageUrl !== undefined) {
      menuItem.imageUrl = data.imageUrl;
    }

    // Update availability
    if (data.isAvailable !== undefined) {
      menuItem.isAvailable = data.isAvailable;
    }

    // Update category
    if (data.categoryId !== undefined) {
      const category =
        await this.categoriesRepository.findOne({
          where: {
            id: data.categoryId,
          },
        });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${data.categoryId} not found`,
        );
      }

      menuItem.categoryId = data.categoryId;
      menuItem.category = category;
    }

    // Save changes
    const savedMenuItem =
      await this.menuItemsRepository.save(
        menuItem,
      );
    return this.findOne(
      savedMenuItem.id,
    );
  }
  // Delete menu item
  async remove(id: number): Promise<void> {
    const menuItem = await this.menuItemsRepository.findOne({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException(
        `Menu item with ID ${id} not found`,
      );
    }

    // Check whether this menu item has ever
    // been used in an order.
    const orderItemCount =
      await this.orderItemsRepository.count({
        where: {
          menuItemId: id,
        },
      });

    // Never ordered -> permanently delete it
    if (orderItemCount === 0) {
      await this.menuItemsRepository.remove(menuItem);
      return;
    }

    // Already ordered -> preserve it for
    // historical orders, but make it unavailable.
    menuItem.isAvailable = false;

    await this.menuItemsRepository.save(menuItem);
  }

  // Upload menu item image
  async uploadImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<MenuItem> {
    if (!file) {
      throw new BadRequestException(
        'Image file is required',
      );
    }

    const menuItem = await this.findOne(id);

    menuItem.imageUrl =
      `/uploads/menu-items/${file.filename}`;

    return this.menuItemsRepository.save(menuItem);
  }
}
