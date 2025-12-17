"use client";

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
import { useEffect, useRef, useState } from "react";

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      });
    });

    const currentElement = domRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [delay]);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  // Generate unique key on each page load to force animation replay
  const [animKey] = useState(() => Date.now());

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
          <div className="rounded-full bg-primary p-6 sm:p-8 animate-in fade-in zoom-in duration-700 relative group" style={{ clipPath: 'inset(-100% 0 0 0 round 9999px)' }}>
            {/* Animated CV pages with hover animation */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 transition-transform duration-500 group-hover:scale-110" key={animKey}>
              {/* Back CV page */}
              <div className="absolute top-1/2 left-1/2 w-36 h-52 sm:w-40 sm:h-60 -ml-18 -mt-36 sm:-ml-20 sm:-mt-42 cv-page-back origin-bottom-left">
                <img src="/cv-page-back.svg" alt="" className="w-full h-full" />
              </div>

              {/* Front CV page */}
              <div className="absolute top-1/2 left-1/2 w-36 h-52 sm:w-40 sm:h-60 -ml-18 -mt-36 sm:-ml-20 sm:-mt-42 cv-page-front origin-bottom-right">
                <img src="/cv-page-front.svg" alt="" className="w-full h-full" />
              </div>

              {/* AI Sparkle */}
              <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-14 h-14 sm:w-16 sm:h-16 ai-sparkle">
                <img src="/ai-sparkle.svg" alt="" className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Customize Your CV
          <span className="text-primary"> For Every Job</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          Build thematic, skills-focused CVs tailored to each application with
          AI-powered customization that helps you make the most impact.
        </p>
        <div className="flex justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link href="/signup">
            <Button size="lg" className="gap-2 hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
              Start Building Free
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="hover:scale-105 transition-transform">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <FadeInSection>
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything You Need to Land Your Dream Job
          </h2>
        </FadeInSection>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FadeInSection delay={100}>
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
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
          </FadeInSection>

          <FadeInSection delay={200}>
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
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
          </FadeInSection>

          <FadeInSection delay={300}>
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
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
          </FadeInSection>

          <FadeInSection delay={400}>
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
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
          </FadeInSection>

          <FadeInSection delay={500}>
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
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
          </FadeInSection>

          <FadeInSection delay={600}>
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
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
          </FadeInSection>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 text-center relative">
          <FadeInSection>
            <h2 className="mb-4 text-3xl font-bold">
              Ready to Customize Your CV for Every Job?
            </h2>
          </FadeInSection>
          <FadeInSection delay={200}>
            <p className="mx-auto mb-8 max-w-xl text-lg opacity-90">
              Build thematic, skills-focused CVs tailored to each application with
              AI-powered customization that maximizes your chances.
            </p>
          </FadeInSection>
          <FadeInSection delay={400}>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2 hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5" />
                Create Your CV Now
              </Button>
            </Link>
          </FadeInSection>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
