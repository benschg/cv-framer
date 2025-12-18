import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import type { ApplicationStatus } from '@/types/cv.types';

// GET /api/applications/stats - Get application statistics
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all non-archived applications
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .eq('is_archived', false);

    if (error) {
      console.error('Error fetching applications for stats:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate stats
    const byStatus: Record<ApplicationStatus, number> = {
      draft: 0,
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      accepted: 0,
      rejected: 0,
      withdrawn: 0,
    };

    let thisWeek = 0;
    let thisMonth = 0;

    for (const app of applications || []) {
      // Count by status
      const status = app.status as ApplicationStatus;
      if (status in byStatus) {
        byStatus[status]++;
      }

      // Count by time period
      const createdAt = new Date(app.created_at);
      if (createdAt >= oneWeekAgo) {
        thisWeek++;
      }
      if (createdAt >= oneMonthAgo) {
        thisMonth++;
      }
    }

    const stats = {
      total: applications?.length || 0,
      byStatus,
      thisWeek,
      thisMonth,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Applications stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
