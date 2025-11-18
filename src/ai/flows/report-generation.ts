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
    aptitude: z.number().describe('Aptitude score from the career test (out of 100).'),
    personality: z.number().describe('Personality score from the career test (out of 100).'),
    interests: z.number().describe('Interests score from the career test (out of 100).'),
  }).describe('Test scores from the career assessment.'),
  resumeAnalysis: z.object({
    skills: z.array(z.string()).describe('Skills extracted from the resume.'),
    atsScore: z.number().describe('ATS score of the resume (out of 100).'),
    missingSkills: z.array(z.string()).describe('Skills missing from the resume.'),
  }).describe('Analysis of the uploaded resume.'),
  chatInsights: z.string().describe('A summary of the user\'s conversation with the career guidance chatbot.'),
}).describe('Input data for generating the career report.');

export type ReportGenerationInput = z.infer<typeof ReportGenerationInputSchema>;

const ReportGenerationOutputSchema = z.object({
    report: z.string().describe("A JSON string that can be parsed into an object with the following structure: { overview: string, careerMatches: Array<{name: string, description: string, score: number}>, personality: string, skills: { current: string[], missing: string[] } }"),
}).describe('Output of the career report generation.');

export type ReportGenerationOutput = z.infer<typeof ReportGenerationOutputSchema>;

export async function generateCareerReport(input: ReportGenerationInput): Promise<ReportGenerationOutput> {
  return generateCareerReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reportGenerationPrompt',
  input: {schema: ReportGenerationInputSchema},
  output: {schema: ReportGenerationOutputSchema},
  prompt: `You are an expert AI career counselor. Your task is to generate a comprehensive, personalized career report. The output MUST be a single JSON string that can be parsed into an object.

The JSON object should have the following structure:
- "overview": A concise (2-3 sentences) summary of the user's profile and the report's purpose.
- "careerMatches": An array of 3-5 career suggestions. Each object in the array should have:
  - "name": The job title.
  - "description": A brief explanation of why this is a good match.
  - "score": A match score between 70 and 99, based on the provided data.
- "personality": A paragraph describing the user's likely work style and environment preferences based on their personality and interest scores.
- "skills": An object with two keys:
  - "current": An array of the user's top 5-7 skills from their resume.
  - "missing": An array of 3-5 crucial skills the user should develop, based on their resume analysis and potential career paths.

Analyze the following user data to create the report:

**Test Scores (out of 100):**
- Aptitude: {{testScores.aptitude}}
- Personality: {{testScores.personality}}
- Interests: {{testScores.interests}}

**Resume Analysis:**
- Identified Skills: {{#each resumeAnalysis.skills}}{{{this}}}, {{/each}}
- ATS Score: {{resumeAnalysis.atsScore}}
- Suggested Missing Skills: {{#each resumeAnalysis.missingSkills}}{{{this}}}, {{/each}}

**Chat Insights:**
- Summary of user's conversation: {{chatInsights}}

Now, generate the report as a single, parsable JSON string. Do not include any text or formatting outside of the JSON object.`,
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
