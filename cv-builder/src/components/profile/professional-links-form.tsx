'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfessionalLinksFormProps {
  formData: {
    linkedinUrl: string;
    githubUrl: string;
    websiteUrl: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfessionalLinksForm({ formData, onChange }: ProfessionalLinksFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Links</CardTitle>
        <CardDescription>
          Add links to your professional profiles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            type="url"
            value={formData.linkedinUrl}
            onChange={onChange}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            value={formData.githubUrl}
            onChange={onChange}
            placeholder="https://github.com/yourusername"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Personal Website</Label>
          <Input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            value={formData.websiteUrl}
            onChange={onChange}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </CardContent>
    </Card>
  );
}
