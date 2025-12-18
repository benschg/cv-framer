import { ExternalLink } from 'lucide-react';

import { DocumentLayoutWithToc } from '@/components/shared/document-layout-with-toc';
import { Card, CardContent } from '@/components/ui/card';
import { LEGAL_CONFIG } from '@/config/legal';

interface PrivacyPolicyContentProps {
  compact?: boolean;
}

export function PrivacyPolicyContent({ compact = false }: PrivacyPolicyContentProps) {
  // Table of contents items
  const tocItems = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'section-1', label: '1. Information We Collect' },
    { id: 'section-2', label: '2. How We Use Your Information' },
    { id: 'section-3', label: '3. Data Storage and Security' },
    { id: 'section-4', label: '4. Third-Party Services' },
    { id: 'section-5', label: '5. Your Privacy Rights' },
    { id: 'section-6', label: '6. Cookies and Tracking' },
    { id: 'section-7', label: "7. Children's Privacy" },
    { id: 'section-8', label: '8. International Data Transfers' },
    { id: 'section-9', label: '9. Sharing Your Data' },
    { id: 'section-10', label: '10. Changes to This Policy' },
    { id: 'section-11', label: '11. Contact Us' },
  ];

  return (
    <DocumentLayoutWithToc
      tocItems={tocItems}
      compact={compact}
      metadata={{
        lastUpdated: LEGAL_CONFIG.privacyPolicy.lastUpdated,
        version: LEGAL_CONFIG.privacyPolicy.version,
      }}
    >
      <EnglishPrivacyPolicy />
    </DocumentLayoutWithToc>
  );
}

// English Privacy Policy Content Component
function EnglishPrivacyPolicy() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
      <section id="introduction">
        <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>

        <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <p className="mb-0 text-sm text-blue-900 dark:text-blue-100">
              <strong>Welcome to CV Builder.</strong> We respect your privacy and are committed to
              protecting your personal data. This privacy policy explains how we collect, use,
              store, and protect your information when you use our CV building platform.
            </p>
          </CardContent>
        </Card>

        <p className="text-muted-foreground">
          This policy applies to all users of our service and complies with the General Data
          Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
        </p>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-1" className="scroll-mt-4">
        <h2 className="mb-4 text-2xl font-semibold">1. Information We Collect</h2>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-medium">1.1 Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                <strong>Email address</strong> (required for both Email OTP and Google OAuth
                authentication)
              </li>
              <li>
                <strong>Authentication data</strong> including login timestamps and session tokens
              </li>
              <li>
                <strong>Google profile information</strong> (if you choose Google sign-in): name,
                profile picture, and Google user ID
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">1.2 Profile Information</h3>
            <p>You provide the following professional information:</p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                <strong>Basic details:</strong> First name, last name, phone number, location,
                timezone
              </li>
              <li>
                <strong>Professional links:</strong> LinkedIn, GitHub, personal website, portfolio
                URLs
              </li>
              <li>
                <strong>Profile photos:</strong> Images you upload (stored in a{' '}
                <strong>public storage bucket</strong>)
              </li>
              <li>
                <strong>Professional summary:</strong> Your tagline and biography
              </li>
              <li>
                <strong>Language preference:</strong> English or German
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">1.3 Career Data</h3>
            <p>We store career information you provide about:</p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Your work experience and employment history</li>
              <li>Your education and qualifications</li>
              <li>Your professional skills and competences</li>
              <li>Certifications and professional references (including uploaded documents)</li>
              <li>Other career-related information you choose to add</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">1.4 Documents & Files</h3>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                <strong>CV Documents:</strong> Generated CVs with custom formatting, templates, and
                display settings
              </li>
              <li>
                <strong>Cover Letters:</strong> AI-generated or manually written cover letters
              </li>
              <li>
                <strong>Job Applications:</strong> Company names, job titles, URLs, descriptions,
                application status
              </li>
              <li>
                <strong>Uploaded Files:</strong> PDF, DOCX, TXT files (max 5-10MB) for CV data
                extraction
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">1.5 Share Link Analytics</h3>
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
              <CardContent className="p-4">
                <p className="mb-2 text-sm">
                  When you create a public share link for your CV, we collect{' '}
                  <strong>limited analytics</strong>:
                </p>
                <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                  <li>
                    <strong>Visitor IP address</strong>
                  </li>
                  <li>
                    <strong>User agent</strong> (browser and device type)
                  </li>
                  <li>
                    <strong>HTTP referrer</strong> (source of the visit)
                  </li>
                  <li>
                    <strong>Visit timestamp</strong> and view count
                  </li>
                </ul>
                <p className="mb-0 mt-2 text-sm">
                  <strong>Note:</strong> This is the <strong>only analytics</strong> we collect. We
                  do <strong>not</strong> use Google Analytics, tracking pixels, or third-party
                  advertising cookies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-2" className="scroll-mt-4">
        <h2 className="mb-4 text-2xl font-semibold">2. How We Use Your Information</h2>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-medium">2.1 Core Services</h3>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                <strong>Account management:</strong> Create, secure, and maintain your account
              </li>
              <li>
                <strong>CV generation:</strong> Build professional CVs and cover letters
              </li>
              <li>
                <strong>Content storage:</strong> Save your profile, career data, and documents
                securely
              </li>
              <li>
                <strong>Job application tracking:</strong> Organize and track your job search
                progress
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">2.2 AI-Powered Features</h3>
            <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/20">
              <CardContent className="space-y-3 p-4">
                <p className="text-sm font-medium">
                  We use <strong>Google Gemini AI</strong> to enhance your experience:
                </p>

                <div>
                  <p className="mb-1 text-sm font-medium">Data sent to AI services:</p>
                  <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                    <li>Your profile and career information</li>
                    <li>Your CV content and cover letters</li>
                    <li>Job postings you paste for analysis</li>
                    <li>Uploaded files (PDFs, images) for data extraction</li>
                  </ul>
                </div>

                <div>
                  <p className="mb-1 text-sm font-medium">
                    AI features available throughout the application:
                  </p>
                  <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                    <li>CV and cover letter content generation</li>
                    <li>Document analysis and data extraction</li>
                    <li>Job matching and fit analysis</li>
                    <li>Content optimization suggestions</li>
                  </ul>
                </div>

                <p className="mb-0 text-sm">
                  <strong>Your control:</strong> All AI features are optional. You can create all
                  content manually without using AI generation.
                </p>

                <p className="mb-0 text-sm text-muted-foreground">
                  <strong>Important:</strong> Data sent to Google may be processed according to{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Google's Privacy Policy
                    <ExternalLink className="h-3 w-3" />
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://ai.google.dev/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    AI Terms of Service
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-3" className="scroll-mt-4">
        <h2 className="mb-4 text-2xl font-semibold">3. Data Storage and Security</h2>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-medium">3.1 Storage Infrastructure</h3>
            <p>We use secure cloud storage for your data.</p>
            <p className="mt-2">
              <strong>Location:</strong> {LEGAL_CONFIG.dataLocation}
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">3.2 Security Measures</h3>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Users can only access their own data</li>
              <li>All data transmitted via encrypted connections (HTTPS/TLS)</li>
              <li>Secure authentication methods</li>
              <li>Automatic data deletion when you delete your account</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">3.3 Data Retention</h3>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                <strong>Active accounts:</strong> Data retained while your account is active
              </li>
              <li>
                <strong>Account deletion:</strong> All data permanently deleted within{' '}
                {LEGAL_CONFIG.dataRetention.backupDeletionDays} days
              </li>
            </ul>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-4" className="scroll-mt-4">
        <h2 className="mb-4 text-2xl font-semibold">4. Third-Party Services</h2>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold">Supabase (Database, Auth, Storage)</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>Provider:</strong> Supabase Inc.
                </li>
                <li>
                  <strong>Purpose:</strong> Database, authentication, and file storage
                </li>
                <li>
                  <strong>Data shared:</strong> All application data
                </li>
                <li>
                  <strong>Privacy Policy:</strong>{' '}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    supabase.com/privacy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold">Google Gemini AI</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>Provider:</strong> Google LLC
                </li>
                <li>
                  <strong>Purpose:</strong> AI content generation and document analysis
                </li>
                <li>
                  <strong>Data shared:</strong> Your content (when using AI features)
                </li>
                <li>
                  <strong>Privacy Policy:</strong>{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    policies.google.com/privacy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold">Google OAuth (Optional)</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>Provider:</strong> Google LLC
                </li>
                <li>
                  <strong>Purpose:</strong> Authentication only (no tracking or advertising)
                </li>
                <li>
                  <strong>Data shared:</strong> Only if you choose Google sign-in
                </li>
                <li>
                  <strong>Privacy Policy:</strong>{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
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
        <h2 className="mb-4 text-2xl font-semibold">5. Your Privacy Rights</h2>

        <div className="space-y-4">
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold">GDPR Rights (EU Users)</h3>
              <p className="mb-2 text-sm">You have the right to:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                <li>
                  <strong>Access:</strong> Download a copy of all your data (JSON export)
                </li>
                <li>
                  <strong>Rectification:</strong> Update or correct your information
                </li>
                <li>
                  <strong>Erasure:</strong> Request deletion of your account and all data
                </li>
                <li>
                  <strong>Portability:</strong> Export your data in machine-readable format
                </li>
                <li>
                  <strong>Restriction:</strong> Limit how we process your data
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain types of processing
                </li>
                <li>
                  <strong>Withdraw consent:</strong> Opt out of optional features at any time
                </li>
              </ul>
            </CardContent>
          </Card>

          <div>
            <h3 className="mb-2 text-lg font-medium">How to Exercise Your Rights</h3>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>
                <strong>In-app:</strong> Go to Settings → Account → Privacy Controls
              </li>
              <li>
                <strong>Email:</strong> Contact us at{' '}
                <a
                  href={`mailto:${LEGAL_CONFIG.privacyEmail}`}
                  className="text-primary hover:underline"
                >
                  {LEGAL_CONFIG.privacyEmail}
                </a>
              </li>
              <li>
                <strong>Response time:</strong> We will respond within 30 days
              </li>
            </ul>
          </div>
        </div>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-6" className="scroll-mt-4">
        <h2 className="mb-4 text-2xl font-semibold">6. Cookies and Tracking</h2>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-lg font-medium">Essential Cookies</h3>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>Authentication tokens (keep you logged in)</li>
              <li>Preferences (language, theme settings)</li>
              <li>Security tokens (CSRF protection)</li>
            </ul>
          </div>

          <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <p className="mb-2 text-sm font-semibold">We do NOT use:</p>
              <ul className="mb-0 ml-4 list-inside list-disc space-y-1 text-sm">
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
        <h2 className="mb-4 text-2xl font-semibold">7. Children's Privacy</h2>
        <p>
          Our service is{' '}
          <strong>not intended for users under {LEGAL_CONFIG.minimumAge} years of age</strong>. We
          do not knowingly collect personal information from children. If you believe a child has
          provided us with personal information, please contact us at{' '}
          <a href={`mailto:${LEGAL_CONFIG.privacyEmail}`} className="text-primary hover:underline">
            {LEGAL_CONFIG.privacyEmail}
          </a>
          .
        </p>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-8" className="scroll-mt-4">
        <h2 className="mb-4 text-2xl font-semibold">8. International Data Transfers</h2>
        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>
            <strong>Data location:</strong> {LEGAL_CONFIG.dataLocation}
          </li>
          <li>
            <strong>EU users:</strong> Your data may be transferred outside the European Economic
            Area (EEA)
          </li>
          <li>
            <strong>Safeguards:</strong> We use Standard Contractual Clauses (SCCs) with our service
            providers
          </li>
          <li>
            <strong>Third countries:</strong> Google (United States), Supabase (
            {LEGAL_CONFIG.supabaseRegion})
          </li>
        </ul>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-9" className="scroll-mt-4">
        <h2 className="mb-4 text-2xl font-semibold">9. Sharing Your Data</h2>
        <Card className="mb-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
          <CardContent className="p-4">
            <p className="mb-0 text-sm font-semibold">
              We <strong>do not sell</strong> your personal information to third parties.
            </p>
          </CardContent>
        </Card>

        <p className="mb-2">We share data only with:</p>
        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>
            <strong>Supabase:</strong> For database, authentication, and storage (all data)
          </li>
          <li>
            <strong>Google:</strong> For AI processing (when you use AI features) and OAuth (if you
            choose Google sign-in)
          </li>
          <li>
            <strong>Legal authorities:</strong> When required by law or to protect our rights
          </li>
        </ul>

        <p className="mt-4">
          When you create a <strong>public share link</strong>, the CV content you choose to share
          becomes publicly accessible.
        </p>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-10" className="scroll-mt-4">
        <h2 className="mb-4 text-2xl font-semibold">10. Changes to This Policy</h2>
        <ul className="ml-4 list-inside list-disc space-y-1">
          <li>
            <strong>Notifications:</strong> We will notify you by email of material changes
          </li>
          <li>
            <strong>Effective date:</strong> Changes take effect 30 days after posting
          </li>
          <li>
            <strong>Continued use:</strong> Using the service after changes constitutes acceptance
          </li>
        </ul>
      </section>

      <hr className="my-8 border-border" />

      <section id="section-11" className="scroll-mt-4">
        <h2 className="mb-4 text-2xl font-semibold">11. Contact Us</h2>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold">Data Controller</h3>
            <div className="space-y-1 text-sm">
              <p>{LEGAL_CONFIG.companyName}</p>
              <p>{LEGAL_CONFIG.companyAddress}</p>
              <p>{LEGAL_CONFIG.companyCity}</p>
              <p>{LEGAL_CONFIG.companyCountry}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold">Privacy Inquiries</h3>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Email:</strong>{' '}
                <a
                  href={`mailto:${LEGAL_CONFIG.privacyEmail}`}
                  className="text-primary hover:underline"
                >
                  {LEGAL_CONFIG.privacyEmail}
                </a>
              </p>
              <p>
                <strong>Subject:</strong> "Privacy Inquiry - CV Builder"
              </p>
              <p>
                <strong>Response Time:</strong> Within 7 business days
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <hr className="my-8 border-border" />

      {/* Summary */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50 dark:border-blue-900 dark:from-blue-950/20 dark:to-green-950/20">
        <CardContent className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Summary of Key Points</h3>
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="flex items-start gap-2">
              <span className="text-lg text-green-600">✅</span>
              <span>
                <strong>No data selling:</strong> We never sell your personal information
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg text-green-600">✅</span>
              <span>
                <strong>Your control:</strong> You own your data and can delete it anytime
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg text-green-600">✅</span>
              <span>
                <strong>AI optional:</strong> All AI features are optional
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg text-green-600">✅</span>
              <span>
                <strong>Secure storage:</strong> Row Level Security and encryption
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg text-green-600">✅</span>
              <span>
                <strong>Limited analytics:</strong> Only on public CV shares
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg text-green-600">✅</span>
              <span>
                <strong>GDPR/CCPA compliant:</strong> Full data rights
              </span>
            </div>
          </div>
          <p className="mb-0 mt-4 text-sm">
            For questions or concerns, please contact us at{' '}
            <a
              href={`mailto:${LEGAL_CONFIG.privacyEmail}`}
              className="font-medium text-primary hover:underline"
            >
              {LEGAL_CONFIG.privacyEmail}
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
