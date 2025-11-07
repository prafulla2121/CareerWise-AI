'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Activity, FileText, BarChart, Bot } from "lucide-react";
import Link from "next/link";
import { Overview } from "@/components/dashboard/overview";
import { AtsScoreChart } from "@/components/dashboard/ats-score-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { PersonalityChart } from "@/components/dashboard/personality-chart";
import { SkillsChart } from "@/components/dashboard/skills-chart";

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
    const profileStrength = (!!latestResumeAnalysis ? 50 : 0) + (testsCompletedCount > 0 ? 25 : 0) + (user?.displayName ? 25 : 0);

    const testScores = latestTestResult?.scores || { aptitude: 0, personality: 0, interests: 0 };
    const personalityScores = latestTestResult?.scores || { openness: 75, conscientiousness: 60, extraversion: 85, agreeableness: 90, neuroticism: 30 };
    
    const recommendedCareers = latestTestResult?.recommendedCareers || [];
    const skills = latestResumeAnalysis?.skills || [];

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                      <Link href="/report">Generate Report</Link>
                    </Button>
                </div>
            </div>
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="glass-effect">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Profile Strength
                            </CardTitle>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{profileStrength}%</div>
                            <p className="text-xs text-muted-foreground">
                                Keep completing activities!
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="glass-effect">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Latest ATS Score
                            </CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                           <AtsScoreChart score={atsScore} />
                        </CardContent>
                    </Card>
                    <Card className="glass-effect">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{testsCompletedCount}/1</div>
                             <Link href="/test" className="text-xs text-muted-foreground hover:text-primary">
                                {testsCompletedCount > 0 ? 'Retake Test' : 'Take the test'}
                            </Link>
                        </CardContent>
                    </Card>
                    <Card className="glass-effect">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Recommended Careers
                            </CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{recommendedCareers.length}</div>
                            <Link href="/report" className="text-xs text-muted-foreground hover:text-primary">
                                View recommendations
                            </Link>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 glass-effect">
                        <CardHeader>
                            <CardTitle>Test Analytics</CardTitle>
                            <CardDescription>Your latest scores from the career assessment.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Overview scores={testScores} />
                        </CardContent>
                    </Card>
                     <Card className="col-span-3 glass-effect">
                        <CardHeader>
                            <CardTitle>Personality Insights</CardTitle>
                             <CardDescription>Your personality trait scores based on the assessment.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <PersonalityChart scores={personalityScores} />
                        </CardContent>
                    </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 glass-effect">
                        <CardHeader>
                            <CardTitle>Skills Distribution</CardTitle>
                            <CardDescription>A breakdown of your skills from your resume.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SkillsChart skills={skills} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3 glass-effect">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                A summary of your recent actions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {latestResumeAnalysis ? (
                                    <div className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary/10 text-primary"><FileText className="h-5 w-5" /></AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Resume Analyzed</p>
                                            <p className="text-sm text-muted-foreground">{new Date(latestResumeAnalysis.createdAt?.toDate()).toLocaleDateString()}</p>
                                        </div>
                                        <div className="ml-auto font-medium">+{latestResumeAnalysis.atsScore} ATS</div>
                                    </div>
                                ) : (
                                     <div className="flex items-center text-muted-foreground">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-muted/50"><FileText className="h-5 w-5" /></AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">No Resume Analyzed</p>
                                        </div>
                                    </div>
                                )}
                                {latestTestResult ? (
                                    <div className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary/10 text-primary"><BarChart className="h-5 w-5" /></AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Aptitude Test</p>
                                            <p className="text-sm text-muted-foreground">{new Date(latestTestResult.timestamp?.toDate()).toLocaleDateString()}</p>
                                        </div>
                                        <div className="ml-auto font-medium">Completed</div>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-muted-foreground">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-muted/50"><BarChart className="h-5 w-5" /></AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">No Test Completed</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-5 w-5" /></AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">AI Chat Session</p>
                                        <p className="text-sm text-muted-foreground">Ready when you are</p>
                                    </div>
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
        <div className="flex-1 space-y-4 animate-pulse">
            <div className="flex items-center justify-between space-y-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 glass-effect">
                        <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-2/3 mt-2" />
                        </CardHeader>
                        <CardContent className="pl-2">
                           <Skeleton className="h-[350px] w-full" />
                        </CardContent>
                    </Card>
                    <Card className="col-span-3 glass-effect">
                        <CardHeader>
                            <Skeleton className="h-6 w-1/3" />
                            <Skeleton className="h-4 w-2/3 mt-2" />
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
