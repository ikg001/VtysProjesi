import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Routine } from '@prisma/client';
import { CreateRoutineDto, UpdateRoutineDto } from './dto/routine.dto';

const prisma = new PrismaClient();

/**
 * Routines service
 * Business logic for routine management
 */
@Injectable()
export class RoutinesService {
  /**
   * Get all routines for a user
   */
  async findAll(userId: string): Promise<Routine[]> {
    return prisma.routine.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a specific routine by ID
   */
  async findOne(id: string, userId: string): Promise<Routine> {
    const routine = await prisma.routine.findFirst({
      where: { id, userId },
    });

    if (!routine) {
      throw new NotFoundException(`Routine with ID ${id} not found`);
    }

    return routine;
  }

  /**
   * Create a new routine
   */
  async create(dto: CreateRoutineDto, userId: string): Promise<Routine> {
    // Validation: weekly routines must have weekdays
    if (dto.frequency === 'weekly' && (!dto.weekdays || dto.weekdays.length === 0)) {
      throw new BadRequestException('Weekly routines must specify at least one weekday');
    }

    // Validation: daily routines should not have weekdays
    if (dto.frequency === 'daily' && dto.weekdays && dto.weekdays.length > 0) {
      throw new BadRequestException('Daily routines should not specify weekdays');
    }

    return prisma.routine.create({
      data: {
        userId,
        title: dto.title,
        frequency: dto.frequency,
        weekdays: dto.weekdays || [],
        timeOfDay: dto.timeOfDay,
        reminders: dto.reminders ?? true,
        meta: dto.meta || {},
      },
    });
  }

  /**
   * Update an existing routine
   */
  async update(id: string, dto: UpdateRoutineDto, userId: string): Promise<Routine> {
    // Ensure routine exists and belongs to user
    await this.findOne(id, userId);

    // Validation logic (same as create)
    if (dto.frequency === 'weekly' && dto.weekdays && dto.weekdays.length === 0) {
      throw new BadRequestException('Weekly routines must specify at least one weekday');
    }

    return prisma.routine.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.frequency && { frequency: dto.frequency }),
        ...(dto.weekdays !== undefined && { weekdays: dto.weekdays }),
        ...(dto.timeOfDay !== undefined && { timeOfDay: dto.timeOfDay }),
        ...(dto.reminders !== undefined && { reminders: dto.reminders }),
        ...(dto.meta && { meta: dto.meta }),
      },
    });
  }

  /**
   * Delete a routine
   */
  async remove(id: string, userId: string): Promise<void> {
    // Ensure routine exists and belongs to user
    await this.findOne(id, userId);

    await prisma.routine.delete({
      where: { id },
    });
  }
}
