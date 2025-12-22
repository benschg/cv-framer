# CV Builder

A modern, AI-powered CV and cover letter builder that helps you create customized, thematic CVs tailored for every job application.

## Overview

CV Builder is a Next.js application that enables you to build skills-focused, thematic CVs rather than traditional chronological resumes. With AI-powered customization, you can paste any job posting and automatically optimize your CV to emphasize the skills and experience that matter most for that specific role.

### Key Features

- **Per-Application Customization**: Create a unique, tailored CV for every job you apply to with AI-powered optimization
- **Thematic, Skills-Focused CVs**: Organize your experience by skills and competencies rather than just timeline
- **Professional Templates**: ATS-friendly templates with WYSIWYG editor for complete customization
- **Matching Cover Letters**: Generate personalized cover letters aligned with your customized CV
- **PDF Export**: Professional-grade PDF generation with pixel-perfect output
- **Easy Sharing**: Share your CV with a simple link and track views
- **CV Import**: Import existing CVs from PDF or DOCX format
- **Profile Management**: Centralized profile with sections for experience, education, skills, projects, certifications, and more

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router and Turbopack
- **React 19** - Latest React with improved performance
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth UI transitions
- **Radix UI** - Headless UI components for accessibility
- **Lucide React** - Beautiful icon library
- **Shadcn/ui** - High-quality, customizable UI components

### Backend & Services
- **Supabase** - Backend as a Service for authentication and database
- **Google Gemini AI** - AI-powered CV and cover letter customization
- **Puppeteer** - Headless browser for PDF generation

### Developer Tools
- **Bun** - Fast JavaScript runtime and package manager
- **Turbo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Testing framework
- **Husky** - Git hooks
- **TypeScript** - Static type checking

### Additional Libraries
- **DnD Kit** - Drag and drop functionality
- **React Easy Crop** - Image cropping
- **Zod** - Schema validation
- **next-themes** - Dark mode support
- **Sonner** - Toast notifications
- **Canvas Confetti** - Celebration animations

## Prerequisites

- **Bun** 1.3.4 or higher
- **Node.js** (compatible with Bun)
- **Supabase Account** - For backend services
- **Google Gemini API Key** - For AI features

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cv-framer
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Setup

Create a `.env.local` file in the `cv-builder` directory:

```bash
cd cv-builder
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key
```

#### Getting API Keys

**Supabase:**
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy the Project URL and anon/public key

**Google Gemini:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to your `.env.local` file

### 4. Run Development Server

From the root directory:

```bash
# Run all workspaces
bun dev

# Or run only the CV builder
bun dev:cv-builder
```

The application will be available at [http://localhost:3001](http://localhost:3001)

## Project Structure

```
cv-framer/
├── cv-builder/              # Main Next.js application
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   │   ├── (auth)/     # Authentication pages (login, signup)
│   │   │   ├── (dashboard)/ # Protected dashboard pages
│   │   │   │   ├── cv/     # CV management
│   │   │   │   ├── cover-letter/ # Cover letter management
│   │   │   │   ├── applications/ # Job applications
│   │   │   │   ├── profile/     # User profile sections
│   │   │   │   └── settings/    # User settings
│   │   │   └── page.tsx    # Landing page
│   │   ├── components/     # React components
│   │   │   ├── ui/        # Shadcn UI components
│   │   │   └── shared/    # Shared components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utility functions
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json
├── package.json           # Root package.json (monorepo)
└── turbo.json            # Turbo configuration
```

## Available Scripts

### Root Level
```bash
bun dev              # Run all workspaces in development mode
bun build            # Build all workspaces
bun lint             # Lint all workspaces
bun dev:cv-builder   # Run only CV builder
```

### CV Builder (from cv-builder directory)
```bash
bun dev              # Start development server (port 3001)
bun build            # Build for production
bun start            # Start production server
bun lint             # Run ESLint
bun lint:fix         # Fix ESLint issues
bun format           # Format code with Prettier
bun format:check     # Check code formatting
bun type-check       # Run TypeScript type checking
bun test             # Run tests with Vitest
bun test:ui          # Run tests with UI
bun test:coverage    # Generate test coverage report
bun knip             # Find unused dependencies and exports
```

## What the Application Does

### For New Users

When you first visit CV Builder, you'll see a landing page that explains:

1. **Customization for Every Job**: Instead of sending the same CV to every employer, CV Builder helps you create a unique version optimized for each specific job posting. Simply paste the job description and let AI customize your CV to match.

2. **Thematic, Skills-Focused Approach**: Move beyond traditional chronological resumes. Organize your experience by skills and competencies, helping recruiters immediately see your value and expertise in their required areas.

3. **Professional Templates**: Choose from ATS-friendly templates that work with both thematic and chronological formats. The WYSIWYG editor lets you customize every detail while maintaining professional formatting.

4. **Matching Cover Letters**: Generate personalized cover letters that align perfectly with your customized CV for each specific job posting.

5. **Easy Export & Sharing**: Export pixel-perfect PDFs or share your CV with a simple link and track who views it.

### Core Workflow

1. **Create Your Profile**: Import your existing CV or build your profile from scratch with sections for:
   - Personal information
   - Work experience
   - Education
   - Skills & competencies
   - Projects & achievements
   - Certifications
   - References

2. **Create Job Applications**: For each job you apply to:
   - Paste the job description
   - AI analyzes and suggests relevant experience and skills
   - Create a customized CV emphasizing the most relevant qualifications
   - Generate a matching cover letter

3. **Customize & Export**: Fine-tune your CV with the WYSIWYG editor and export as PDF or share via link

## Authentication

The app supports multiple authentication methods:
- Email/Password authentication
- Google OAuth
- Protected routes with automatic redirects
- Profile management

## Database

Uses Supabase for:
- User authentication and management
- CV and cover letter storage
- Application tracking
- Profile data persistence

## AI Features

Powered by Google Gemini AI:
- Job description analysis
- CV content optimization
- Cover letter generation
- Skills matching and recommendations

## Development

### Code Quality
- ESLint for linting with custom rules
- Prettier for consistent code formatting
- TypeScript for type safety
- Husky for pre-commit hooks

### Testing
- Vitest for unit and integration tests
- React Testing Library for component testing
- Coverage reporting with V8

### Monorepo
- Managed with Turbo for fast builds
- Bun workspaces for dependency management
- Shared configurations across packages

## Browser Support

Modern browsers supporting ES2020+:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

See LICENSE file for details.

## Support

For issues and questions, please open an issue on the repository.
