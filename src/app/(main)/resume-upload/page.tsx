'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeResume, AnalyzeResumeOutput } from '@/ai/flows/resume-analysis';
import { Loader2, FileText, UploadCloud, CheckCircle, BarChart, XCircle } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { AtsScoreChart } from '@/components/dashboard/ats-score-chart';
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
            toast({
                variant: 'destructive',
                title: 'File too large',
                description: 'Please upload a resume smaller than 4MB.',
            });
            return;
        }
        if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
            toast({
                variant: 'destructive',
                title: 'Invalid file type',
                description: 'Please upload a PDF or DOCX file.',
            });
            return;
        }
      setFile(selectedFile);
      setAnalysisResult(null); // Reset previous results
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a resume file to analyze.',
      });
      return;
    }

    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not logged in',
            description: 'You must be logged in to analyze a resume.',
        });
        return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const resumeDataUri = reader.result as string;
        const result = await analyzeResume({ resumeDataUri });
        setAnalysisResult(result);
        toast({
          title: 'Analysis Complete',
          description: 'Your resume has been successfully analyzed.',
        });

        const analysisData = {
          userId: user.uid,
          skills: result.skills,
          atsScore: result.atsScore,
          missingSkills: result.missingSkills,
          createdAt: serverTimestamp(),
          fileName: file.name,
        };

        const analysisCollection = collection(firestore, 'users', user.uid, 'resumeAnalysis');
        await addDoc(analysisCollection, analysisData);

        const userDocRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userDocRef, { profileStrength: 50 }, { merge: true });

      };
    } catch (e: any) {
        console.error('Analysis failed:', e);
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'Something went wrong during the analysis. Please try again.',
        });
        if(user && file){
             const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: `users/${user.uid}/resumeAnalysis`,
                requestResourceData: {fileName: file.name},
            });
            errorEmitter.emit('permission-error', contextualError);
        }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="glass-effect w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
              <div className="rounded-full border border-primary/20 bg-primary/10 p-2">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Resume Analysis</CardTitle>
          </div>
          <CardDescription>
            Upload your resume (PDF or DOCX) to get an AI-powered analysis and ATS score.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-8">
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <label htmlFor="file-upload" className="cursor-pointer text-center">
              <p className="font-semibold text-primary">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PDF or DOCX (max. 4MB)</p>
            </label>
            <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
            {file && <p className="text-sm text-foreground">Selected file: {file.name}</p>}
          </div>
          <Button onClick={handleAnalyze} disabled={!file || isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Resume'
            )}
          </Button>
        </CardContent>
      </Card>

      {isAnalyzing && (
        <Card className="mt-8 glass-effect">
            <CardHeader>
                <CardTitle>Analyzing your resume...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-10">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="mt-8 glass-effect">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Here's the breakdown of your resume analysis.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <Card className="glass-effect">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <AtsScoreChart score={analysisResult.atsScore} />
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="glass-effect">
                    <CardHeader>
                        <CardTitle className="text-md flex items-center gap-2"><CheckCircle className="text-green-500"/> Identified Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                    {analysisResult.skills.length > 0 ? analysisResult.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                    )) : <p className="text-sm text-muted-foreground">No specific skills were identified.</p>}
                    </CardContent>
                </Card>
                <Card className="glass-effect">
                    <CardHeader>
                        <CardTitle className="text-md flex items-center gap-2"><XCircle className="text-destructive"/> Missing Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                    {analysisResult.missingSkills.length > 0 ? analysisResult.missingSkills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                    )) : <p className="text-sm text-muted-foreground">Great news! No critical skills seem to be missing.</p>}
                    </CardContent>
                </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
