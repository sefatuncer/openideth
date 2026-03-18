import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ethers } from 'ethers';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BlockchainService } from '../../common/services/blockchain.service';
import { PaginationQueryDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { CreatePropertyDto, UpdatePropertyDto, PropertySearchQueryDto } from './dto';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);
  constructor(
    private prisma: PrismaService,
    private blockchain: BlockchainService,
  ) {}

  async create(landlordId: string, dto: CreatePropertyDto) {
    const property = await this.prisma.property.create({
      data: {
        title: dto.title,
        description: dto.description,
        propertyType: dto.propertyType,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        country: dto.country,
        bedrooms: dto.bedrooms,
        bathrooms: dto.bathrooms,
        area: dto.area,
        monthlyRent: dto.monthlyRent,
        depositAmount: dto.depositAmount,
        amenities: dto.amenities || [],
        rules: dto.rules || [],
        landlordId,
        status: 'DRAFT',
      },
    });

    // Register on blockchain (non-blocking)
    if (this.blockchain.isEnabled() && this.blockchain.propertyRegistry) {
      try {
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify({ id: property.id, title: dto.title, address: dto.address })));
        const tx = await this.blockchain.propertyRegistry!.registerProperty(dataHash, property.id);
        const receipt = await tx.wait();
        const event = receipt.logs[0];
        if (event) {
          await this.prisma.property.update({
            where: { id: property.id },
            data: { blockchainRegistryId: event.topics[1] },
          });
        }
        this.logger.log(`Property ${property.id} registered on-chain: ${tx.hash}`);
      } catch (error) {
        this.logger.error(`Failed to register property on-chain: ${error}`);
      }
    }

    return property;
  }

  async findAll(query: PropertySearchQueryDto) {
    const where: any = { status: 'ACTIVE' };

    if (query.query) {
      where.OR = [
        { title: { contains: query.query, mode: 'insensitive' } },
        { description: { contains: query.query, mode: 'insensitive' } },
        { address: { contains: query.query, mode: 'insensitive' } },
      ];
    }
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.minPrice) where.monthlyRent = { ...where.monthlyRent, gte: query.minPrice };
    if (query.maxPrice) where.monthlyRent = { ...where.monthlyRent, lte: query.maxPrice };
    if (query.bedrooms) where.bedrooms = { gte: query.bedrooms };
    if (query.propertyType) where.propertyType = query.propertyType;

    const orderBy: any = {};
    if (query.sortBy === 'price') orderBy.monthlyRent = query.sortOrder || 'asc';
    else if (query.sortBy === 'area') orderBy.area = query.sortOrder || 'asc';
    else orderBy.createdAt = query.sortOrder || 'desc';

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          landlord: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return new PaginatedResponseDto(properties, total, page, limit);
  }

  async findById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        landlord: { select: { id: true, name: true, avatarUrl: true, phone: true } },
        reviews: { select: { rating: true } },
      },
    });
    if (!property) throw new NotFoundException('Property not found');

    const avgRating =
      property.reviews.length > 0
        ? property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length
        : null;

    return { ...property, averageRating: avgRating, reviewCount: property.reviews.length };
  }

  async update(id: string, landlordId: string, dto: UpdatePropertyDto) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.landlordId !== landlordId) throw new ForbiddenException('Not the property owner');

    const { ...updateData } = dto;
    return this.prisma.property.update({ where: { id }, data: updateData as any });
  }

  async delete(id: string, landlordId: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.landlordId !== landlordId) throw new ForbiddenException('Not the property owner');

    return this.prisma.property.update({ where: { id }, data: { status: 'INACTIVE' } });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.property.update({ where: { id }, data: { status: status as any } });
  }

  async getMyListings(landlordId: string, pagination: PaginationQueryDto) {
    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { landlordId },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      }),
      this.prisma.property.count({ where: { landlordId } }),
    ]);

    return new PaginatedResponseDto(properties, total, pagination.page, pagination.limit);
  }

  async addImage(propertyId: string, landlordId: string, imageData: { url: string; caption?: string; isPrimary?: boolean }) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { images: true },
    });
    if (!property) throw new NotFoundException('Property not found');
    if (property.landlordId !== landlordId) throw new ForbiddenException('Not the property owner');
    if (property.images.length >= 10) throw new BadRequestException('Maximum 10 images per property');

    const order = property.images.length;
    return this.prisma.propertyImage.create({
      data: { propertyId, url: imageData.url, caption: imageData.caption, isPrimary: imageData.isPrimary || false, order },
    });
  }

  async removeImage(imageId: string, landlordId: string) {
    const image = await this.prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: { select: { landlordId: true } } },
    });
    if (!image) throw new NotFoundException('Image not found');
    if (image.property.landlordId !== landlordId) throw new ForbiddenException('Not the property owner');

    return this.prisma.propertyImage.delete({ where: { id: imageId } });
  }

  async verify(id: string) {
    const property = await this.prisma.property.update({ where: { id }, data: { isVerified: true } });

    // Verify on blockchain (non-blocking)
    if (this.blockchain.isEnabled() && this.blockchain.propertyRegistry && property.blockchainRegistryId) {
      try {
        const tx = await this.blockchain.propertyRegistry!.verifyProperty(BigInt(property.blockchainRegistryId));
        await tx.wait();
        this.logger.log(`Property ${id} verified on-chain: ${tx.hash}`);
      } catch (error) {
        this.logger.error(`Failed to verify property on-chain: ${error}`);
      }
    }

    return property;
  }
}
