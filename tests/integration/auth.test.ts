import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { resetDatabase, createTestUser } from '../helpers/setup';

describe('POST /api/v1/auth/register', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates a user and returns 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'New User',
        email: 'new@example.com',
        password: 'SecurePass1', // Adjust to match your schema constraints
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe('new@example.com');
    expect(res.body.data.tier).toBe('free');
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'SecurePass1' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});