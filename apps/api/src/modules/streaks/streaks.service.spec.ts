import { StreaksService } from './streaks.service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    streak: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

describe('StreaksService', () => {
  let service: StreaksService;
  let prisma: any;

  beforeEach(() => {
    service = new StreaksService();
    prisma = new PrismaClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStreakOnDone', () => {
    const routineId = 'routine-123';
    const userId = 'user-123';

    it('should create streak when none exists', async () => {
      prisma.streak.findUnique.mockResolvedValue(null);
      prisma.streak.create.mockResolvedValue({
        routineId,
        userId,
        currentStreak: 1,
        bestStreak: 1,
      });

      await service.updateStreakOnDone(routineId, userId, new Date('2025-11-12'));

      expect(prisma.streak.create).toHaveBeenCalledWith({
        data: {
          routineId,
          userId,
          currentStreak: 1,
          bestStreak: 1,
          lastCheckinAt: expect.any(Date),
        },
      });
    });

    it('should increment streak on consecutive day', async () => {
      const lastCheckin = new Date('2025-11-11');
      const today = new Date('2025-11-12');

      prisma.streak.findUnique.mockResolvedValue({
        routineId,
        userId,
        currentStreak: 5,
        bestStreak: 10,
        lastCheckinAt: lastCheckin,
      });

      await service.updateStreakOnDone(routineId, userId, today);

      expect(prisma.streak.update).toHaveBeenCalledWith({
        where: { routineId },
        data: {
          currentStreak: 6,
          bestStreak: 10,
          lastCheckinAt: expect.any(Date),
        },
      });
    });

    it('should reset streak when there is a gap', async () => {
      const lastCheckin = new Date('2025-11-10'); // 2 days ago
      const today = new Date('2025-11-12');

      prisma.streak.findUnique.mockResolvedValue({
        routineId,
        userId,
        currentStreak: 5,
        bestStreak: 10,
        lastCheckinAt: lastCheckin,
      });

      await service.updateStreakOnDone(routineId, userId, today);

      expect(prisma.streak.update).toHaveBeenCalledWith({
        where: { routineId },
        data: {
          currentStreak: 1,
          bestStreak: 10, // Best streak unchanged
          lastCheckinAt: expect.any(Date),
        },
      });
    });

    it('should update best streak when current exceeds it', async () => {
      const lastCheckin = new Date('2025-11-11');
      const today = new Date('2025-11-12');

      prisma.streak.findUnique.mockResolvedValue({
        routineId,
        userId,
        currentStreak: 10,
        bestStreak: 10,
        lastCheckinAt: lastCheckin,
      });

      await service.updateStreakOnDone(routineId, userId, today);

      expect(prisma.streak.update).toHaveBeenCalledWith({
        where: { routineId },
        data: {
          currentStreak: 11,
          bestStreak: 11, // Updated!
          lastCheckinAt: expect.any(Date),
        },
      });
    });

    it('should not change streak on same day', async () => {
      const today = new Date('2025-11-12');

      prisma.streak.findUnique.mockResolvedValue({
        routineId,
        userId,
        currentStreak: 5,
        bestStreak: 10,
        lastCheckinAt: today,
      });

      await service.updateStreakOnDone(routineId, userId, today);

      expect(prisma.streak.update).not.toHaveBeenCalled();
    });
  });
});
