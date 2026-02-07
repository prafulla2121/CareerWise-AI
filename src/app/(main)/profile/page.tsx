'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, Mail, Calendar, BarChart, FileText, Globe } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const generateColor = (name: string) => {
  if (!name) return 'hsl(222, 47%, 11%)';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 50%)`;
};


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const resumeAnalysisQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'resumeAnalysis') : null,
    [firestore, user]
  );
  const testResultsQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'testResults') : null,
    [firestore, user]
  );

  const { data: resumeAnalyses, isLoading: isResumeLoading } = useCollection(resumeAnalysisQuery);
  const { data: testResults, isLoading: isTestLoading } = useCollection(testResultsQuery);

  if (isUserLoading || isResumeLoading || isTestLoading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }
  
  const userName = user.displayName || 'Anonymous User';
  const avatarColor = generateColor(userName);

  const profileStrength = (!!resumeAnalyses?.length ? 40 : 0) + (!!testResults?.length ? 40 : 0) + (user.displayName ? 20 : 0);
  const creationDate = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A';

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="glass-effect overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-secondary" />
        <CardHeader className="flex flex-col items-center text-center -mt-16">
          <Avatar className="h-24 w-24 border-4 border-background">
            {user.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
            <AvatarFallback className="text-3xl" style={{ backgroundColor: avatarColor, color: 'white' }}>
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-3xl">{userName}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="mt-6 space-y-8 p-6">
            <Card className="glass-effect">
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        <span>{user.displayName || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>{user.email || 'Not set'}</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span>Member since {creationDate}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div className='w-full'>
                            <Label htmlFor="language-select" className="sr-only">Language</Label>
                            <Select defaultValue="en">
                                <SelectTrigger id="language-select" className="w-full">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="hi">Hindi</SelectItem>
                                    <SelectItem value="mr">Marathi</SelectItem>
                                    <SelectItem value="gu">Gujarati</SelectItem>
                                    <SelectItem value="ta">Tamil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-effect">
                <CardHeader>
                    <CardTitle>Activity Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <span>Resumes Analyzed</span>
                        </div>
                        <span className="font-bold">{resumeAnalyses?.length || 0}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BarChart className="h-5 w-5 text-muted-foreground" />
                            <span>Tests Completed</span>
                        </div>
                        <span className="font-bold">{testResults?.length || 0}</span>
                    </div>
                </CardContent>
            </Card>

             <Card className="glass-effect">
                <CardHeader>
                    <CardTitle>Profile Strength</CardTitle>
                     <CardDescription>Complete more activities to strengthen your profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={profileStrength} className="h-3" />
                    <p className="text-right text-sm mt-2 text-muted-foreground">{profileStrength}% Complete</p>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
    </div>
  );
}


function ProfileSkeleton() {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Card className="overflow-hidden glass-effect">
          <Skeleton className="h-32 w-full" />
          <div className="flex flex-col items-center -mt-16">
            <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
            <Skeleton className="h-8 w-48 mt-4" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <CardContent className="mt-12 space-y-8 p-6">
            <Card className="glass-effect">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
             <Card className="glass-effect">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </CardContent>
            </Card>
            <Card className="glass-effect">
                <CardHeader>
                    <Skeleton className="h-6 w-36" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-3 w-full" />
                </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    );
  }
