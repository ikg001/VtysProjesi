import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Checkin } from '@prisma/client';
import { CreateCheckinDto, MarkDoneDto } from './dto/checkin.dto';
import { StreaksService } from '../streaks/streaks.service';
import { EventsService } from '../events/events.service';

const prisma = new PrismaClient();

/**
 * Checkins service
 * Manages routine check-ins (done/skipped)
 * Triggers streak updates and event logging
 */
@Injectable()
export class CheckinsService {
  constructor(
    private readonly streaksService: StreaksService,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Get all check-ins for a user within a date range
   */
  async findAll(userId: string, from?: Date, to?: Date): Promise<Checkin[]> {
    const where: any = { userId };

    if (from || to) {
      where.checkinDate = {};
      if (from) where.checkinDate.gte = from;
      if (to) where.checkinDate.lte = to;
    }

    return prisma.checkin.findMany({
      where,
      orderBy: { checkinDate: 'desc' },
      include: {
        routine: {
          select: { id: true, title: true, frequency: true },
        },
      },
    });
  }

  /**
   * Get check-ins for a specific routine
   */
  async findByRoutine(
    routineId: string,
    userId: string,
    from?: Date,
    to?: Date,
  ): Promise<Checkin[]> {
    const where: any = { routineId, userId };

    if (from || to) {
      where.checkinDate = {};
      if (from) where.checkinDate.gte = from;
      if (to) where.checkinDate.lte = to;
    }

    return prisma.checkin.findMany({
      where,
      orderBy: { checkinDate: 'desc' },
    });
  }

  /**
   * Create a check-in
   */
  async create(dto: CreateCheckinDto, userId: string): Promise<Checkin> {
    // Verify routine exists and belongs to user
    const routine = await prisma.routine.findFirst({
      where: { id: dto.routineId, userId },
    });

    if (!routine) {
      throw new NotFoundException('Routine not found');
    }

    // Parse date (ensure it's start of day)
    const checkinDate = new Date(dto.checkinDate);
    checkinDate.setHours(0, 0, 0, 0);

    // Create check-in (unique constraint handles duplicates)
    try {
      const checkin = await prisma.checkin.create({
        data: {
          routineId: dto.routineId,
          userId,
          checkinDate,
          status: dto.status,
          note: dto.note,
          meta: dto.meta || {},
        },
      });

      // If status is 'done', update streak
      if (dto.status === 'done') {
        await this.streaksService.updateStreakOnDone(dto.routineId, userId, checkinDate);
      }

      // Log event
      await this.eventsService.create({
        userId,
        type: 'checkin_created',
        payload: {
          checkinId: checkin.id,
          routineId: dto.routineId,
          status: dto.status,
        },
      });

      return checkin;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Check-in already exists for this date');
      }
      throw error;
    }
  }

  /**
   * Mark a check-in as done (PATCH /checkins/:id/done)
   */
  async markDone(id: string, userId: string, dto: MarkDoneDto): Promise<Checkin> {
    // Find check-in
    const existing = await prisma.checkin.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Check-in not found');
    }

    // Update to done
    const checkin = await prisma.checkin.update({
      where: { id },
      data: {
        status: 'done',
        note: dto.note || existing.note,
        meta: dto.meta ? { ...existing.meta, ...dto.meta } : existing.meta,
      },
    });

    // Update streak
    await this.streaksService.updateStreakOnDone(
      checkin.routineId,
      userId,
      new Date(checkin.checkinDate),
    );

    // Log event
    await this.eventsService.create({
      userId,
      type: 'checkin_done',
      payload: {
        checkinId: id,
        routineId: checkin.routineId,
      },
    });

    return checkin;
  }

  /**
   * Delete a check-in
   */
  async remove(id: string, userId: string): Promise<void> {
    const checkin = await prisma.checkin.findFirst({
      where: { id, userId },
    });

    if (!checkin) {
      throw new NotFoundException('Check-in not found');
    }

    await prisma.checkin.delete({ where: { id } });

    // Note: Streak recalculation on delete could be added here
  }
}
