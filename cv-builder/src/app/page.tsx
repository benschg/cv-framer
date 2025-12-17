import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Sparkles,
  Share2,
  Target,
  Briefcase,
  Download,
} from "lucide-react";
import Image from "next/image";
import { Footer } from "@/components/shared/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/icon.svg"
              alt="CV Builder"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="text-xl font-bold">CV Builder</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-blue-500 p-6 sm:p-8">
            <Image
              src="/icon.svg"
              alt="CV Builder"
              width={160}
              height={160}
              className="h-32 w-32 sm:h-40 sm:w-40"
            />
          </div>
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
          Customize Your CV
          <span className="text-primary"> For Every Job</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          Build thematic, skills-focused CVs tailored to each application with
          AI-powered customization that helps you make the most impact.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Start Building Free
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Everything You Need to Land Your Dream Job
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Sparkles className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Per-Application Customization</CardTitle>
              <CardDescription>
                Create a unique, tailored CV for every job you apply to with
                AI-powered optimization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Paste any job posting and AI automatically customizes your CV to
                emphasize the skills and experience that matter most for that role.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Target className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Thematic, Skills-Focused</CardTitle>
              <CardDescription>
                Move beyond chronological resumes with thematic CVs that showcase
                your expertise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Organize your experience by skills and competencies rather than just
                timeline, helping recruiters see your value immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Professional Templates</CardTitle>
              <CardDescription>
                ATS-friendly templates that adapt to both thematic and chronological
                formats.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                WYSIWYG editor lets you customize every detail while maintaining
                professional formatting for each unique application.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Matching Cover Letters</CardTitle>
              <CardDescription>
                Generate cover letters customized for each application alongside
                your tailored CV.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI creates personalized cover letters that align perfectly with your
                customized CV for each specific job posting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Download className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>PDF Export</CardTitle>
              <CardDescription>
                Export pixel-perfect PDFs that look exactly as designed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Professional-grade PDF generation ensures your CV looks perfect
                on any device.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Easy Sharing</CardTitle>
              <CardDescription>
                Share your CV with a simple link and track who views it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate shareable links with privacy controls and view
                analytics.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Customize Your CV for Every Job?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg opacity-90">
            Build thematic, skills-focused CVs tailored to each application with
            AI-powered customization that maximizes your chances.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              <Sparkles className="h-5 w-5" />
              Create Your CV Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
