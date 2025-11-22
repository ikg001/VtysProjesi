import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed script for initial development data
 * Creates: 1 user, 1 routine, 1 checkin, 1 streak
 */
async function main() {
  console.log('🌱 Starting seed...');

  // Note: In Supabase, users are in auth.users schema
  // For development, we'll create a mock user reference
  const mockUserId = '00000000-0000-0000-0000-000000000001';

  // Clean existing data (optional - careful in production!)
  console.log('🧹 Cleaning existing seed data...');
  await prisma.checkin.deleteMany({ where: { userId: mockUserId } });
  await prisma.streak.deleteMany({ where: { userId: mockUserId } });
  await prisma.routine.deleteMany({ where: { userId: mockUserId } });
  await prisma.userPrefs.deleteMany({ where: { userId: mockUserId } });

  // 1. Create user preferences
  console.log('👤 Creating user preferences...');
  await prisma.userPrefs.create({
    data: {
      userId: mockUserId,
      tz: 'Europe/Istanbul',
      locale: 'tr-TR',
    },
  });

  // 2. Create a daily routine
  console.log('📋 Creating daily routine...');
  const routine = await prisma.routine.create({
    data: {
      userId: mockUserId,
      title: '🏃 Morning Run',
      frequency: 'daily',
      weekdays: [], // Daily = no weekdays restriction
      timeOfDay: '07:00:00',
      reminders: true,
      meta: {
        description: 'Start the day with a 30-minute run',
        goalDistance: 5,
        unit: 'km',
      },
    },
  });

  console.log(`✅ Created routine: ${routine.title} (${routine.id})`);

  // 3. Create a weekly routine
  console.log('📋 Creating weekly routine...');
  const weeklyRoutine = await prisma.routine.create({
    data: {
      userId: mockUserId,
      title: '📚 Read Book',
      frequency: 'weekly',
      weekdays: [1, 3, 5], // Mon, Wed, Fri
      timeOfDay: '20:00:00',
      reminders: true,
      meta: {
        description: 'Read for 30 minutes',
        currentBook: 'Atomic Habits',
      },
    },
  });

  console.log(`✅ Created routine: ${weeklyRoutine.title} (${weeklyRoutine.id})`);

  // 4. Create today's check-in
  console.log('✅ Creating check-in...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkin = await prisma.checkin.create({
    data: {
      routineId: routine.id,
      userId: mockUserId,
      checkinDate: today,
      status: 'done',
      note: 'Felt great! 5km in 28 minutes.',
      meta: {
        distance: 5.2,
        duration: 28,
      },
    },
  });

  console.log(`✅ Created checkin for ${checkin.checkinDate.toISOString().split('T')[0]}`);

  // 5. Create streak
  console.log('🔥 Creating streak...');
  const streak = await prisma.streak.create({
    data: {
      routineId: routine.id,
      userId: mockUserId,
      currentStreak: 1,
      bestStreak: 1,
      lastCheckinAt: new Date(),
    },
  });

  console.log(`✅ Created streak: ${streak.currentStreak} day(s)`);

  // 6. Create some events
  console.log('📊 Creating events...');
  await prisma.event.createMany({
    data: [
      {
        userId: mockUserId,
        type: 'routine_created',
        payload: { routineId: routine.id, title: routine.title },
      },
      {
        userId: mockUserId,
        type: 'checkin_done',
        payload: { checkinId: checkin.id, routineId: routine.id },
      },
    ],
  });

  console.log('📊 Created events');

  console.log('\n✨ Seed completed successfully!\n');
  console.log('Summary:');
  console.log(`  - User ID: ${mockUserId}`);
  console.log(`  - Routines: 2 (1 daily, 1 weekly)`);
  console.log(`  - Check-ins: 1`);
  console.log(`  - Streaks: 1`);
  console.log(`  - Events: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
