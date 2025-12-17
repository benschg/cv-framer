import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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

/**
 * Generate PDF from HTML content
 */
export async function generatePDFFromHTML(
  html: string,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const mergedOptions = { ...defaultOptions, ...options };

  // Configure browser launch options
  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

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

  const executablePath = await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });

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
