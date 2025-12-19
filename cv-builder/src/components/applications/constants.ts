/**
 * Application tracker constants and configuration
 */
import { CheckCircle, FileEdit, Gift, Search, Send, Undo2, Users, XCircle } from 'lucide-react';

import type { ApplicationStatus } from '@/types/cv.types';

// Kanban column layout - some columns are stacked vertically
export type KanbanColumn = {
  statuses: ApplicationStatus[];
  stacked?: boolean;
};

export const KANBAN_LAYOUT: KanbanColumn[] = [
  { statuses: ['draft'] },
  { statuses: ['applied'] },
  { statuses: ['screening', 'interview', 'offer'], stacked: true },
  { statuses: ['accepted', 'rejected'], stacked: true },
];

// All statuses for the dropdown menu
export const ALL_STATUSES: ApplicationStatus[] = [
  'draft',
  'applied',
  'screening',
  'interview',
  'offer',
  'accepted',
  'rejected',
];

// Icon map for status icons
export const STATUS_ICONS = {
  FileEdit,
  Send,
  Search,
  Users,
  Gift,
  CheckCircle,
  XCircle,
  Undo2,
} as const;
