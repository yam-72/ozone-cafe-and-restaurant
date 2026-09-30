import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import {
  extname,
} from 'path';

import { MenuItemsService } from './menu-items.service';
import { MenuItem } from './entities/menu-item.entity';

import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemQueryDto } from './dto/menu-item-query.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('menu-items')
export class MenuItemsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
  ) {}

  // Get all menu items
  // Supports search and filtering
  @Get()
  findAll(
    @Query() query: MenuItemQueryDto,
  ): Promise<MenuItem[]> {
    return this.menuItemsService.searchAndFilter(
      query,
    );
  }
  @Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Post(':id/image')
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination:
        './uploads/menu-items',

      filename: (
        request,
        file,
        callback,
      ) => {
        const uniqueName =
          `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}${extname(file.originalname)}`;

        callback(
          null,
          uniqueName,
        );
      },
    }),

    fileFilter: (
      request,
      file,
      callback,
    ) => {
      if (
        !file.mimetype.startsWith(
          'image/',
        )
      ) {
        return callback(
          new Error(
            'Only image files are allowed',
          ),
          false,
        );
      }

      callback(null, true);
    },

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  }),
)
async uploadImage(
  @Param(
    'id',
    ParseIntPipe,
  )
  id: number,

  @UploadedFile()
  file: Express.Multer.File,
) {
  return this.menuItemsService.uploadImage(
    id,
    file,
  );
}

  // Get one menu item by ID
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MenuItem> {
    return this.menuItemsService.findOne(id);
  }

  // Create menu item - Admin only
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(
    @Body() data: CreateMenuItemDto,
  ): Promise<MenuItem> {
    return this.menuItemsService.create(data);
  }

  // Update menu item - Admin only
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMenuItemDto,
  ): Promise<MenuItem> {
    return this.menuItemsService.update(
      id,
      data,
    );
  }

  // Delete menu item - Admin only
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.menuItemsService.remove(id);

    return {
      message: `Menu item with ID ${id} deleted successfully`,
    };
  }
}

