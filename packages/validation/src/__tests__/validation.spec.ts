import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  createReportSchema,
  reportFiltersSchema,
  commentSchema,
  flagSchema,
} from '../index';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'John Doe',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createReportSchema', () => {
    it('should validate valid report', () => {
      const result = createReportSchema.safeParse({
        title: 'Traffic jam on 6 de Agosto',
        description: 'Major traffic jam on 6 de Agosto avenue due to accident',
        category: 'TRAFFIC',
        latitude: -0.1807,
        longitude: -78.4678,
        priority: 'HIGH',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short title', () => {
      const result = createReportSchema.safeParse({
        title: 'AB',
        description: 'Description that is long enough',
        category: 'TRAFFIC',
        latitude: -0.1807,
        longitude: -78.4678,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid coordinates', () => {
      const result = createReportSchema.safeParse({
        title: 'Valid Title',
        description: 'Description that is long enough',
        category: 'TRAFFIC',
        latitude: 100, // out of range
        longitude: -78.4678,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const result = createReportSchema.safeParse({
        title: 'Valid Title',
        description: 'Description that is long enough',
        category: 'INVALID_CATEGORY',
        latitude: -0.1807,
        longitude: -78.4678,
      });
      expect(result.success).toBe(false);
    });

    it('should default priority to MEDIUM', () => {
      const result = createReportSchema.safeParse({
        title: 'Valid Title',
        description: 'Description that is long enough',
        category: 'TRAFFIC',
        latitude: -0.1807,
        longitude: -78.4678,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('MEDIUM');
      }
    });
  });

  describe('reportFiltersSchema', () => {
    it('should parse and coerce query params', () => {
      const result = reportFiltersSchema.safeParse({
        page: '1',
        limit: '20',
        west: '-78.5',
        south: '-0.2',
        east: '-78.4',
        north: '-0.1',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.west).toBe(-78.5);
      }
    });

    it('should apply defaults', () => {
      const result = reportFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });
  });

  describe('commentSchema', () => {
    it('should validate valid comment', () => {
      const result = commentSchema.safeParse({ content: 'This is a comment' });
      expect(result.success).toBe(true);
    });

    it('should reject empty comment', () => {
      const result = commentSchema.safeParse({ content: '' });
      expect(result.success).toBe(false);
    });

    it('should reject long comment', () => {
      const result = commentSchema.safeParse({ content: 'x'.repeat(1001) });
      expect(result.success).toBe(false);
    });
  });

  describe('flagSchema', () => {
    it('should validate valid flag', () => {
      const result = flagSchema.safeParse({ reason: 'This is spam content' });
      expect(result.success).toBe(true);
    });

    it('should reject short reason', () => {
      const result = flagSchema.safeParse({ reason: 'Hi' });
      expect(result.success).toBe(false);
    });
  });
});
