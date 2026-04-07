import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepo: {
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  beforeEach(() => {
    userRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    service = new UserService(userRepo as any);
  });

  it('paginates users with expected query options', async () => {
    const users = [{ id: 1 }, { id: 2 }] as User[];
    userRepo.findAndCount.mockResolvedValue([users, 9]);

    const result = await service.findAll({ page: 2, limit: 4 });

    expect(userRepo.findAndCount).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
      skip: 4,
      take: 4,
    });
    expect(result).toEqual({
      items: users,
      pagination: {
        page: 2,
        limit: 4,
        total: 9,
        totalPages: 3,
      },
    });
  });

  it('throws NotFoundException when user does not exist', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.findById(404)).rejects.toBeInstanceOf(NotFoundException);
    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 404 } });
  });
});