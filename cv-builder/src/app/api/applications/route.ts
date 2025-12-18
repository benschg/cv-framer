import { NextRequest, NextResponse } from 'next/server';

import { errorResponse,validateBody } from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';
import {
  type CreateApplicationInput,
  CreateApplicationSchema,
  GetApplicationsQuerySchema,
} from '@/types/api.schemas';

// GET /api/applications - Get all applications for the current user
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const queryResult = GetApplicationsQuerySchema.safeParse({
      status: searchParams.get('status') || undefined,
      includeArchived: searchParams.get('includeArchived') || undefined,
    });

    const status = queryResult.success ? queryResult.data.status : undefined;
    const includeArchived = queryResult.success
      ? queryResult.data.includeArchived === 'true'
      : false;

    // Build query
    let query = supabase.from('job_applications').select('*').eq('user_id', user.id);

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('updated_at', { ascending: false });

    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (error) {
    console.error('Applications GET error:', error);
    return errorResponse(error);
  }
}

// POST /api/applications - Create a new application
export async function POST(request: NextRequest) {
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

    // Validate request body
    const validated: CreateApplicationInput = await validateBody(request, CreateApplicationSchema);

    // Create the application
    const { data: application, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: user.id,
        company_name: validated.company_name,
        job_title: validated.job_title,
        job_url: validated.job_url || null,
        job_description: validated.job_description || null,
        location: validated.location || null,
        salary_range: validated.salary_range || null,
        status: validated.status,
        deadline: validated.deadline || null,
        notes: validated.notes || null,
        contact_name: validated.contact_name || null,
        contact_email: validated.contact_email || null,
        cv_id: validated.cv_id || null,
        cover_letter_id: validated.cover_letter_id || null,
        is_archived: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Applications POST error:', error);
    return errorResponse(error);
  }
}
