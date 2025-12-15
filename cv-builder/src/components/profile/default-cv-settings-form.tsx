'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DefaultCvSettingsFormProps {
  defaultTagline: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DefaultCvSettingsForm({ defaultTagline, onChange }: DefaultCvSettingsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Default CV Settings</CardTitle>
        <CardDescription>
          Set default values for new CVs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="defaultTagline">Default Tagline</Label>
          <Input
            id="defaultTagline"
            name="defaultTagline"
            value={defaultTagline}
            onChange={onChange}
            placeholder="e.g., Senior Software Engineer | React & Node.js"
          />
          <p className="text-xs text-muted-foreground">
            This will be used as the default tagline for new CVs
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
