import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { FileUploadService } from '../../common/services/file-upload.service';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  providers: [PropertiesService, FileUploadService],
  controllers: [PropertiesController],
  exports: [PropertiesService],
})
export class PropertiesModule {}
