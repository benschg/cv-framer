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

export interface ParseJobUrlResult {
  data?: ParsedJobPosting;
  error?: string;
}

export async function parseJobPostingUrl(url: string): Promise<ParseJobUrlResult> {
  try {
    const response = await fetch('/api/parse-job-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to parse job posting URL' };
    }

    return { data };
  } catch (error) {
    console.error('Error parsing job posting URL:', error);
    return { error: 'Failed to parse job posting URL' };
  }
}
