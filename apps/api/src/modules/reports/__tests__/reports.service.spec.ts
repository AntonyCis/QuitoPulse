import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportsService } from '../reports.service';

describe('ReportsService', () => {
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
