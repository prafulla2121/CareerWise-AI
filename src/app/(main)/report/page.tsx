'use client';

import { useState } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { generateCareerReport, ReportGenerationOutput } from '@/ai/flows/report-generation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookUser, Loader2, CheckCircle, BrainCircuit, UserCheck, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

type ParsedReport = {
  overview: string;
  careerMatches: { name: string; description: string; score: number }[];
  personality: string;
  skills: { current: string[], missing: string[] };
};

export default function ReportPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [report, setReport] = useState<ParsedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testResultQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'users', user.uid, 'testResults'), orderBy('timestamp', 'desc'), limit(1)) : null,
    [firestore, user]
  );
  
  const resumeAnalysisQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'users', user.uid, 'resumeAnalysis'), orderBy('createdAt', 'desc'), limit(1)) : null,
    [firestore, user]
  );
  
  const chatHistoryQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, `users/${user.uid}/chatMessages`), orderBy('createdAt', 'asc')) : null,
    [firestore, user]
  );

  const { data: testResults, isLoading: isTestLoading } = useCollection(testResultQuery);
  const { data: resumeAnalyses, isLoading: isResumeLoading } = useCollection(resumeAnalysisQuery);
  const { data: chatHistory, isLoading: isChatLoading } = useCollection(chatHistoryQuery);

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
      // Simple aggregation of chat history for insights
      const chatInsights = chatHistory?.map(c => `${c.sender}: ${c.message}`).join('\n') || 'No chat history available.';

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
        chatInsights: chatInsights,
      };
      
      const generatedReport : ReportGenerationOutput = await generateCareerReport(reportInput);
      
      const parsed = JSON.parse(generatedReport.report);
      setReport(parsed);

    } catch (e) {
      console.error(e);
      setError('An error occurred while generating the report. The AI may have returned an unexpected format. Please try again.');
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
            <div className="space-y-8">
              <Card className='glass-effect'>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3"><BookUser className="text-primary"/> Report Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{report.overview}</p>
                </CardContent>
              </Card>

              <Card className='glass-effect'>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3"><BrainCircuit className="text-primary"/> Career Matches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.careerMatches.map(career => (
                    <Card key={career.name} className="glass-effect p-4">
                      <h4 className="font-bold text-lg">{career.name}</h4>
                      <p className="text-sm text-muted-foreground">{career.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-semibold">Match Score:</span>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{width: `${career.score}%`}}></div>
                        </div>
                        <span className="text-xs font-bold text-primary">{career.score}%</span>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card className='glass-effect'>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3"><UserCheck className="text-primary"/> Personality Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{report.personality}</p>
                  </CardContent>
                </Card>
                <Card className='glass-effect'>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Award className="text-primary"/> Skills Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Your Current Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.skills.current.map(skill => <div key={skill} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{skill}</div>)}
                      </div>
                    </div>
                     <div>
                      <h4 className="font-semibold mb-2">Recommended Skills to Develop</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.skills.missing.map(skill => <div key={skill} className="bg-secondary/10 text-secondary text-xs font-medium px-2.5 py-1 rounded-full">{skill}</div>)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                        <span className={latestTestResult ? "text-green-500 line-through" : ""}>Complete the Career Assessment Test</span>
                        {!latestTestResult && <Button variant="link" asChild><Link href="/test">Start Test</Link></Button>}
                    </div>
                    <div className="flex items-center gap-2">
                        {latestResumeAnalysis ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Loader2 className="h-5 w-5 animate-spin" />}
                        <span className={latestResumeAnalysis ? "text-green-500 line-through" : ""}>Upload and Analyze Your Resume</span>
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
            {(isUserLoading || isTestLoading || isResumeLoading || isChatLoading) ? renderLoadingState() : renderReportContent()}
        </CardContent>
    </Card>
  );
}