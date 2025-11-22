import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser } from '@/common';
import { EventsService } from './events.service';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Get user events
   */
  @Get()
  @ApiOperation({ summary: 'Get user events' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.eventsService.findAll(userId, limit);
  }

  /**
   * Create an event manually (optional - mostly auto-generated)
   */
  @Post()
  @ApiOperation({ summary: 'Create an event' })
  async create(
    @Body() body: { type: string; payload: Record<string, any> },
    @CurrentUser('id') userId: string,
  ) {
    return this.eventsService.create({
      userId,
      type: body.type,
      payload: body.payload,
    });
  }
}
