'use server';
/**
 * @fileOverview Generates a comprehensive career report combining test scores, resume analysis, and chat insights.
 *
 * - generateCareerReport - A function that generates the career report.
 * - ReportGenerationInput - The input type for the generateCareerReport function.
 * - ReportGenerationOutput - The return type for the generateCareerReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportGenerationInputSchema = z.object({
  testScores: z.object({
    aptitude: z.number().describe('Aptitude score from the career test.'),
    personality: z.number().describe('Personality score from the career test.'),
    interests: z.number().describe('Interests score from the career test.'),
  }).describe('Test scores from the career assessment.'),
  resumeAnalysis: z.object({
    skills: z.array(z.string()).describe('Skills extracted from the resume.'),
    atsScore: z.number().describe('ATS score of the resume.'),
    missingSkills: z.array(z.string()).describe('Skills missing from the resume.'),
  }).describe('Analysis of the uploaded resume.'),
  chatInsights: z.string().describe('Insights from the career guidance chatbot.'),
}).describe('Input data for generating the career report.');

export type ReportGenerationInput = z.infer<typeof ReportGenerationInputSchema>;

const ReportGenerationOutputSchema = z.object({
  report: z.string().describe('The generated career report providing personalized guidance.'),
}).describe('Output of the career report generation.');

export type ReportGenerationOutput = z.infer<typeof ReportGenerationOutputSchema>;

export async function generateCareerReport(input: ReportGenerationInput): Promise<ReportGenerationOutput> {
  return generateCareerReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reportGenerationPrompt',
  input: {schema: ReportGenerationInputSchema},
  output: {schema: ReportGenerationOutputSchema},
  prompt: `You are an AI career counselor. Generate a comprehensive career report based on the following information:

Test Scores:
- Aptitude: {{testScores.aptitude}}
- Personality: {{testScores.personality}}
- Interests: {{testScores.interests}}

Resume Analysis:
- Skills: {{#each resumeAnalysis.skills}}{{{this}}}, {{/each}}
- ATS Score: {{resumeAnalysis.atsScore}}
- Missing Skills: {{#each resumeAnalysis.missingSkills}}{{{this}}}, {{/each}}

Chat Insights:
{{chatInsights}}

Provide personalized guidance on potential career paths, highlighting strengths and areas for improvement. The report should be comprehensive and easy to understand.`,
});

const generateCareerReportFlow = ai.defineFlow(
  {
    name: 'generateCareerReportFlow',
    inputSchema: ReportGenerationInputSchema,
    outputSchema: ReportGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
