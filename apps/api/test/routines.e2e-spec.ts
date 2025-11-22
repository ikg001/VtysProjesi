import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * E2E Tests for Routines and Check-ins
 */
describe('Routines & Check-ins (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let routineId: string;
  let checkinId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login to get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'TestPassword123!',
      });

    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /routines', () => {
    it('should create a daily routine', async () => {
      const res = await request(app.getHttpServer())
        .post('/routines')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Morning Meditation',
          frequency: 'daily',
          timeOfDay: '07:00:00',
          reminders: true,
          meta: { duration: 10 },
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Morning Meditation');
      routineId = res.body.id;
    });

    it('should create a weekly routine', () => {
      return request(app.getHttpServer())
        .post('/routines')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Gym Day',
          frequency: 'weekly',
          weekdays: [1, 3, 5], // Mon, Wed, Fri
          timeOfDay: '18:00:00',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.weekdays).toEqual([1, 3, 5]);
        });
    });

    it('should reject weekly routine without weekdays', () => {
      return request(app.getHttpServer())
        .post('/routines')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Weekly',
          frequency: 'weekly',
        })
        .expect(400);
    });
  });

  describe('GET /routines', () => {
    it('should get all user routines', () => {
      return request(app.getHttpServer())
        .get('/routines')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('POST /checkins', () => {
    it('should create a check-in', async () => {
      const today = new Date().toISOString().split('T')[0];

      const res = await request(app.getHttpServer())
        .post('/checkins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          routineId,
          checkinDate: today,
          status: 'done',
          note: 'Completed successfully',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      checkinId = res.body.id;
    });
  });

  describe('PATCH /checkins/:id/done', () => {
    it('should mark check-in as done and update streak', () => {
      return request(app.getHttpServer())
        .patch(`/checkins/${checkinId}/done`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          note: 'Updated note',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('done');
        });
    });
  });

  describe('GET /streaks', () => {
    it('should get user streaks', () => {
      return request(app.getHttpServer())
        .get('/streaks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('GET /analytics/summary', () => {
    it('should get analytics summary', () => {
      return request(app.getHttpServer())
        .get('/analytics/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalRoutines');
          expect(res.body).toHaveProperty('completionRate');
          expect(res.body).toHaveProperty('topStreaks');
        });
    });
  });
});
