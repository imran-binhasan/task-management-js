import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from 'src/common/enums/role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as any);
  });

  it('allows when route has no role metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: Role.USER } }) }),
    };

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws when user role is not allowed', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: Role.USER } }) }),
    };

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows when user role matches required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: Role.ADMIN } }) }),
    };

    expect(guard.canActivate(context)).toBe(true);
  });
});