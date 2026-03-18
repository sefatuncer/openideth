import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sharp = require('sharp');
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private s3Client: S3Client;
  private bucket: string;
  private useLocal: boolean;
  private localUploadDir: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET', 'openideth-uploads');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID', '');
    this.useLocal = !accessKeyId || accessKeyId === 'your-aws-access-key';

    if (!this.useLocal) {
      this.s3Client = new S3Client({
        region: this.configService.get<string>('AWS_REGION', 'eu-central-1'),
        credentials: {
          accessKeyId,
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
        },
      });
    }

    this.localUploadDir = path.join(process.cwd(), 'uploads');
    if (this.useLocal && !fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }

  async generatePresignedUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async generatePresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async deleteFile(key: string): Promise<void> {
    if (this.useLocal) {
      const filePath = path.join(this.localUploadDir, key);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return;
    }
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    options?: { resize?: { width: number; height: number } },
  ): Promise<{ url: string; key: string }> {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large (max 10MB)');
    }

    let buffer = file.buffer;

    // Optimize image with sharp
    if (options?.resize) {
      buffer = await sharp(buffer)
        .resize(options.resize.width, options.resize.height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
    } else {
      buffer = await sharp(buffer)
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    const ext = 'jpg';
    const key = `${folder}/${randomUUID()}.${ext}`;

    if (this.useLocal) {
      const dir = path.join(this.localUploadDir, folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(this.localUploadDir, key), buffer);
      const apiUrl = this.configService.get<string>('API_URL', 'http://localhost:4000');
      return { url: `${apiUrl}/uploads/${key}`, key };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    });
    await this.s3Client.send(command);
    return { url: `https://${this.bucket}.s3.amazonaws.com/${key}`, key };
  }
}
