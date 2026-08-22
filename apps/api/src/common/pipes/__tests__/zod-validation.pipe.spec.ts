import { describe, it, expect } from 'vitest';
import { ZodValidationPipe } from '../zod-validation.pipe';
import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    age: z.number().min(0).max(150).optional(),
  });

  const pipe = new ZodValidationPipe(schema);

  it('should validate and return parsed data', () => {
    const input = { email: 'test@example.com', name: 'John' };
    const result = pipe.transform(input);
    expect(result).toEqual(input);
  });

  it('should parse and coerce types', () => {
    const numSchema = z.object({ page: z.coerce.number().min(1) });
    const numPipe = new ZodValidationPipe(numSchema);
    const result = numPipe.transform({ page: '5' });
    expect(result.page).toBe(5);
  });

  it('should throw BadRequestException on invalid data', () => {
    expect(() => pipe.transform({ email: 'invalid', name: '' })).toThrow(BadRequestException);
  });

  it('should return structured error response', () => {
    try {
      pipe.transform({ email: 'not-an-email', name: '' });
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as {
        message: string;
        errors: Array<{ field: string; message: string }>;
      };
      expect(response.message).toBe('Error de validación');
      expect(response.errors).toHaveLength(2);
      expect(response.errors[0].field).toBe('email');
      expect(response.errors[1].field).toBe('name');
    }
  });

  it('should allow optional fields to be missing', () => {
    const input = { email: 'test@example.com', name: 'John' };
    const result = pipe.transform(input);
    expect(result.age).toBeUndefined();
  });

  it('should validate nested fields', () => {
    const nestedSchema = z.object({
      user: z.object({
        email: z.string().email(),
      }),
    });
    const nestedPipe = new ZodValidationPipe(nestedSchema);

    const valid = { user: { email: 'test@example.com' } };
    expect(nestedPipe.transform(valid)).toEqual(valid);

    expect(() => nestedPipe.transform({ user: { email: 'invalid' } })).toThrow(
      BadRequestException,
    );
  });
});
