import { IsString, IsNumber, IsOptional, IsBoolean, MaxLength, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsString()
  @MaxLength(100)
  label!: string;

  @IsString()
  @MaxLength(7)
  color!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  label?: string;

  @IsString()
  @IsOptional()
  @MaxLength(7)
  color?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  sortOrder?: number;
}
