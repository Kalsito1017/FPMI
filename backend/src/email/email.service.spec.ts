import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get(EmailService);
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('sendPasswordResetEmail', () => {
    it('logs reset email triggered in dev mode (no API key)', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      await service.sendPasswordResetEmail('user@test.com', 'test-token-123');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[EmailService] Dev mode — reset email triggered for user@test.com',
        ),
      );

      if (originalKey) {
        process.env.RESEND_API_KEY = originalKey;
      }
    });

    it('logs reset email in dev mode with custom FRONTEND_URL', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;
      process.env.FRONTEND_URL = 'https://fpmi.example.com';

      await service.sendPasswordResetEmail('user@test.com', 'token-abc');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '[EmailService] Dev mode — reset email triggered for user@test.com',
        ),
      );

      if (originalKey) {
        process.env.RESEND_API_KEY = originalKey;
      }
    });
  });
});
