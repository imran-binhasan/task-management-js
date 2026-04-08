import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let qb: {
    orderBy: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    where: jest.Mock;
    getManyAndCount: jest.Mock;
  };
  let userRepo: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  beforeEach(() => {
    qb = {
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };

    service = new UserService(userRepo as any);
  });

  it('paginates users with expected query options', async () => {
    const users = [{ id: 1 }, { id: 2 }] as User[];
    qb.getManyAndCount.mockResolvedValue([users, 9]);

    const result = await service.findAll({ page: 2, limit: 4 });

    expect(userRepo.createQueryBuilder).toHaveBeenCalledWith('user');
    expect(qb.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
    expect(qb.skip).toHaveBeenCalledWith(4);
    expect(qb.take).toHaveBeenCalledWith(4);
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

  it('applies search filter when search term is provided', async () => {
    qb.getManyAndCount.mockResolvedValue([[], 0]);

    await service.findAll({ page: 1, limit: 20, search: 'John' });

    expect(qb.where).toHaveBeenCalledWith(
      '(LOWER(user.name) LIKE :search OR LOWER(user.email) LIKE :search)',
      { search: '%john%' },
    );
  });

  it('throws NotFoundException when user does not exist', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.findById(404)).rejects.toBeInstanceOf(NotFoundException);
    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 404 } });
  });
});