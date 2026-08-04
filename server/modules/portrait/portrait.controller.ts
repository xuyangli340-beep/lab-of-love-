import { Controller, Get, Post, Patch, Body, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { PortraitService } from './portrait.service';
import type { IdealPortrait } from '@shared/api.interface';

interface RatingBody {
  rating: number;
}

interface FeedbackBody {
  feedback: string;
}

@Controller('api/ideal-portrait')
export class PortraitController {
  constructor(private readonly portraitService: PortraitService) {}

  @Get()
  @NeedLogin()
  async get(@Req() req: { userContext: { userId: string } }): Promise<IdealPortrait | null> {
    const { userId } = req.userContext;
    return this.portraitService.get(userId);
  }

  @Post('generate')
  @NeedLogin()
  async generate(
    @Req() req: { userContext: { userId: string } },
  ): Promise<{ id: string; portrait: IdealPortrait }> {
    const { userId } = req.userContext;
    return this.portraitService.generate(userId);
  }

  @Patch('rating')
  @NeedLogin()
  async submitRating(
    @Req() req: { userContext: { userId: string } },
    @Body() body: RatingBody,
  ): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    return this.portraitService.submitRating(userId, body.rating);
  }

  @Patch('feedback')
  @NeedLogin()
  async submitFeedback(
    @Req() req: { userContext: { userId: string } },
    @Body() body: FeedbackBody,
  ): Promise<{ success: boolean }> {
    const { userId } = req.userContext;
    return this.portraitService.submitFeedback(userId, body.feedback);
  }
}
