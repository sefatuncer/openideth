import { Controller, Get, Post, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { FileUploadService } from '../../common/services/file-upload.service';

@ApiTags('kyc')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KycController {
  constructor(
    private kycService: KycService,
    private fileUploadService: FileUploadService,
  ) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate KYC verification' })
  async initiate(@CurrentUser() user: any) {
    return this.kycService.initiate(user.id);
  }

  @Post('documents')
  @ApiOperation({ summary: 'Upload KYC documents (JSON URLs)' })
  async uploadDocuments(
    @CurrentUser() user: any,
    @Body() body: { type: string; frontUrl: string; backUrl?: string; selfieUrl?: string },
  ) {
    return this.kycService.uploadDocument(user.id, body.type, body.frontUrl, body.backUrl, body.selfieUrl);
  }

  @Post('documents/upload')
  @ApiOperation({ summary: 'Upload KYC documents (multipart files)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ], { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadDocumentFiles(
    @CurrentUser() user: any,
    @UploadedFiles() files: { front?: Express.Multer.File[]; back?: Express.Multer.File[]; selfie?: Express.Multer.File[] },
    @Body() body: { type: string },
  ) {
    const frontFile = files.front?.[0];
    if (!frontFile) throw new (await import('@nestjs/common')).BadRequestException('Front document is required');

    const front = await this.fileUploadService.uploadFile(frontFile, `kyc/${user.id}`);
    const back = files.back?.[0] ? await this.fileUploadService.uploadFile(files.back[0], `kyc/${user.id}`) : undefined;
    const selfie = files.selfie?.[0] ? await this.fileUploadService.uploadFile(files.selfie[0], `kyc/${user.id}`) : undefined;

    return this.kycService.uploadDocument(user.id, body.type, front.url, back?.url, selfie?.url);
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
