'use server';
/**
 * @fileOverview AI-powered resume builder flow.
 *
 * - generateResume - A function that generates a resume based on user data and AI suggestions.
 * - ResumeBuilderInput - The input type for the generateResume function.
 * - ResumeBuilderOutput - The return type for the generateResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumeBuilderInputSchema = z.object({
  userData: z.object({
    name: z.string().describe('The user\'s full name.'),
    email: z.string().email().describe('The user\'s email address.'),
    phone: z.string().describe('The user\'s phone number.'),
    linkedin: z.string().optional().describe('The user\'s LinkedIn profile URL.'),
    github: z.string().optional().describe('The user\'s GitHub profile URL.'),
    location: z.string().describe('The user\'s location (e.g., "City, State").'),
    summary: z.string().describe('A brief professional summary of the user.'),
    experience: z
      .array(
        z.object({
          title: z.string().describe('The job title.'),
          company: z.string().describe('The company name.'),
          location: z.string().describe('The location of the company.'),
          startDate: z.string().describe('The start date of the job (e.g., Jan 2020).'),
          endDate: z.string().optional().describe('The end date of the job (e.g., Dec 2022), or "Present".'),
          description: z.string().describe('A description of the job responsibilities and achievements, often in bullet points.'),
        })
      )
      .describe('The user\'s work experience.'),
    education:
      z.array(
        z.object({
          institution: z.string().describe('The name of the educational institution.'),
          degree: z.string().describe('The degree obtained.'),
          location: z.string().describe('The location of the institution.'),
          startDate: z.string().describe('The start date of the education (e.g., Sept 2016).'),
          endDate: z.string().describe('The end date of the education (e.g., May 2020).'),
          description: z.string().optional().describe('Optional description of coursework, projects, or honors.'),
        })
      )
      .describe('The user\'s education history.'),
    skills: z.array(z.string()).describe('A list of the user\'s skills.'),
  }).describe('The user data to generate the resume from.'),
  templateStyle: z.enum(['modern', 'classic']).default('classic').describe("The styling of the template to use. 'classic' should be a print-friendly HTML document with a white background and Times New Roman font.")
});
export type ResumeBuilderInput = z.infer<typeof ResumeBuilderInputSchema>;

const ResumeBuilderOutputSchema = z.object({
  generatedResume: z.string().describe('The generated resume. This should be a complete HTML document with inline CSS for a white background and a professional, classic font like Times New Roman.'),
  suggestions: z.array(z.string()).describe('AI-powered suggestions for improving the resume.'),
});
export type ResumeBuilderOutput = z.infer<typeof ResumeBuilderOutputSchema>;

export async function generateResume(input: ResumeBuilderInput): Promise<ResumeBuilderOutput> {
  // Force classic template style for HTML output
  const classicInput = { ...input, templateStyle: 'classic' as const };
  return resumeBuilderFlow(classicInput);
}

const prompt = ai.definePrompt({
  name: 'resumeBuilderPrompt',
  input: {schema: ResumeBuilderInputSchema},
  output: {schema: ResumeBuilderOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an AI-powered resume builder. Your task is to generate a professional resume and provide actionable suggestions for improvement.

**Resume Generation Rules:**
- Generate a complete, single HTML file. The HTML must have a professional and clean layout suitable for printing. Use a classic and readable font like "Times New Roman" as the primary font family.
- Use inline CSS within a <style> tag in the <head> of the document for all styling.
- The output must be ONLY the HTML code, starting with <!DOCTYPE html>.
- Structure the resume with clear sections: Header (Name, Contact Info), Summary, Experience, Education, and Skills.
- For the Experience and Education sections, use bullet points for descriptions.

**Resume Content:**
Use the following user data to populate the resume.

- Name: {{userData.name}}
- Contact: {{userData.email}} | {{userData.phone}} | {{userData.location}}
{{#if userData.linkedin}} | LinkedIn: {{userData.linkedin}}{{/if}}
{{#if userData.github}} | GitHub: {{userData.github}}{{/if}}

**Summary:**
{{userData.summary}}

**Experience:**
{{#each userData.experience}}
- **{{this.title}}** at {{this.company}} ({{this.location}})
  *{{this.startDate}} - {{this.endDate}}*
  {{{this.description}}}
{{/each}}

**Education:**
{{#each userData.education}}
- **{{this.degree}}**, {{this.institution}} ({{this.location}})
  *{{this.startDate}} - {{this.endDate}}*
  {{{this.description}}}
{{/each}}

**Skills:**
{{#each userData.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

**AI Suggestions:**
Provide 3-5 specific, actionable suggestions for improving the resume content. Examples: "Quantify achievements in your experience section, like 'Increased sales by 15%' instead of 'Responsible for sales'." or "Add more keywords relevant to a [Job Title] role, such as [Keyword1, Keyword2]."
`,
});

const resumeBuilderFlow = ai.defineFlow(
  {
    name: 'resumeBuilderFlow',
    inputSchema: ResumeBuilderInputSchema,
    outputSchema: ResumeBuilderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
