'use server';
/**
 * @fileOverview Analyzes a resume using Gemini API to identify key skills, provide an ATS score, and recommend careers.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume file (PDF/DOCX) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  skills: z.array(z.string()).describe('List of key skills identified in the resume.'),
  atsScore: z.number().describe('The Applicant Tracking System (ATS) score of the resume.'),
  missingSkills: z.array(z.string()).describe('List of skills the resume is missing based on common job descriptions for roles that match the resume.'),
  recommendedCareers: z.array(z.string()).describe('A list of 3-5 career titles recommended based on the skills and experience in the resume.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const analyzeResumePrompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  model: 'googleai/gemini-1.0-pro',
  prompt: `You are an expert AI resume analyst and career counselor. Analyze the provided resume and perform the following tasks:
1.  Extract a list of the most important technical and soft skills.
2.  Provide an Applicant Tracking System (ATS) score out of 100.
3.  Identify critical skills that are missing for typical job roles that would be a good fit for this resume.
4.  Recommend 3 to 5 specific career titles that would be a strong match for the experience and skills presented in the resume.

Resume: {{media url=resumeDataUri}}`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await analyzeResumePrompt(input);
    return output!;
  }
);
