import { IsString, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

export class ConfirmImageDto {
  @IsString()
  @MaxLength(500)
  key!: string;

  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(100)
  mimeType!: string;

  @IsNumber()
  @Min(0)
  fileSize!: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  thumbnailUrl?: string;
}