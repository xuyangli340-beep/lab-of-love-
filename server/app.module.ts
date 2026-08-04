import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PlatformModule } from '@lark-apaas/fullstack-nestjs-core';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { ViewModule } from './modules/view/view.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { InterviewModule } from './modules/interview/interview.module';
import { PreferenceModule } from './modules/preference/preference.module';
import { PortraitModule } from './modules/portrait/portrait.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { TeamModule } from './modules/team/team.module';
import { WizardModule } from './modules/wizard/wizard.module';
import { EvidenceModule } from './modules/evidence/evidence.module';

@Module({
  imports: [
    PlatformModule.forRoot(),
    AuthModule,
    UserProfileModule,
    InterviewModule,
    PreferenceModule,
    PortraitModule,
    CandidateModule,
    TeamModule,
    WizardModule,
    EvidenceModule,
    ViewModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
