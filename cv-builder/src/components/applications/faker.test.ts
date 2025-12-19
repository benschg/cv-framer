import { describe, expect, it } from 'vitest';

import { generateFakeApplication } from './faker';

describe('generateFakeApplication', () => {
  it('should return an object with required fields', () => {
    const result = generateFakeApplication();

    expect(result).toHaveProperty('company_name');
    expect(result).toHaveProperty('job_title');
    expect(result).toHaveProperty('location');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('job_description');
  });

  it('should return non-empty strings for all fields', () => {
    const result = generateFakeApplication();

    expect(result.company_name.length).toBeGreaterThan(0);
    expect(result.job_title.length).toBeGreaterThan(0);
    expect(result.location.length).toBeGreaterThan(0);
    expect(result.status.length).toBeGreaterThan(0);
    expect(result.job_description.length).toBeGreaterThan(0);
  });

  it('should return a valid application status', () => {
    const validStatuses = [
      'draft',
      'applied',
      'screening',
      'interview',
      'offer',
      'accepted',
      'rejected',
    ];
    const result = generateFakeApplication();

    expect(validStatuses).toContain(result.status);
  });

  it('should include company and title in job description', () => {
    const result = generateFakeApplication();

    expect(result.job_description).toContain(result.company_name);
    expect(result.job_description).toContain(result.job_title);
  });

  it('should generate different results on multiple calls', () => {
    // Generate multiple applications and check they're not all identical
    const results = Array.from({ length: 10 }, () => generateFakeApplication());
    const uniqueCompanies = new Set(results.map((r) => r.company_name));
    const uniqueTitles = new Set(results.map((r) => r.job_title));

    // With random selection, we should get some variety
    // (statistically unlikely to get same value 10 times)
    expect(uniqueCompanies.size + uniqueTitles.size).toBeGreaterThan(2);
  });

  it('should return valid location format', () => {
    const result = generateFakeApplication();

    // All locations should either be "Remote" or contain a comma (city, country format)
    expect(result.location === 'Remote' || result.location.includes(',')).toBe(true);
  });
});
