import { NextResponse } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';

/**
 * Validate request body against a Zod schema
 * Returns parsed data or throws with proper error response
 */
export async function validateBody<T extends ZodSchema>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

/**
 * Validate query params against a Zod schema
 */
export function validateQuery<T extends ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params);
}

/**
 * Custom validation error with formatted message
 */
export class ValidationError extends Error {
  public readonly issues: z.ZodIssue[];

  constructor(zodError: ZodError) {
    const message = zodError.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    super(message);
    this.name = 'ValidationError';
    this.issues = zodError.issues;
  }
}

/**
 * Create error response with proper status code
 */
export function errorResponse(error: unknown, status = 500): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message, issues: error.issues }, { status: 400 });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ error: 'Internal server error' }, { status });
}

/**
 * Safe parse that returns null on error (for optional validation)
 */
export function safeParse<T extends ZodSchema>(schema: T, data: unknown): z.infer<T> | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}
