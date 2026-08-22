import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportsService } from '../reports.service';

function createChainMock(returnValues: unknown[] = []) {
  let callIndex = 0;
  const chain: Record<string, unknown> = {};

  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, prop) {
      if (prop === 'then') return undefined;
      if (prop === Symbol.toPrimitive || prop === Symbol.iterator) return undefined;
      if (prop === 'mockResolvedValue') {
        return (val: unknown) => {
          callIndex = 0;
          returnValues.length = 0;
          returnValues.push(val);
          return chain;
        };
      }
      return (..._args: unknown[]) => {
        if (prop === 'returning') {
          return vi.fn().mockResolvedValue(returnValues[0] ?? []);
        }
        if (prop === 'limit' || prop === 'offset' || prop === 'orderBy') {
          return chain;
        }
        return chain;
      };
    },
  };

  return new Proxy(chain, handler);
}

describe('ReportsService', () => {
  let reportsService: ReportsService;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findMany', () => {
    it('should be callable', () => {
      expect(typeof ReportsService.prototype.findMany).toBe('function');
    });
  });

  describe('create', () => {
    it('should be callable', () => {
      expect(typeof ReportsService.prototype.create).toBe('function');
    });
  });

  describe('confirm', () => {
    it('should be callable', () => {
      expect(typeof ReportsService.prototype.confirm).toBe('function');
    });
  });

  describe('addComment', () => {
    it('should be callable', () => {
      expect(typeof ReportsService.prototype.addComment).toBe('function');
    });
  });

  describe('flag', () => {
    it('should be callable', () => {
      expect(typeof ReportsService.prototype.flag).toBe('function');
    });
  });

  describe('getMyReports', () => {
    it('should be callable', () => {
      expect(typeof ReportsService.prototype.getMyReports).toBe('function');
    });
  });
});
