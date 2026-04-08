import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { AuditService } from 'src/modules/audit/services/audit.service';
import { AuditLog } from 'src/modules/audit/entities/audit-log.entity';
import { AuditAction } from 'src/common/enums/audit-action.enum';
import { Role } from 'src/common/enums/role.enum';
import { JwtUser } from 'src/common/interface/jwt-user.interface';
import { TaskSnapshot } from 'src/common/interface/task-snapshot.interface';
import { PaginatedServiceResponse } from 'src/common/interface/api-response.interface';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { QueryTaskDto } from '../dto/query-task.dto';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    private readonly auditService: AuditService,
    private readonly userService: UserService,
  ) {}

  // ─── Queries ──────────────────────────────────────────────────────────────

  async findAll(
    user: JwtUser,
    query: QueryTaskDto,
  ): Promise<PaginatedServiceResponse<Task>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();
    const currentUserId = this.resolveUserId(user);

    const qb = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (user.role !== Role.ADMIN) {
      qb.where('task.assignedToId = :userId', { userId: currentUserId });
    }

    if (search) {
      const normalizedSearch = `%${search.toLowerCase()}%`;
      const searchCondition = `(
        LOWER(task.title) LIKE :search
        OR LOWER(task.description) LIKE :search
        OR LOWER(assignedTo.name) LIKE :search
        OR LOWER(assignedTo.email) LIKE :search
        OR LOWER(createdBy.name) LIKE :search
        OR LOWER(createdBy.email) LIKE :search
      )`;

      if (user.role !== Role.ADMIN) {
        qb.andWhere(searchCondition, { search: normalizedSearch });
      } else {
        qb.where(searchCondition, { search: normalizedSearch });
      }
    }

    const [items, total] = await qb.getManyAndCount();

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

  async findOne(id: number, user: JwtUser): Promise<Task> {
    const currentUserId = this.resolveUserId(user);

    const task = await this.taskRepo.findOne({
      where: { id },
      relations: { assignedTo: true, createdBy: true },
    });

    if (!task) throw new NotFoundException(`Task #${id} not found`);

    if (user.role !== Role.ADMIN && task.assignedToId !== currentUserId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  // ─── Commands ────────────────────────────────────────────────────────────

  async create(dto: CreateTaskDto, user: JwtUser): Promise<Task> {
    const currentUserId = this.resolveUserId(user);
    await this.validateAssignee(dto.assignedToId);
    const actorName = await this.resolveActorName(user);

    return this.dataSource.transaction(async (manager) => {
      const taskRepo = manager.getRepository(Task);
      const auditRepo = manager.getRepository(AuditLog);

      const task = taskRepo.create({
        title: dto.title,
        description: dto.description,
        assignedToId: dto.assignedToId ?? null,
        createdById: currentUserId,
      });

      const saved = await taskRepo.save(task);

      await this.auditService.log(
        {
          actorId: currentUserId,
          actorName,
          action: AuditAction.TASK_CREATED,
          taskId: saved.id,
          before: null,
          after: this.snapshot(saved),
          summary: `Task "${saved.title}" created`,
        },
        auditRepo,
      );

      return this.loadFullTask(taskRepo, saved.id);
    });
  }

  async update(id: number, dto: UpdateTaskDto, user: JwtUser): Promise<Task> {
    const currentUserId = this.resolveUserId(user);
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: { assignedTo: true, createdBy: true },
    });
    if (!task) throw new NotFoundException(`Task #${id} not found`);

    // ── Role-based field access ──────────────────────────────────────────
    const isAdmin = user.role === Role.ADMIN;

    if (!isAdmin) {
      if (task.assignedToId !== currentUserId) {
        throw new ForbiddenException('You do not have access to this task');
      }

      const attemptedAdminFields =
        dto.title !== undefined ||
        dto.description !== undefined ||
        dto.assignedToId !== undefined;

      if (attemptedAdminFields) {
        throw new ForbiddenException(
          'Users can only update the status of their assigned tasks',
        );
      }
    }

    // ── Detect actual changes ────────────────────────────────────────────
    const changes = {
      title: dto.title !== undefined && dto.title !== task.title,
      description: dto.description !== undefined && dto.description !== task.description,
      status: dto.status !== undefined && dto.status !== task.status,
      assignee: dto.assignedToId !== undefined && dto.assignedToId !== task.assignedToId,
    };

    if (!Object.values(changes).some(Boolean)) {
      throw new BadRequestException('No changes detected');
    }

    if (changes.assignee) {
      await this.validateAssignee(dto.assignedToId);
    }
    const actorName = await this.resolveActorName(user);

    return this.dataSource.transaction(async (manager) => {
      const taskRepo = manager.getRepository(Task);
      const auditRepo = manager.getRepository(AuditLog);
      const before = this.snapshot(task);

      // Apply changes
      if (changes.title) task.title = dto.title!;
      if (changes.description) task.description = dto.description!;
      if (changes.status) task.status = dto.status!;
      if (changes.assignee) task.assignedToId = dto.assignedToId ?? null;

      const saved = await taskRepo.save(task);
      const after = this.snapshot(saved);

      // Emit one audit log per distinct change type so the log is granular
      const auditPromises: Promise<unknown>[] = [];

      if (changes.status) {
        auditPromises.push(
          this.auditService.log(
            {
              actorId: currentUserId,
              actorName,
              action: AuditAction.STATUS_CHANGED,
              taskId: saved.id,
              before,
              after,
              summary: `Status changed: ${before.status} → ${after.status}`,
            },
            auditRepo,
          ),
        );
      }

      if (changes.assignee) {
        auditPromises.push(
          this.auditService.log(
            {
              actorId: currentUserId,
              actorName,
              action: AuditAction.TASK_ASSIGNED,
              taskId: saved.id,
              before,
              after,
              summary: `Assignee changed: ${before.assignedToId ?? 'none'} → ${after.assignedToId ?? 'none'}`,
            },
            auditRepo,
          ),
        );
      }

      if (changes.title || changes.description) {
        auditPromises.push(
          this.auditService.log(
            {
              actorId: currentUserId,
              actorName,
              action: AuditAction.TASK_UPDATED,
              taskId: saved.id,
              before,
              after,
              summary: 'Task content updated',
            },
            auditRepo,
          ),
        );
      }

      await Promise.all(auditPromises);

      return this.loadFullTask(taskRepo, saved.id);
    });
  }

  async remove(id: number, user: JwtUser): Promise<void> {
    const currentUserId = this.resolveUserId(user);
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task #${id} not found`);
    const actorName = await this.resolveActorName(user);

    await this.dataSource.transaction(async (manager) => {
      const taskRepo = manager.getRepository(Task);
      const auditRepo = manager.getRepository(AuditLog);

      await taskRepo.softDelete(id);

      await this.auditService.log(
        {
          actorId: currentUserId,
          actorName,
          action: AuditAction.TASK_DELETED,
          taskId: id,
          before: this.snapshot(task),
          after: null,
          summary: `Task "${task.title}" deleted`,
        },
        auditRepo,
      );
    });
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  /** Re-fetch a task with full relations inside an active transaction. */
  private loadFullTask(
    repo: Repository<Task>,
    id: number,
  ): Promise<Task> {
    return repo.findOneOrFail({
      where: { id },
      relations: { assignedTo: true, createdBy: true },
    });
  }

  /** Captures the mutable fields of a task for before/after audit snapshots. */
  private snapshot(task: Task): TaskSnapshot {
    return {
      title: task.title,
      description: task.description,
      status: task.status,
      assignedToId: task.assignedToId,
    };
  }

  /**
   * Ensures the intended assignee exists and holds the USER role.
   * Admins cannot be assigned tasks — this is a business rule, not just a guard.
   */
  private async validateAssignee(assignedToId?: number | null): Promise<void> {
    if (assignedToId === null || assignedToId === undefined) return;

    const assignee = await this.userService.findById(assignedToId);
    if (assignee.role !== Role.USER) {
      throw new BadRequestException(
        'Tasks can only be assigned to accounts with the USER role',
      );
    }
  }

  /**
   * Gets a stable display name for audit rows.
   * Falls back to current DB value for compatibility with old tokens.
   */
  private async resolveActorName(user: JwtUser): Promise<string | null> {
    if (user.name) return user.name;

    const actor = await this.userService.findById(this.resolveUserId(user));
    return actor.name;
  }

  private resolveUserId(user: JwtUser): number {
    const legacyUser = user as JwtUser & { id?: number };
    const id = user.sub ?? legacyUser.id;

    if (!id || Number.isNaN(Number(id))) {
      throw new UnauthorizedException('Invalid token payload: missing user id');
    }

    return Number(id);
  }
}