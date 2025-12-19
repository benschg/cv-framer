import { describe, expect, it, vi } from 'vitest';
import { z, ZodError, type ZodIssue } from 'zod';

import {
  errorResponse,
  safeParse,
  validateBody,
  validateQuery,
  ValidationError,
} from './api-utils';

describe('validateBody', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  it('should parse valid JSON body', async () => {
    const request = {
      json: vi.fn().mockResolvedValue({ name: 'John', age: 30 }),
    } as unknown as Request;

    const result = await validateBody(request, schema);
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should throw ValidationError for invalid body', async () => {
    const request = {
      json: vi.fn().mockResolvedValue({ name: 'John', age: 'not a number' }),
    } as unknown as Request;

    await expect(validateBody(request, schema)).rejects.toThrow(ValidationError);
  });

  it('should re-throw non-Zod errors', async () => {
    const request = {
      json: vi.fn().mockRejectedValue(new Error('JSON parse error')),
    } as unknown as Request;

    await expect(validateBody(request, schema)).rejects.toThrow('JSON parse error');
  });
});

describe('validateQuery', () => {
  const schema = z.object({
    page: z.string(),
    limit: z.string(),
  });

  it('should parse valid query params', () => {
    const searchParams = new URLSearchParams('page=1&limit=10');
    const result = validateQuery(searchParams, schema);
    expect(result).toEqual({ page: '1', limit: '10' });
  });

  it('should throw ZodError for missing params', () => {
    const searchParams = new URLSearchParams('page=1');
    expect(() => validateQuery(searchParams, schema)).toThrow();
  });

  it('should handle empty params', () => {
    const optionalSchema = z.object({
      page: z.string().optional(),
    });
    const searchParams = new URLSearchParams('');
    const result = validateQuery(searchParams, optionalSchema);
    expect(result).toEqual({});
  });
});

describe('ValidationError', () => {
  it('should create error with formatted message', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['name'],
        message: 'Expected string, received number',
      } as ZodIssue,
    ]);

    const error = new ValidationError(zodError);
    expect(error.message).toBe('name: Expected string, received number');
    expect(error.name).toBe('ValidationError');
    expect(error.issues).toHaveLength(1);
  });

  it('should join multiple issues with comma', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['name'],
        message: 'Expected string',
      } as ZodIssue,
      {
        code: 'invalid_type',
        expected: 'number',
        path: ['age'],
        message: 'Expected number',
      } as ZodIssue,
    ]);

    const error = new ValidationError(zodError);
    expect(error.message).toBe('name: Expected string, age: Expected number');
    expect(error.issues).toHaveLength(2);
  });

  it('should handle nested paths', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['user', 'profile', 'email'],
        message: 'Required',
      } as ZodIssue,
    ]);

    const error = new ValidationError(zodError);
    expect(error.message).toBe('user.profile.email: Required');
  });
});

describe('errorResponse', () => {
  it('should handle ValidationError with 400 status', async () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['name'],
        message: 'Expected string',
      } as ZodIssue,
    ]);
    const validationError = new ValidationError(zodError);

    const response = errorResponse(validationError);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('name: Expected string');
    expect(data.issues).toHaveLength(1);
  });

  it('should handle regular Error with custom status', async () => {
    const error = new Error('Not found');
    const response = errorResponse(error, 404);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Not found');
  });

  it('should handle regular Error with default 500 status', async () => {
    const error = new Error('Something went wrong');
    const response = errorResponse(error);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Something went wrong');
  });

  it('should handle non-Error values', async () => {
    const response = errorResponse('string error');
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should handle null/undefined', async () => {
    const response = errorResponse(null);
    const data = await response.json();

    expect(data.error).toBe('Internal server error');
  });
});

describe('safeParse', () => {
  const schema = z.object({
    name: z.string(),
    age: z.number(),
  });

  it('should return parsed data for valid input', () => {
    const result = safeParse(schema, { name: 'John', age: 30 });
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should return null for invalid input', () => {
    const result = safeParse(schema, { name: 'John', age: 'invalid' });
    expect(result).toBeNull();
  });

  it('should return null for missing fields', () => {
    const result = safeParse(schema, { name: 'John' });
    expect(result).toBeNull();
  });

  it('should return null for null input', () => {
    const result = safeParse(schema, null);
    expect(result).toBeNull();
  });

  it('should return null for undefined input', () => {
    const result = safeParse(schema, undefined);
    expect(result).toBeNull();
  });

  it('should work with simple schemas', () => {
    const stringSchema = z.string();
    expect(safeParse(stringSchema, 'hello')).toBe('hello');
    expect(safeParse(stringSchema, 123)).toBeNull();
  });

  it('should work with array schemas', () => {
    const arraySchema = z.array(z.number());
    expect(safeParse(arraySchema, [1, 2, 3])).toEqual([1, 2, 3]);
    expect(safeParse(arraySchema, ['a', 'b'])).toBeNull();
  });
});
