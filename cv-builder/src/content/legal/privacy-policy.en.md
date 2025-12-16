# Privacy Policy

**Last Updated:** {{lastUpdated}}
**Effective Date:** {{effectiveDate}}
**Version:** {{version}}

---

## Introduction

Welcome to CV Builder. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, store, and protect your information when you use our CV building platform.

This policy applies to all users of our service and complies with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).

---

## 1. Information We Collect

### 1.1 Account Information

When you create an account, we collect:

- **Email address** (required for both Email OTP and Google OAuth authentication)
- **Authentication data** including login timestamps and session tokens
- **Google profile information** (if you choose Google sign-in): name, profile picture, and Google user ID

### 1.2 Profile Information

You provide the following professional information:

- **Basic details:** First name, last name, phone number, location, timezone
- **Professional links:** LinkedIn, GitHub, personal website, portfolio URLs
- **Profile photos:** Images you upload (stored in a public storage bucket)
- **Professional summary:** Your tagline and biography
- **Language preference:** English or German

### 1.3 Career Data

We store comprehensive career information you provide:

- **Work Experience:** Company names, job titles, locations, employment dates, descriptions, and achievements
- **Education:** Institutions, degrees, fields of study, dates, grades, and descriptions
- **Skills:** Categorized technical and soft skills
- **Certifications:** Names, issuers, dates, credential IDs, and uploaded certificate documents (PDF, images)
- **Professional References:** Names, titles, companies, contact information, testimonials, and uploaded reference letters
- **Key Competences:** Professional competencies with descriptions

### 1.4 Werbeflaechen Content

Our unique self-marketing framework collects structured content across 18 categories:

- Short profile, professional experience, training & development
- Core competencies, industry expertise, language skills
- Soft skills, technical skills, methodological skills, leadership skills
- Project experience, achievements & references, certifications
- Publications, volunteer work, interests & hobbies
- Goals & motivation, unique value proposition

This content is stored in both English and German, with AI-generated fit scores and reasoning.

### 1.5 Documents

- **CV Documents:** Generated CVs with custom formatting, templates, and display settings
- **Cover Letters:** AI-generated or manually written cover letters linked to job applications
- **Job Applications:** Company names, job titles, URLs, descriptions, application status, deadlines, notes, and contact information
- **Uploaded Files:** PDF, DOCX, and TXT files (max 5-10MB) you upload for CV data extraction

### 1.6 File Uploads

We process the following file types:

- **Certification Documents:** Images (JPEG, PNG, WebP) and PDFs (max 10MB) stored in private buckets
- **Reference Letters:** Images and PDFs (max 10MB) stored in private buckets
- **Profile Photos:** Images (max 10MB) stored in a **public bucket** (accessible via URL)
- **CV Uploads:** PDF, DOCX, TXT files (max 5MB) for automatic profile extraction

### 1.7 Share Link Analytics

When you create a public share link for your CV, we collect **limited analytics**:

- **Visitor IP address** (anonymized after 90 days)
- **User agent** (browser and device type)
- **HTTP referrer** (source of the visit)
- **Visit timestamp** and view count

**Note:** This is the **only analytics** we collect. We do **not** use Google Analytics, tracking pixels, or third-party advertising cookies.

### 1.8 Technical Data

- **Device information:** Browser type, operating system, screen resolution
- **Log data:** API requests, access times, error messages
- **Session data:** Authentication state and user preferences

---

## 2. How We Use Your Information

### 2.1 Core Services

- **Account management:** Create, secure, and maintain your account
- **CV generation:** Build professional CVs and cover letters
- **Content storage:** Save your profile, career data, and documents securely
- **Job application tracking:** Organize and track your job search progress
- **Share functionality:** Generate public links to share your CV with employers

### 2.2 AI-Powered Features

We use **Google Gemini AI** to enhance your experience:

**Data sent to Google Gemini AI:**
- All Werbeflaechen content (18 categories)
- Your CV content and cover letters
- Job postings you paste for analysis
- Uploaded files (PDFs, images) for data extraction using Vision API

**AI models used:**
- gemini-2.0-flash (primary)
- gemini-1.5-pro (advanced tasks)
- gemini-1.5-flash (quick processing)

**AI features:**
- **CV Content Generation:** Create personalized CV sections from your profile
- **Cover Letter Generation:** Write job-specific cover letters
- **Document Extraction:** Analyze uploaded CVs to autofill your profile
- **Certification Analysis:** Extract data from certificate images/PDFs
- **Reference Letter Analysis:** Parse reference letters automatically
- **Job Fit Analysis:** Score how well you match a job posting

**Your control:** All AI features are optional. You can create all content manually without using AI generation.

**Important:** Data sent to Google may be processed according to [Google's Privacy Policy](https://policies.google.com/privacy) and [AI Terms of Service](https://ai.google.dev/terms).

### 2.3 Analytics and Improvement

- **Share link analytics:** Provide you with insights on who views your CV
- **Service improvement:** Understand usage patterns (anonymized data only)
- **Bug fixing:** Diagnose and resolve technical issues

### 2.4 Legal Compliance

- **Security:** Prevent fraud, abuse, and unauthorized access
- **Terms enforcement:** Ensure compliance with our Terms of Service
- **Legal obligations:** Respond to valid legal requests

---

## 3. Data Storage and Security

### 3.1 Storage Infrastructure

We use **Supabase** for all data storage:

- **Database:** PostgreSQL with Row Level Security (RLS)
- **File Storage:** Supabase Storage with the following buckets:
  - `profile-photos` — **PUBLIC** (photos accessible via URL)
  - `certification-documents` — **PRIVATE** (only you can access)
  - `reference-letters` — **PRIVATE** (only you can access)
  - `uploaded-cvs` — **PRIVATE** (only you can access)

**Location:** {{dataLocation}}

### 3.2 Security Measures

- **Row Level Security (RLS):** Enforced on all database tables — users can **only** access their own data
- **Encrypted connections:** All data transmitted via HTTPS/TLS
- **Secure authentication:** OAuth 2.0 (Google) and One-Time Password (Email OTP)
- **Session management:** Secure token-based sessions with automatic expiration
- **Cascade deletion:** All your data is automatically deleted if you delete your account

### 3.3 File Processing

- **PDF extraction:** Processed server-side using `unpdf` library (no third-party services)
- **DOCX extraction:** Processed server-side using `mammoth` library (no third-party services)
- **TXT files:** Parsed directly on our servers
- **Image analysis:** Sent to Google Gemini Vision API for data extraction

### 3.4 Data Retention

- **Active accounts:** Data retained indefinitely while your account is active
- **Account deletion:** All data permanently deleted within {{backupDeletionDays}} days
- **Share link analytics:** Visitor data retained for {{analyticsMonths}} months
- **Backups:** Deleted data removed from backups within {{backupDeletionDays}} days

---

## 4. Third-Party Services

### 4.1 Supabase (Database, Auth, Storage)

- **Provider:** Supabase Inc.
- **Data shared:** All application data (profile, documents, files)
- **Purpose:** Database, authentication, and file storage
- **Privacy Policy:** [https://supabase.com/privacy](https://supabase.com/privacy)

### 4.2 Google Gemini AI

- **Provider:** Google LLC
- **Data shared:** Your content (profile, CVs, job postings, uploaded files)
- **Purpose:** AI content generation and document analysis
- **Privacy Policy:** [https://policies.google.com/privacy](https://policies.google.com/privacy)
- **Terms of Service:** [https://ai.google.dev/terms](https://ai.google.dev/terms)

### 4.3 Google OAuth (Optional)

- **Provider:** Google LLC
- **Data shared:** Only if you choose Google sign-in
- **Data received:** Email, name, profile picture
- **Purpose:** Authentication only (no tracking or advertising)
- **Privacy Policy:** [https://policies.google.com/privacy](https://policies.google.com/privacy)

---

## 5. Your Privacy Rights

### 5.1 GDPR Rights (EU Users)

You have the right to:

- **Access:** Download a copy of all your data (JSON export)
- **Rectification:** Update or correct your information via your profile settings
- **Erasure:** Request deletion of your account and all data
- **Portability:** Export your data in machine-readable format
- **Restriction:** Limit how we process your data
- **Objection:** Object to certain types of processing
- **Withdraw consent:** Opt out of optional features (like AI generation) at any time
- **Lodge a complaint:** Contact your local data protection authority

### 5.2 CCPA Rights (California Users)

You have the right to:

- **Know:** What personal information we collect and how it's used
- **Delete:** Request deletion of your personal information
- **Opt-out:** We do **not sell** your personal information
- **Non-discrimination:** Equal service regardless of your privacy choices

### 5.3 How to Exercise Your Rights

- **In-app:** Go to Settings > Account > Privacy Controls
- **Email:** Contact us at {{privacyEmail}}
- **Response time:** We will respond within 30 days
- **Verification:** We may require identity verification for security

### 5.4 Data Export

You can export your data in JSON format, including:

- Profile information and professional links
- Work experience, education, skills, certifications, references
- Werbeflaechen content (all 18 categories)
- CV and cover letter metadata
- Job application history and notes

---

## 6. Cookies and Tracking

### 6.1 Essential Cookies

We use essential cookies required for the service to function:

- **Authentication tokens:** Keep you logged in securely
- **Preferences:** Remember your language and theme settings
- **Security tokens:** Prevent cross-site request forgery (CSRF) attacks

### 6.2 Analytics

We do **NOT** use:

- Google Analytics
- Third-party advertising cookies
- Social media tracking pixels
- Cross-site tracking technologies

The **only analytics** we collect are visitor statistics on **public CV share links** (IP address, user agent, referrer) to provide you with insights.

---

## 7. Children's Privacy

Our service is **not intended for users under {{minimumAge}} years of age**. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately at {{privacyEmail}}.

---

## 8. International Data Transfers

- **Data location:** {{dataLocation}}
- **EU users:** Your data may be transferred outside the European Economic Area (EEA)
- **Safeguards:** We use Standard Contractual Clauses (SCCs) with our service providers
- **Third countries:** Google (United States), Supabase ({{supabaseRegion}})

---

## 9. Sharing Your Data

We **do not sell** your personal information to third parties.

We share data only with:

1. **Supabase:** For database, authentication, and storage (all data)
2. **Google:** For AI processing (when you use AI features) and OAuth (if you choose Google sign-in)
3. **Legal authorities:** When required by law or to protect our rights

When you create a **public share link**, the CV content you choose to share becomes publicly accessible. You control what information is visible through privacy levels:

- **None:** Show all contact information
- **Personal:** Show name and location only
- **Full:** Hide all personal information

---

## 10. Changes to This Policy

- **Notifications:** We will notify you by email of material changes
- **Effective date:** Changes take effect 30 days after posting
- **Review:** We recommend reviewing this policy periodically
- **Continued use:** Using the service after changes constitutes acceptance

---

## 11. Contact Us

**Data Controller:**

{{companyName}}
{{companyAddress}}
{{companyCity}}
{{companyCountry}}

**Privacy Inquiries:**

Email: {{privacyEmail}}
Subject: "Privacy Inquiry - CV Builder"

**Response Time:** We respond to all privacy inquiries within 7 business days.

---

## Summary of Key Points

- ✅ **No data selling:** We never sell your personal information
- ✅ **Your control:** You own your data and can delete it anytime
- ✅ **AI optional:** All AI features are optional; create content manually if preferred
- ✅ **Secure storage:** Row Level Security and encryption on all data
- ✅ **Limited analytics:** Only on public CV shares (no Google Analytics)
- ✅ **GDPR/CCPA compliant:** Full data access, export, and deletion rights
- ✅ **Transparent:** We disclose all third-party services and data processing

For questions or concerns, please contact us at {{privacyEmail}}.
