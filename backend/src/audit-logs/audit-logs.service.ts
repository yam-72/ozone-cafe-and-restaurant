import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  AuditAction,
  AuditLog,
} from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(data: {
    userId?: number | null;
    action: AuditAction;
    entity: string;
    entityId?: number | null;
    description: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, any> | null;
  }) {
    const auditLog =
      this.auditLogRepository.create({
        userId: data.userId ?? null,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId ?? null,
        description: data.description,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        metadata: data.metadata ?? null,
      });

    return this.auditLogRepository.save(
      auditLog,
    );
  }

  async findAll() {
    return this.auditLogRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findRecent(limit = 50) {
    return this.auditLogRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }
}