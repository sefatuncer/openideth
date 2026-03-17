import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  STUDIO = 'STUDIO',
  COMMERCIAL = 'COMMERCIAL',
}
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class PropertySearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ enum: PropertyType })
  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  @ApiPropertyOptional({ enum: ['price', 'createdAt', 'area'] })
  @IsOptional()
  @IsEnum(['price', 'createdAt', 'area'])
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string;
}
