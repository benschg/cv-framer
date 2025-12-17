import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generatePDFFromHTML } from '@/lib/pdf/generator';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface PdfGenerationRequest {
  html: string;
  css: string;
  theme: 'dark' | 'light';
  filename?: string;
  format?: 'A4' | 'Letter';
}

// POST /api/cv/[id]/export - Export CV as PDF using client-rendered HTML
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this CV
    const { data: cv, error: cvError } = await supabase
      .from('cv_documents')
      .select('id, name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (cvError || !cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Parse request body
    const body: PdfGenerationRequest = await request.json();

    if (!body.html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    const format = body.format || 'A4';
    const theme = body.theme || 'light';

    // Theme-specific colors
    const themeColors = theme === 'dark'
      ? {
          bgPage: '#343a40',
          bgSidebar: '#2a2e32',
          textPrimary: '#ffffff',
          textSecondary: '#e0e0e0',
          textMuted: '#b0b0b0',
        }
      : {
          bgPage: '#ffffff',
          bgSidebar: '#f5f5f5',
          textPrimary: '#1a1a1a',
          textSecondary: '#333333',
          textMuted: '#666666',
        };

    // Build full HTML document with CSS
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* Base CV styles */
    ${body.css || ''}
  </style>
  <style>
    /* PDF-specific overrides */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
    }

    /* Force consistent font rendering in Puppeteer */
    .cv-document-wrapper,
    .cv-document-wrapper * {
      text-rendering: geometricPrecision !important;
      -webkit-font-smoothing: antialiased !important;
      font-synthesis: none !important;
      -webkit-text-size-adjust: 100% !important;
      text-size-adjust: 100% !important;
      /* Explicit font feature settings for consistency */
      font-feature-settings: 'kern' 1, 'liga' 1;
      font-kerning: normal;
      /* Slight letter-spacing adjustment to compensate for Puppeteer font metrics */
      letter-spacing: -0.01em !important;
    }

    html {
      /* Force consistent base font size - browser default is 16px */
      font-size: 16px !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    body {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 16px !important;
      line-height: 1.5 !important;
    }

    /* Force CSS variables for PDF rendering */
    :root, .cv-document-wrapper, .cv-document-wrapper[data-theme='${theme}'] {
      --cv-page-width: ${format === 'A4' ? '210mm' : '216mm'} !important;
      --cv-page-height: ${format === 'A4' ? '297mm' : '279mm'} !important;
      --cv-page-padding: 15mm !important;
      --cv-sidebar-width: 55mm !important;
      --cv-content-height: ${format === 'A4' ? 'calc(297mm - 30mm - 8mm)' : 'calc(279mm - 30mm - 8mm)'} !important;
      --cv-bg-page: ${themeColors.bgPage} !important;
      --cv-bg-sidebar: ${themeColors.bgSidebar} !important;
      --cv-text-primary: ${themeColors.textPrimary} !important;
      --cv-text-secondary: ${themeColors.textSecondary} !important;
      --cv-text-muted: ${themeColors.textMuted} !important;
    }

    /* Ensure SVG icons are visible and correctly sized */
    svg {
      display: inline-block !important;
      vertical-align: middle !important;
    }

    /* Fix icon sizes - h-3 w-3 = 0.75rem = 12px at 16px base */
    .cv-page-footer svg,
    .cv-footer-item svg {
      width: 12px !important;
      height: 12px !important;
      flex-shrink: 0 !important;
    }

    /* Fix sidebar icon sizes - h-3 w-3 = 12px */
    .cv-sidebar svg,
    .cv-sidebar-contact-item svg {
      width: 12px !important;
      height: 12px !important;
      flex-shrink: 0 !important;
    }

    /* Fix header icon sizes - h-4 w-4 = 1rem = 16px */
    .cv-header-contact-item svg {
      width: 16px !important;
      height: 16px !important;
      flex-shrink: 0 !important;
    }

    /* Fix document wrapper for PDF */
    .cv-document-wrapper {
      display: block !important;
      padding: 0 !important;
      gap: 0 !important;
      background: none !important;
      min-height: auto !important;
    }

    /* Fix page dimensions for PDF */
    .cv-page {
      width: ${format === 'A4' ? '210mm' : '216mm'} !important;
      height: ${format === 'A4' ? '297mm' : '279mm'} !important;
      max-height: ${format === 'A4' ? '297mm' : '279mm'} !important;
      min-height: ${format === 'A4' ? '297mm' : '279mm'} !important;
      box-shadow: none !important;
      border: none !important;
      page-break-after: always !important;
      page-break-inside: avoid !important;
      margin: 0 !important;
      padding: 0 !important;
      transform: none !important;
      overflow: hidden !important;
      /* Explicit base font settings */
      font-size: 16px !important;
      line-height: 1.5 !important;
    }

    .cv-page:last-child {
      page-break-after: auto !important;
    }

    /* Hide no-print elements */
    .cv-no-print {
      display: none !important;
    }

    /* Ensure consistent content heights */
    .cv-two-column {
      height: calc(${format === 'A4' ? '297mm' : '279mm'} - 8mm) !important;
      max-height: calc(${format === 'A4' ? '297mm' : '279mm'} - 8mm) !important;
    }

    .cv-main-content.cv-full-width {
      height: calc(${format === 'A4' ? '297mm' : '279mm'} - 8mm) !important;
      max-height: calc(${format === 'A4' ? '297mm' : '279mm'} - 8mm) !important;
    }
  </style>
</head>
<body>
  ${body.html}
</body>
</html>
    `.trim();

    // Generate PDF
    const pdfBuffer = await generatePDFFromHTML(fullHtml, { format });

    // Create filename
    const filename = body.filename || `${cv.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

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
      { error: error instanceof Error ? error.message : 'Failed to export CV' },
      { status: 500 }
    );
  }
}
