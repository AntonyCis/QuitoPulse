import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { registerSchema, loginSchema, refreshSchema } from '@radar-quito/validation';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: { email: string; password: string; displayName?: string },
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.register(dto.email, dto.password, dto.displayName, ip);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: { email: string; password: string },
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress;
    return this.authService.login(dto.email, dto.password, ip);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(refreshSchema)) dto: { refreshToken: string },
  ) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: { id: string },
    @Body() dto: { refreshToken?: string },
  ) {
    await this.authService.logout(user.id, dto.refreshToken);
    return { message: 'Sesión cerrada' };
  }
}
