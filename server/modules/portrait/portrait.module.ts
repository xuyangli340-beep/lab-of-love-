import { Module } from '@nestjs/common';
import { PortraitController } from './portrait.controller';
import { PortraitService } from './portrait.service';
import { UserProfileModule } from '../user-profile/user-profile.module';

@Module({
  imports: [UserProfileModule],
  controllers: [PortraitController],
  providers: [PortraitService],
  exports: [PortraitService],
})
export class PortraitModule {}
