import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON, GeminiModel } from '@/lib/ai/gemini';
import { validateBody, errorResponse } from '@/lib/api-utils';
import { AutofillWerbeflaechenSchema } from '@/types/api.schemas';
import type { CategoryKey } from '@/types/werbeflaechen.types';

interface ExtractedWerbeflaechen {
  kurzprofil?: {
    summary?: string;
    professionalTitle?: string;
    yearsExperience?: number;
  };
  berufliche_erfahrungen?: {
    experiences?: Array<{
      company: string;
      title: string;
      location?: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      description?: string;
      bullets?: string[];
    }>;
  };
  aus_weiterbildungen?: {
    education?: Array<{
      institution: string;
      degree: string;
      field?: string;
      startDate: string;
      endDate?: string;
      description?: string;
    }>;
    certifications?: Array<{
      name: string;
      issuer?: string;
      date?: string;
    }>;
  };
  kernkompetenzen?: {
    skills?: Array<{
      category: string;
      items: string[];
    }>;
  };
  schluesselkompetenzen?: {
    softSkills?: string[];
    competencies?: Array<{
      name: string;
      level?: string;
    }>;
  };
  erfolge?: {
    achievements?: Array<{
      title: string;
      description: string;
      metric?: string;
    }>;
  };
  projekte?: {
    projects?: Array<{
      name: string;
      description: string;
      role?: string;
      technologies?: string[];
      outcome?: string;
    }>;
  };
  highlights?: {
    highlights?: Array<{
      title: string;
      description: string;
    }>;
  };
  slogan?: {
    slogan?: string;
    tagline?: string;
  };
  motivation?: {
    whatDrivesYou?: string;
    whyThisField?: string;
    careerGoals?: string;
  };
  usp?: {
    uniqueSellingPoints?: Array<{
      title: string;
      description: string;
    }>;
  };
  referenzen?: {
    references?: Array<{
      name: string;
      title: string;
      company: string;
      relationship?: string;
      quote?: string;
    }>;
  };
}

// Row mapping for categories
const CATEGORY_ROWS: Record<CategoryKey, number> = {
  vision_mission: 1,
  motivation: 1,
  passion: 1,
  slogan: 1,
  zitat_motto: 1,
  highlights: 1,
  erfolge: 2,
  mehrwert: 2,
  projekte: 2,
  referenzen: 2,
  usp: 2,
  corporate_design: 2,
  erfahrungswissen: 3,
  kernkompetenzen: 3,
  schluesselkompetenzen: 3,
  kurzprofil: 3,
  berufliche_erfahrungen: 3,
  aus_weiterbildungen: 3,
};

// POST /api/werbeflaechen/autofill - Extract CV data and autofill werbeflaechen
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const data = await validateBody(request, AutofillWerbeflaechenSchema);
    const {
      cvText,
      language = 'en',
      model = 'gemini-2.0-flash',
      overwrite = false,
    } = data;

    // Extract werbeflaechen data from CV using AI
    const extractedData = await extractWerbeflaechenFromCV(
      cvText,
      language,
      model as GeminiModel
    );

    // Get existing entries if not overwriting
    let existingCategories: Set<string> = new Set();
    if (!overwrite) {
      const { data: existing } = await supabase
        .from('werbeflaechen_entries')
        .select('category_key')
        .eq('user_id', user.id)
        .eq('language', language);

      if (existing) {
        existingCategories = new Set(existing.map(e => e.category_key));
      }
    }

    // Upsert the extracted data
    const savedCategories: string[] = [];

    for (const [categoryKey, content] of Object.entries(extractedData)) {
      if (!content || Object.keys(content).length === 0) continue;

      // Skip if not overwriting and entry exists
      if (!overwrite && existingCategories.has(categoryKey)) {
        continue;
      }

      const row_number = CATEGORY_ROWS[categoryKey as CategoryKey];
      if (!row_number) continue;

      const entry = {
        user_id: user.id,
        language,
        category_key: categoryKey,
        row_number,
        content,
        is_complete: hasSubstantialContent(content),
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from('werbeflaechen_entries')
        .upsert(entry, {
          onConflict: 'user_id,language,category_key',
        });

      savedCategories.push(categoryKey);
    }

    return NextResponse.json({
      success: true,
      savedCategories,
      extractedData,
      message: `Successfully populated ${savedCategories.length} categories`,
    });
  } catch (error) {
    console.error('Werbeflaechen autofill error:', error);
    return errorResponse(error);
  }
}

async function extractWerbeflaechenFromCV(
  cvText: string,
  language: 'en' | 'de',
  model: GeminiModel
): Promise<ExtractedWerbeflaechen> {
  const languageNote = language === 'de'
    ? 'The CV is in German. Extract and return data in German.'
    : 'Extract and return data in English.';

  const prompt = `You are an expert CV analyzer. Extract structured information from this CV/resume and organize it into the Werbeflaechen (self-marketing) framework categories.

${languageNote}

CV/Resume Text:
${cvText}

Extract information into these categories (only include categories where you find relevant data):

1. kurzprofil (Short Profile):
   - summary: Professional summary/objective
   - professionalTitle: Current or target job title
   - yearsExperience: Years of professional experience (number)

2. berufliche_erfahrungen (Professional Experience):
   - experiences: Array of work experiences with company, title, location, startDate, endDate, current (boolean), description, bullets[]

3. aus_weiterbildungen (Education & Training):
   - education: Array with institution, degree, field, startDate, endDate, description
   - certifications: Array with name, issuer, date

4. kernkompetenzen (Core/Technical Skills):
   - skills: Array of {category: "Category Name", items: ["skill1", "skill2"]}

5. schluesselkompetenzen (Key/Soft Competencies):
   - softSkills: Array of soft skill names
   - competencies: Array of {name, level} where level is beginner/intermediate/advanced/expert

6. erfolge (Achievements):
   - achievements: Array of {title, description, metric} - focus on quantifiable accomplishments

7. projekte (Projects):
   - projects: Array of {name, description, role, technologies[], outcome}

8. highlights (Career Highlights):
   - highlights: Array of {title, description} - standout moments/awards

9. slogan (Tagline):
   - slogan: A professional slogan derived from the CV
   - tagline: A one-line professional tagline

10. motivation (Motivation):
    - whatDrivesYou: What motivates this person (inferred from CV)
    - whyThisField: Why they chose this career field
    - careerGoals: Career aspirations if mentioned

11. usp (Unique Selling Points):
    - uniqueSellingPoints: Array of {title, description} - what makes this person unique

12. referenzen (References):
    - references: Array of {name, title, company, relationship, quote} if mentioned

Return ONLY valid JSON with the extracted data. Use null or empty arrays for categories with no relevant data found.
Format dates as YYYY-MM or YYYY-MM-DD where possible.`;

  return generateJSON<ExtractedWerbeflaechen>(prompt, model);
}

function hasSubstantialContent(content: Record<string, unknown>): boolean {
  for (const value of Object.values(content)) {
    if (Array.isArray(value) && value.length > 0) return true;
    if (typeof value === 'string' && value.trim().length > 0) return true;
    if (typeof value === 'number') return true;
  }
  return false;
}
