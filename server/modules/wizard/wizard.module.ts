import { Module } from '@nestjs/common';
import { WizardController, WizardService } from './wizard.controller';

@Module({
  controllers: [WizardController],
  providers: [WizardService],
  exports: [WizardService],
})
export class WizardModule {}
