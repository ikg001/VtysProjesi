import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalyticsSummary {
  totalRoutines: number;
  totalCheckins: number;
  completedCheckins: number;
  skippedCheckins: number;
  completionRate: number;
  topStreaks: Array<{
    routineId: string;
    routineTitle: string;
    currentStreak: number;
    bestStreak: number;
  }>;
}

/**
 * Analytics service
 * Provides aggregated insights and statistics
 */
@Injectable()
export class AnalyticsService {
  /**
   * Get summary analytics for a user
   */
  async getSummary(userId: string, from?: Date, to?: Date): Promise<AnalyticsSummary> {
    // Build where clause
    const checkinWhere: any = { userId };
    if (from || to) {
      checkinWhere.checkinDate = {};
      if (from) checkinWhere.checkinDate.gte = from;
      if (to) checkinWhere.checkinDate.lte = to;
    }

    // Run queries in parallel
    const [totalRoutines, checkins, streaks] = await Promise.all([
      // Total active routines
      prisma.routine.count({ where: { userId } }),

      // All check-ins in period
      prisma.checkin.findMany({
        where: checkinWhere,
        select: { status: true },
      }),

      // Top streaks
      prisma.streak.findMany({
        where: { userId },
        include: {
          routine: {
            select: { id: true, title: true },
          },
        },
        orderBy: { currentStreak: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate completion metrics
    const totalCheckins = checkins.length;
    const completedCheckins = checkins.filter((c) => c.status === 'done').length;
    const skippedCheckins = checkins.filter((c) => c.status === 'skipped').length;
    const completionRate = totalCheckins > 0 ? (completedCheckins / totalCheckins) * 100 : 0;

    // Format top streaks
    const topStreaks = streaks.map((s) => ({
      routineId: s.routineId,
      routineTitle: s.routine.title,
      currentStreak: s.currentStreak,
      bestStreak: s.bestStreak,
    }));

    return {
      totalRoutines,
      totalCheckins,
      completedCheckins,
      skippedCheckins,
      completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
      topStreaks,
    };
  }
}
