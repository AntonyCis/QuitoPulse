import { Controller, Post, Body, Delete, Param } from '@nestjs/common';
import { StorageService } from './storage.service';
import { IsString, IsNumber, Max } from 'class-validator';

class PresignDto {
  @IsString()
  mimeType!: string;

  @IsNumber()
  @Max(10 * 1024 * 1024)
  fileSize!: number;
}

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presign')
  async getPresignedUrl(@Body() dto: PresignDto) {
    return this.storageService.getPresignedUploadUrl({
      mimeType: dto.mimeType,
      fileSize: dto.fileSize,
    });
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    await this.storageService.deleteFile(key);
    return { message: 'Archivo eliminado' };
  }
}
