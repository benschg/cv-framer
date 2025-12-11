import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse } from '@/lib/api-utils';
import mammoth from 'mammoth';
import PDFParser from 'pdf2json';

// POST /api/cv-upload - Upload and extract text from a CV file
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOCX, or TXT files.' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Determine file type
    let fileType = 'txt';
    if (file.type === 'application/pdf') {
      fileType = 'pdf';
    } else if (file.type.includes('wordprocessingml')) {
      fileType = 'docx';
    }

    // Extract text based on file type
    let extractedText = '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (fileType === 'txt') {
      extractedText = buffer.toString('utf-8');
    } else if (fileType === 'pdf') {
      // For PDF, we'll use a simple text extraction
      // In production, you might want to use pdf-parse or similar
      extractedText = await extractTextFromPDF(buffer);
    } else if (fileType === 'docx') {
      // For DOCX, extract text
      extractedText = await extractTextFromDOCX(buffer);
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract sufficient text from the file. Please try pasting the text directly.' },
        { status: 400 }
      );
    }

    // Store the upload record
    const { data: uploadRecord, error: insertError } = await supabase
      .from('uploaded_cvs')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_type: fileType,
        file_size: file.size,
        extracted_text: extractedText,
        status: 'completed',
        extraction_metadata: {
          extractedAt: new Date().toISOString(),
          charCount: extractedText.length,
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing upload record:', insertError);
      // Continue anyway - the extraction worked
    }

    return NextResponse.json({
      success: true,
      uploadId: uploadRecord?.id,
      extractedText,
      filename: file.name,
      charCount: extractedText.length,
    });
  } catch (error) {
    console.error('CV upload error:', error);
    return errorResponse(error);
  }
}

// PDF text extraction using pdf2json with column-aware extraction
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve) => {
    try {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData: Error | { parserError: Error }) => {
        const error = 'parserError' in errData ? errData.parserError : errData;
        console.error('PDF parsing error:', error);
        resolve('');
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: PDFData) => {
        try {
          const pages: string[] = [];

          for (const page of pdfData.Pages) {
            const pageWidth = page.Width || 50; // Default width in pdf2json units
            const pageText = extractPageText(page.Texts, pageWidth);
            if (pageText.trim()) {
              pages.push(formatExtractedText(pageText));
            }
          }

          resolve(pages.join('\n\n---\n\n'));
        } catch (error) {
          console.error('PDF processing error:', error);
          resolve('');
        }
      });

      pdfParser.parseBuffer(buffer);
    } catch (error) {
      console.error('PDF parsing error:', error);
      resolve('');
    }
  });
}

// Type definitions for pdf2json output
interface PDFText {
  x: number;
  y: number;
  w: number;
  R: Array<{ T: string; S?: number; TS?: number[] }>;
}

interface PDFPage {
  Width?: number;
  Height?: number;
  Texts: PDFText[];
}

interface PDFData {
  Pages: PDFPage[];
}

// Extract text from a page with column detection
function extractPageText(texts: PDFText[], pageWidth: number): string {
  if (texts.length === 0) return '';

  // Decode and collect all text items with positions
  const items: Array<{ x: number; y: number; text: string; fontSize: number }> = [];

  for (const textItem of texts) {
    const text = textItem.R.map(r => decodeURIComponent(r.T)).join('');
    if (!text.trim()) continue;

    // Get font size from TS array (index 1 is font size)
    const fontSize = textItem.R[0]?.TS?.[1] || 12;

    items.push({
      x: textItem.x,
      y: textItem.y,
      text,
      fontSize,
    });
  }

  if (items.length === 0) return '';

  // Detect if this is a multi-column layout
  const xPositions = items.map(item => item.x);
  const midPoint = pageWidth / 2;
  const leftItems = xPositions.filter(x => x < midPoint * 0.7).length;
  const rightItems = xPositions.filter(x => x > midPoint * 0.5).length;
  const isMultiColumn = leftItems > 5 && rightItems > 5 &&
    Math.min(leftItems, rightItems) / Math.max(leftItems, rightItems) > 0.15;

  if (isMultiColumn) {
    // Find the column divider (gap between columns)
    const sortedX = [...xPositions].sort((a, b) => a - b);
    let maxGap = 0;
    let columnDivider = midPoint * 0.4;

    for (let i = 1; i < sortedX.length; i++) {
      const gap = sortedX[i] - sortedX[i - 1];
      if (gap > maxGap && sortedX[i - 1] < midPoint && sortedX[i] > midPoint * 0.3) {
        maxGap = gap;
        columnDivider = (sortedX[i - 1] + sortedX[i]) / 2;
      }
    }

    const leftColumn = items.filter(item => item.x < columnDivider);
    const rightColumn = items.filter(item => item.x >= columnDivider);

    const leftText = extractColumnText(leftColumn);
    const rightText = extractColumnText(rightColumn);

    // Main content first (right column), then sidebar
    let pageText = '';
    if (rightText.trim()) {
      pageText += rightText;
    }
    if (leftText.trim()) {
      pageText += '\n\n--- Sidebar ---\n\n' + leftText;
    }
    return pageText;
  }

  return extractColumnText(items);
}

// Extract text from a set of items (single column)
function extractColumnText(items: Array<{ x: number; y: number; text: string; fontSize: number }>): string {
  if (items.length === 0) return '';

  // Group text by Y position (lines) with tolerance
  const lines: Map<number, Array<{ x: number; text: string; fontSize: number }>> = new Map();
  const yTolerance = 0.3; // pdf2json uses smaller units

  for (const item of items) {
    const y = Math.round(item.y / yTolerance) * yTolerance;

    if (!lines.has(y)) {
      lines.set(y, []);
    }
    lines.get(y)!.push({ x: item.x, text: item.text, fontSize: item.fontSize });
  }

  // Sort lines by Y (ascending - pdf2json Y starts from top)
  const sortedYs = Array.from(lines.keys()).sort((a, b) => a - b);

  let text = '';
  let lastY: number | null = null;
  let lastFontSize: number | null = null;

  for (const y of sortedYs) {
    const lineItems = lines.get(y)!;
    lineItems.sort((a, b) => a.x - b.x);

    // Join items with appropriate spacing
    let lineText = '';
    let lastX = -1;
    for (const item of lineItems) {
      // Add space if there's a gap between items
      if (lastX >= 0 && item.x - lastX > 0.5) {
        lineText += ' ';
      }
      lineText += item.text;
      lastX = item.x + (item.text.length * 0.1); // Approximate end position
    }
    lineText = lineText.trim();

    if (!lineText) continue;

    // Get average font size for this line
    const avgFontSize = lineItems.reduce((sum, item) => sum + item.fontSize, 0) / lineItems.length;

    if (lastY !== null) {
      const gap = y - lastY;
      // Larger gap or font size change indicates new section
      if (gap > 1.5 || (lastFontSize && avgFontSize > lastFontSize * 1.2)) {
        text += '\n\n';
      } else if (gap > 0.8) {
        text += '\n';
      } else {
        text += ' ';
      }
    }

    text += lineText;
    lastY = y;
    lastFontSize = avgFontSize;
  }

  return text;
}

// Format extracted text to preserve structure (sections, bullets, numbers)
function formatExtractedText(text: string): string {
  let formatted = text
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

    // Preserve bullet points - normalize various bullet characters to •
    .replace(/^[\s]*[●○◦▪▸►‣⁃∙·]\s*/gm, '• ')
    .replace(/^[\s]*[-–—]\s+/gm, '• ')

    // Preserve numbered lists - normalize to "1. " format
    .replace(/^[\s]*(\d+)[.)]\s*/gm, '$1. ')
    .replace(/^[\s]*([a-z])[.)]\s*/gim, '   $1. ')

    // Detect section headers (lines in ALL CAPS or Title Case followed by newline)
    .replace(/^([A-Z][A-Z\s&]+)$/gm, '\n## $1\n')

    // Collapse multiple spaces (but preserve newlines)
    .replace(/[ \t]+/g, ' ')

    // Collapse more than 2 consecutive newlines to 2
    .replace(/\n{3,}/g, '\n\n')

    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')

    // Remove empty lines at start/end
    .trim();

  return formatted;
}

// DOCX text extraction using mammoth library
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    // mammoth returns the text content with some structure preserved
    const text = result.value || '';

    // Apply the same formatting to preserve structure
    return formatExtractedText(text);
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return '';
  }
}

// GET /api/cv-upload - Get user's uploaded CVs
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: uploads, error } = await supabase
      .from('uploaded_cvs')
      .select('id, filename, file_type, file_size, status, created_at, extraction_metadata')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching uploads:', error);
      return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
    }

    return NextResponse.json({ uploads: uploads || [] });
  } catch (error) {
    console.error('CV upload GET error:', error);
    return errorResponse(error);
  }
}
