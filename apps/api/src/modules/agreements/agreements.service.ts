import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { CreateAgreementDto, UpdateAgreementDto } from './dto';

@Injectable()
export class AgreementsService {
  constructor(private prisma: PrismaService) {}

  async create(landlordId: string, dto: CreateAgreementDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (property.landlordId !== landlordId) throw new ForbiddenException('Not the property owner');

    const activeAgreement = await this.prisma.rentalAgreement.findFirst({
      where: { propertyId: dto.propertyId, status: 'ACTIVE' },
    });
    if (activeAgreement) throw new BadRequestException('Property already has an active agreement');

    return this.prisma.rentalAgreement.create({
      data: {
        propertyId: dto.propertyId,
        landlordId,
        tenantId: dto.tenantId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        monthlyRent: dto.monthlyRent,
        depositAmount: dto.depositAmount,
        terms: dto.terms,
        status: 'DRAFT',
      },
    });
  }

  async findById(id: string, userId: string) {
    const agreement = await this.prisma.rentalAgreement.findUnique({
      where: { id },
      include: {
        property: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        landlord: { select: { id: true, name: true, email: true } },
        tenant: { select: { id: true, name: true, email: true } },
        payments: { orderBy: { dueDate: 'desc' }, take: 5 },
        escrowDeposits: true,
      },
    });
    if (!agreement) throw new NotFoundException('Agreement not found');

    const isParty = agreement.landlordId === userId || agreement.tenantId === userId;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (!isParty && user?.role !== 'ADMIN') throw new ForbiddenException('Access denied');

    return agreement;
  }

  async findByUser(userId: string, pagination: PaginationQueryDto) {
    const where = {
      OR: [{ landlordId: userId }, { tenantId: userId }],
    };

    const [agreements, total] = await Promise.all([
      this.prisma.rentalAgreement.findMany({
        where,
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: { select: { id: true, title: true, address: true, city: true } },
          landlord: { select: { id: true, name: true } },
          tenant: { select: { id: true, name: true } },
        },
      }),
      this.prisma.rentalAgreement.count({ where }),
    ]);

    return new PaginatedResponseDto(agreements, total, pagination.page, pagination.limit);
  }

  async update(id: string, landlordId: string, dto: UpdateAgreementDto) {
    const agreement = await this.prisma.rentalAgreement.findUnique({ where: { id } });
    if (!agreement) throw new NotFoundException('Agreement not found');
    if (agreement.landlordId !== landlordId) throw new ForbiddenException('Not the landlord');
    if (agreement.status !== 'DRAFT') throw new BadRequestException('Can only update draft agreements');

    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);

    return this.prisma.rentalAgreement.update({ where: { id }, data });
  }

  async sign(id: string, userId: string, ip: string) {
    const agreement = await this.prisma.rentalAgreement.findUnique({ where: { id } });
    if (!agreement) throw new NotFoundException('Agreement not found');

    if (agreement.status !== 'DRAFT' && agreement.status !== 'PENDING_SIGNATURE') {
      throw new BadRequestException('Agreement cannot be signed in its current status');
    }

    const isLandlord = agreement.landlordId === userId;
    const isTenant = agreement.tenantId === userId;
    if (!isLandlord && !isTenant) throw new ForbiddenException('Not a party to this agreement');

    const data: any = {};
    if (isLandlord) {
      if (agreement.landlordSignedAt) throw new BadRequestException('Landlord already signed');
      data.landlordSignedAt = new Date();
      data.landlordSignatureIp = ip;
    } else {
      if (agreement.tenantSignedAt) throw new BadRequestException('Tenant already signed');
      data.tenantSignedAt = new Date();
      data.tenantSignatureIp = ip;
    }

    const otherSigned = isLandlord ? agreement.tenantSignedAt : agreement.landlordSignedAt;
    data.status = otherSigned ? 'ACTIVE' : 'PENDING_SIGNATURE';

    if (data.status === 'ACTIVE') {
      await this.prisma.property.update({
        where: { id: agreement.propertyId },
        data: { status: 'RENTED' },
      });
    }

    return this.prisma.rentalAgreement.update({ where: { id }, data });
  }

  async terminate(id: string, userId: string, reason: string) {
    const agreement = await this.prisma.rentalAgreement.findUnique({ where: { id } });
    if (!agreement) throw new NotFoundException('Agreement not found');
    if (agreement.status !== 'ACTIVE') throw new BadRequestException('Only active agreements can be terminated');

    const isParty = agreement.landlordId === userId || agreement.tenantId === userId;
    if (!isParty) throw new ForbiddenException('Not a party to this agreement');

    await this.prisma.property.update({
      where: { id: agreement.propertyId },
      data: { status: 'ACTIVE' },
    });

    return this.prisma.rentalAgreement.update({
      where: { id },
      data: { status: 'TERMINATED', terminatedAt: new Date(), terminationReason: reason },
    });
  }

  async uploadDocument(id: string, userId: string, url: string, hash: string) {
    const agreement = await this.prisma.rentalAgreement.findUnique({ where: { id } });
    if (!agreement) throw new NotFoundException('Agreement not found');

    const isParty = agreement.landlordId === userId || agreement.tenantId === userId;
    if (!isParty) throw new ForbiddenException('Not a party to this agreement');

    return this.prisma.rentalAgreement.update({
      where: { id },
      data: { documentUrl: url, documentHash: hash },
    });
  }

  async findExpiring(days: number) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.rentalAgreement.findMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: futureDate },
      },
      include: {
        landlord: { select: { id: true, name: true, email: true } },
        tenant: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true } },
      },
    });
  }
}
