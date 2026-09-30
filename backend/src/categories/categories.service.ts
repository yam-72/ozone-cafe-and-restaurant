import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${id} not found`,
      );
    }

    return category;
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    const existingCategory =
      await this.categoriesRepository.findOne({
        where: {
          name: data.name,
        },
      });

    if (existingCategory) {
      throw new ConflictException(
        `Category "${data.name}" already exists`,
      );
    }

    const category = this.categoriesRepository.create(data);

    return this.categoriesRepository.save(category);
  }

async update(
  id: number,
  data: UpdateCategoryDto,
): Promise<Category> {
  const category = await this.findOne(id);

  if (data.name && data.name !== category.name) {
    const existingCategory =
      await this.categoriesRepository.findOne({
        where: {
          name: data.name,
        },
      });

    if (
      existingCategory &&
      existingCategory.id !== id
    ) {
      throw new ConflictException(
        `Category "${data.name}" already exists`,
      );
    }
  }

  Object.assign(category, data);

  return this.categoriesRepository.save(category);
}

async remove(id: number): Promise<void> {
  const category = await this.findOne(id);

  try {
    await this.categoriesRepository.remove(category);
  } catch (error) {
    if (
      error?.code === '23503'
    ) {
      throw new ConflictException(
        `Cannot delete category "${category.name}" because it has menu items. Move or delete the menu items first.`,
      );
    }

    throw error;
  }
}
  async uploadImage(
  id: number,
  file: Express.Multer.File,
): Promise<Category> {
  if (!file) {
    throw new BadRequestException(
      'Image file is required',
    );
  }

  const category = await this.findOne(id);

  category.imageUrl =
    `/uploads/categories/${file.filename}`;

  return this.categoriesRepository.save(category);
}
}
