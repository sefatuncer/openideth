import { IsUUID, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  agreementId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: ['STRIPE', 'ETH', 'USDT'] })
  @IsEnum(['STRIPE', 'ETH', 'USDT'])
  method: string;
}
