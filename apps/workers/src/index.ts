import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Scheduler worker
 * Runs background jobs (cron tasks)
 * 
 * Jobs:
 * - Generate tomorrow's check-in placeholders (00:05 daily)
 * - Send push notifications for upcoming routines
 */

interface RoutineWithSchedule {
  id: string;
  userId: string;
  title: string;
  frequency: string;
  weekdays: number[];
  timeOfDay: string | null;
}

/**
 * Generate check-in records for tomorrow
 * Runs daily at 00:05
 */
async function generateTomorrowCheckins() {
  console.log('[Scheduler] Running: generateTomorrowCheckins');

  // Calculate tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Get day of week (1=Monday, 7=Sunday)
  const dayOfWeek = ((tomorrow.getDay() + 6) % 7) + 1; // Convert Sun=0 to Sun=7

  console.log(`[Scheduler] Tomorrow: ${tomorrow.toISOString().split('T')[0]}, Day: ${dayOfWeek}`);

  // Find all active routines
  const routines = await prisma.routine.findMany({
    where: {
      // Note: In real app, add is_active field
    },
  }) as RoutineWithSchedule[];

  console.log(`[Scheduler] Found ${routines.length} routines`);

  let created = 0;
  let skipped = 0;

  for (const routine of routines) {
    let shouldCreate = false;

    if (routine.frequency === 'daily') {
      shouldCreate = true;
    } else if (routine.frequency === 'weekly' && routine.weekdays) {
      shouldCreate = routine.weekdays.includes(dayOfWeek);
    }

    if (!shouldCreate) {
      skipped++;
      continue;
    }

    // Check if check-in already exists
    const existing = await prisma.checkin.findFirst({
      where: {
        routineId: routine.id,
        checkinDate: tomorrow,
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Create placeholder check-in
    await prisma.checkin.create({
      data: {
        routineId: routine.id,
        userId: routine.userId,
        checkinDate: tomorrow,
        status: 'skipped', // Default status (user can mark as done later)
        meta: {},
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        userId: routine.userId,
        type: 'checkin_planned',
        payload: {
          routineId: routine.id,
          checkinDate: tomorrow.toISOString(),
        },
      },
    });

    created++;
  }

  console.log(`[Scheduler] Created ${created} check-ins, skipped ${skipped}`);
}

/**
 * Send push notifications (placeholder)
 */
async function sendPushNotifications() {
  console.log('[Scheduler] Running: sendPushNotifications');

  // TODO: Implement FCM push notifications
  // 1. Find routines with reminders enabled and timeOfDay set
  // 2. Check if it's close to reminder time
  // 3. Fetch push tokens from push_tokens table
  // 4. Send via FCM API

  console.log('[Scheduler] Push notifications not yet implemented');
}

/**
 * Main entry point
 */
async function main() {
  console.log('🚀 Scheduler Worker started');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Cron enabled: ${process.env.CRON_ENABLED || 'true'}`);

  if (process.env.CRON_ENABLED === 'false') {
    console.log('⏸️  Cron is disabled. Exiting.');
    process.exit(0);
  }

  // Schedule: Generate tomorrow's check-ins at 00:05 daily
  cron.schedule('5 0 * * *', async () => {
    try {
      await generateTomorrowCheckins();
    } catch (error) {
      console.error('[Scheduler] Error in generateTomorrowCheckins:', error);
    }
  }, {
    timezone: process.env.CRON_TIMEZONE || 'Europe/Istanbul',
  });

  console.log('✅ Cron job scheduled: Generate check-ins at 00:05 daily');

  // For testing, you can run once on startup
  if (process.env.NODE_ENV === 'development') {
    console.log('[Dev] Running generateTomorrowCheckins once...');
    await generateTomorrowCheckins();
  }

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('❌ Scheduler failed:', error);
  process.exit(1);
});
