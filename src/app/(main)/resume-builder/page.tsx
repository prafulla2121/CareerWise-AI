'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, Download, PlusCircle, Trash2, CalendarIcon, FileType } from 'lucide-react';
import { generateResume, ResumeBuilderInput } from '@/ai/flows/resume-builder';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ---------------------- SCHEMAS ----------------------

const experienceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.date({ required_error: 'A start date is required.' }),
  endDate: z.date().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().min(1, 'Description is required'),
}).refine(data => data.isCurrent || !!data.endDate, {
  message: 'End date is required unless this is your current job.',
  path: ['endDate'],
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.date({ required_error: 'A start date is required.' }),
  endDate: z.date({ required_error: 'An end date is required.' }),
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
  templateStyle: z.enum(['modern', 'classic']).default('classic'),
});

type ResumeFormData = z.infer<typeof resumeBuilderSchema>;

// ---------------------- COMPONENT ----------------------

export default function ResumeBuilderPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);

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
      experience: [],
      education: [],
      skills: '',
      templateStyle: 'classic',
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

  // ---------------------- SUBMIT ----------------------
  const onSubmit = async (data: ResumeFormData) => {
    setIsLoading(true);
    setGeneratedResume(null);
    try {
      const input: ResumeBuilderInput = {
        userData: {
          ...data,
          skills: data.skills.split(',').map(s => s.trim()),
          experience: data.experience.map(exp => ({
            ...exp,
            startDate: format(exp.startDate, 'MMM yyyy'),
            endDate: exp.isCurrent ? 'Present' : (exp.endDate ? format(exp.endDate, 'MMM yyyy') : ''),
          })),
          education: data.education.map(edu => ({
            ...edu,
            startDate: format(edu.startDate, 'MMM yyyy'),
            endDate: format(edu.endDate, 'MMM yyyy'),
          })),
        },
        templateStyle: data.templateStyle,
      };
      const result = await generateResume(input);
      setGeneratedResume({
        content: result.generatedResume,
        suggestions: result.suggestions,
        type: data.templateStyle === 'classic' ? 'html' : 'markdown',
      });
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
    const isHtml = generatedResume.type === 'html';
    const blob = new Blob([generatedResume.content], { type: isHtml ? 'text/html;charset=utf-8' : 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isHtml ? 'resume.html' : 'resume.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---------------------- RENDER ----------------------
  return (
    <div className="container mx-auto max-w-6xl py-8">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-3xl">AI Resume Builder</CardTitle>
          <CardDescription>
            Fill in your details, and our AI will generate a professional resume for you, complete with improvement suggestions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* ---------------------- Personal Details ---------------------- */}
                <Card className="glass-effect">
                  <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: 'name', label: 'Full Name' },
                        { name: 'email', label: 'Email' },
                        { name: 'phone', label: 'Phone' },
                        { name: 'location', label: 'Location', placeholder: 'City, Country' },
                        { name: 'linkedin', label: 'LinkedIn URL' },
                        { name: 'github', label: 'GitHub URL' },
                      ].map((f) => (
                        <FormField key={f.name} control={form.control} name={f.name as any} render={({ field }) => (
                          <FormItem>
                            <FormLabel>{f.label}</FormLabel>
                            <FormControl><Input placeholder={f.placeholder || ''} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ---------------------- Summary ---------------------- */}
                <Card className="glass-effect">
                  <CardHeader><CardTitle>Professional Summary</CardTitle></CardHeader>
                  <CardContent>
                    <FormField control={form.control} name="summary" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary</FormLabel>
                        <FormControl>
                          <Textarea rows={5} placeholder="A brief professional summary..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                {/* ---------------------- Experience ---------------------- */}
                <Card className="glass-effect">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Work Experience</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendExp({ title: '', company: '', location: '', startDate: new Date(), description: '', isCurrent: false })
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {expFields.map((field, index) => (   // ✅ FIXED HERE
                      <div key={field.id} className="space-y-4 rounded-md border p-4 relative">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-4 right-4 h-7 w-7"
                          onClick={() => removeExp(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        {/* Fields for each experience */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name={`experience.${index}.title`} render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name={`experience.${index}.company`} render={({ field }) => (
                            <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <FormField control={form.control} name={`experience.${index}.location`} render={({ field }) => (
                          <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />

                        {/* Description */}
                        <FormField control={form.control} name={`experience.${index}.description`} render={({ field }) => (
                          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* ---------------------- Education ---------------------- */}
                <Card className="glass-effect">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Education</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendEdu({ institution: '', degree: '', location: '', startDate: new Date(), endDate: new Date(), description: '' })
                      }
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {eduFields.map((field, index) => (
                      <div key={field.id} className="space-y-4 rounded-md border p-4 relative">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-4 right-4 h-7 w-7"
                          onClick={() => removeEdu(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (
                            <FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (
                            <FormItem><FormLabel>Degree / Certificate</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>

                        <FormField control={form.control} name={`education.${index}.location`} render={({ field }) => (
                          <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* ---------------------- Skills ---------------------- */}
                <Card className="glass-effect">
                  <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                  <CardContent>
                    <FormField control={form.control} name="skills" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skills</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter skills separated by commas, e.g., React, Node.js, Project Management" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                {/* ---------------------- Template ---------------------- */}
                <Card className="glass-effect">
                  <CardHeader><CardTitle>Template</CardTitle></CardHeader>
                  <CardContent>
                    <FormField control={form.control} name="templateStyle" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Choose a Resume Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="classic">Classic (Print-Friendly)</SelectItem>
                            <SelectItem value="modern">Modern (Markdown)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </CardContent>
                </Card>

                {/* ---------------------- Submit Button ---------------------- */}
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate AI Resume
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* ---------------------- Right Side Preview ---------------------- */}
            <div className="space-y-8">
              {isLoading && (
                <Card className="glass-effect h-full flex flex-col items-center justify-center">
                  <CardContent className="text-center p-6">
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
                      <CardTitle className="flex items-center gap-2">
                        <FileType className="h-5 w-5 text-primary" /> Generated Resume
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={downloadResume}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {generatedResume.type === 'html' ? (
                        <iframe
                          srcDoc={generatedResume.content}
                          className="w-full h-[600px] rounded-md border bg-white"
                          title="Generated Resume Preview"
                        />
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none rounded-md border p-4 bg-background/50 h-[600px] overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-sans">{generatedResume.content}</pre>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary" /> AI Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                        {generatedResume.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
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
