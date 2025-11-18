'use server';
/**
 * @fileOverview Analyzes a job description using Gemini to extract key information.
 *
 * - analyzeJobDescription - A function that handles the job description analysis.
 * - JobAnalysisInput - The input type for the analyzeJobDescription function.
 * - JobAnalysisOutput - The return type for the analyzeJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobAnalysisInputSchema = z.object({
  jobDescription: z.string().describe('The full text of the job description to be analyzed.'),
});
export type JobAnalysisInput = z.infer<typeof JobAnalysisInputSchema>;

const JobAnalysisOutputSchema = z.object({
    jobTitle: z.string().describe('The job title identified from the description.'),
    keyResponsibilities: z.array(z.string()).describe('A list of the key responsibilities.'),
    requiredSkills: z.array(z.string()).describe('A list of essential skills, technologies, or qualifications.'),
    preferredQualifications: z.array(z.string()).describe('A list of "nice-to-have" or preferred qualifications.'),
    companyCulture: z.string().describe('A brief, one or two-sentence summary of the implied company culture or work environment.'),
});
export type JobAnalysisOutput = z.infer<typeof JobAnalysisOutputSchema>;

export async function analyzeJobDescription(input: JobAnalysisInput): Promise<JobAnalysisOutput> {
  return jobAnalysisFlow(input);
}

const jobAnalysisPrompt = ai.definePrompt({
  name: 'jobAnalysisPrompt',
  input: {schema: JobAnalysisInputSchema},
  output: {schema: JobAnalysisOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert NLP analyst specializing in parsing job descriptions for career coaching. Analyze the following job description and extract the key information.

Job Description:
{{{jobDescription}}}

Based on the text provided, extract the following:
1.  **Job Title**: The most likely job title.
2.  **Key Responsibilities**: A bulleted list of the primary duties and tasks.
3.  **Required Skills**: A list of non-negotiable skills, technologies, and qualifications mentioned.
4.  **Preferred Qualifications**: A list of qualifications described as "preferred," "a plus," "nice to have," or similar.
5.  **Company Culture**: A brief summary of the work environment or company values as implied by the text.
`,
});

const jobAnalysisFlow = ai.defineFlow(
  {
    name: 'jobAnalysisFlow',
    inputSchema: JobAnalysisInputSchema,
    outputSchema: JobAnalysisOutputSchema,
  },
  async input => {
    const {output} = await jobAnalysisPrompt(input);
    return output!;
  }
);
