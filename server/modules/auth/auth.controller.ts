import { Controller, Post, Body, Req, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import type {
  AuthRegisterRequest,
  AuthResponse,
} from '@shared/api.interface';

interface RequestWithUser extends Request {
  userContext: { userId: string; userName?: string };
}

@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Req() req: RequestWithUser,
    @Body() data: AuthRegisterRequest,
  ): Promise<AuthResponse> {
    const userId = req.userContext?.userId;
    return this.authService.register(data, userId || '');
  }

  @Post('reset-password/request')
  async requestResetPassword(
    @Body('email') email: string,
  ): Promise<{ success: boolean }> {
    return this.authService.requestResetPassword(email);
  }

  @Post('reset-password/confirm')
  async confirmResetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ success: boolean }> {
    return this.authService.confirmResetPassword(token, newPassword);
  }
}
