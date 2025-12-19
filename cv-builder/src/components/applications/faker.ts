/**
 * Fake data generation for application tracker (dev only)
 */
import type { ApplicationStatus } from '@/types/cv.types';

import { ALL_STATUSES } from './constants';

const FAKE_COMPANIES = [
  'Acme Corp',
  'TechStart Inc',
  'DataFlow Systems',
  'CloudNine Solutions',
  'InnovateTech',
  'PixelPerfect',
  'CodeCraft Labs',
  'DigitalDreams',
  'FutureWorks',
  'ByteSize Co',
  'Quantum Dynamics',
  'NexGen Software',
  'BlueSky Analytics',
  'GreenLeaf Tech',
  'RedRocket Media',
  'SilverStream',
];

const FAKE_TITLES = [
  'Senior Frontend Developer',
  'Full Stack Engineer',
  'React Developer',
  'Software Engineer',
  'Lead Developer',
  'UI/UX Developer',
  'Tech Lead',
  'Junior Developer',
  'Backend Engineer',
  'DevOps Engineer',
  'Platform Engineer',
];

const FAKE_LOCATIONS = [
  'Berlin, Germany',
  'Munich, Germany',
  'Hamburg, Germany',
  'Remote',
  'Frankfurt, Germany',
  'Cologne, Germany',
  'Vienna, Austria',
  'Zurich, Switzerland',
];

export interface FakeApplicationData {
  company_name: string;
  job_title: string;
  location: string;
  status: ApplicationStatus;
  job_description: string;
}

export function generateFakeApplication(): FakeApplicationData {
  const company = FAKE_COMPANIES[Math.floor(Math.random() * FAKE_COMPANIES.length)];
  const title = FAKE_TITLES[Math.floor(Math.random() * FAKE_TITLES.length)];
  const location = FAKE_LOCATIONS[Math.floor(Math.random() * FAKE_LOCATIONS.length)];
  const status = ALL_STATUSES[Math.floor(Math.random() * ALL_STATUSES.length)];

  return {
    company_name: company,
    job_title: title,
    location,
    status,
    job_description: `We are looking for a ${title} to join our team at ${company}.`,
  };
}
