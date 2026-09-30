import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

import {
  UserRole,
} from '../../users/entities/user.entity';

import {
  AuditAction,
} from '../../audit-logs/entities/audit-log.entity';

import {
  AuditLogsService,
} from '../../audit-logs/audit-logs.service';

@Injectable()
export class RolesGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,

    private readonly auditLogsService: AuditLogsService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<
        UserRole[]
      >(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    // If the endpoint doesn't require a role,
    // allow the request.
    if (!requiredRoles) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest();

    const user =
      request.user;

    // No authenticated user
    if (!user) {
      await this.auditLogsService.create({
        userId: null,

        action:
          AuditAction.UNAUTHORIZED_ACCESS,

        entity: 'AUTH',

        description:
          `Unauthorized access attempt to ${request.method} ${request.originalUrl}`,

        ipAddress:
          request.ip ?? null,

        userAgent:
          request.headers[
            'user-agent'
          ] ?? null,

        metadata: {
          method:
            request.method,

          endpoint:
            request.originalUrl,

          requiredRoles,
        },
      });

      throw new ForbiddenException(
        'User information not found',
      );
    }

    // Check whether the user's role
    // is allowed to access the endpoint.
    if (
      !requiredRoles.includes(
        user.role,
      )
    ) {
      await this.auditLogsService.create({
        userId: user.id,

        action:
          AuditAction.UNAUTHORIZED_ACCESS,

        entity: 'AUTH',

        entityId: user.id,

        description:
          `User ${user.email} attempted unauthorized access to ${request.method} ${request.originalUrl}`,

        ipAddress:
          request.ip ?? null,

        userAgent:
          request.headers[
            'user-agent'
          ] ?? null,

        metadata: {
          method:
            request.method,

          endpoint:
            request.originalUrl,

          userRole:
            user.role,

          requiredRoles,
        },
      });

      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
