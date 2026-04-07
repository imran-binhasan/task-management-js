import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '../guard/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { LoginDto } from '../dto/login.dto';
import type { JwtUser } from 'src/common/interface/jwt-user.interface';


@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login with email + password',
    description: 'Returns a signed JWT access token valid for the configured duration.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Return the currently authenticated user profile' })
  me(@CurrentUser() user: JwtUser) {
    return this.authService.me(user.sub);
  }
}