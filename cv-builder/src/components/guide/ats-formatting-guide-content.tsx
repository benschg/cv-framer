import { CheckCircle2, XCircle, FileType, Search, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export function ATSFormattingGuideContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <Badge variant="secondary" className="mb-2">
          Guide
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          ATS Formatting Guide
        </h1>
        <p className="text-xl text-muted-foreground">
          Learn how to optimize your CV for Applicant Tracking Systems to increase your chances of getting noticed by recruiters.
        </p>
      </div>

      {/* What is ATS Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            What is Resume Parsing?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Resume/CV parsing is an important feature of many Applicant Tracking Systems (ATS).
            The ability to parse resumes allows for the automatic extraction, storage, and analysis of resume data.
          </p>
          <p className="text-muted-foreground">
            The system helps candidates populate application fields automatically and assists recruiters in
            identifying potential job matches. Companies use parsed data primarily to help applicants complete
            applications and suggest relevant positions.
          </p>
        </CardContent>
      </Card>

      {/* Alert Box */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Pro Tip</AlertTitle>
        <AlertDescription>
          Many professionals maintain two versions of their CV: one optimized for ATS parsing
          and another with enhanced visual design for direct human review.
        </AlertDescription>
      </Alert>

      {/* Elements to Avoid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Elements to Avoid
          </CardTitle>
          <CardDescription>
            These formatting elements can confuse ATS systems and may cause your CV to be incorrectly parsed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Tables',
              'Text boxes',
              'Logos, images, and graphics',
              'Multiple columns',
              'Headers and footers',
              'Uncommon section headings',
              'Hyperlinks on important terms',
              'Uncommon or decorative fonts'
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Elements to Use */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Acceptable Formatting Elements
          </CardTitle>
          <CardDescription>
            These formatting options are safe to use and will be correctly parsed by most ATS systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Bold text for emphasis',
              'Italics for titles or subtle emphasis',
              'Underlines (particularly in headings)',
              'Standard bullet points',
              'Colors (note: ATS will convert all text to the same color)'
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Best Practices Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* File Format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileType className="h-5 w-5" />
              File Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-900 dark:text-green-100">Recommended: .docx</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                .docx format is the most accurately parsed by ATS systems
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              While PDFs preserve formatting better for human readers, .docx files are better for ATS parsing.
            </p>
          </CardContent>
        </Card>

        {/* Fonts */}
        <Card>
          <CardHeader>
            <CardTitle>Font Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Stick to universal, professional fonts that ATS systems recognize:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Arial', 'Helvetica', 'Times New Roman', 'Garamond', 'Georgia', 'Cambria'].map((font) => (
                <Badge key={font} variant="secondary">
                  {font}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanning Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Scanning Strategy</CardTitle>
          <CardDescription>
            How ATS systems read your CV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Like a human reader, ATS systems scan from left to right and top to bottom.
            Structure your CV to accommodate this reading pattern:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>Use chronological or combination resume formats (avoid functional layouts)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>Place contact information at the top of the page</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>List your most recent positions first</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Keywords Matter</CardTitle>
          <CardDescription>
            Strategic keyword placement is crucial for ATS success
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            ATS systems search for specific keywords related to the job requirements. To optimize your CV:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>Include hard skills that match the job posting</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>Pay special attention to keywords that appear multiple times in the job description</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span>Focus on terms near the requirements section</span>
            </li>
          </ul>
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Misspelling certain words and phrases could immediately disqualify your resume.
              Always proofread carefully, especially for technical terms and job-specific keywords.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Source Attribution */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Source Attribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            This guide is based on information from Roche's Resume Parsing FAQ, which provides
            valuable insights into how major employers use ATS systems.
          </p>
          <a
            href="https://careers.roche.com/global/en/resume-parsing-faq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            View Original Source at Roche Careers
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-bold">
              Ready to Create an ATS-Optimized CV?
            </h3>
            <p className="text-primary-foreground/90">
              Our CV Builder automatically formats your resume to be ATS-friendly while maintaining a professional appearance.
            </p>
            <div className="flex gap-4 justify-center pt-2">
              <a href="/cv" className="inline-flex items-center justify-center rounded-md bg-primary-foreground text-primary px-6 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                Create Your CV
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
