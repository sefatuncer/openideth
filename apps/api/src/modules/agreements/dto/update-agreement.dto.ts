import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAgreementDto } from './create-agreement.dto';

export class UpdateAgreementDto extends PartialType(
  OmitType(CreateAgreementDto, ['propertyId', 'tenantId'] as const),
) {}
