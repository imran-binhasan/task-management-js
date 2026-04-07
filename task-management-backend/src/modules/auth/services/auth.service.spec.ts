import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from 'src/common/enums/role.enum';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const bcrypt = require('bcrypt') as { compare: jest.Mock };

describe('AuthService', () => {
  let service: AuthService;
  let userService: { findRawByEmail: jest.Mock; findById: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(() => {
    userService = {
      findRawByEmail: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = { signAsync: jest.fn() };
    service = new AuthService(userService as any, jwtService as any);
  });

  it('throws UnauthorizedException on invalid credentials', async () => {
    userService.findRawByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'bad@example.com', password: 'badpass' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns token and user payload on valid credentials', async () => {
    bcrypt.compare.mockResolvedValue(true);

    userService.findRawByEmail.mockResolvedValue({
      id: 1,
      name: 'Admin',
      email: 'admin@example.com',
      role: Role.ADMIN,
      password: 'hashed',
    });
    jwtService.signAsync.mockResolvedValue('token123');

    const result = await service.login({
      email: 'admin@example.com',
      password: 'secret123',
    });

    expect(bcrypt.compare).toHaveBeenCalledWith('secret123', 'hashed');
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 1, email: 'admin@example.com', name: 'Admin' }),
    );
    expect(result).toEqual({
      accessToken: 'token123',
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@example.com',
        role: Role.ADMIN,
      },
    });
  });

  it('delegates me lookup to user service', async () => {
    userService.findById.mockResolvedValue({ id: 7, name: 'User' });

    const result = await service.me(7);

    expect(userService.findById).toHaveBeenCalledWith(7);
    expect(result).toEqual({ id: 7, name: 'User' });
  });
});