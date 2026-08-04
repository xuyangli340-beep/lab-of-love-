import { Controller, Get, Patch, Body, Req, Logger } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { UserProfileService } from './user-profile.service';
import type { UserProfile } from '@shared/api.interface';

interface RequestWithUser extends Request {
  userContext: { userId: string; userName?: string };
}

@Controller('api/user-profile')
@NeedLogin()
export class UserProfileController {
  private readonly logger = new Logger(UserProfileController.name);

  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  async getProfile(@Req() req: RequestWithUser): Promise<UserProfile> {
    const { userId } = req.userContext;
    return this.userProfileService.getOrCreate(userId);
  }

  @Patch()
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() data: Partial<UserProfile>,
  ): Promise<{ success: boolean; profile: UserProfile }> {
    const { userId } = req.userContext;
    const profile = await this.userProfileService.update(userId, data);
    return { success: true, profile };
  }
}
