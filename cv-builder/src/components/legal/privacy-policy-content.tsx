'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ArrowUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LEGAL_CONFIG } from '@/config/legal';

interface PrivacyPolicyContentProps {
  compact?: boolean;
}

export function PrivacyPolicyContent({ compact = false }: PrivacyPolicyContentProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to show/hide scroll-to-top button
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
    { id: 'introduction', label: 'Introduction' },
    { id: 'section-1', label: '1. Information We Collect' },
    { id: 'section-2', label: '2. How We Use Your Information' },
    { id: 'section-3', label: '3. Data Storage and Security' },
    { id: 'section-4', label: '4. Third-Party Services' },
    { id: 'section-5', label: '5. Your Privacy Rights' },
    { id: 'section-6', label: '6. Cookies and Tracking' },
    { id: 'section-7', label: '7. Children\'s Privacy' },
    { id: 'section-8', label: '8. International Data Transfers' },
    { id: 'section-9', label: '9. Sharing Your Data' },
    { id: 'section-10', label: '10. Changes to This Policy' },
    { id: 'section-11', label: '11. Contact Us' },
  ];

  return (
    <div className={compact ? 'max-w-2xl' : 'max-w-6xl mx-auto'}>

      {/* Metadata Card */}
      <Card className="bg-muted/50 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
            <span>
              Last Updated: {LEGAL_CONFIG.privacyPolicy.lastUpdated}
            </span>
            <span>
              Version: {LEGAL_CONFIG.privacyPolicy.version}
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

          {/* Privacy Policy Content */}
          <EnglishPrivacyPolicy />
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

// English Privacy Policy Content Component
function EnglishPrivacyPolicy() {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert space-y-6">
      <section id="introduction">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100 mb-0">
              <strong>Welcome to CV Builder.</strong> We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we collect, use, store, and protect your information when you use our CV building platform.
            </p>
          </CardContent>
        </Card>

        <p className="text-muted-foreground">
          This policy applies to all users of our service and complies with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
        </p>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-1" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">1.1 Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Email address</strong> (required for both Email OTP and Google OAuth authentication)</li>
              <li><strong>Authentication data</strong> including login timestamps and session tokens</li>
              <li><strong>Google profile information</strong> (if you choose Google sign-in): name, profile picture, and Google user ID</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">1.2 Profile Information</h3>
            <p>You provide the following professional information:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Basic details:</strong> First name, last name, phone number, location, timezone</li>
              <li><strong>Professional links:</strong> LinkedIn, GitHub, personal website, portfolio URLs</li>
              <li><strong>Profile photos:</strong> Images you upload (stored in a <strong>public storage bucket</strong>)</li>
              <li><strong>Professional summary:</strong> Your tagline and biography</li>
              <li><strong>Language preference:</strong> English or German</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">1.3 Career Data</h3>
            <p>We store career information you provide about:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your work experience and employment history</li>
              <li>Your education and qualifications</li>
              <li>Your professional skills and competences</li>
              <li>Certifications and professional references (including uploaded documents)</li>
              <li>Other career-related information you choose to add</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">1.4 Documents & Files</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>CV Documents:</strong> Generated CVs with custom formatting, templates, and display settings</li>
              <li><strong>Cover Letters:</strong> AI-generated or manually written cover letters</li>
              <li><strong>Job Applications:</strong> Company names, job titles, URLs, descriptions, application status</li>
              <li><strong>Uploaded Files:</strong> PDF, DOCX, TXT files (max 5-10MB) for CV data extraction</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">1.5 Share Link Analytics</h3>
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <CardContent className="p-4">
                <p className="text-sm mb-2">When you create a public share link for your CV, we collect <strong>limited analytics</strong>:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li><strong>Visitor IP address</strong></li>
                  <li><strong>User agent</strong> (browser and device type)</li>
                  <li><strong>HTTP referrer</strong> (source of the visit)</li>
                  <li><strong>Visit timestamp</strong> and view count</li>
                </ul>
                <p className="text-sm mt-2 mb-0">
                  <strong>Note:</strong> This is the <strong>only analytics</strong> we collect. We do <strong>not</strong> use Google Analytics, tracking pixels, or third-party advertising cookies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-2" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">2.1 Core Services</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Account management:</strong> Create, secure, and maintain your account</li>
              <li><strong>CV generation:</strong> Build professional CVs and cover letters</li>
              <li><strong>Content storage:</strong> Save your profile, career data, and documents securely</li>
              <li><strong>Job application tracking:</strong> Organize and track your job search progress</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">2.2 AI-Powered Features</h3>
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium">We use <strong>Google Gemini AI</strong> to enhance your experience:</p>

                <div>
                  <p className="text-sm font-medium mb-1">Data sent to AI services:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>Your profile and career information</li>
                    <li>Your CV content and cover letters</li>
                    <li>Job postings you paste for analysis</li>
                    <li>Uploaded files (PDFs, images) for data extraction</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">AI features available throughout the application:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>CV and cover letter content generation</li>
                    <li>Document analysis and data extraction</li>
                    <li>Job matching and fit analysis</li>
                    <li>Content optimization suggestions</li>
                  </ul>
                </div>

                <p className="text-sm mb-0">
                  <strong>Your control:</strong> All AI features are optional. You can create all content manually without using AI generation.
                </p>

                <p className="text-sm mb-0 text-muted-foreground">
                  <strong>Important:</strong> Data sent to Google may be processed according to{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Google's Privacy Policy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {' '}and{' '}
                  <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    AI Terms of Service
                    <ExternalLink className="h-3 w-3" />
                  </a>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-3" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">3. Data Storage and Security</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">3.1 Storage Infrastructure</h3>
            <p>We use secure cloud storage for your data.</p>
            <p className="mt-2"><strong>Location:</strong> {LEGAL_CONFIG.dataLocation}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">3.2 Security Measures</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Users can only access their own data</li>
              <li>All data transmitted via encrypted connections (HTTPS/TLS)</li>
              <li>Secure authentication methods</li>
              <li>Automatic data deletion when you delete your account</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">3.3 Data Retention</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Active accounts:</strong> Data retained while your account is active</li>
              <li><strong>Account deletion:</strong> All data permanently deleted within {LEGAL_CONFIG.dataRetention.backupDeletionDays} days</li>
            </ul>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-4" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Supabase (Database, Auth, Storage)</h3>
              <ul className="text-sm space-y-1">
                <li><strong>Provider:</strong> Supabase Inc.</li>
                <li><strong>Purpose:</strong> Database, authentication, and file storage</li>
                <li><strong>Data shared:</strong> All application data</li>
                <li>
                  <strong>Privacy Policy:</strong>{' '}
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    supabase.com/privacy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Google Gemini AI</h3>
              <ul className="text-sm space-y-1">
                <li><strong>Provider:</strong> Google LLC</li>
                <li><strong>Purpose:</strong> AI content generation and document analysis</li>
                <li><strong>Data shared:</strong> Your content (when using AI features)</li>
                <li>
                  <strong>Privacy Policy:</strong>{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    policies.google.com/privacy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Google OAuth (Optional)</h3>
              <ul className="text-sm space-y-1">
                <li><strong>Provider:</strong> Google LLC</li>
                <li><strong>Purpose:</strong> Authentication only (no tracking or advertising)</li>
                <li><strong>Data shared:</strong> Only if you choose Google sign-in</li>
                <li>
                  <strong>Privacy Policy:</strong>{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    policies.google.com/privacy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-5" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">5. Your Privacy Rights</h2>

        <div className="space-y-4">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">GDPR Rights (EU Users)</h3>
              <p className="text-sm mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                <li><strong>Access:</strong> Download a copy of all your data (JSON export)</li>
                <li><strong>Rectification:</strong> Update or correct your information</li>
                <li><strong>Erasure:</strong> Request deletion of your account and all data</li>
                <li><strong>Portability:</strong> Export your data in machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Withdraw consent:</strong> Opt out of optional features at any time</li>
              </ul>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-medium mb-2">How to Exercise Your Rights</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>In-app:</strong> Go to Settings → Account → Privacy Controls</li>
              <li><strong>Email:</strong> Contact us at <a href={`mailto:${LEGAL_CONFIG.privacyEmail}`} className="text-primary hover:underline">{LEGAL_CONFIG.privacyEmail}</a></li>
              <li><strong>Response time:</strong> We will respond within 30 days</li>
            </ul>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-6" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Essential Cookies</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Authentication tokens (keep you logged in)</li>
              <li>Preferences (language, theme settings)</li>
              <li>Security tokens (CSRF protection)</li>
            </ul>
          </div>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-2">We do NOT use:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-sm mb-0">
                <li>Google Analytics</li>
                <li>Third-party advertising cookies</li>
                <li>Social media tracking pixels</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-7" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
        <p>
          Our service is <strong>not intended for users under {LEGAL_CONFIG.minimumAge} years of age</strong>. We do not knowingly collect
          personal information from children. If you believe a child has provided us with personal information, please contact us at{' '}
          <a href={`mailto:${LEGAL_CONFIG.privacyEmail}`} className="text-primary hover:underline">{LEGAL_CONFIG.privacyEmail}</a>.
        </p>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-8" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li><strong>Data location:</strong> {LEGAL_CONFIG.dataLocation}</li>
          <li><strong>EU users:</strong> Your data may be transferred outside the European Economic Area (EEA)</li>
          <li><strong>Safeguards:</strong> We use Standard Contractual Clauses (SCCs) with our service providers</li>
          <li><strong>Third countries:</strong> Google (United States), Supabase ({LEGAL_CONFIG.supabaseRegion})</li>
        </ul>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-9" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">9. Sharing Your Data</h2>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 mb-4">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-0">
              We <strong>do not sell</strong> your personal information to third parties.
            </p>
          </CardContent>
        </Card>

        <p className="mb-2">We share data only with:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li><strong>Supabase:</strong> For database, authentication, and storage (all data)</li>
          <li><strong>Google:</strong> For AI processing (when you use AI features) and OAuth (if you choose Google sign-in)</li>
          <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
        </ul>

        <p className="mt-4">
          When you create a <strong>public share link</strong>, the CV content you choose to share becomes publicly accessible.
        </p>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-10" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li><strong>Notifications:</strong> We will notify you by email of material changes</li>
          <li><strong>Effective date:</strong> Changes take effect 30 days after posting</li>
          <li><strong>Continued use:</strong> Using the service after changes constitutes acceptance</li>
        </ul>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-11" className="scroll-mt-4">
        <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Data Controller</h3>
            <div className="text-sm space-y-1">
              <p>{LEGAL_CONFIG.companyName}</p>
              <p>{LEGAL_CONFIG.companyAddress}</p>
              <p>{LEGAL_CONFIG.companyCity}</p>
              <p>{LEGAL_CONFIG.companyCountry}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Privacy Inquiries</h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${LEGAL_CONFIG.privacyEmail}`} className="text-primary hover:underline">
                  {LEGAL_CONFIG.privacyEmail}
                </a>
              </p>
              <p><strong>Subject:</strong> "Privacy Inquiry - CV Builder"</p>
              <p><strong>Response Time:</strong> Within 7 business days</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <hr className="my-8 border-border" />

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 text-lg">Summary of Key Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg">✅</span>
              <span><strong>No data selling:</strong> We never sell your personal information</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg">✅</span>
              <span><strong>Your control:</strong> You own your data and can delete it anytime</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg">✅</span>
              <span><strong>AI optional:</strong> All AI features are optional</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg">✅</span>
              <span><strong>Secure storage:</strong> Row Level Security and encryption</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg">✅</span>
              <span><strong>Limited analytics:</strong> Only on public CV shares</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 text-lg">✅</span>
              <span><strong>GDPR/CCPA compliant:</strong> Full data rights</span>
            </div>
          </div>
          <p className="text-sm mt-4 mb-0">
            For questions or concerns, please contact us at{' '}
            <a href={`mailto:${LEGAL_CONFIG.privacyEmail}`} className="text-primary hover:underline font-medium">
              {LEGAL_CONFIG.privacyEmail}
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
