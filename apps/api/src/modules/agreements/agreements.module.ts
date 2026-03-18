import { Module } from '@nestjs/common';
import { AgreementsService } from './agreements.service';
import { AgreementsController } from './agreements.controller';
import { BlockchainService } from '../../common/services/blockchain.service';

@Module({
  providers: [AgreementsService, BlockchainService],
  controllers: [AgreementsController],
  exports: [AgreementsService],
})
export class AgreementsModule {}
