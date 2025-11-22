import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from './config/config.module';
import { AllExceptionsFilter, LoggingInterceptor, JwtAuthGuard } from './common';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { RoutinesModule } from './modules/routines/routines.module';
import { CheckinsModule } from './modules/checkins/checkins.module';
import { StreaksModule } from './modules/streaks/streaks.module';
import { EventsModule } from './modules/events/events.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

/**
 * Root application module
 * Configures global middleware, guards, filters, and feature modules
 */
@Module({
  imports: [
    // Config
    ConfigModule,

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL) || 60,
        limit: Number(process.env.THROTTLE_LIMIT) || 100,
      },
    ]),

    // JWT
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),

    // Feature modules
    AuthModule,
    RoutinesModule,
    CheckinsModule,
    StreaksModule,
    EventsModule,
    AnalyticsModule,
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global JWT authentication (can be bypassed with @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
