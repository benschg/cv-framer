import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/cv-styles - Return CV CSS styles
export async function GET() {
  try {
    const cssPath = path.join(process.cwd(), 'src', 'styles', 'cv.css');
    const css = await fs.readFile(cssPath, 'utf-8');

    return new NextResponse(css, {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Failed to load CV styles:', error);
    return new NextResponse('/* CV styles not found */', {
      status: 200,
      headers: { 'Content-Type': 'text/css' },
    });
  }
}
