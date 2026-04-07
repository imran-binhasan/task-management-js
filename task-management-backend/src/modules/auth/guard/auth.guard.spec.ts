import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: { verifyAsync: jest.Mock };
  let configService: { getOrThrow: jest.Mock };

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    configService = { getOrThrow: jest.fn().mockReturnValue('secret') };
    guard = new AuthGuard(jwtService as any, configService as any);
  });

  it('throws when no bearer token is provided', async () => {
    const req: any = { headers: {} };
    const context: any = {
      switchToHttp: () => ({ getRequest: () => req }),
    };

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches decoded user and allows request', async () => {
    const req: any = { headers: { authorization: 'Bearer token123' } };
    jwtService.verifyAsync.mockResolvedValue({ sub: 1, role: 'ADMIN' });
    const context: any = {
      switchToHttp: () => ({ getRequest: () => req }),
    };

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(req.user).toEqual({ sub: 1, role: 'ADMIN' });
  });
});