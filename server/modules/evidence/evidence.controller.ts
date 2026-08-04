import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { EvidenceService } from './evidence.service';
import type { EvidenceItem, EvidenceStats } from '@shared/api.interface';

@Controller('api/evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  @NeedLogin()
  async getList(
    @Req() req: { userContext: { userId: string } },
  ): Promise<{ items: EvidenceItem[] }> {
    return this.evidenceService.getList(req.userContext.userId);
  }

  @Post()
  @NeedLogin()
  async create(
    @Req() req: { userContext: { userId: string } },
    @Body() data: Omit<EvidenceItem, 'id' | 'interviewRecordId'>,
  ): Promise<{ id: string; success: boolean }> {
    return this.evidenceService.create(req.userContext.userId, data);
  }

  @Post('batch')
  @NeedLogin()
  async batchCreate(
    @Req() req: { userContext: { userId: string } },
    @Body() body: { items: Array<Omit<EvidenceItem, 'id' | 'interviewRecordId'>> },
  ): Promise<{ success: boolean; count: number }> {
    return this.evidenceService.batchCreate(req.userContext.userId, body.items);
  }

  @Get('stats')
  @NeedLogin()
  async getStats(
    @Req() req: { userContext: { userId: string } },
  ): Promise<EvidenceStats> {
    return this.evidenceService.getStats(req.userContext.userId);
  }
}
