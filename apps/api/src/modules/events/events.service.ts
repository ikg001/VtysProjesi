import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateEventDto {
  userId: string;
  type: string;
  payload: Record<string, any>;
}

/**
 * Events service
 * Telemetry and event logging
 */
@Injectable()
export class EventsService {
  /**
   * Create an event
   */
  async create(dto: CreateEventDto) {
    return prisma.event.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        payload: dto.payload,
      },
    });
  }

  /**
   * Get user events
   */
  async findAll(userId: string, limit = 100) {
    return prisma.event.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
