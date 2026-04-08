import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';
import { TaskStatus } from 'src/common/enums/task-status.enum';
import { AuditAction } from 'src/common/enums/audit-action.enum';
import { TaskService } from './task.service';
import { Task } from '../entities/task.entity';
import { AuditLog } from 'src/modules/audit/entities/audit-log.entity';

describe('TaskService', () => {
  let service: TaskService;
  let dataSource: { transaction: jest.Mock };
  let taskRepo: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
  };
  let auditService: { log: jest.Mock };
  let userService: { findById: jest.Mock };
  let txTaskRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findOneOrFail: jest.Mock;
    softDelete: jest.Mock;
  };
  let txAuditRepo: Record<string, never>;

  beforeEach(() => {
    txTaskRepo = {
      create: jest.fn((value) => value),
      save: jest.fn(),
      findOneOrFail: jest.fn(),
      softDelete: jest.fn(),
    };
    txAuditRepo = {};

    const manager = {
      getRepository: jest.fn((entity) => {
        if (entity === Task) return txTaskRepo;
        if (entity === AuditLog) return txAuditRepo;
        return null;
      }),
    };

    dataSource = {
      transaction: jest.fn(async (cb) => cb(manager)),
    };

    taskRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
    };

    auditService = { log: jest.fn().mockResolvedValue(undefined) };
    userService = { findById: jest.fn() };

    service = new TaskService(
      dataSource as any,
      taskRepo as any,
      auditService as any,
      userService as any,
    );
  });

  it('applies assigned user filter for non-admin in findAll', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    taskRepo.createQueryBuilder.mockReturnValue(qb);

    await service.findAll(
      { sub: 55, email: 'u@example.com', role: Role.USER },
      { page: 2, limit: 10 },
    );

    expect(qb.where).toHaveBeenCalledWith('task.assignedToId = :userId', {
      userId: 55,
    });
  });

  it('applies assigned user filter for legacy payload using id', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    taskRepo.createQueryBuilder.mockReturnValue(qb);

    await service.findAll(
      { id: 77, email: 'legacy@example.com', role: Role.USER } as any,
      { page: 1, limit: 10 },
    );

    expect(qb.where).toHaveBeenCalledWith('task.assignedToId = :userId', {
      userId: 77,
    });
  });

  it('blocks non-admin from changing admin-only fields', async () => {
    taskRepo.findOne.mockResolvedValue({
      id: 1,
      title: 'A',
      description: 'B',
      status: TaskStatus.PENDING,
      assignedToId: 10,
    });

    await expect(
      service.update(
        1,
        { title: 'New title' },
        { sub: 10, email: 'user@example.com', role: Role.USER },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects updates when no values change', async () => {
    taskRepo.findOne.mockResolvedValue({
      id: 1,
      title: 'Same',
      description: 'Same desc',
      status: TaskStatus.PENDING,
      assignedToId: 10,
      createdBy: null,
      assignedTo: null,
    });

    await expect(
      service.update(
        1,
        {
          title: 'Same',
          description: 'Same desc',
          status: TaskStatus.PENDING,
          assignedToId: 10,
        },
        { sub: 1, email: 'admin@example.com', role: Role.ADMIN, name: 'Admin' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('emits separate audit logs for status, assignee, and content changes', async () => {
    const initialTask = {
      id: 7,
      title: 'Old',
      description: 'Old desc',
      status: TaskStatus.PENDING,
      assignedToId: 2,
      createdBy: null,
      assignedTo: null,
    };
    taskRepo.findOne.mockResolvedValue(initialTask);

    userService.findById.mockResolvedValue({ id: 3, role: Role.USER, name: 'Assignee' });

    txTaskRepo.save.mockResolvedValue({ ...initialTask });
    txTaskRepo.findOneOrFail.mockResolvedValue({ id: 7 });

    await service.update(
      7,
      {
        title: 'New',
        description: 'New desc',
        status: TaskStatus.DONE,
        assignedToId: 3,
      },
      { sub: 1, email: 'admin@example.com', role: Role.ADMIN, name: 'Admin' },
    );

    expect(auditService.log).toHaveBeenCalledTimes(3);
    expect(auditService.log).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ action: AuditAction.STATUS_CHANGED, actorName: 'Admin' }),
      txAuditRepo,
    );
    expect(auditService.log).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ action: AuditAction.TASK_ASSIGNED, actorName: 'Admin' }),
      txAuditRepo,
    );
    expect(auditService.log).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ action: AuditAction.TASK_UPDATED, actorName: 'Admin' }),
      txAuditRepo,
    );
  });

  it('uses DB actor name fallback when JWT name is missing', async () => {
    userService.findById.mockResolvedValue({ id: 5, name: 'Fallback Actor', role: Role.ADMIN });
    txTaskRepo.save.mockResolvedValue({
      id: 20,
      title: 'Task',
      description: 'Desc',
      status: TaskStatus.PENDING,
      assignedToId: null,
    });
    txTaskRepo.findOneOrFail.mockResolvedValue({ id: 20 });

    await service.create(
      { title: 'Task', description: 'Desc' },
      { sub: 5, email: 'admin@example.com', role: Role.ADMIN },
    );

    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AuditAction.TASK_CREATED,
        actorName: 'Fallback Actor',
      }),
      txAuditRepo,
    );
  });
});