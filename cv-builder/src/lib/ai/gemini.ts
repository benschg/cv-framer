import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Available models
export type GeminiModel = 'gemini-2.0-flash' | 'gemini-2.0-flash-thinking-exp' | 'gemini-1.5-flash' | 'gemini-1.5-pro';

// Get a model instance
export function getModel(modelName: GeminiModel = 'gemini-2.0-flash'): GenerativeModel {
  return genAI.getGenerativeModel({ model: modelName });
}

// Generic function to generate content
export async function generateContent(
  prompt: string,
  modelName: GeminiModel = 'gemini-2.0-flash'
): Promise<string> {
  const model = getModel(modelName);
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

// Generate JSON content with parsing
export async function generateJSON<T>(
  prompt: string,
  modelName: GeminiModel = 'gemini-2.0-flash'
): Promise<T> {
  const fullPrompt = `${prompt}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanations.`;

  const text = await generateContent(fullPrompt, modelName);

  // Clean the response - remove any markdown code blocks
  let cleanedText = text.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  return JSON.parse(cleanedText) as T;
}

// Types for CV generation
export interface CompanyResearchResult {
  company: {
    name: string;
    industry?: string;
    culture?: string[];
    values?: string[];
    techStack?: string[];
    size?: string;
  };
  role: {
    title: string;
    level?: string;
    responsibilities?: string[];
    requiredSkills?: string[];
    preferredSkills?: string[];
    keywords?: string[];
  };
  insights?: {
    whatTheyValue?: string;
    toneGuidance?: string;
    keyMatches?: string[];
    gaps?: string[];
  };
}

export interface GeneratedCVContent {
  tagline?: string;
  profile?: string;
  slogan?: string;
}

// Analyze a job posting to extract company research
export async function analyzeJobPosting(
  jobPosting: string,
  companyName?: string,
  positionTitle?: string
): Promise<CompanyResearchResult> {
  const prompt = `Analyze this job posting and extract key information for CV customization.

Job Posting:
${jobPosting}

${companyName ? `Company Name: ${companyName}` : ''}
${positionTitle ? `Position Title: ${positionTitle}` : ''}

Extract and return a JSON object with this structure:
{
  "company": {
    "name": "company name",
    "industry": "industry/sector",
    "culture": ["culture trait 1", "culture trait 2"],
    "values": ["value 1", "value 2"],
    "techStack": ["technology 1", "technology 2"],
    "size": "startup/small/medium/large/enterprise"
  },
  "role": {
    "title": "job title",
    "level": "junior/mid/senior/lead/manager/director",
    "responsibilities": ["responsibility 1", "responsibility 2"],
    "requiredSkills": ["skill 1", "skill 2"],
    "preferredSkills": ["skill 1", "skill 2"],
    "keywords": ["keyword 1", "keyword 2"]
  },
  "insights": {
    "whatTheyValue": "brief description of what the company values",
    "toneGuidance": "suggested tone for the CV (e.g., formal, innovative, results-driven)",
    "keyMatches": ["areas where a strong candidate should emphasize"],
    "gaps": ["common gaps candidates might have"]
  }
}`;

  return generateJSON<CompanyResearchResult>(prompt);
}

// Generate tailored CV content based on werbeflaechen data and job context
export async function generateCVContent(
  werbeflaechenData: Record<string, unknown>,
  jobContext?: {
    company?: string;
    position?: string;
    jobPosting?: string;
    companyResearch?: CompanyResearchResult;
  },
  language: 'en' | 'de' = 'en',
  sections?: string[]
): Promise<GeneratedCVContent> {
  const languageInstructions = language === 'de'
    ? 'Generate all content in German (Deutsch).'
    : 'Generate all content in English.';

  const sectionsToGenerate = sections || ['tagline', 'profile'];

  const prompt = `You are an expert CV writer. Generate professional CV content based on the provided self-marketing data.

${languageInstructions}

Self-Marketing Data (Werbeflaechen):
${JSON.stringify(werbeflaechenData, null, 2)}

${jobContext ? `
Target Job Context:
- Company: ${jobContext.company || 'Not specified'}
- Position: ${jobContext.position || 'Not specified'}
${jobContext.jobPosting ? `- Job Description: ${jobContext.jobPosting.slice(0, 2000)}...` : ''}
${jobContext.companyResearch ? `
- Company Research:
  - Industry: ${jobContext.companyResearch.company.industry || 'Unknown'}
  - What they value: ${jobContext.companyResearch.insights?.whatTheyValue || 'Unknown'}
  - Key skills needed: ${jobContext.companyResearch.role.requiredSkills?.join(', ') || 'Unknown'}
  - Tone guidance: ${jobContext.companyResearch.insights?.toneGuidance || 'Professional'}
` : ''}
` : ''}

Generate content for these sections: ${sectionsToGenerate.join(', ')}

Return a JSON object with this structure:
{
  ${sectionsToGenerate.includes('tagline') ? '"tagline": "A compelling one-line professional tagline",' : ''}
  ${sectionsToGenerate.includes('profile') ? '"profile": "A 3-4 sentence professional summary highlighting key strengths and value proposition",' : ''}
  ${sectionsToGenerate.includes('slogan') ? '"slogan": "A memorable personal slogan or motto"' : ''}
}

Guidelines:
- Be concise but impactful
- Use active voice and strong action verbs
- Quantify achievements where possible
- Tailor content to the target job if context is provided
- Focus on value delivered, not just responsibilities
- Make the tagline memorable and specific to the person's expertise`;

  return generateJSON<GeneratedCVContent>(prompt);
}

// Regenerate a single section of the CV
export async function regenerateSection(
  section: string,
  currentContent: string,
  werbeflaechenData: Record<string, unknown>,
  jobContext?: {
    company?: string;
    position?: string;
    companyResearch?: CompanyResearchResult;
  },
  customInstructions?: string,
  language: 'en' | 'de' = 'en'
): Promise<string> {
  const languageInstructions = language === 'de'
    ? 'Generate content in German (Deutsch).'
    : 'Generate content in English.';

  const prompt = `You are an expert CV writer. Regenerate this CV section with a fresh perspective.

${languageInstructions}

Section to regenerate: ${section}

Current content:
${currentContent}

Self-Marketing Data:
${JSON.stringify(werbeflaechenData, null, 2)}

${jobContext ? `
Target Job:
- Company: ${jobContext.company || 'Not specified'}
- Position: ${jobContext.position || 'Not specified'}
${jobContext.companyResearch?.insights?.whatTheyValue ? `- What they value: ${jobContext.companyResearch.insights.whatTheyValue}` : ''}
` : ''}

${customInstructions ? `
Additional Instructions:
${customInstructions}
` : ''}

Generate a new version of this section that:
1. Takes a different angle or emphasis than the current content
2. Maintains professional quality
3. Is tailored to the target job if context is provided
4. Incorporates the custom instructions if provided

Return ONLY the new content for this section, no JSON wrapping, no explanations.`;

  return generateContent(prompt);
}

// Types for job posting URL parsing
export interface ParsedJobPosting {
  company: string;
  position: string;
  jobDescription: string;
  location?: string;
  employmentType?: string;
  salary?: string;
  contactName?: string;
  contactEmail?: string;
}

// Parse a job posting URL's HTML content to extract key information
export async function parseJobPostingUrl(
  htmlContent: string,
  sourceUrl: string
): Promise<ParsedJobPosting> {
  // Truncate HTML to avoid token limits (keep first 50k chars)
  const truncatedHtml = htmlContent.slice(0, 50000);

  const prompt = `You are an expert at extracting job posting information from HTML content.

Analyze this HTML content from a job posting page and extract the key information.

Source URL: ${sourceUrl}

HTML Content:
${truncatedHtml}

Extract and return a JSON object with this structure:
{
  "company": "The company name posting the job",
  "position": "The job title/position",
  "jobDescription": "The full job description including responsibilities, requirements, qualifications - extract all relevant text, formatted cleanly without HTML",
  "location": "Job location if specified (optional)",
  "employmentType": "Full-time, Part-time, Contract, etc. if specified (optional)",
  "salary": "Salary range if specified (optional)",
  "contactName": "Name of the hiring manager or recruiter if mentioned (optional)",
  "contactEmail": "Contact email for applications if mentioned (optional)"
}

Guidelines:
- Extract the company name from the page content, URL, or meta tags
- Get the exact job title as listed
- For jobDescription, include: role overview, responsibilities, requirements, qualifications, nice-to-haves, benefits - clean text only
- Look for contact information like "Contact:", "Hiring Manager:", "Recruiter:", or email addresses
- If a field is not found or unclear, use an empty string
- Keep the jobDescription comprehensive but clean (no HTML tags, no excessive whitespace)`;

  return generateJSON<ParsedJobPosting>(prompt);
}

// Types for certification document extraction
export interface ExtractedCertificationData {
  name: string | null;
  issuer: string | null;
  date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  url: string | null;
}

export interface CertificationExtraction {
  extractedData: ExtractedCertificationData;
  confidence: {
    name: number;
    issuer: number;
    date: number;
    expiry_date: number;
    credential_id: number;
    url: number;
  };
  reasoning: string;
}

// Extract certification data from a document image or PDF
export async function extractCertificationData(
  fileBuffer: Buffer,
  mimeType: string,
  modelName: GeminiModel = 'gemini-2.0-flash'
): Promise<CertificationExtraction> {
  const model = getModel(modelName);

  const prompt = `You are analyzing a certification document to extract structured information. Think carefully about what you see in the image.

Your task is to extract the following fields:

1. **Certification Name** - The official full name of the certification (e.g., "AWS Certified Solutions Architect - Associate")
   - Look for prominent titles, headers, or the main certification text
   - Include any level indicators (Associate, Professional, Expert, etc.)

2. **Issuing Organization** - The company or institution that issued this certificate (e.g., "Amazon Web Services", "Microsoft", "Google Cloud")
   - Look for logos, organization names, or issuer information
   - Use the full official name when possible

3. **Issue Date** - When the certification was issued (format: YYYY-MM)
   - Look for "Issued:", "Date:", "Completion Date:", etc.
   - If only year is visible, use YYYY-01
   - If no date is found, return null

4. **Expiry Date** - When the certification expires (format: YYYY-MM)
   - Look for "Expires:", "Valid Until:", "Expiration Date:", etc.
   - If it says "Does not expire" or "No expiration", return null
   - If only year is visible, use YYYY-12
   - If no expiry information is found, return null

5. **Credential ID** - Any unique identifier, certificate number, or credential ID
   - Look for "ID:", "Certificate #:", "Credential ID:", serial numbers, etc.
   - May be alphanumeric codes, often near the bottom of the certificate

6. **Verification URL** - Any URL for verifying the certification
   - Look for "Verify at:", URLs, web addresses, or QR codes
   - If there's a QR code, try to identify if there's an associated URL visible
   - Return null if no verification method is visible

For each field, assign a confidence score (0.0 to 1.0):
- 1.0 = Absolutely certain, text is crystal clear
- 0.9 = Very confident, clearly visible
- 0.8 = Confident, minor ambiguity
- 0.7 = Moderately confident, some uncertainty
- 0.5 = Low confidence, text is unclear or partially obscured
- 0.0 = No information found or completely unreadable

Be conservative with high confidence scores. Only use 0.8+ when the text is very clear and unambiguous.

IMPORTANT FORMATTING:
- All dates MUST be in YYYY-MM format (e.g., "2024-03" not "March 2024")
- Use null (not empty string) for fields you cannot extract
- Think step by step about what you see before making extractions

Return your response as ONLY valid JSON (no markdown, no explanations outside the JSON):
{
  "extractedData": {
    "name": "string" | null,
    "issuer": "string" | null,
    "date": "YYYY-MM" | null,
    "expiry_date": "YYYY-MM" | null,
    "credential_id": "string" | null,
    "url": "string" | null
  },
  "confidence": {
    "name": 0.0-1.0,
    "issuer": 0.0-1.0,
    "date": 0.0-1.0,
    "expiry_date": 0.0-1.0,
    "credential_id": 0.0-1.0,
    "url": 0.0-1.0
  },
  "reasoning": "Brief explanation of what you observed and any challenges in extraction"
}`;

  // Use Gemini Vision API
  const base64Data = fileBuffer.toString('base64');
  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();

  // Clean and parse JSON
  let cleanedText = text.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7);
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  return JSON.parse(cleanedText) as CertificationExtraction;
}

// Types for cover letter generation
export interface GeneratedCoverLetterContent {
  subject?: string;
  greeting?: string;
  opening?: string;
  body?: string;
  closing?: string;
}

// Generate cover letter content
export async function generateCoverLetter(
  werbeflaechenData: Record<string, unknown>,
  cvContent?: Record<string, unknown>,
  jobContext?: {
    company?: string;
    position?: string;
    companyResearch?: CompanyResearchResult;
  },
  userProfile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  },
  language: 'en' | 'de' = 'en'
): Promise<GeneratedCoverLetterContent> {
  const languageInstructions = language === 'de'
    ? 'Generate the cover letter in German (Deutsch). Use formal German business letter conventions.'
    : 'Generate the cover letter in English. Use professional business letter conventions.';

  const prompt = `You are an expert cover letter writer. Generate a compelling, personalized cover letter.

${languageInstructions}

${userProfile ? `
Applicant Information:
- Name: ${userProfile.firstName || ''} ${userProfile.lastName || ''}
- Email: ${userProfile.email || ''}
- Phone: ${userProfile.phone || ''}
` : ''}

${jobContext?.company ? `
Target Company: ${jobContext.company}
Target Position: ${jobContext.position || 'Not specified'}
` : ''}

${jobContext?.companyResearch ? `
Company Research:
${JSON.stringify(jobContext.companyResearch, null, 2)}
` : ''}

${cvContent ? `
CV/Resume Content:
${JSON.stringify(cvContent, null, 2)}
` : ''}

Self-Marketing Data (Werbeflaechen):
${JSON.stringify(werbeflaechenData, null, 2)}

Generate a cover letter with these sections:
1. subject: A compelling subject line for the application
2. greeting: Professional greeting (use hiring manager name if known, otherwise generic)
3. opening: Strong opening paragraph that hooks the reader and mentions the position
4. body: 2-3 paragraphs highlighting relevant experience, skills, and why you're a good fit
5. closing: Call to action and professional closing

Guidelines:
- Be specific and avoid generic phrases
- Connect your experience to the company's needs
- Show enthusiasm without being over the top
- Keep total length to about 300-400 words
- Make it personal and authentic

Return as JSON:
{
  "subject": "...",
  "greeting": "...",
  "opening": "...",
  "body": "...",
  "closing": "..."
}`;

  return generateJSON<GeneratedCoverLetterContent>(prompt);
}
