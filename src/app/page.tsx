'use client';

import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, BarChart, FileText, Briefcase } from "lucide-react";
import Image from 'next/image';
import placeholderData from '@/lib/placeholder-images.json';
import { useAuth, useUser, FirebaseClientProvider } from "@/firebase";
import { useRouter } from "next/navigation";
import { initiateAnonymousSignIn } from "@/firebase/auth/email-password";
import { useEffect } from "react";

const features = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "AI Career Chat",
    description: "Get personalized career guidance from our Gemini-powered chatbot.",
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "Resume Analysis",
    description: "Upload your resume for an instant ATS score and improvement tips.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: "Career Prediction",
    description: "Take our assessment to discover career paths tailored to your profile.",
  },
  {
    icon: <Briefcase className="h-8 w-8 text-primary" />,
    title: "Resume Builder",
    description: "Auto-generate a professional resume with AI-powered suggestions.",
  },
];

function HomeComponent() {
  const heroImage = placeholderData.placeholderImages.find(p => p.id === 'hero-landing');
  const auth = useAuth();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const handleGuestLogin = () => {
    initiateAnonymousSignIn(auth);
  };
  
  useEffect(() => {
    if (!isUserLoading && user) {
        router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center px-4 py-20 text-center md:py-32">
           <h1 className="text-4xl font-bold tracking-tight md:text-6xl bg-gradient-to-br from-foreground to-foreground/70 text-transparent bg-clip-text">
            Unlock Your Career Potential with AI-Powered Guidance
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Career 360 provides a holistic view of your professional journey by analyzing your skills, personality, and experience to chart a clear path to success.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started for Free</Link>
            </Button>
             <Button size="lg" variant="secondary" onClick={handleGuestLogin}>
              Continue as Guest
            </Button>
          </div>
        </section>

        {heroImage && (
            <section className="container mx-auto px-4 pb-16">
                 <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10">
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={heroImage.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                 </div>
            </section>
        )}

        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-12 text-center text-3xl font-bold">A 360° View of Your Career</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="glass-effect text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
      </main>
      <footer className="border-t border-border/50">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <Logo className="text-base" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Career 360. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}


export default function Home() {
    return (
        <FirebaseClientProvider>
            <HomeComponent />
        </FirebaseClientProvider>
    )
}
