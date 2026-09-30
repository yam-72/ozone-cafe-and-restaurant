import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

import { Roles } from './decorators/roles.decorator';

import {
  UserRole,
} from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  // ==========================================
  // REGISTER
  // ==========================================

  @Post('register')
  async register(
    @Body()
    registerDto: RegisterDto,
  ) {
    return this.authService.register(
      registerDto,
    );
  }

  // ==========================================
  // REGISTER ADMIN
  // ==========================================

  @Post('register-admin')
  async registerAdmin(
    @Body()
    registerAdminDto: RegisterAdminDto,
  ) {
    return this.authService.registerAdmin(
      registerAdminDto,
    );
  }

  // ==========================================
  // LOGIN
  // ==========================================

  @Post('login')
  async login(
    @Body()
    loginDto: LoginDto,

    @Req()
    request: any,
  ) {
    return this.authService.login(
      loginDto,
      request.ip,
      request.headers['user-agent'],
    );
  }

  // ==========================================
  // REFRESH
  // ==========================================

  @Post('refresh')
  async refresh(
    @Body()
    refreshTokenDto: RefreshTokenDto,
  ) {
    return this.authService.refresh(
      refreshTokenDto.refreshToken,
    );
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  @Post('logout')
  async logout(
    @Body()
    refreshTokenDto: RefreshTokenDto,

    @Req()
    request: any,
  ) {
    return this.authService.logout(
      refreshTokenDto.refreshToken,
      request.ip,
      request.headers['user-agent'],
    );
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  @Post('forgot-password')
  async forgotPassword(
    @Body()
    forgotPasswordDto: ForgotPasswordDto,

    @Req()
    request: any,
  ) {
    return this.authService.forgotPassword(
      forgotPasswordDto.email,
      request.ip,
      request.headers['user-agent'],
    );
  }

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  @Post('reset-password')
  async resetPassword(
    @Body()
    resetPasswordDto: ResetPasswordDto,

    @Req()
    request: any,
  ) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
      request.ip,
      request.headers['user-agent'],
    );
  }

  // ==========================================
  // CURRENT USER
  // ==========================================

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(
    @Req()
    request: any,
  ) {
    return {
      message:
        'Authenticated successfully',

      user: request.user,
    };
  }

  // ==========================================
  // ADMIN TEST
  // ==========================================

  @Roles(UserRole.ADMIN)
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Get('admin-test')
  async adminTest() {
    return {
      message:
        'Welcome Admin',
    };
  }

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req()
    request: any,

    @Body()
    changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      request.user.id,
      changePasswordDto,
    );
  }
}
