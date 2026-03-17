import { IsString, IsNumber, IsEnum, IsOptional, IsArray, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  STUDIO = 'STUDIO',
  COMMERCIAL = 'COMMERCIAL',
}

export class CreatePropertyDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  zipCode: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  bedrooms: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  bathrooms: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  area: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];
}
