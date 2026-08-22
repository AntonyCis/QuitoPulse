import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

function createMockDb() {
  const chainResult: Record<string, unknown> = {};
  const chain = new Proxy({} as Record<string, unknown>, {
    get(_target, prop) {
      if (prop === Symbol.toPrimitive || prop === Symbol.iterator) return undefined;
      if (prop === 'then') return undefined;
      if (prop === 'mockResolvedValue') {
        return (val: unknown) => {
          Object.assign(chainResult, { _result: val });
          return chain;
        };
      }
      if (prop === 'mockReturnValue') {
        return (val: unknown) => {
          Object.assign(chainResult, { _result: val });
          return chain;
        };
      }
      return (...args: unknown[]) => {
        return chain;
      };
    },
  });

  const db = {
    select: vi.fn(() => {
      const innerChain: Record<string, unknown> = {};
      const inner = new Proxy({} as Record<string, unknown>, {
        get(_t, prop) {
          if (prop === 'then') return undefined;
          if (prop === Symbol.toPrimitive || prop === Symbol.iterator) return undefined;
          return (..._args: unknown[]) => inner;
        },
      });
      return inner;
    }),
    insert: vi.fn(() => {
      const inner = new Proxy({} as Record<string, unknown>, {
        get(_t, prop) {
          if (prop === 'then') return undefined;
          if (prop === Symbol.toPrimitive || prop === Symbol.iterator) return undefined;
          return (..._args: unknown[]) => inner;
        },
      });
      return inner;
    }),
    update: vi.fn(() => {
      const inner = new Proxy({} as Record<string, unknown>, {
        get(_t, prop) {
          if (prop === 'then') return undefined;
          if (prop === Symbol.toPrimitive || prop === Symbol.iterator) return undefined;
          return (..._args: unknown[]) => inner;
        },
      });
      return inner;
    }),
    delete: vi.fn(() => chain),
  };

  return db;
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();

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

    authService = new AuthService(
      mockJwtService,
      mockConfigService,
      mockDb as any,
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
