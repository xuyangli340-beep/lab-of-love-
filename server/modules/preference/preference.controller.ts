import { Controller, Get, Patch, Post, Delete, Param, Body, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { PreferenceService } from './preference.service';
import type { PreferenceFactor } from '@shared/api.interface';

interface UpdateFactorBody {
  weight?: number;
  isHardConstraint?: boolean;
}

interface CreateFactorBody {
  factorName: string;
  weight: number;
  isHardConstraint?: boolean;
}

@Controller('api/preference-factors')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get()
  @NeedLogin()
  async getList(@Req() req: { userContext: { userId: string } }) {
    const { userId } = req.userContext;
    return this.preferenceService.getList(userId);
  }

  @Patch(':id')
  @NeedLogin()
  async update(
    @Req() req: { userContext: { userId: string } },
    @Param('id') id: string,
    @Body() body: UpdateFactorBody,
  ): Promise<{ success: boolean; factor: PreferenceFactor }> {
    const { userId } = req.userContext;
    return this.preferenceService.update(userId, id, body);
  }

  @Post()
  @NeedLogin()
  async create(
    @Req() req: { userContext: { userId: string } },
    @Body() body: CreateFactorBody,
  ): Promise<{ id: string; success: boolean }> {
    const { userId } = req.userContext;
    return this.preferenceService.create(userId, { ...body, isCustom: true, isHardConstraint: body.isHardConstraint ?? false });
  }

  @Delete(':id')
  @NeedLogin()
  async remove(
    @Req() req: { userContext: { userId: string } },
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    return this.preferenceService.remove(userId, id);
  }
}
