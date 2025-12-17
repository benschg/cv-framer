import type { Browser } from 'puppeteer-core';

export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
}

const defaultOptions: PDFGenerationOptions = {
  format: 'A4',
  margin: {
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
  },
  printBackground: true,
};

// Check if running in production/Vercel environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

// Chromium binary from official @sparticuz/chromium GitHub releases
const CHROMIUM_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.x64.tar';

async function launchBrowser(): Promise<Browser> {
  if (isProduction) {
    // Production: Use puppeteer-core with remote chromium for serverless
    const puppeteer = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium-min');

    return puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: { width: 794, height: 1123 }, // A4 at 96 DPI
      executablePath: await chromium.default.executablePath(CHROMIUM_URL),
      headless: true,
    });
  } else {
    // Development: Use full puppeteer with bundled Chromium
    const puppeteer = await import('puppeteer');

    return puppeteer.default.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
      ],
      defaultViewport: { width: 794, height: 1123 }, // A4 at 96 DPI
      headless: true,
    });
  }
}

/**
 * Generate PDF from HTML content
 */
export async function generatePDFFromHTML(
  html: string,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const mergedOptions = { ...defaultOptions, ...options };

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();

    // Set viewport to match A4 at 96 DPI (same as preview)
    await page.setViewport({ width: 794, height: 1123 });

    // Emulate print media for consistent rendering
    await page.emulateMediaType('print');

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Small delay to ensure rendering is complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate PDF
    const pdf = await page.pdf({
      format: mergedOptions.format,
      margin: mergedOptions.margin,
      printBackground: mergedOptions.printBackground,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/**
 * Generate PDF from a URL
 */
export async function generatePDFFromURL(
  url: string,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const mergedOptions = { ...defaultOptions, ...options };

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });

    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    const pdf = await page.pdf({
      format: mergedOptions.format,
      margin: mergedOptions.margin,
      printBackground: mergedOptions.printBackground,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
