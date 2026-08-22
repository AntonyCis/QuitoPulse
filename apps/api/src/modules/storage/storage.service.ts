import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface PresignParams {
  mimeType: string;
  fileSize: number;
}

export interface PresignResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresAt: Date;
}

@Injectable()
export class StorageService {
  private s3Client: S3Client | null = null;
  private bucket: string;
  private publicUrl: string;
  private isConfigured: boolean;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get('S3_BUCKET', '');
    this.publicUrl = this.configService.get('S3_PUBLIC_URL', '');

    const endpoint = this.configService.get('S3_ENDPOINT');
    const accessKeyId = this.configService.get('S3_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get('S3_SECRET_ACCESS_KEY', '');
    const region = this.configService.get('S3_REGION', 'auto');

    this.isConfigured = !!(endpoint && accessKeyId && secretAccessKey && this.bucket);

    if (this.isConfigured) {
      this.s3Client = new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  private ensureConfigured(): void {
    if (!this.isConfigured || !this.s3Client) {
      throw new BadRequestException(
        'Almacenamiento de archivos no configurado. Configure las variables S3_* en .env',
      );
    }
  }

  async getPresignedUploadUrl(params: PresignParams): Promise<PresignResult> {
    this.ensureConfigured();

    if (!ALLOWED_MIME_TYPES.includes(params.mimeType)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Use: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (params.fileSize > MAX_FILE_SIZE) {
      throw new BadRequestException(`El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const id = randomUUID();
    const ext = this.getExtension(params.mimeType);
    const key = `reports/${id}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: params.mimeType,
      ContentLength: params.fileSize,
    });

    const uploadUrl = await getSignedUrl(this.s3Client!, command, {
      expiresIn: 300,
    });

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 300);

    return {
      uploadUrl,
      key,
      publicUrl: this.publicUrl ? `${this.publicUrl}/${key}` : '',
      expiresAt,
    };
  }

  async deleteFile(key: string): Promise<void> {
    this.ensureConfigured();

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client!.send(command);
  }

  getFileUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return key;
  }

  private getExtension(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return map[mimeType] || 'bin';
  }
}
