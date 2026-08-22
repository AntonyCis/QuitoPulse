import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReportDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsString()
  categoryId!: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const)
  @IsOptional()
  priority?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsDateString()
  @IsOptional()
  incidentDate?: string;
}

export class UpdateReportDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const)
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;
}

export class ReportQueryDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  west?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  south?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  east?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  north?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class CreateCommentDto {
  @IsString()
  @MaxLength(1000)
  content!: string;
}

export class CreateFlagDto {
  @IsString()
  @MaxLength(500)
  reason!: string;
}
