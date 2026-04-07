import { AuditAction } from 'src/common/enums/audit-action.enum';
import { AuditService } from './audit.service';
import { AuditLog } from '../entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepo: {
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  beforeEach(() => {
    auditRepo = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
      createQueryBuilder: jest.fn(),
    };

    service = new AuditService(auditRepo as any);
  });

  it('stores actorName when provided in log dto', async () => {
    await service.log({
      actorId: 1,
      actorName: 'Imran Ahmed',
      action: AuditAction.TASK_CREATED,
      taskId: 10,
      summary: 'created',
    });

    expect(auditRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 1,
        actorName: 'Imran Ahmed',
      }),
    );
  });

  it('falls back actorName from actor relation when missing', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    const missingName = {
      actorName: null,
      actor: { name: 'Fallback Name' },
    } as AuditLog;
    const existingName = {
      actorName: 'Stored Name',
      actor: { name: 'Ignored Name' },
    } as AuditLog;

    qb.getManyAndCount.mockResolvedValue([[missingName, existingName], 2]);
    auditRepo.createQueryBuilder.mockReturnValue(qb);

    const result = await service.findMany({
      page: 1,
      limit: 20,
      taskId: 99,
      actorId: 7,
      action: AuditAction.TASK_UPDATED,
    });

    expect(qb.andWhere).toHaveBeenNthCalledWith(1, 'audit.taskId = :taskId', {
      taskId: 99,
    });
    expect(qb.andWhere).toHaveBeenNthCalledWith(2, 'audit.actorId = :actorId', {
      actorId: 7,
    });
    expect(qb.andWhere).toHaveBeenNthCalledWith(3, 'audit.action = :action', {
      action: AuditAction.TASK_UPDATED,
    });
    expect(result.items[0].actorName).toBe('Fallback Name');
    expect(result.items[1].actorName).toBe('Stored Name');
    expect(result.pagination.totalPages).toBe(1);
  });
});