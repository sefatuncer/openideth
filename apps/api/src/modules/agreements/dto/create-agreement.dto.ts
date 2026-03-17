import { IsString, IsUUID, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAgreementDto {
  @ApiProperty()
  @IsUUID()
  propertyId: string;

  @ApiProperty()
  @IsUUID()
  tenantId: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  depositAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  terms?: string;
}
