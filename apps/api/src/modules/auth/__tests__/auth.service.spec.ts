import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();

    const mockJwtService = {
      sign: vi.fn().mockReturnValue('mock-jwt-token'),
      verify: vi.fn(),
    } as unknown as JwtService;

    const mockConfigService = {
      get: vi.fn((key: string) => {
        const config: Record<string, string> = {
          JWT_EXPIRATION: '15m',
          JWT_REFRESH_EXPIRATION: '7d',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
        };
        return config[key];
      }),
    } as unknown as ConfigService;

    const mockAuditService = {
      log: vi.fn(),
    } as never;

    const mockDb = {} as never;

    authService = new AuthService(
      mockJwtService,
      mockConfigService,
      mockAuditService,
      mockDb,
    );
  });

  describe('register', () => {
    it('should have correct structure', () => {
      expect(authService).toBeDefined();
      expect(typeof authService.register).toBe('function');
      expect(typeof authService.login).toBe('function');
    });
  });

  describe('login', () => {
    it('should be callable', () => {
      expect(typeof authService.login).toBe('function');
    });
  });
});
