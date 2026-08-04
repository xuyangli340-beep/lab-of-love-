import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UserProfileService } from '../user-profile/user-profile.service';
import type { AuthRegisterRequest, AuthResponse } from '@shared/api.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly userProfileService: UserProfileService) {}

  async register(data: AuthRegisterRequest, userId: string): Promise<AuthResponse> {
    if (!data.email || !data.password || !data.nickname) {
      throw new BadRequestException('昵称、邮箱和密码均为必填项');
    }
    if (data.password.length < 6) {
      throw new BadRequestException('密码长度至少6位');
    }
    const profile = await this.userProfileService.getOrCreate(userId, data.nickname);
    if (!profile.nickname && data.nickname) {
      await this.userProfileService.update(userId, { nickname: data.nickname });
    }
    return {
      token: 'platform-auth',
      user: {
        id: userId,
        email: data.email,
        nickname: data.nickname,
      },
    };
  }

  async requestResetPassword(email: string): Promise<{ success: boolean }> {
    this.logger.log(`Password reset requested for: ${email}`);
    return { success: true };
  }

  async confirmResetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean }> {
    if (!token || !newPassword) {
      throw new BadRequestException('token 和新密码均为必填项');
    }
    return { success: true };
  }
}
