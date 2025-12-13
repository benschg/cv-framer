import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJSON, GeminiModel } from '@/lib/ai/gemini';
import { validateBody, errorResponse } from '@/lib/api-utils';
import { AutofillWerbeflaechenSchema } from '@/types/api.schemas';
import type { CategoryKey } from '@/types/werbeflaechen.types';

interface CategoryExtraction {
  content: Record<string, unknown>;
  ai_reasoning: Record<string, string>;
  cv_coverage: number;
  fit_reasoning: string;
}

interface ExtractedWerbeflaechen {
  // Row 1: Will you love the job?
  vision_mission?: CategoryExtraction;
  motivation?: CategoryExtraction;
  passion?: CategoryExtraction;
  slogan?: CategoryExtraction;
  zitat_motto?: CategoryExtraction;
  highlights?: CategoryExtraction;
  // Row 2: Can you do the job?
  erfolge?: CategoryExtraction;
  mehrwert?: CategoryExtraction;
  projekte?: CategoryExtraction;
  referenzen?: CategoryExtraction;
  usp?: CategoryExtraction;
  corporate_design?: CategoryExtraction;
  // Row 3: Can we work together?
  erfahrungswissen?: CategoryExtraction;
  kernkompetenzen?: CategoryExtraction;
  schluesselkompetenzen?: CategoryExtraction;
  kurzprofil?: CategoryExtraction;
  berufliche_erfahrungen?: CategoryExtraction;
  aus_weiterbildungen?: CategoryExtraction;
}

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await validateBody(request, AutofillWerbeflaechenSchema);
    const {
      cvText,
      language = 'en',
      model = 'gemini-2.0-flash',
      overwrite = false,
    } = data;

    const extractedData = await extractWerbeflaechenFromCV(
      cvText,
      language,
      model as GeminiModel
    );

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

    const savedCategories: string[] = [];

    for (const [categoryKey, extraction] of Object.entries(extractedData)) {
      if (!extraction || !extraction.content || Object.keys(extraction.content).length === 0) continue;

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
        content: extraction.content,
        ai_reasoning: extraction.ai_reasoning,
        cv_coverage: extraction.cv_coverage,
        fit_reasoning: extraction.fit_reasoning,
        is_complete: hasSubstantialContent(extraction.content),
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

For EACH category, provide:
1. "content": The extracted data for that category
2. "ai_reasoning": For each field in content, explain WHY you extracted/inferred that value (key = field name, value = reasoning)
3. "cv_coverage": Score 1-10 how well the CV covers this category (10 = excellent coverage, 1 = almost no relevant data)
4. "fit_reasoning": Brief explanation of the coverage score

Categories to extract (organized by row):

=== ROW 1: "Will you love the job?" ===

1. vision_mission (Vision & Mission):
   content: { vision, mission, longTermGoals }
   - Infer from career trajectory, stated objectives, or professional summary

2. motivation (Motivation):
   content: { whatDrivesYou, whyThisField, careerGoals }
   - Infer from CV tone, career choices, and any stated objectives

3. passion (Passion):
   content: { professionalPassions, excitingAspects, sideProjects }
   - Infer from side projects, volunteering, interests, or enthusiastic language

4. slogan (Tagline/Slogan):
   content: { slogan, tagline }
   - Create a compelling professional tagline based on their profile

5. zitat_motto (Quote/Motto):
   content: { quote, source, personalMotto }
   - Extract any quotes mentioned, or infer a fitting motto from their approach

6. highlights (Career Highlights):
   content: { highlights: [{title, description}] }
   - Top 3-5 most impressive achievements or career moments

=== ROW 2: "Can you do the job?" ===

7. erfolge (Achievements):
   content: { achievements: [{title, description, metric}] }
   - Quantifiable accomplishments with metrics where possible

8. mehrwert (Added Value):
   content: { valueProposition, uniqueContributions, impactAreas }
   - What unique value they bring to employers

9. projekte (Projects):
   content: { projects: [{name, description, role, technologies[], outcome}] }
   - Notable projects with outcomes

10. referenzen (References):
    content: { references: [{name, title, company, relationship, quote}] }
    - Any mentioned references or testimonials

11. usp (Unique Selling Points):
    content: { uniqueSellingPoints: [{title, description}] }
    - What makes them stand out from other candidates

12. corporate_design (Personal Branding):
    content: { brandKeywords, professionalImage, communicationStyle }
    - Infer their professional brand from CV tone and presentation

=== ROW 3: "Can we work together?" ===

13. erfahrungswissen (Experiential Knowledge):
    content: { industryInsights, lessonsLearned, expertiseAreas }
    - Deep knowledge gained through experience

14. kernkompetenzen (Core/Technical Skills):
    content: { skills: [{category, items[]}] }
    - Technical and hard skills grouped by category

15. schluesselkompetenzen (Key/Soft Competencies):
    content: { softSkills[], competencies: [{name, level}] }
    - Interpersonal and soft skills

16. kurzprofil (Short Profile):
    content: { summary, professionalTitle, yearsExperience }
    - Concise professional summary

17. berufliche_erfahrungen (Professional Experience):
    content: { experiences: [{company, title, location, startDate, endDate, current, description, bullets[]}] }
    - Full work history

18. aus_weiterbildungen (Education & Training):
    content: { education: [{institution, degree, field, startDate, endDate, description}], certifications: [{name, issuer, date}] }
    - Education and certifications

Return JSON with all 18 categories. Example structure:
{
  "vision_mission": {
    "content": { "vision": "...", "mission": "...", "longTermGoals": "..." },
    "ai_reasoning": { "vision": "Inferred from career progression showing...", "mission": "..." },
    "cv_coverage": 5,
    "fit_reasoning": "CV hints at direction but no explicit vision statement"
  },
  "kurzprofil": {
    "content": { "summary": "...", "professionalTitle": "...", "yearsExperience": 10 },
    "ai_reasoning": { "summary": "Extracted from objective section...", "professionalTitle": "..." },
    "cv_coverage": 8,
    "fit_reasoning": "CV has clear summary and title, years calculated from experience dates"
  },
  ... (include all 18 categories)
}

IMPORTANT:
- Include ALL 18 categories in the response
- For categories where CV has no data, still include them with cv_coverage: 1-3 and infer what you can
- Be creative in inferring motivation, passion, vision from career choices and CV tone
- Generate a compelling slogan and motto even if not explicitly stated`;

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
