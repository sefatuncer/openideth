import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { FileUploadService } from '../../common/services/file-upload.service';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  providers: [KycService, FileUploadService],
  controllers: [KycController],
  exports: [KycService],
})
export class KycModule {}
