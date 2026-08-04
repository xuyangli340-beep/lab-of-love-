import { Body, Controller, Get, Logger, Patch, Post, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Request } from 'express';
import { CandidateService } from './candidate.service';
import type { CandidateResult } from '@shared/api.interface';

interface SaveCandidateBody {
  poolSize: number;
  resultsJson: string;
}

interface SelectCandidateBody {
  candidateId: string;
}

@Controller('api/candidate-results')
export class CandidateController {
  private readonly logger = new Logger(CandidateController.name);

  constructor(private readonly candidateService: CandidateService) {}

  @Get()
  @NeedLogin()
  async get(@Req() req: Request): Promise<CandidateResult | null> {
    const { userId } = req.userContext;
    return this.candidateService.get(userId);
  }

  @Post()
  @NeedLogin()
  async save(
    @Req() req: Request,
    @Body() body: SaveCandidateBody,
  ): Promise<{ id: string; success: true }> {
    const { userId } = req.userContext;
    const { poolSize, resultsJson } = body;
    return this.candidateService.save(userId, poolSize, resultsJson);
  }

  @Patch('select')
  @NeedLogin()
  async select(
    @Req() req: Request,
    @Body() body: SelectCandidateBody,
  ): Promise<{ success: true }> {
    const { userId } = req.userContext;
    const { candidateId } = body;
    return this.candidateService.select(userId, candidateId);
  }
}
