'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Activity, FileText, BarChart, Bot, UserCheck } from "lucide-react";
import Link from "next/link";
import { Overview } from "@/components/dashboard/overview";
import { AtsScoreChart } from "@/components/dashboard/ats-score-chart";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonalityChart } from "@/components/dashboard/personality-chart";
import { SkillsChart } from "@/components/dashboard/skills-chart";
import { ProfileCompleteness } from "@/components/dashboard/profile-completeness";

export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const resumeAnalysisQuery = useMemoFirebase(() => 
        user ? query(collection(firestore, 'users', user.uid, 'resumeAnalysis'), orderBy('createdAt', 'desc'), limit(1)) : null,
        [firestore, user]
    );
    const testResultsQuery = useMemoFirebase(() => 
        user ? query(collection(firestore, 'users', user.uid, 'testResults'), orderBy('timestamp', 'desc')) : null,
        [firestore, user]
    );

    const { data: resumeAnalyses, isLoading: isResumeLoading } = useCollection(resumeAnalysisQuery);
    const { data: testResults, isLoading: isTestLoading } = useCollection(testResultsQuery);

    const isLoading = isUserLoading || isResumeLoading || isTestLoading;

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    const latestResumeAnalysis = resumeAnalyses?.[0];
    const latestTestResult = testResults?.[0];
    
    const atsScore = latestResumeAnalysis?.atsScore || 0;
    const testsCompletedCount = testResults?.length || 0;
    
    const recommendedCareers = latestTestResult?.recommendedCareers || [];
    const skills = latestResumeAnalysis?.skills || [];
    const testScores = latestTestResult?.scores || { aptitude: 0, personality: 0, interests: 0 };
    const personalityScores = {
        openness: testScores.personality * 0.9, 
        conscientiousness: testScores.aptitude * 0.8, 
        extraversion: testScores.personality * 0.7, 
        agreeableness: testScores.personality * 0.95, 
        neuroticism: 100 - testScores.aptitude * 0.5
    };

    const completeness = {
        hasTakenTest: testsCompletedCount > 0,
        hasAnalyzedResume: !!latestResumeAnalysis,
        hasCompletedProfile: !!user?.displayName
    };
    const profileStrength = (completeness.hasAnalyzedResume ? 40 : 0) + (completeness.hasTakenTest ? 40 : 0) + (completeness.hasCompletedProfile ? 20 : 0);

    return (
        <div className="flex-1 space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome Back, {user?.displayName?.split(' ')[0] || 'User'}!</h2>
                    <p className="text-muted-foreground">Here's a snapshot of your career journey.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild>
                      <Link href="/report">Generate Full Report</Link>
                    </Button>
                </div>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="glass-effect">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Profile Strength</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{profileStrength}%</div>
                                <p className="text-xs text-muted-foreground">Keep improving your profile</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-effect">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Latest ATS Score</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                               <AtsScoreChart score={atsScore} />
                            </CardContent>
                        </Card>
                        <Card className="glass-effect">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">AI Recommendations</CardTitle>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{recommendedCareers.length}</div>
                                <Link href="/report" className="text-xs text-muted-foreground hover:text-primary">
                                    View recommended careers
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* AI Insights */}
                    <Card className="glass-effect">
                        <CardHeader>
                            <CardTitle>AI-Powered Insights</CardTitle>
                            <CardDescription>Your assessment scores and personality traits.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <Overview scores={testScores} />
                            <PersonalityChart scores={personalityScores} />
                        </CardContent>
                    </Card>
                    
                    <Card className="glass-effect">
                        <CardHeader>
                            <CardTitle>Skills Distribution</CardTitle>
                            <CardDescription>A breakdown of your skills from your resume.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <SkillsChart skills={skills} />
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                    <ProfileCompleteness completeness={completeness} />
                    <Card className="glass-effect">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {latestResumeAnalysis ? (
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Resume Analyzed</p>
                                        <p className="text-sm text-muted-foreground">{new Date(latestResumeAnalysis.createdAt?.toDate()).toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm">+{latestResumeAnalysis.atsScore} ATS</div>
                                </div>
                            ) : (
                                 <div className="flex items-center text-muted-foreground">
                                    <div className="p-2 rounded-full bg-muted/50"><FileText className="h-5 w-5" /></div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">No Resume Analyzed</p>
                                    </div>
                                </div>
                            )}
                            {latestTestResult ? (
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary"><BarChart className="h-5 w-5" /></div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Aptitude Test</p>
                                        <p className="text-sm text-muted-foreground">{new Date(latestTestResult.timestamp?.toDate()).toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-sm text-green-400">Completed</div>
                                </div>
                            ) : (
                                <div className="flex items-center text-muted-foreground">
                                    <div className="p-2 rounded-full bg-muted/50"><BarChart className="h-5 w-5" /></div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">No Test Completed</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center">
                                <div className="p-2 rounded-full bg-primary/10 text-primary"><Bot className="h-5 w-5" /></div>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">AI Chat Session</p>
                                    <p className="text-sm text-muted-foreground">Ready when you are</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="flex-1 space-y-6 animate-pulse">
             <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-4 w-48 mt-2" />
                </div>
                <Skeleton className="h-10 w-44" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                     <div className="grid gap-6 md:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="glass-effect">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-7 w-1/4" />
                                    <Skeleton className="h-3 w-1/2 mt-1" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="glass-effect">
                        <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-2/3 mt-2" />
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                           <Skeleton className="h-[250px] w-full" />
                           <Skeleton className="h-[250px] w-full" />
                        </CardContent>
                    </Card>
                </div>
                
                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="glass-effect">
                         <CardHeader>
                            <Skeleton className="h-6 w-1/2" />
                         </CardHeader>
                         <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </CardContent>
                    </Card>
                    <Card className="glass-effect">
                        <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <div className="ml-4 space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <Skeleton className="h-4 w-12 ml-auto" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
