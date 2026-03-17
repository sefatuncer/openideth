import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Properties (e2e)', () => {
  let app: INestApplication;
  let landlordToken: string;
  let tenantToken: string;
  let propertyId: string;

  const landlordUser = {
    email: `landlord-${Date.now()}@openideth.com`,
    password: 'TestPassword123!',
    name: 'Test Landlord',
    role: 'LANDLORD',
  };

  const tenantUser = {
    email: `tenant-${Date.now()}@openideth.com`,
    password: 'TestPassword123!',
    name: 'Test Tenant',
    role: 'TENANT',
  };

  const testProperty = {
    title: 'Test Apartment',
    description: 'A test apartment for e2e tests',
    propertyType: 'APARTMENT',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'US',
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    monthlyRent: 1500,
    depositAmount: 3000,
    amenities: ['WiFi', 'Parking'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();

    // Register users
    const landlordRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(landlordUser);
    landlordToken = landlordRes.body.accessToken;

    const tenantRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(tenantUser);
    tenantToken = tenantRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/properties', () => {
    it('should create a property (landlord)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/properties')
        .set('Authorization', `Bearer ${landlordToken}`)
        .send(testProperty)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(testProperty.title);
      expect(res.body.status).toBe('DRAFT');
      propertyId = res.body.id;
    });

    it('should reject for tenant role', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/properties')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send(testProperty)
        .expect(403);
    });

    it('should reject without auth', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/properties')
        .send(testProperty)
        .expect(401);
    });
  });

  describe('GET /api/v1/properties', () => {
    it('should search properties (public)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/properties')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
    });
  });

  describe('GET /api/v1/properties/:id', () => {
    it('should get property details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/properties/${propertyId}`)
        .expect(200);

      expect(res.body.id).toBe(propertyId);
      expect(res.body).toHaveProperty('averageRating');
    });

    it('should 404 for nonexistent property', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/properties/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /api/v1/properties/:id', () => {
    it('should update property (owner)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/properties/${propertyId}`)
        .set('Authorization', `Bearer ${landlordToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
    });

    it('should reject update from non-owner', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/properties/${propertyId}`)
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({ title: 'Hacked' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/properties/:id', () => {
    it('should soft-delete property (owner)', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/properties/${propertyId}`)
        .set('Authorization', `Bearer ${landlordToken}`)
        .expect(200);

      expect(res.body.status).toBe('INACTIVE');
    });
  });
});
