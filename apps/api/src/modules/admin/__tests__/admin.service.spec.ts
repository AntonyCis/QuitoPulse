import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from '../admin.service';

describe('AdminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStats', () => {
    it('should be callable', () => {
      expect(typeof AdminService.prototype.getStats).toBe('function');
    });
  });

  describe('getUsers', () => {
    it('should be callable', () => {
      expect(typeof AdminService.prototype.getUsers).toBe('function');
    });
  });

  describe('updateUserRole', () => {
    it('should be callable', () => {
      expect(typeof AdminService.prototype.updateUserRole).toBe('function');
    });
  });

  describe('toggleUserActive', () => {
    it('should be callable', () => {
      expect(typeof AdminService.prototype.toggleUserActive).toBe('function');
    });
  });

  describe('getPendingReports', () => {
    it('should be callable', () => {
      expect(typeof AdminService.prototype.getPendingReports).toBe('function');
    });
  });

  describe('updateReportStatus', () => {
    it('should be callable', () => {
      expect(typeof AdminService.prototype.updateReportStatus).toBe('function');
    });
  });

  describe('getPendingFlags', () => {
    it('should be callable', () => {
      expect(typeof AdminService.prototype.getPendingFlags).toBe('function');
    });
  });

  describe('dismissFlag', () => {
    it('should be callable', () => {
      expect(typeof AdminService.prototype.dismissFlag).toBe('function');
    });
  });
});
