'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { generateCareerReport, ReportGenerationOutput } from '@/ai/flows/report-generation';
import { analyzeResume, AnalyzeResumeOutput } from '@/ai/flows/resume-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookUser, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

export default function ReportPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [report, setReport] = useState<ReportGenerationOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize Firestore references
  const testResultQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'testResults'), orderBy('timestamp', 'desc'), limit(1)) : null,
    [firestore, user]
  );
  
  const resumeAnalysisQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'resumeAnalysis'), orderBy('createdAt', 'desc'), limit(1)) : null,
    [firestore, user]
  );

  const { data: testResults, isLoading: isTestLoading } = useCollection(testResultQuery);
  const { data: resumeAnalyses, isLoading: isResumeLoading } = useCollection(resumeAnalysisQuery);

  const latestTestResult = testResults?.[0];
  const latestResumeAnalysis = resumeAnalyses?.[0];

  const canGenerate = !!(latestTestResult && latestResumeAnalysis);

  const handleGenerateReport = async () => {
    if (!latestTestResult || !latestResumeAnalysis) {
      setError('You need to complete the career test and upload a resume before a report can be generated.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setReport(null);

    try {
      const reportInput = {
        testScores: {
          aptitude: latestTestResult.scores.aptitude,
          personality: latestTestResult.scores.personality,
          interests: latestTestResult.scores.interests,
        },
        resumeAnalysis: {
          skills: latestResumeAnalysis.skills,
          atsScore: latestResumeAnalysis.atsScore,
          missingSkills: latestResumeAnalysis.missingSkills,
        },
        chatInsights: 'No chat insights available yet.', // Placeholder for now
      };
      
      const generatedReport = await generateCareerReport(reportInput);
      setReport(generatedReport);

    } catch (e) {
      console.error(e);
      setError('An error occurred while generating the report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const renderLoadingState = () => (
    <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    </div>
  );

  const renderReportContent = () => {
    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h3 className="text-xl font-semibold">Generating Your Report...</h3>
                <p className="text-muted-foreground">Our AI is analyzing your profile to create personalized career guidance. This may take a moment.</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }
    
    if (report) {
        return (
            <div className="prose prose-invert max-w-none">
                <h2 className="text-3xl font-bold mb-4">Your Personalized Career Report</h2>
                <p className="whitespace-pre-wrap">{report.report}</p>
            </div>
        );
    }

    if (!canGenerate) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
                <div className="mb-4 rounded-full border border-primary/20 bg-primary/10 p-3">
                    <BookUser className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Generate Your Career Report</h2>
                <p className="text-muted-foreground max-w-md">
                    To unlock your personalized AI-powered career report, you need to complete the following steps:
                </p>
                <div className="mt-4 flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-2">
                        {latestTestResult ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Loader2 className="h-5 w-5 animate-spin" />}
                        <span className={latestTestResult ? "text-green-500" : ""}>Complete the Career Assessment Test</span>
                        {!latestTestResult && <Button variant="link" asChild><Link href="/test">Start Test</Link></Button>}
                    </div>
                    <div className="flex items-center gap-2">
                        {latestResumeAnalysis ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Loader2 className="h-5 w-5 animate-spin" />}
                        <span className={latestResumeAnalysis ? "text-green-500" : ""}>Upload and Analyze Your Resume</span>
                        {!latestResumeAnalysis && <Button variant="link" asChild><Link href="/resume-upload">Upload Resume</Link></Button>}
                    </div>
                </div>
                <Button onClick={handleGenerateReport} disabled={!canGenerate || isGenerating} className="mt-6">
                    {isGenerating ? "Generating..." : "Generate Report"}
                </Button>
            </div>
        )
    }

    return (
        <div className="text-center">
            <div className="mb-4 rounded-full border border-primary/20 bg-primary/10 p-3 inline-block">
                <BookUser className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Career Report</h2>
            <p className="text-muted-foreground mb-6">Your data is ready. Generate your report to see your personalized career insights.</p>
            <Button onClick={handleGenerateReport} disabled={!canGenerate || isGenerating}>
                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Report"}
            </Button>
        </div>
    );
  }

  return (
    <Card className="glass-effect w-full max-w-4xl mx-auto my-8">
        <CardHeader>
            <CardTitle>Career Report</CardTitle>
            <CardDescription>
                Comprehensive insights based on your test results and resume analysis.
            </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center p-6">
            {(isUserLoading || isTestLoading || isResumeLoading) ? renderLoadingState() : renderReportContent()}
        </CardContent>
    </Card>
  );
}
function CheckCircle(props:any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  }
