'use client';

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRightCircle, Circle, User } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ProfileCompletenessProps {
    completeness: {
        hasTakenTest: boolean;
        hasAnalyzedResume: boolean;
        hasCompletedProfile: boolean;
    }
}

export function ProfileCompleteness({ completeness }: ProfileCompletenessProps) {
    const steps = [
        {
            title: 'Complete Your Profile',
            description: 'Add your name and photo.',
            isComplete: completeness.hasCompletedProfile,
            href: '/profile',
            icon: <User className="h-5 w-5" />
        },
        {
            title: 'Take the Career Test',
            description: 'Discover your strengths.',
            isComplete: completeness.hasTakenTest,
            href: '/test',
            icon: <CheckCircle className="h-5 w-5" />
        },
        {
            title: 'Analyze Your Resume',
            description: 'Get your ATS score.',
            isComplete: completeness.hasAnalyzedResume,
            href: '/resume-upload',
            icon: <ArrowRightCircle className="h-5 w-5" />
        },
    ];

    return (
        <Card className="glass-effect">
            <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>Finish these steps to unlock your full potential.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {steps.map((step, index) => (
                    <Link href={step.href} key={index}>
                        <div className={cn(
                            "flex items-center space-x-4 rounded-md p-3 transition-all",
                            step.isComplete ? "bg-secondary/10 border-secondary/20" : "bg-muted/50 hover:bg-muted"
                        )}>
                            <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full",
                                step.isComplete ? "bg-secondary text-secondary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                            )}>
                                {step.isComplete ? <CheckCircle className="h-5 w-5" /> : step.icon }
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className={cn(
                                    "text-sm font-medium leading-none",
                                    step.isComplete && "line-through text-muted-foreground"
                                )}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                            {!step.isComplete && <ArrowRightCircle className="h-5 w-5 text-primary" />}
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}
