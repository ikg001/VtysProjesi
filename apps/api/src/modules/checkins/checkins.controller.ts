import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser } from '@/common';
import { CheckinsService } from './checkins.service';
import {
  CreateCheckinDto,
  MarkDoneDto,
  QueryCheckinsDto,
  CheckinResponseDto,
} from './dto/checkin.dto';

/**
 * Checkins controller
 * Manages routine check-ins and completions
 */
@ApiTags('Check-ins')
@ApiBearerAuth()
@Controller('checkins')
@UseGuards(JwtAuthGuard)
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  /**
   * Get all check-ins for current user
   */
  @Get()
  @ApiOperation({ summary: 'Get all check-ins' })
  @ApiResponse({ status: 200, type: [CheckinResponseDto] })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryCheckinsDto,
  ): Promise<CheckinResponseDto[]> {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    return this.checkinsService.findAll(userId, from, to);
  }

  /**
   * Get check-ins for a specific routine
   */
  @Get('routines/:routineId')
  @ApiOperation({ summary: 'Get check-ins for a routine' })
  @ApiResponse({ status: 200, type: [CheckinResponseDto] })
  async findByRoutine(
    @Param('routineId') routineId: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryCheckinsDto,
  ): Promise<CheckinResponseDto[]> {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    return this.checkinsService.findByRoutine(routineId, userId, from, to);
  }

  /**
   * Create a check-in
   */
  @Post()
  @ApiOperation({ summary: 'Create a check-in' })
  @ApiResponse({ status: 201, type: CheckinResponseDto })
  async create(
    @Body() dto: CreateCheckinDto,
    @CurrentUser('id') userId: string,
  ): Promise<CheckinResponseDto> {
    return this.checkinsService.create(dto, userId);
  }

  /**
   * Mark check-in as done (main business logic endpoint)
   */
  @Patch(':id/done')
  @ApiOperation({ summary: 'Mark check-in as done' })
  @ApiResponse({ status: 200, description: 'Check-in marked as done', type: CheckinResponseDto })
  async markDone(
    @Param('id') id: string,
    @Body() dto: MarkDoneDto,
    @CurrentUser('id') userId: string,
  ): Promise<CheckinResponseDto> {
    return this.checkinsService.markDone(id, userId, dto);
  }

  /**
   * Delete a check-in
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a check-in' })
  @ApiResponse({ status: 204 })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string): Promise<void> {
    return this.checkinsService.remove(id, userId);
  }
}
