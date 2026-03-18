import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Register and get token
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `user-test-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test User',
        role: 'TENANT',
      });
    accessToken = res.body?.data?.accessToken || res.body?.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/me - should return profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data || res.body).toHaveProperty('email');
    expect(res.body.data || res.body).toHaveProperty('name');
  });

  it('PATCH /users/me - should update profile', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Name', phone: '+1234567890' })
      .expect(200);

    const data = res.body.data || res.body;
    expect(data.name).toBe('Updated Name');
  });

  it('GET /users/me - should fail without auth', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .expect(401);
  });
});
