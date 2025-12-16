'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LEGAL_CONFIG } from '@/config/legal';

interface TermsOfServiceContentProps {
  compact?: boolean;
}

export function TermsOfServiceContent({ compact = false }: TermsOfServiceContentProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Table of contents items
  const tocItems = [
    { id: 'intro', label: 'Introduction' },
    { id: 'section-1', label: '1. Acceptance of Terms' },
    { id: 'section-2', label: '2. Description of Service' },
    { id: 'section-3', label: '3. User Accounts' },
    { id: 'section-4', label: '4. User Content' },
    { id: 'section-5', label: '5. AI-Generated Content' },
    { id: 'section-6', label: '6. Prohibited Uses' },
    { id: 'section-7', label: '7. Termination' },
    { id: 'section-8', label: '8. Disclaimer of Warranties' },
    { id: 'section-9', label: '9. Limitation of Liability' },
    { id: 'section-10', label: '10. Changes to Terms' },
    { id: 'section-11', label: '11. Contact' },
  ];

  return (
    <div className={compact ? 'max-w-2xl' : 'max-w-6xl mx-auto'}>

      {/* Metadata Card */}
      <Card className="bg-muted/50 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
            <span>
              Last Updated: {LEGAL_CONFIG.termsOfService.lastUpdated}
            </span>
            <span>
              Version: {LEGAL_CONFIG.termsOfService.version}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout: TOC + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Table of Contents (Desktop Sidebar) */}
        {!compact && (
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-4">
              <h3 className="font-semibold mb-4 text-sm">
                Table of Contents
              </h3>
              <nav className="space-y-1">
                {tocItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left py-1 px-2 text-sm hover:text-primary hover:bg-muted rounded-md transition-colors text-muted-foreground"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Content */}
        <main className={compact ? 'col-span-1' : 'lg:col-span-3'}>
          {/* Mobile TOC (Collapsible) */}
          {!compact && (
            <div className="lg:hidden mb-6">
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted rounded-lg hover:bg-muted/80">
                  <span className="font-semibold">
                    Table of Contents
                  </span>
                  <ChevronDown className="h-5 w-5" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pt-2">
                  <nav className="space-y-1">
                    {tocItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="block w-full text-left py-1 px-2 text-sm hover:text-primary hover:bg-muted rounded-md"
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Terms Content */}
          <EnglishTerms />
        </main>
      </div>

      {/* Scroll to Top Button */}
      {!compact && showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-lg z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

// Terms of Service Content Component
function EnglishTerms() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert space-y-6">
      <section id="intro">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100 mb-0">
              <strong>Welcome to CV Builder.</strong> These Terms of Service govern your use of our CV building platform. By using our service, you agree to these terms.
            </p>
          </CardContent>
        </Card>

        <p className="text-muted-foreground">
          <strong>Effective Date:</strong> {LEGAL_CONFIG.termsOfService.effectiveDate}
        </p>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-1" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using CV Builder, you agree to be bound by these Terms of Service and our Privacy Policy.
          If you do not agree to these terms, please do not use our service.
        </p>
        <p>
          You must be at least {LEGAL_CONFIG.minimumAge} years old to use this service.
        </p>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-2" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
        <p>CV Builder provides:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li><strong>CV Creation:</strong> Tools to build and customize professional CVs</li>
          <li><strong>Cover Letter Generation:</strong> AI-powered cover letter creation</li>
          <li><strong>Job Application Tracking:</strong> Organize and track your job search</li>
          <li><strong>AI-Powered Features:</strong> Content generation using Google Gemini AI (optional)</li>
          <li><strong>File Storage:</strong> Secure storage for your career documents</li>
          <li><strong>Public Sharing:</strong> Share your CV via public links</li>
        </ul>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-3" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">3.1 Account Creation</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must not share your account credentials</li>
              <li>One account per person</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">3.2 Account Security</h3>
            <p>
              You are responsible for all activities that occur under your account. Notify us immediately at{' '}
              <a href={`mailto:${LEGAL_CONFIG.supportEmail}`} className="text-primary hover:underline">
                {LEGAL_CONFIG.supportEmail}
              </a>{' '}
              if you suspect unauthorized access.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">3.3 Account Deletion</h3>
            <p>
              You may delete your account at any time from Settings. All your data will be permanently deleted within{' '}
              {LEGAL_CONFIG.dataRetention.backupDeletionDays} days.
            </p>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-4" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">4. User Content</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">4.1 Your Content</h3>
            <p>
              You retain all rights to the content you create (CVs, cover letters, profile data, documents).
              By using our service, you grant us a limited license to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Store and process your content to provide the service</li>
              <li>Send your content to Google Gemini AI when you use AI features</li>
              <li>Display your content when you create public share links</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">4.2 Content Standards</h3>
            <p>You agree that your content will not:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Contain false or misleading information</li>
              <li>Include malicious code or viruses</li>
              <li>Impersonate another person</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">4.3 Data Accuracy</h3>
            <p>
              You are responsible for the accuracy of information in your CVs and cover letters.
              We are not responsible for any consequences resulting from inaccurate information.
            </p>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-5" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">5. AI-Generated Content</h2>

        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900 mb-4">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-medium">When using AI features:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
              <li>AI-generated content is provided "as is" without guarantees</li>
              <li>You must review and verify all AI-generated content before use</li>
              <li>We are not responsible for the accuracy or quality of AI output</li>
              <li>AI features are subject to Google's AI Terms of Service</li>
            </ul>
          </CardContent>
        </Card>

        <p>
          <strong>Important:</strong> Always review AI-generated CVs and cover letters for accuracy,
          appropriateness, and compliance with job requirements before submission.
        </p>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-6" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">6. Prohibited Uses</h2>

        <p className="mb-2">You may not:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Use the service for any illegal purpose</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt the service</li>
          <li>Use automated tools to scrape or extract data</li>
          <li>Create fake or fraudulent CVs</li>
          <li>Upload malware or malicious code</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Impersonate another person or entity</li>
          <li>Harass, abuse, or harm others</li>
        </ul>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-7" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">7.1 By You</h3>
            <p>You may terminate your account at any time by deleting it from Settings.</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">7.2 By Us</h3>
            <p>We may suspend or terminate your account if:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>You violate these Terms of Service</li>
              <li>You engage in prohibited activities</li>
              <li>We are required to do so by law</li>
              <li>Your account has been inactive for an extended period</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">7.3 Effect of Termination</h3>
            <p>
              Upon termination, your right to use the service ends immediately.
              Your data will be deleted according to our data retention policy ({LEGAL_CONFIG.dataRetention.backupDeletionDays} days).
            </p>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-8" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>

        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-2">THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.</p>
            <p className="text-sm mb-0">
              We do not guarantee that the service will be uninterrupted, error-free, or secure.
              We make no warranties regarding the accuracy, reliability, or quality of AI-generated content.
            </p>
          </CardContent>
        </Card>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-9" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>

        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-sm mb-0">
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>We are not liable for lost profits, data loss, or business interruption</li>
              <li>Our total liability is limited to the amount you paid us in the past 12 months</li>
              <li>We are not responsible for third-party services (Google AI, Supabase)</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-10" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li><strong>Notification:</strong> We will notify you by email of material changes</li>
          <li><strong>Effective date:</strong> Changes take effect 30 days after notification</li>
          <li><strong>Continued use:</strong> Using the service after changes constitutes acceptance</li>
          <li><strong>Disagreement:</strong> If you disagree, delete your account before the effective date</li>
        </ul>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-11" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Questions about Terms of Service?</h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${LEGAL_CONFIG.supportEmail}`} className="text-primary hover:underline">
                  {LEGAL_CONFIG.supportEmail}
                </a>
              </p>
              <p><strong>Subject:</strong> "Terms of Service Inquiry"</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <hr className="my-8 border-border" />

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-lg">Key Points</h3>
          <div className="space-y-2 text-sm">
            <p>✅ <strong>Your Content:</strong> You own your content and can delete it anytime</p>
            <p>✅ <strong>AI Optional:</strong> All AI features are optional to use</p>
            <p>✅ <strong>Your Responsibility:</strong> Review all content before use</p>
            <p>✅ <strong>No Warranties:</strong> Service provided "as is"</p>
            <p>✅ <strong>Limited Liability:</strong> We're not responsible for job outcomes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

