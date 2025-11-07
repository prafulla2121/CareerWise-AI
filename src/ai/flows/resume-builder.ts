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
    location: z.string().describe('The user\'s location.'),
    summary: z.string().describe('A brief professional summary of the user.'),
    experience: z
      .array(
        z.object({
          title: z.string().describe('The job title.'),
          company: z.string().describe('The company name.'),
          location: z.string().describe('The location of the company.'),
          startDate: z.string().describe('The start date of the job (e.g., Jan 2020).'),
          endDate: z.string().optional().describe('The end date of the job (e.g., Dec 2022), or null if current.'),
          description: z.string().describe('A description of the job responsibilities and achievements.'),
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
  templateStyle: z.string().optional().describe("The styling of the template to use.")
});
export type ResumeBuilderInput = z.infer<typeof ResumeBuilderInputSchema>;

const ResumeBuilderOutputSchema = z.object({
  generatedResume: z.string().describe('The generated resume in a suitable format (e.g., Markdown, HTML, or PDF data URI).'),
  suggestions: z.array(z.string()).describe('AI-powered suggestions for improving the resume.'),
});
export type ResumeBuilderOutput = z.infer<typeof ResumeBuilderOutputSchema>;

export async function generateResume(input: ResumeBuilderInput): Promise<ResumeBuilderOutput> {
  return resumeBuilderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeBuilderPrompt',
  input: {schema: ResumeBuilderInputSchema},
  output: {schema: ResumeBuilderOutputSchema},
  prompt: `You are an AI-powered resume builder. Generate a resume based on the provided user data and offer suggestions for improvement.

User Data:
{{#if userData.name}}Name: {{{userData.name}}}{{/if}}
{{#if userData.email}}Email: {{{userData.email}}}{{/if}}
{{#if userData.phone}}Phone: {{{userData.phone}}}{{/if}}
{{#if userData.linkedin}}LinkedIn: {{{userData.linkedin}}}{{/if}}
{{#if userData.github}}GitHub: {{{userData.github}}}{{/if}}
{{#if userData.location}}Location: {{{userData.location}}}{{/if}}
{{#if userData.summary}}Summary: {{{userData.summary}}}{{/if}}

Experience:
{{#each userData.experience}}
  Title: {{{this.title}}}
  Company: {{{this.company}}}
  Location: {{{this.location}}}
  Dates: {{{this.startDate}}} - {{this.endDate}}
  Description: {{{this.description}}}
{{/each}}

Education:
{{#each userData.education}}
  Institution: {{{this.institution}}}
  Degree: {{{this.degree}}}
  Location: {{{this.location}}}
  Dates: {{{this.startDate}}} - {{{this.endDate}}}
  Description: {{{this.description}}}
{{/each}}

Skills: {{#each userData.skills}}{{{this}}}, {{/each}}


Generate the resume in Markdown format. Provide specific, actionable suggestions for improving the resume, such as adding keywords, quantifying achievements, or tailoring the resume to specific job descriptions.
Template Style: {{{templateStyle}}}
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
