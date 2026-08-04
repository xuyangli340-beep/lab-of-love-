import { Controller, Get, Post, Patch, Body, Param, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { InterviewService } from './interview.service';
import type { InterviewRecord, InterviewAnswer } from '@shared/api.interface';

@Controller('api/interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Get('current')
  @NeedLogin()
  async getCurrent(@Req() req: { userContext: { userId: string } }): Promise<InterviewRecord | null> {
    return this.interviewService.getCurrent(req.userContext.userId);
  }

  @Post()
  @NeedLogin()
  async create(@Req() req: { userContext: { userId: string } }): Promise<{ id: string; status: string }> {
    return this.interviewService.create(req.userContext.userId);
  }

  @Get('answers')
  @NeedLogin()
  async getAnswers(
    @Req() req: { userContext: { userId: string } },
  ): Promise<{ items: InterviewAnswer[] }> {
    return this.interviewService.getAnswers(req.userContext.userId);
  }

  @Patch('answers/:id')
  @NeedLogin()
  async updateAnswer(
    @Req() req: { userContext: { userId: string } },
    @Param('id') id: string,
    @Body() data: Partial<InterviewAnswer>,
  ): Promise<{ success: boolean; answer: InterviewAnswer }> {
    return this.interviewService.updateAnswer(req.userContext.userId, id, data);
  }
}
