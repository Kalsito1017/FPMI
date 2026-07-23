import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { execSync } from 'child_process';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';

jest.mock('cache-manager-redis-yet', () => ({
  redisStore: jest.fn().mockResolvedValue({
    get: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  }),
}));

interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    passwordHash?: string;
  };
}

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  db: { status: string; latencyMs: number };
}

interface CourseResponse {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string;
}

interface MeResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    passwordHash?: string;
  };
}

describe('AppModule (e2e)', () => {
  let app: INestApplication;
  let pgContainer: StartedPostgreSqlContainer;
  let prisma: PrismaService;

  beforeAll(async () => {
    pgContainer = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('fpmi_test')
      .withUsername('fpmi_test')
      .withPassword('fpmi_test')
      .start();

    const dbUrl = `postgresql://${pgContainer.getUsername()}:${pgContainer.getPassword()}@${pgContainer.getHost()}:${pgContainer.getPort()}/${pgContainer.getDatabase()}`;

    process.env.DATABASE_URL = dbUrl;

    execSync('npx prisma migrate deploy', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
      },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    prisma = app.get(PrismaService);

    const passwordHash = await bcrypt.hash('testpass123', 10);

    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@fpmi.bg',
        passwordHash,
        role: 'STUDENT',
      },
    });

    await prisma.course.create({
      data: {
        title: 'Тестов курс',
        slug: 'test-course',
        description: 'Описание на тестовия курс',
        category: 'MATH',
      },
    });
  }, 120_000);

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
    if (pgContainer) {
      await pgContainer.stop();
    }
  }, 30_000);

  it('GET /health returns 200 with status ok', () => {
    return request(app.getHttpServer() as never)
      .get('/health')
      .expect(200)
      .expect((res: { body: HealthResponse }) => {
        expect(res.body.status).toBe('ok');
      });
  });

  it('POST /auth/register creates a user and returns token', () => {
    return request(app.getHttpServer() as never)
      .post('/auth/register')
      .send({
        name: 'New User',
        email: 'newuser@fpmi.bg',
        password: 'securepassword123',
      })
      .expect(201)
      .expect((res: { body: AuthResponse }) => {
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('newuser@fpmi.bg');
      });
  });

  it('POST /auth/login logs in and returns token', () => {
    return request(app.getHttpServer() as never)
      .post('/auth/login')
      .send({
        email: 'test@fpmi.bg',
        password: 'testpass123',
      })
      .expect(201)
      .expect((res: { body: AuthResponse }) => {
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('test@fpmi.bg');
      });
  });

  it('POST /auth/login rejects wrong password with 401', () => {
    return request(app.getHttpServer() as never)
      .post('/auth/login')
      .send({
        email: 'test@fpmi.bg',
        password: 'wrongpassword123',
      })
      .expect(401);
  });

  it('GET /courses returns courses with 200', () => {
    return request(app.getHttpServer() as never)
      .get('/courses')
      .expect(200)
      .expect((res: { body: { data: CourseResponse[]; meta: object } }) => {
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        expect(res.body.meta).toBeDefined();
      });
  });

  it('GET /courses/:slug returns a single course', () => {
    return request(app.getHttpServer() as never)
      .get('/courses/test-course')
      .expect(200)
      .expect((res: { body: CourseResponse }) => {
        expect(res.body.title).toBe('Тестов курс');
        expect(res.body.slug).toBe('test-course');
      });
  });

  it('GET /courses/:slug returns 404 for non-existent course', () => {
    return request(app.getHttpServer() as never)
      .get('/courses/non-existent-slug')
      .expect(404);
  });

  it('GET /auth/me returns current user with valid token', async () => {
    const loginRes: { body: AuthResponse } = await request(
      app.getHttpServer() as never,
    )
      .post('/auth/login')
      .send({
        email: 'test@fpmi.bg',
        password: 'testpass123',
      });

    const token = loginRes.body.accessToken;

    return request(app.getHttpServer() as never)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res: { body: MeResponse }) => {
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe('test@fpmi.bg');
        expect(res.body.user.passwordHash).toBeUndefined();
      });
  });

  it('GET /auth/me returns 401 without token', () => {
    return request(app.getHttpServer() as never)
      .get('/auth/me')
      .expect(401);
  });
});
