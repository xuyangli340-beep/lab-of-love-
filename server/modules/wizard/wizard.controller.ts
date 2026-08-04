import { Controller, Get, Req, Logger } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import {
  userProfileRecord,
  interviewRecord,
  preferenceFactor,
  idealPortrait,
  candidateResult,
  teamSelection,
} from '../../database/schema';
import type { WizardProgress } from '@shared/api.interface';

interface RequestWithUser extends Request {
  userContext: { userId: string };
}

@Injectable()
export class WizardService {
  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getProgress(userId: string): Promise<WizardProgress> {
    const profiles = await this.db
      .select({ id: userProfileRecord.id, nickname: userProfileRecord.nickname })
      .from(userProfileRecord)
      .where(eq(userProfileRecord.owner, userId));
    const profileId = profiles[0]?.id;

    let profileCompleted = false;
    let interviewCompleted = false;
    let modelCompleted = false;
    let portraitCompleted = false;
    let candidatesCompleted = false;
    let teamCompleted = false;
    let currentStep = 1;

    if (profileId) {
      profileCompleted = !!(profiles[0] as unknown as { nickname?: string })?.nickname;

      const interviews = await this.db
        .select({ status: interviewRecord.status })
        .from(interviewRecord)
        .where(eq(interviewRecord.userProfileId, profileId))
        .limit(1);
      interviewCompleted = interviews.length > 0 && interviews[0].status === 'completed';

      const factors = await this.db
        .select({ id: preferenceFactor.id })
        .from(preferenceFactor)
        .where(eq(preferenceFactor.userProfileId, profileId))
        .limit(1);
      modelCompleted = factors.length > 0;

      const portraits = await this.db
        .select({ id: idealPortrait.id })
        .from(idealPortrait)
        .where(eq(idealPortrait.userProfileId, profileId))
        .limit(1);
      portraitCompleted = portraits.length > 0;

      const candidates = await this.db
        .select({ id: candidateResult.id })
        .from(candidateResult)
        .where(eq(candidateResult.userProfileId, profileId))
        .limit(1);
      candidatesCompleted = candidates.length > 0;

      const teams = await this.db
        .select({ id: teamSelection.id })
        .from(teamSelection)
        .where(eq(teamSelection.userProfileId, profileId))
        .limit(1);
      teamCompleted = teams.length > 0;

      if (teamCompleted) currentStep = 6;
      else if (candidatesCompleted) currentStep = 5;
      else if (portraitCompleted) currentStep = 4;
      else if (modelCompleted) currentStep = 3;
      else if (interviewCompleted) currentStep = 2;
      else if (profileCompleted) currentStep = 1;
    }

    return {
      profileCompleted,
      interviewCompleted,
      modelCompleted,
      portraitCompleted,
      candidatesCompleted,
      teamCompleted,
      currentStep,
    };
  }
}

@Controller('api/wizard')
@NeedLogin()
export class WizardController {
  private readonly logger = new Logger(WizardController.name);

  constructor(private readonly wizardService: WizardService) {}

  @Get('progress')
  async getProgress(@Req() req: RequestWithUser): Promise<WizardProgress> {
    const { userId } = req.userContext;
    return this.wizardService.getProgress(userId);
  }
}
