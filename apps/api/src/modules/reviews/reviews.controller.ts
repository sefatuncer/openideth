import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  async create(
    @CurrentUser() user: any,
    @Body() body: { propertyId: string; rating: number; comment?: string },
  ) {
    return this.reviewsService.create(user.id, body);
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Get reviews for a property' })
  async findByProperty(@Param('propertyId') propertyId: string, @Query() pagination: PaginationQueryDto) {
    return this.reviewsService.findByProperty(propertyId, pagination);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my reviews' })
  async findMy(@CurrentUser() user: any, @Query() pagination: PaginationQueryDto) {
    return this.reviewsService.findByUser(user.id, pagination);
  }
}
