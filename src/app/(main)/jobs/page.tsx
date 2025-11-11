'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { searchForJobs, JobSearchInput, JobSearchOutput } from '@/ai/flows/job-search';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Briefcase, Building, MapPin, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [recommendedCareers, setRecommendedCareers] = useState<string[]>([]);
  const [jobListings, setJobListings] = useState<JobSearchOutput>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSearch, setActiveSearch] = useState<string | null>(null);

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

  useEffect(() => {
    const careersFromTest = testResults?.[0]?.recommendedCareers || [];
    const careersFromResume = resumeAnalyses?.[0]?.recommendedCareers || [];
    const uniqueCareers = [...new Set([...careersFromTest, ...careersFromResume])];
    setRecommendedCareers(uniqueCareers);
  }, [testResults, resumeAnalyses]);

  const handleSearch = async (jobTitle: string) => {
    setIsSearching(true);
    setError(null);
    setJobListings([]);
    setActiveSearch(jobTitle);

    try {
      const input: JobSearchInput = { jobTitle };
      const result = await searchForJobs(input);
      setJobListings(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred while searching for jobs. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const isLoading = isUserLoading || isTestLoading || isResumeLoading;

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-3xl">Find Your Next Job</CardTitle>
          <CardDescription>
            Based on your profile, here are some recommended career paths. Click a title to search for current job openings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {isLoading ? (
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                </div>
            ) : recommendedCareers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {recommendedCareers.map(career => (
                        <Button
                            key={career}
                            variant={activeSearch === career ? "default" : "secondary"}
                            onClick={() => handleSearch(career)}
                            disabled={isSearching}
                        >
                           {isSearching && activeSearch === career ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Briefcase className="mr-2 h-4 w-4" />}
                            {career}
                        </Button>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No career recommendations found. Complete a career test or resume analysis to get started.</p>
            )}

            {isSearching && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="glass-effect animate-pulse">
                            <CardHeader>
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {error && <p className="text-destructive">{error}</p>}
            
            {jobListings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                    {jobListings.map(job => (
                        <Card key={job.id} className="glass-effect flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl">{job.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 pt-1">
                                    <Building className="h-4 w-4" /> {job.company}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" /> {job.location}
                                </p>
                                <p className="text-sm pt-2">{job.description}</p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                                        Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

             {!isSearching && jobListings.length === 0 && activeSearch && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No job listings found for "{activeSearch}". Try another career title.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
