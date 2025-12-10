import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePDFFromHTML } from '@/lib/pdf/generator';
import { generateCVHTML } from '@/lib/pdf/cv-template';
import type { CVDocument, UserProfile } from '@/types/cv.types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/cv/[id]/export - Export CV as PDF
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get export options from query params
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'A4') as 'A4' | 'Letter';

    // Fetch the CV
    const { data: cv, error: cvError } = await supabase
      .from('cv_documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (cvError || !cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Fetch user profile for header info
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Generate HTML
    const html = generateCVHTML({
      cv: cv as CVDocument,
      userProfile: profile as UserProfile | undefined,
    });

    // Generate PDF
    const pdfBuffer = await generatePDFFromHTML(html, { format });

    // Create filename
    const filename = `${cv.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('CV export error:', error);
    return NextResponse.json(
      { error: 'Failed to export CV' },
      { status: 500 }
    );
  }
}
