import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  User,
  UserRole,
} from './entities/user.entity';

import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => this.removePassword(user));
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.removePassword(user);
  }

  // ==============================
  // ADMIN PROFILE
  // ==============================

  async getProfile(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return this.removePassword(user);
  }

  async updateProfile(
    id: number,
    data: UpdateProfileDto,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const email = data.email.trim().toLowerCase();

    // Check whether another account already uses this email
    if (email !== user.email.toLowerCase()) {
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }
    }

    user.fullName = data.fullName.trim();
    user.email = email;
    user.phone = data.phone?.trim() || null;

    const updatedUser = await this.usersRepository.save(user);

    return {
      message: 'Profile updated successfully.',
      user: this.removePassword(updatedUser),
    };
  }

  async updateProfileImage(
    id: number,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new ConflictException(
        'Profile image is required.',
      );
    }

    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.profileImage =
      `/uploads/profile/${file.filename}`;

    const updatedUser =
      await this.usersRepository.save(user);

    return {
      message: 'Profile image updated successfully.',
      user: this.removePassword(updatedUser),
    };
  }

  async removeProfileImage(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.profileImage = null;

    const updatedUser =
      await this.usersRepository.save(user);

    return {
      message: 'Profile image removed successfully.',
      user: this.removePassword(updatedUser),
    };
  }

  // ==============================
  // USER STATUS
  // ==============================

  async setActive(
    id: number,
    isActive: boolean,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.isActive = isActive;

    const updatedUser =
      await this.usersRepository.save(user);

    return {
      message: isActive
        ? 'User activated successfully.'
        : 'User deactivated successfully.',
      user: this.removePassword(updatedUser),
    };
  }

  // ==============================
  // USER ROLE
  // ==============================

  async updateRole(
    id: number,
    role: UserRole,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    user.role = role;

    const updatedUser =
      await this.usersRepository.save(user);

    return {
      message: 'User role updated successfully.',
      user: this.removePassword(updatedUser),
    };
  }

  // ==============================
  // DELETE USER
  // ==============================

  async remove(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    await this.usersRepository.remove(user);

    return {
      message: 'User deleted successfully.',
    };
  }

  // ==============================
  // REMOVE PASSWORD FROM RESPONSE
  // ==============================

  private removePassword(user: User) {
    const {
      password,
      ...safeUser
    } = user;

    return safeUser;
  }
}
