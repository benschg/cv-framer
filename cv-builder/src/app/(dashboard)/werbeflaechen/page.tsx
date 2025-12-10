'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Sparkles } from 'lucide-react';

export default function WerbeflaechenPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Werbeflaechen</h1>
        <p className="text-muted-foreground">
          Your self-marketing framework - the foundation for great CVs
        </p>
      </div>

      {/* Coming soon placeholder */}
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Werbeflaechen Framework</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Complete your 18-category self-marketing profile based on the Kanton
            Zurich method. This data powers AI-generated CVs and cover letters.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Coming in Phase 2
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
