'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Sparkles } from 'lucide-react';

export default function CoverLetterPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cover Letters</h1>
        <p className="text-muted-foreground">
          AI-generated cover letters tailored to each job application
        </p>
      </div>

      {/* Coming soon placeholder */}
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Cover Letter Generator</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Create compelling, personalized cover letters based on your
            Werbeflaechen data and the specific job requirements.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Coming in Phase 6
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
