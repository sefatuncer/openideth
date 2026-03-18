import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FileUploadService } from '../../common/services/file-upload.service';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() })],
  providers: [UsersService, FileUploadService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
