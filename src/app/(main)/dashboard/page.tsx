import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, Activity } from "lucide-react";
import Link from "next/link";
import { Overview } from "@/components/dashboard/overview";
import { AtsScoreChart } from "@/components/dashboard/ats-score-chart";
import { FileText, BarChart, Bot } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


export default function DashboardPage() {
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
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="glass-effect">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Profile Strength
                                </CardTitle>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">75%</div>
                                <p className="text-xs text-muted-foreground">
                                    +10% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="glass-effect">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    ATS Score
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                               <AtsScoreChart score={82} />
                            </CardContent>
                        </Card>
                        <Card className="glass-effect">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1/3</div>
                                <p className="text-xs text-muted-foreground">
                                    Next: Personality Test
                                </p>
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
                                <div className="text-2xl font-bold">5</div>
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
                                <CardDescription>Your scores from the career assessments.</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <Overview />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3 glass-effect">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    You have completed 3 activities this month.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary/10 text-primary"><FileText className="h-5 w-5" /></AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Resume Analyzed</p>
                                            <p className="text-sm text-muted-foreground">2 days ago</p>
                                        </div>
                                        <div className="ml-auto font-medium">+82 ATS</div>
                                    </div>
                                    <div className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary/10 text-primary"><BarChart className="h-5 w-5" /></AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Aptitude Test</p>
                                            <p className="text-sm text-muted-foreground">5 days ago</p>
                                        </div>
                                        <div className="ml-auto font-medium">Completed</div>
                                    </div>
                                    <div className="flex items-center">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-primary/10 text-primary"><Bot className="h-5 w-5" /></AvatarFallback>
                                        </Avatar>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">AI Chat Session</p>
                                            <p className="text-sm text-muted-foreground">1 week ago</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
