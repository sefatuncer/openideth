import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { FileUploadService } from '../../common/services/file-upload.service';
import { BlockchainService } from '../../common/services/blockchain.service';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  providers: [PropertiesService, FileUploadService, BlockchainService],
  controllers: [PropertiesController],
  exports: [PropertiesService],
})
export class PropertiesModule {}
