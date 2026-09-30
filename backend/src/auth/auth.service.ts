import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { Repository } from 'typeorm';

import { createHash, randomBytes } from 'crypto';

import {
  User,
  UserRole,
} from '../users/entities/user.entity';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { AuditLogsService } from '../audit-logs/audit-logs.service';

import {
  AuditAction,
} from '../audit-logs/entities/audit-log.entity';

import { SessionsService } from './sessions.service';
import {
  PasswordResetToken,
} from './entities/password-reset-token.entity';

@Injectable()
export class AuthService {
 constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,

  @InjectRepository(PasswordResetToken)
  private readonly passwordResetTokenRepository:
    Repository<PasswordResetToken>,

  private readonly jwtService: JwtService,

  private readonly auditLogsService: AuditLogsService,

  private readonly sessionsService: SessionsService,
) {}

  private hashRefreshToken(
    refreshToken: string,
  ) {
    return createHash('sha256')
      .update(refreshToken)
      .digest('hex');
  }

  private generateRefreshToken() {
    return randomBytes(64).toString('hex');
  }

  // ==========================================
  // REGISTER USER
  // ==========================================

  async register(
    registerDto: RegisterDto,
  ) {
    const {
      fullName,
      email,
      password,
      phone,
    } = registerDto;

    const existingUser =
      await this.userRepository.findOne({
        where: { email },
      });

    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10,
      );

    const user =
      this.userRepository.create({
        fullName,
        email,
        password: hashedPassword,
        phone: phone ?? null,
        role: UserRole.USER,
        isActive: true,
      });

    const savedUser =
      await this.userRepository.save(
        user,
      );

    await this.auditLogsService.create({
      userId: savedUser.id,

      action:
        AuditAction.REGISTER,

      entity: 'USER',

      entityId: savedUser.id,

      description:
        `User ${savedUser.email} registered successfully`,
    });

    const {
      password: _,
      ...safeUser
    } = savedUser;

    return {
      message:
        'Registration successful',

      user: safeUser,
    };
  }

  // ==========================================
  // REGISTER ADMIN
  // ==========================================

  async registerAdmin(
    registerAdminDto: RegisterAdminDto,
  ) {
    const {
      fullName,
      email,
      password,
      phone,
    } = registerAdminDto;

    const existingUser =
      await this.userRepository.findOne({
        where: { email },
      });

    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists',
      );
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10,
      );

    const admin =
      this.userRepository.create({
        fullName,
        email,
        password: hashedPassword,
        phone: phone ?? null,
        role: UserRole.ADMIN,
        isActive: true,
      });

    const savedAdmin =
      await this.userRepository.save(
        admin,
      );

    await this.auditLogsService.create({
      userId: savedAdmin.id,

      action:
        AuditAction.REGISTER,

      entity: 'USER',

      entityId: savedAdmin.id,

      description:
        `Admin ${savedAdmin.email} registered successfully`,
    });

    const {
      password: _,
      ...safeAdmin
    } = savedAdmin;

    return {
      message:
        'Admin registration successful',

      user: safeAdmin,
    };
  }

  // ==========================================
  // LOGIN
  // ==========================================

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const {
      email,
      password,
    } = loginDto;

    const user =
      await this.userRepository.findOne({
        where: { email },
      });

    if (!user) {
      await this.auditLogsService.create({
        userId: null,

        action:
          AuditAction.PASSWORD_CHANGE_FAILED,

        entity: 'AUTH',

        description:
          `Failed login attempt for ${email}`,

        ipAddress:
          ipAddress ?? null,

        userAgent:
          userAgent ?? null,
      });

      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    if (!user.isActive) {
      await this.auditLogsService.create({
        userId: user.id,

        action:
          AuditAction.LOGIN_FAILED,

        entity: 'AUTH',

        entityId: user.id,

        description:
          `Login attempt on inactive account ${user.email}`,

        ipAddress:
          ipAddress ?? null,

        userAgent:
          userAgent ?? null,
      });

      throw new UnauthorizedException(
        'Your account is inactive',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!passwordMatches) {
      await this.auditLogsService.create({
        userId: user.id,

        action:
          AuditAction.LOGIN_FAILED,

        entity: 'AUTH',

        entityId: user.id,

        description:
          `Failed login attempt for ${user.email}`,

        ipAddress:
          ipAddress ?? null,

        userAgent:
          userAgent ?? null,
      });

      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // ========================================
    // ACCESS TOKEN
    // ========================================

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    // ========================================
    // REFRESH TOKEN
    // ========================================

    const refreshToken =
      this.generateRefreshToken();

    const refreshTokenHash =
      this.hashRefreshToken(
        refreshToken,
      );

    // ========================================
    // SESSION
    // ========================================

    const expiresAt =
      new Date(
        Date.now() +
          7 *
            24 *
            60 *
            60 *
            1000,
      );

    await this.sessionsService.create({
      userId: user.id,

      refreshTokenHash,

      ipAddress:
        ipAddress ?? null,

      userAgent:
        userAgent ?? null,

      device: null,

      expiresAt,
    });

    // ========================================
    // AUDIT LOG
    // ========================================

    await this.auditLogsService.create({
      userId: user.id,

      action:
        AuditAction.LOGIN,

      entity: 'AUTH',

      entityId: user.id,

      description:
        `User ${user.email} logged in successfully`,

      ipAddress:
        ipAddress ?? null,

      userAgent:
        userAgent ?? null,
    });

    const {
      password: _,
      ...safeUser
    } = user;

    return {
      message:
        'Login successful',

      accessToken,

      refreshToken,

      user: safeUser,
    };
  }

  // ==========================================
  // REFRESH ACCESS TOKEN
  // ==========================================

  async refresh(
    refreshToken: string,
  ) {
    const refreshTokenHash =
      this.hashRefreshToken(
        refreshToken,
      );

    const session =
      await this.sessionsService
        .findByRefreshTokenHash(
          refreshTokenHash,
        );

    if (!session) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    if (session.revokedAt) {
      throw new UnauthorizedException(
        'Session has been revoked',
      );
    }

    if (
      session.expiresAt.getTime() <
      Date.now()
    ) {
      throw new UnauthorizedException(
        'Refresh token has expired',
      );
    }

    const user =
      await this.userRepository.findOne({
        where: {
          id: session.userId,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account is inactive',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    await this.sessionsService
      .updateLastActive(
        session,
      );

    return {
      message:
        'Access token refreshed successfully',

      accessToken,
    };
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async logout(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const refreshTokenHash =
      this.hashRefreshToken(
        refreshToken,
      );

    const session =
      await this.sessionsService
        .findByRefreshTokenHash(
          refreshTokenHash,
        );

    if (!session) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    if (!session.revokedAt) {
      session.revokedAt =
        new Date();

      await this.sessionsService
        .updateLastActive(
          session,
        );
    }

    await this.auditLogsService.create({
      userId: session.userId,

      action:
        AuditAction.LOGOUT,

      entity: 'AUTH',

      entityId: session.userId,

      description:
        `User ${session.userId} logged out`,

      ipAddress:
        ipAddress ?? null,

      userAgent:
        userAgent ?? null,
    });

    return {
      message:
        'Logout successful',
    };
  }

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ) {
    const {
      currentPassword,
      newPassword,
    } = changePasswordDto;

    const user =
      await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    // Verify current password
    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password,
      );

    if (!passwordMatches) {
      await this.auditLogsService.create({
        userId: user.id,

        action:
          AuditAction.LOGIN_FAILED,

        entity: 'AUTH',

        entityId: user.id,

        description:
          `Failed password change attempt for ${user.email}`,
      });

      throw new UnauthorizedException(
        'Current password is incorrect',
      );
    }

    // Prevent using the same password
    if (
      currentPassword ===
      newPassword
    ) {
      throw new ConflictException(
        'New password must be different from the current password',
      );
    }

    // Hash new password
    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10,
      );

    user.password =
      hashedPassword;

    await this.userRepository.save(
      user,
    );

    // Revoke all active sessions
    await this.sessionsService
      .revokeAllByUser(
        user.id,
      );

    // Record password change
    await this.auditLogsService.create({
      userId: user.id,

      action:
        AuditAction.PASSWORD_CHANGE,

      entity: 'USER',

      entityId: user.id,

      description:
        `User ${user.email} changed their password`,
    });

    return {
      message:
        'Password changed successfully',
    };
  }
  // ==========================================
// FORGOT PASSWORD
// ==========================================

async forgotPassword(
  email: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const user =
    await this.userRepository.findOne({
      where: { email },
    });

  // Do not reveal whether the email exists.
  if (!user) {
    await this.auditLogsService.create({
      userId: null,

      action:
        AuditAction.PASSWORD_RESET_REQUEST,

      entity: 'AUTH',

      description:
        `Password reset requested for unknown email ${email}`,

      ipAddress:
        ipAddress ?? null,

      userAgent:
        userAgent ?? null,
    });

    return {
      message:
        'If the account exists, a password reset link has been sent.',
    };
  }

  // Invalidate previous unused reset tokens.
  await this.passwordResetTokenRepository.update(
    {
      userId: user.id,
      used: false,
    },
    {
      used: true,
    },
  );

  const token =
    randomBytes(32).toString('hex');

  const expiresAt =
    new Date(
      Date.now() +
        15 * 60 * 1000,
    );

  const resetToken =
    this.passwordResetTokenRepository.create({
      userId: user.id,
      token,
      expiresAt,
      used: false,
    });

  await this.passwordResetTokenRepository.save(
    resetToken,
  );

  await this.auditLogsService.create({
    userId: user.id,

    action:
      AuditAction.PASSWORD_RESET_REQUEST,

    entity: 'AUTH',

    entityId: user.id,

    description:
      `Password reset requested for ${user.email}`,

    ipAddress:
      ipAddress ?? null,

    userAgent:
      userAgent ?? null,
  });

  /*
   * Development only:
   * Return the token so you can test the flow.
   *
   * In production this token must be sent
   * through email and NOT returned here.
   */

   return {
    message:
      'Password reset request created',

    resetToken: token,

    expiresAt,
  };
}

// ==========================================
// RESET PASSWORD
// ==========================================


async resetPassword(
  token: string,
  newPassword: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const resetToken =
    await this.passwordResetTokenRepository.findOne({
      where: {
        token,
        used: false,
      },
      relations: {
        user: true,
      },
    });

  if (!resetToken) {
    throw new UnauthorizedException(
      'Invalid or expired password reset token',
    );
  }

  if (
    resetToken.expiresAt.getTime() <
    Date.now()
  ) {
    throw new UnauthorizedException(
      'Invalid or expired password reset token',
    );
  }

  const user = resetToken.user;

  if (!user) {
    throw new UnauthorizedException(
      'User account not found',
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10,
    );

  user.password =
    hashedPassword;

  await this.userRepository.save(
    user,
  );

  resetToken.used = true;

  await this.passwordResetTokenRepository.save(
    resetToken,
  );

  // Force existing sessions to log in again.
  await this.sessionsService.revokeAllByUser(
    user.id,
  );

  await this.auditLogsService.create({
    userId: user.id,

    action:
      AuditAction.PASSWORD_RESET,

    entity: 'USER',

    entityId: user.id,

    description:
      `User ${user.email} reset their password`,

    ipAddress:
      ipAddress ?? null,

    userAgent:
      userAgent ?? null,
  });

  return {
    message:
      'Password reset successful',
  };
}
}
