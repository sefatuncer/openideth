import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('kyc')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private kycService: KycService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate KYC verification' })
  async initiate(@CurrentUser() user: any) {
    return this.kycService.initiate(user.id);
  }

  @Post('documents')
  @ApiOperation({ summary: 'Upload KYC documents' })
  async uploadDocuments(
    @CurrentUser() user: any,
    @Body() body: { type: string; frontUrl: string; backUrl?: string; selfieUrl?: string },
  ) {
    return this.kycService.uploadDocument(user.id, body.type, body.frontUrl, body.backUrl, body.selfieUrl);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get KYC status' })
  async getStatus(@CurrentUser() user: any) {
    return this.kycService.getStatus(user.id);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get pending KYC reviews (admin)' })
  async getPending(@Query() pagination: PaginationQueryDto) {
    return this.kycService.getPendingReviews(pagination);
  }

  @Post(':id/review')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Review KYC submission (admin)' })
  async review(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { approved: boolean; rejectionReason?: string },
  ) {
    return this.kycService.review(id, user.id, body.approved, body.rejectionReason);
  }
}
