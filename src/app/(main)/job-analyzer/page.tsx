'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { analyzeJobDescription, JobAnalysisOutput } from '@/ai/flows/job-description-analysis';
import { Loader2, ClipboardCheck, Brain, Building, ListChecks, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobAnalyzerPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JobAnalysisOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({
        variant: 'destructive',
        title: 'No text provided',
        description: 'Please paste a job description to analyze.',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeJobDescription({ jobDescription });
      setAnalysisResult(result);
      toast({
        title: 'Analysis Complete',
        description: 'The job description has been successfully analyzed.',
      });
    } catch (e: any) {
      console.error('Analysis failed:', e);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Something went wrong during the analysis. Please try again.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      <Card className="glass-effect w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
              <div className="rounded-full border border-primary/20 bg-primary/10 p-2">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Job Description Analyzer</CardTitle>
          </div>
          <CardDescription>
            Paste a job description below to have our AI extract key responsibilities, skills, and qualifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-[200px] text-base"
            disabled={isAnalyzing}
          />
          <Button onClick={handleAnalyze} disabled={isAnalyzing || !jobDescription.trim()} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
                <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze Job Description
                </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isAnalyzing && <AnalysisSkeleton />}

      {analysisResult && (
        <div className="space-y-8">
            <Card className="glass-effect">
                <CardHeader>
                    <CardTitle>{analysisResult.jobTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg"><Building className="text-primary h-5 w-5"/> Company Culture & Environment</h3>
                    <p className="text-muted-foreground">{analysisResult.companyCulture}</p>
                </CardContent>
            </Card>

            <Card className='glass-effect'>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><ListChecks className="text-primary"/> Key Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {analysisResult.keyResponsibilities.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>

            <Card className='glass-effect'>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3"><Star className="text-primary"/> Skills & Qualifications</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-3">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {analysisResult.requiredSkills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-base">{skill}</Badge>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-3">Preferred Qualifications</h3>
                        <div className="flex flex-wrap gap-2">
                            {analysisResult.preferredQualifications.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-base font-normal">{skill}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

function AnalysisSkeleton() {
    return (
        <div className="space-y-8">
            <Card className="glass-effect">
                <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
             <Card className="glass-effect">
                <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(4)].map((_,i) => <Skeleton key={i} className="h-5 w-full" />)}
                </CardContent>
            </Card>
             <Card className="glass-effect">
                <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="h-7 w-28" />
                            <Skeleton className="h-7 w-24" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                         <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-7 w-24" />
                            <Skeleton className="h-7 w-32" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
