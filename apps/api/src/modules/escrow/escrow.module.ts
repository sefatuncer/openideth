import { Module } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { BlockchainService } from '../../common/services/blockchain.service';

@Module({
  providers: [EscrowService, BlockchainService],
  controllers: [EscrowController],
  exports: [EscrowService],
})
export class EscrowModule {}
