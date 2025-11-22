import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser } from '@/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto, UpdateRoutineDto, RoutineResponseDto } from './dto/routine.dto';

/**
 * Routines controller
 * Manages user routines (habits/tasks)
 */
@ApiTags('Routines')
@ApiBearerAuth()
@Controller('routines')
@UseGuards(JwtAuthGuard)
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  /**
   * Get all routines for current user
   */
  @Get()
  @ApiOperation({ summary: 'Get all user routines' })
  @ApiResponse({ status: 200, description: 'List of routines', type: [RoutineResponseDto] })
  async findAll(@CurrentUser('id') userId: string): Promise<RoutineResponseDto[]> {
    return this.routinesService.findAll(userId);
  }

  /**
   * Get a specific routine
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get routine by ID' })
  @ApiResponse({ status: 200, description: 'Routine details', type: RoutineResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<RoutineResponseDto> {
    return this.routinesService.findOne(id, userId);
  }

  /**
   * Create a new routine
   */
  @Post()
  @ApiOperation({ summary: 'Create a new routine' })
  @ApiResponse({ status: 201, description: 'Routine created', type: RoutineResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() dto: CreateRoutineDto,
    @CurrentUser('id') userId: string,
  ): Promise<RoutineResponseDto> {
    return this.routinesService.create(dto, userId);
  }

  /**
   * Update a routine
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a routine' })
  @ApiResponse({ status: 200, description: 'Routine updated', type: RoutineResponseDto })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoutineDto,
    @CurrentUser('id') userId: string,
  ): Promise<RoutineResponseDto> {
    return this.routinesService.update(id, dto, userId);
  }

  /**
   * Delete a routine
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a routine' })
  @ApiResponse({ status: 204, description: 'Routine deleted' })
  @ApiResponse({ status: 404, description: 'Routine not found' })
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string): Promise<void> {
    return this.routinesService.remove(id, userId);
  }
}
