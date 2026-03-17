import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EscrowService } from './escrow.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('escrow')
@Controller('escrow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EscrowController {
  constructor(private escrowService: EscrowService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Create escrow deposit' })
  async createDeposit(@Body() body: { agreementId: string; amount: number }) {
    return this.escrowService.createDeposit(body.agreementId, body.amount);
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Release escrow deposit' })
  async release(@Param('id') id: string, @CurrentUser() user: any) {
    return this.escrowService.release(id, user.id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund escrow deposit (admin)' })
  async refund(@Param('id') id: string, @CurrentUser() user: any) {
    return this.escrowService.refund(id, user.id);
  }

  @Post(':id/dispute')
  @ApiOperation({ summary: 'Dispute escrow deposit' })
  async dispute(@Param('id') id: string, @CurrentUser() user: any, @Body('reason') reason: string) {
    return this.escrowService.dispute(id, user.id, reason);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve dispute (admin)' })
  async resolve(@Param('id') id: string, @CurrentUser() user: any, @Body('resolution') resolution: string) {
    return this.escrowService.resolveDispute(id, user.id, resolution);
  }

  @Get('agreement/:agreementId')
  @ApiOperation({ summary: 'Get escrow deposits by agreement' })
  async getByAgreement(@Param('agreementId') agreementId: string) {
    return this.escrowService.getByAgreement(agreementId);
  }
}
