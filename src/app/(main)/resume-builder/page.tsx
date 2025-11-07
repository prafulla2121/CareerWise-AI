'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, Download, PlusCircle, Trash2 } from 'lucide-react';
import { useFieldArray } from 'react-hook-form';
import { generateResume, ResumeBuilderInput } from '@/ai/flows/resume-builder';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().optional(),
});

const resumeBuilderSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required'),
  summary: z.string().min(10, 'Summary should be at least 10 characters'),
  experience: z.array(experienceSchema).min(1, 'At least one experience is required'),
  education: z.array(educationSchema).min(1, 'At least one education entry is required'),
  skills: z.string().min(1, 'Skills are required'),
});

type ResumeFormData = z.infer<typeof resumeBuilderSchema>;

export default function ResumeBuilderPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<{ markdown: string; suggestions: string[] } | null>(null);

  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeBuilderSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      linkedin: '',
      github: '',
      location: '',
      summary: '',
      experience: [{ title: '', company: '', location: '', startDate: '', endDate: '', description: '' }],
      education: [{ institution: '', degree: '', location: '', startDate: '', endDate: '' }],
      skills: '',
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const onSubmit = async (data: ResumeFormData) => {
    setIsLoading(true);
    setGeneratedResume(null);
    try {
      const input: ResumeBuilderInput = {
        userData: {
          ...data,
          skills: data.skills.split(',').map(s => s.trim()),
        },
        templateStyle: 'modern'
      };
      const result = await generateResume(input);
      setGeneratedResume({ markdown: result.generatedResume, suggestions: result.suggestions });
      toast({ title: 'Resume Generated!', description: 'Your AI-powered resume is ready.' });
    } catch (error) {
      console.error('Resume generation failed', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'An error occurred while generating your resume.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadResume = () => {
    if (!generatedResume) return;
    const blob = new Blob([generatedResume.markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="container mx-auto max-w-6xl py-8">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-3xl">AI Resume Builder</CardTitle>
          <CardDescription>Fill in your details, and our AI will generate a professional resume for you, complete with improvement suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <Card className='glass-effect'>
                    <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                    <CardContent className='space-y-4'>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="City, Country" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="linkedin" render={({ field }) => (<FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="github" render={({ field }) => (<FormItem><FormLabel>GitHub URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </CardContent>
                </Card>

                <Card className='glass-effect'>
                    <CardHeader><CardTitle>Professional Summary</CardTitle></CardHeader>
                    <CardContent>
                        <FormField control={form.control} name="summary" render={({ field }) => (<FormItem><FormLabel>Summary</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
                
                <Card className='glass-effect'>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Work Experience</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ title: '', company: '', location: '', startDate: '', endDate: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                    {expFields.map((field, index) => (
                        <div key={field.id} className="space-y-4 rounded-md border p-4 relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`experience.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (<FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`experience.${index}.location`} render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`experience.${index}.startDate`} render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input placeholder="e.g., Jan 2020" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`experience.${index}.endDate`} render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input placeholder="e.g., Present" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeExp(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    </CardContent>
                </Card>

                <Card className='glass-effect'>
                     <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Education</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={() => appendEdu({ institution: '', degree: '', location: '', startDate: '', endDate: '', description: ''})}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                    {eduFields.map((field, index) => (
                        <div key={field.id} className="space-y-4 rounded-md border p-4 relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (<FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (<FormItem><FormLabel>Degree</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`education.${index}.location`} render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`education.${index}.startDate`} render={({ field }) => (<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`education.${index}.endDate`} render={({ field }) => (<FormItem><FormLabel>End Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                           </div>
                            <FormField control={form.control} name={`education.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeEdu(index)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                    </CardContent>
                </Card>

                <Card className='glass-effect'>
                    <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                    <CardContent>
                        <FormField control={form.control} name="skills" render={({ field }) => (<FormItem><FormLabel>Skills (comma-separated)</FormLabel><FormControl><Textarea placeholder="e.g., React, Node.js, Project Management" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate AI Resume</>}
                </Button>
              </form>
            </Form>

            <div className="space-y-8">
              {isLoading && (
                <Card className="glass-effect h-full flex flex-col items-center justify-center">
                    <CardContent className="text-center">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <h3 className="text-lg font-semibold">Generating your resume...</h3>
                        <p className="text-muted-foreground">Our AI is crafting your professional story.</p>
                    </CardContent>
                </Card>
              )}
              {generatedResume && (
                <>
                <Card className="glass-effect">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Generated Resume</CardTitle>
                        <Button variant="outline" size="sm" onClick={downloadResume}><Download className="mr-2 h-4 w-4"/>Download Markdown</Button>
                    </CardHeader>
                    <CardContent className="prose prose-sm prose-invert max-w-none rounded-md border p-4 bg-background/50 h-[600px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans">{generatedResume.markdown}</pre>
                    </CardContent>
                </Card>
                <Card className="glass-effect">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            {generatedResume.suggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
                        </ul>
                    </CardContent>
                </Card>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}