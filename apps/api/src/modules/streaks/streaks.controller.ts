import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser } from '@/common';
import { StreaksService } from './streaks.service';

@ApiTags('Streaks')
@ApiBearerAuth()
@Controller('streaks')
@UseGuards(JwtAuthGuard)
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  /**
   * Get all streaks for current user
   */
  @Get()
  @ApiOperation({ summary: 'Get all user streaks' })
  @ApiResponse({ status: 200 })
  async getUserStreaks(@CurrentUser('id') userId: string) {
    return this.streaksService.getUserStreaks(userId);
  }

  /**
   * Get streak for a specific routine
   */
  @Get('routines/:routineId')
  @ApiOperation({ summary: 'Get streak for a routine' })
  @ApiResponse({ status: 200 })
  async getRoutineStreak(
    @Param('routineId') routineId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.streaksService.getStreak(routineId, userId);
  }
}
