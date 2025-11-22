import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Streaks service (Domain Service)
 * Implements core business logic for streak tracking
 *
 * Business Rules:
 * - Streak increments if previous day was also done
 * - Streak resets to 1 if there's a gap
 * - Best streak is always the maximum achieved
 */
@Injectable()
export class StreaksService {
  /**
   * Update streak when a routine is marked as done
   * This is the core domain logic
   */
  async updateStreakOnDone(routineId: string, userId: string, completionDate: Date): Promise<void> {
    // Ensure date is start of day
    const today = new Date(completionDate);
    today.setHours(0, 0, 0, 0);

    // Get or create streak record
    let streak = await prisma.streak.findUnique({
      where: { routineId },
    });

    if (!streak) {
      // First time - create streak
      streak = await prisma.streak.create({
        data: {
          routineId,
          userId,
          currentStreak: 1,
          bestStreak: 1,
          lastCheckinAt: today,
        },
      });
      return;
    }

    // Check if there's a previous check-in
    const lastCheckin = streak.lastCheckinAt;

    if (!lastCheckin) {
      // No previous check-in - start streak
      await prisma.streak.update({
        where: { routineId },
        data: {
          currentStreak: 1,
          bestStreak: Math.max(1, streak.bestStreak),
          lastCheckinAt: today,
        },
      });
      return;
    }

    // Calculate days difference
    const daysDiff = this.getDaysDifference(lastCheckin, today);

    let newCurrentStreak: number;

    if (daysDiff === 0) {
      // Same day - no change
      return;
    } else if (daysDiff === 1) {
      // Consecutive day - increment streak
      newCurrentStreak = streak.currentStreak + 1;
    } else {
      // Gap - reset streak
      newCurrentStreak = 1;
    }

    // Update best streak if necessary
    const newBestStreak = Math.max(newCurrentStreak, streak.bestStreak);

    await prisma.streak.update({
      where: { routineId },
      data: {
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        lastCheckinAt: today,
      },
    });
  }

  /**
   * Get streak for a routine
   */
  async getStreak(routineId: string, userId: string) {
    return prisma.streak.findFirst({
      where: { routineId, userId },
    });
  }

  /**
   * Get all streaks for a user
   */
  async getUserStreaks(userId: string) {
    return prisma.streak.findMany({
      where: { userId },
      include: {
        routine: {
          select: { id: true, title: true },
        },
      },
      orderBy: { currentStreak: 'desc' },
    });
  }

  /**
   * Calculate day difference (ignoring time)
   */
  private getDaysDifference(date1: Date, date2: Date): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}
