import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { PasswordResetToken } from './entities/password-reset-token.entity';
import { Session } from './entities/session.entity';

import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PasswordResetToken,
      Session,
    ]),

    AuditLogsModule,

    PassportModule,

    JwtModule.registerAsync({
      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory: (
        configService: ConfigService,
      ) => {
        const secret =
          configService.get<string>(
            'JWT_SECRET',
          );

        if (!secret) {
          throw new Error(
            'JWT_SECRET is not defined in the environment',
          );
        }

        return {
          secret,

          signOptions: {
            expiresIn: '1h',
          },
        };
      },
    }),
  ],

  controllers: [
    AuthController,
    SessionsController,
  ],

  providers: [
    AuthService,
    JwtStrategy,
    RolesGuard,
    SessionsService,
  ],

  exports: [
    SessionsService,
  ],
})
export class AuthModule {}

