import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, PropertySearchQueryDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LANDLORD')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property listing' })
  async create(@CurrentUser() user: any, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter properties' })
  async findAll(@Query() query: PropertySearchQueryDto) {
    return this.propertiesService.findAll(query);
  }

  @Get('my-listings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LANDLORD')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my property listings' })
  async getMyListings(@CurrentUser() user: any, @Query() pagination: PaginationQueryDto) {
    return this.propertiesService.getMyListings(user.id, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property details' })
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update property' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete property (soft delete)' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.propertiesService.delete(id, user.id);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add image to property' })
  async addImage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { url: string; caption?: string; isPrimary?: boolean },
  ) {
    return this.propertiesService.addImage(id, user.id, body);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove image from property' })
  async removeImage(@Param('id') id: string, @Param('imageId') imageId: string, @CurrentUser() user: any) {
    return this.propertiesService.removeImage(imageId, user.id);
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify property (admin only)' })
  async verify(@Param('id') id: string) {
    return this.propertiesService.verify(id);
  }
}
