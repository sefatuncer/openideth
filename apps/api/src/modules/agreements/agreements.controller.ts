import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { AgreementsService } from './agreements.service';
import { CreateAgreementDto, UpdateAgreementDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('agreements')
@Controller('agreements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgreementsController {
  constructor(private agreementsService: AgreementsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('LANDLORD')
  @ApiOperation({ summary: 'Create a rental agreement' })
  async create(@CurrentUser() user: any, @Body() dto: CreateAgreementDto) {
    return this.agreementsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my agreements' })
  async findAll(@CurrentUser() user: any, @Query() pagination: PaginationQueryDto) {
    return this.agreementsService.findByUser(user.id, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agreement details' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.agreementsService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update draft agreement' })
  async update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateAgreementDto) {
    return this.agreementsService.update(id, user.id, dto);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Sign agreement' })
  async sign(@Param('id') id: string, @CurrentUser() user: any, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return this.agreementsService.sign(id, user.id, ip);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate agreement' })
  async terminate(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('reason') reason: string,
  ) {
    return this.agreementsService.terminate(id, user.id, reason);
  }

  @Post(':id/upload-document')
  @ApiOperation({ summary: 'Upload agreement document' })
  async uploadDocument(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { url: string; hash: string },
  ) {
    return this.agreementsService.uploadDocument(id, user.id, body.url, body.hash);
  }
}
