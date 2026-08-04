import { Module } from '@nestjs/common';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { InterviewModule } from '../interview/interview.module';

@Module({
  imports: [UserProfileModule, InterviewModule],
  controllers: [EvidenceController],
  providers: [EvidenceService],
  exports: [EvidenceService],
})
export class EvidenceModule {}
