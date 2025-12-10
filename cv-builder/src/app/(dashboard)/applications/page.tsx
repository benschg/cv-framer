'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Sparkles } from 'lucide-react';

export default function ApplicationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground">
          Track and manage your job applications
        </p>
      </div>

      {/* Coming soon placeholder */}
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Application Tracker</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Keep track of all your job applications with status updates,
            deadlines, and AI-powered fit analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Coming in Phase 7
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
