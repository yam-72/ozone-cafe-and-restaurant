import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  Repository,
} from 'typeorm';

import { Session } from './entities/session.entity';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import {
  AuditAction,
} from '../audit-logs/entities/audit-log.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,

    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(data: {
    userId: number;
    refreshTokenHash: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    device?: string | null;
    expiresAt: Date;
  }) {
    const session =
      this.sessionRepository.create({
        userId: data.userId,

        refreshTokenHash:
          data.refreshTokenHash,

        ipAddress:
          data.ipAddress ?? null,

        userAgent:
          data.userAgent ?? null,

        device:
          data.device ?? null,

        lastActiveAt: new Date(),

        expiresAt: data.expiresAt,

        revokedAt: null,
      });

    return this.sessionRepository.save(
      session,
    );
  }

  async findActiveByUser(
    userId: number,
  ) {
    return this.sessionRepository.find({
      where: {
        userId,
        revokedAt: IsNull(),
      },

      order: {
        lastActiveAt: 'DESC',
      },
    });
  }
  async revokeAllByUser(
  userId: number,
) {
  const sessions =
    await this.sessionRepository.find({
      where: {
        userId,
        revokedAt: IsNull(),
      },
    });

  if (sessions.length === 0) {
    return;
  }

  const now = new Date();

  for (const session of sessions) {
    session.revokedAt = now;
  }

  await this.sessionRepository.save(
    sessions,
  );
}

  async findAll() {
    const sessions =
      await this.sessionRepository.find({
        relations: {
          user: true,
        },

        order: {
          lastActiveAt: 'DESC',
        },
      });

    const now = new Date();

    return sessions.map((session) => {
      let status:
        | 'ACTIVE'
        | 'REVOKED'
        | 'EXPIRED';

      if (session.revokedAt) {
        status = 'REVOKED';
      } else if (
        session.expiresAt.getTime() <=
        now.getTime()
      ) {
        status = 'EXPIRED';
      } else {
        status = 'ACTIVE';
      }

      return {
        id: session.id,

        user: {
          id: session.user.id,
          fullName: session.user.fullName,
          email: session.user.email,
          role: session.user.role,
        },

        ipAddress: session.ipAddress,

        userAgent: session.userAgent,

        device: session.device,

        lastActiveAt:
          session.lastActiveAt,

        createdAt:
          session.createdAt,

        expiresAt:
          session.expiresAt,

        revokedAt:
          session.revokedAt,

        status,
      };
    });
  }

  async revoke(
    sessionId: number,
    adminUserId: number,
  ) {
    const session =
      await this.sessionRepository.findOne({
        where: {
          id: sessionId,
        },
      });

    if (!session) {
      throw new NotFoundException(
        `Session ${sessionId} not found`,
      );
    }

    if (session.revokedAt) {
      return {
        message:
          `Session ${sessionId} is already revoked`,
      };
    }

    session.revokedAt =
      new Date();

    await this.sessionRepository.save(
      session,
    );

    await this.auditLogsService.create({
      userId: adminUserId,

      action:
        AuditAction.SESSION_REVOKED,

      entity: 'SESSION',

      entityId: session.id,

      description:
        `Admin ${adminUserId} revoked session ${session.id} belonging to user ${session.userId}`,
    });

    return {
      message:
        `Session ${sessionId} revoked successfully`,
    };
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
  ) {
    return this.sessionRepository.findOne({
      where: {
        refreshTokenHash,
      },
    });
  }

  async updateLastActive(
    session: Session,
  ) {
    session.lastActiveAt =
      new Date();

    return this.sessionRepository.save(
      session,
    );
  }
}
