import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // =====================================================
  // CURRENT USER PROFILE
  // =====================================================

  /**
   * GET /api/v1/users/me
   *
   * Return the currently authenticated user's profile.
   */
  @Get('me')
  async getProfile(@Req() request: any) {
    return this.usersService.getProfile(
      request.user.id,
    );
  }

  /**
   * PATCH /api/v1/users/me
   *
   * Update the currently authenticated user's profile.
   */
  @Patch('me')
  async updateProfile(
    @Req() request: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(
      request.user.id,
      updateProfileDto,
    );
  }

  /**
   * POST /api/v1/users/me/profile-image
   *
   * Upload/change profile image.
   */
  @Post('me/profile-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profile',

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
          !file.mimetype.startsWith('image/')
        ) {
          return callback(
            new Error(
              'Only image files are allowed.',
            ),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadProfileImage(
    @Req() request: any,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.usersService.updateProfileImage(
      request.user.id,
      file,
    );
  }

  /**
   * DELETE /api/v1/users/me/profile-image
   *
   * Remove current user's profile image.
   */
  @Delete('me/profile-image')
  async removeProfileImage(
    @Req() request: any,
  ) {
    return this.usersService.removeProfileImage(
      request.user.id,
    );
  }

  // =====================================================
  // ADMIN USER MANAGEMENT
  // =====================================================

  /**
   * GET /api/v1/users
   *
   * Return all users.
   */
  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * GET /api/v1/users/:id
   *
   * Return one user.
   */
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /api/v1/users/:id/status
   *
   * Activate/deactivate user.
   */
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async setActive(
    @Param('id', ParseIntPipe)
    id: number,

    @Body('isActive')
    isActive: boolean,
  ) {
    return this.usersService.setActive(
      id,
      isActive,
    );
  }

  /**
   * PATCH /api/v1/users/:id/role
   *
   * Change USER / ADMIN role.
   */
  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async updateRole(
    @Param('id', ParseIntPipe)
    id: number,

    @Body('role')
    role: UserRole,
  ) {
    return this.usersService.updateRole(
      id,
      role,
    );
  }

  /**
   * DELETE /api/v1/users/:id
   *
   * Delete a user.
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.usersService.remove(id);
  }
}
