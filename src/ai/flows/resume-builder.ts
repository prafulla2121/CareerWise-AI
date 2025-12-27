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
    projects: z.array(
        z.object({
            name: z.string().describe('The name of the project.'),
            description: z.string().describe('A description of the project.'),
        })
    ).optional().describe('The user\'s projects.'),
  }).describe('The user data to generate the resume from.'),
  jobTitle: z.string().optional().describe('The job title the user is applying for, e.g., "Marketing Manager"'),
  templateStyle: z.enum(['modern-2col']).default('modern-2col').describe("The styling of the template to use. 'modern-2col' should be a two-column layout inspired by the provided example.")
});
export type ResumeBuilderInput = z.infer<typeof ResumeBuilderInputSchema>;

const ResumeBuilderOutputSchema = z.object({
  generatedResume: z.string().describe('The generated resume as a complete HTML document with inline CSS.'),
  suggestions: z.array(z.string()).describe('AI-powered suggestions for improving the resume.'),
});
export type ResumeBuilderOutput = z.infer<typeof ResumeBuilderOutputSchema>;

export async function generateResume(input: ResumeBuilderInput): Promise<ResumeBuilderOutput> {
  const styledInput = { ...input, templateStyle: 'modern-2col' as const };
  return resumeBuilderFlow(styledInput);
}

const prompt = ai.definePrompt({
  name: 'resumeBuilderPrompt',
  input: {schema: ResumeBuilderInputSchema},
  output: {schema: ResumeBuilderOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert resume designer. Your task is to generate a professional, two-column resume and provide actionable improvement suggestions.

**Resume Generation Rules:**
1.  Generate a **complete, single HTML file** with a two-column layout. The output must be ONLY the HTML code, starting with \`<!DOCTYPE html>\`.
2.  Use inline CSS within a \`<style>\` tag in the \`<head>\`. The design should be clean, modern, and professional, inspired by the example provided.
3.  **Layout:**
    *   The page should be split into two columns.
    *   **Left Column (approx. 30% width):** This column should contain the Contact, Skills, and Projects sections. Use a slightly off-white or very light gray background for this column.
    *   **Right Column (approx. 70% width):** This column should contain the Name, Job Title, Profile, Work Experience, and Education sections. This should have a white background.
    *   A vertical line should separate the sections in the right column, creating a timeline effect.
4.  **Styling:**
    *   **Fonts:** Use a clean, sans-serif font family like 'Inter' or 'Helvetica'.
    *   **Name:** Display the user's name in large, bold, uppercase letters at the top of the right column.
    *   **Job Title:** Display the job title below the name in smaller, uppercase letters with spacing.
    *   **Section Headers:** All section headers (PROFILE, WORK EXPERIENCE, CONTACT, SKILLS, etc.) should be bold, uppercase, with a solid line/border underneath.
    *   **Timeline Icons:** Use simple, inline SVG icons for the timeline in the right column (a person icon for Profile, a briefcase for Work Experience, a graduation cap for Education).
5.  **Structure:**
    *   Organize the resume with clear sections as described in the layout.
    *   Use bullet points (\`<ul>\`, \`<li>\`) for descriptions in the Experience and Projects sections.

**Resume Content:**
Use the following user data to populate the resume.

- Name: {{userData.name}}
- Job Title: {{jobTitle}}
- Contact: {{userData.email}} | {{userData.phone}} | {{userData.location}}
{{#if userData.linkedin}} | LinkedIn: {{userData.linkedin}}{{/if}}
{{#if userData.github}} | GitHub: {{userData.github}}{{/if}}

**Profile Summary:**
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

{{#if userData.projects}}
**Projects:**
{{#each userData.projects}}
- **{{this.name}}**
  {{{this.description}}}
{{/each}}
{{/if}}

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
