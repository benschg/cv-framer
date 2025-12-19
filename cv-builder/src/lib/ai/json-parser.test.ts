import { describe, expect, it } from 'vitest';

import { cleanJsonResponse, parseJsonResponse } from './json-parser';

describe('cleanJsonResponse', () => {
  it('should return plain JSON unchanged', () => {
    const input = '{"name": "test"}';
    expect(cleanJsonResponse(input)).toBe('{"name": "test"}');
  });

  it('should remove ```json prefix', () => {
    const input = '```json\n{"name": "test"}';
    expect(cleanJsonResponse(input)).toBe('{"name": "test"}');
  });

  it('should remove ``` prefix without json', () => {
    const input = '```\n{"name": "test"}';
    expect(cleanJsonResponse(input)).toBe('{"name": "test"}');
  });

  it('should remove trailing ```', () => {
    const input = '{"name": "test"}\n```';
    expect(cleanJsonResponse(input)).toBe('{"name": "test"}');
  });

  it('should remove both prefix and suffix', () => {
    const input = '```json\n{"name": "test"}\n```';
    expect(cleanJsonResponse(input)).toBe('{"name": "test"}');
  });

  it('should handle extra whitespace', () => {
    const input = '  ```json\n  {"name": "test"}  \n```  ';
    expect(cleanJsonResponse(input)).toBe('{"name": "test"}');
  });

  it('should handle empty string', () => {
    expect(cleanJsonResponse('')).toBe('');
  });

  it('should handle whitespace-only string', () => {
    expect(cleanJsonResponse('   ')).toBe('');
  });
});

describe('parseJsonResponse', () => {
  it('should parse valid JSON', () => {
    const input = '{"name": "test", "value": 123}';
    const result = parseJsonResponse<{ name: string; value: number }>(input);
    expect(result).toEqual({ name: 'test', value: 123 });
  });

  it('should parse JSON wrapped in markdown', () => {
    const input = '```json\n{"name": "test"}\n```';
    const result = parseJsonResponse<{ name: string }>(input);
    expect(result).toEqual({ name: 'test' });
  });

  it('should parse complex nested JSON', () => {
    const input = `\`\`\`json
{
  "company": {
    "name": "Acme Corp",
    "values": ["innovation", "quality"]
  },
  "role": {
    "title": "Developer"
  }
}
\`\`\``;
    const result = parseJsonResponse<{
      company: { name: string; values: string[] };
      role: { title: string };
    }>(input);
    expect(result.company.name).toBe('Acme Corp');
    expect(result.company.values).toEqual(['innovation', 'quality']);
    expect(result.role.title).toBe('Developer');
  });

  it('should throw on invalid JSON', () => {
    const input = '{invalid json}';
    expect(() => parseJsonResponse(input)).toThrow();
  });

  it('should parse array response', () => {
    const input = '```json\n[1, 2, 3]\n```';
    const result = parseJsonResponse<number[]>(input);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle null values', () => {
    const input = '{"value": null}';
    const result = parseJsonResponse<{ value: null }>(input);
    expect(result.value).toBeNull();
  });
});
