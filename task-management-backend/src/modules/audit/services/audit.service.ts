import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';
import { PaginatedServiceResponse } from 'src/common/interface/api-response.interface';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(
    dto: CreateAuditLogDto,
    repository: Repository<AuditLog> = this.auditRepo,
  ): Promise<AuditLog> {
    const entry = repository.create({
      actorId: dto.actorId,
      actorName: dto.actorName ?? null,
      action: dto.action,
      taskId: dto.taskId,
      before: dto.before ?? null,
      after: dto.after ?? null,
      summary: dto.summary,
    });
    return repository.save(entry);
  }

  /** Returns paginated audit logs with optional filters. */
  async findMany(
    query: QueryAuditLogDto,
  ): Promise<PaginatedServiceResponse<AuditLog>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.auditRepo
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.actor', 'actor')
      .orderBy('audit.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.taskId !== undefined) {
      qb.andWhere('audit.taskId = :taskId', { taskId: query.taskId });
    }

    if (query.actorId !== undefined) {
      qb.andWhere('audit.actorId = :actorId', { actorId: query.actorId });
    }

    if (query.action !== undefined) {
      qb.andWhere('audit.action = :action', { action: query.action });
    }

    const [items, total] = await qb.getManyAndCount();

    // Fallback for historical rows that may not have actorName persisted.
    for (const item of items) {
      item.actorName = item.actorName ?? item.actor?.name ?? null;
    }

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}