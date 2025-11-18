'use server';
/**
 * @fileOverview Analyzes a resume using a two-step AI process.
 * 1. extractTextFromResume: Extracts raw text from a resume file.
 * 2. scoreResumeText: Scores the extracted text based on specific criteria and provides feedback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// ------------------- Flow 1: Extract Text -------------------

const ExtractTextFromResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume file (PDF/DOCX) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractTextFromResumeInput = z.infer<typeof ExtractTextFromResumeInputSchema>;

const ExtractTextFromResumeOutputSchema = z.object({
  resumeText: z.string().describe('The full raw text content extracted from the resume document.'),
});
export type ExtractTextFromResumeOutput = z.infer<typeof ExtractTextFromResumeOutputSchema>;

export async function extractTextFromResume(input: ExtractTextFromResumeInput): Promise<ExtractTextFromResumeOutput> {
  return extractTextFromResumeFlow(input);
}

const extractTextPrompt = ai.definePrompt({
  name: 'extractTextPrompt',
  input: {schema: ExtractTextFromResumeInputSchema},
  output: {schema: ExtractTextFromResumeOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are a document parsing expert. Your only task is to extract all the text content from the following document. Do not summarize, analyze, or alter the text in any way. Output the raw text.

Resume: {{media url=resumeDataUri}}`,
});

const extractTextFromResumeFlow = ai.defineFlow(
  {
    name: 'extractTextFromResumeFlow',
    inputSchema: ExtractTextFromResumeInputSchema,
    outputSchema: ExtractTextFromResumeOutputSchema,
  },
  async input => {
    const {output} = await extractTextPrompt(input);
    return output!;
  }
);


// ------------------- Flow 2: Score Resume Text -------------------

const ScoreResumeTextInputSchema = z.object({
    resumeText: z.string().describe("The full raw text content of the resume to be analyzed and scored."),
});
export type ScoreResumeTextInput = z.infer<typeof ScoreResumeTextInputSchema>;

const ScoreResumeTextOutputSchema = z.object({
    skills: z.array(z.string()).describe('List of key skills identified in the resume.'),
    atsScore: z.number().describe('A score out of 100 based on the presence of key sections.'),
    feedback: z.array(z.string()).describe('Specific, actionable feedback for improving the resume based on missing sections.'),
    recommendedCareers: z.array(z.string()).describe('A list of 3-5 career titles recommended based on the resume content.'),
});
export type ScoreResumeTextOutput = z.infer<typeof ScoreResumeTextOutputSchema>;


export async function scoreResumeText(input: ScoreResumeTextInput): Promise<ScoreResumeTextOutput> {
  return scoreResumeTextFlow(input);
}

const scoreResumeTextPrompt = ai.definePrompt({
    name: 'scoreResumeTextPrompt',
    input: { schema: ScoreResumeTextInputSchema },
    output: { schema: ScoreResumeTextOutputSchema },
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: `You are an AI resume grader. Your task is to analyze the provided resume text and score it based on a strict set of rules.

**Analysis Steps:**
1.  **Calculate Score:** Start with a score of 0. Add 20 points for each of the following sections if they are present in the resume text: 'Objective', 'Declaration', 'Hobbies' or 'Interests', 'Achievements', 'Projects'. The maximum score is 100.
2.  **Generate Feedback:** For each section that is MISSING, generate a specific, helpful piece of feedback from the following list:
    - If 'Objective' is missing: "Please add your career objective, it will give your career intension to the Recruiters."
    - If 'Declaration' is missing: "Please add Declaration. It will give the assurance that everything written on your resume is true and fully acknowledged by you"
    - If 'Hobbies' or 'Interests' is missing: "Please add Hobbies. It will show your personality to the Recruiters and give the assurance that you are fit for this role or not."
    - If 'Achievements' is missing: "Please add Achievements. It will show that you are capable for the required position."
    - If 'Projects' is missing: "Please add Projects. It will show that you have done work related the required position or not."
    If a section is present, do not provide feedback for it. The feedback array should only contain advice for missing sections.
3.  **Extract Skills:** Identify and list the key skills from the resume text.
4.  **Recommend Careers:** Based on the overall content, recommend 3-5 suitable career titles.

**Input Resume Text:**
{{{resumeText}}}

Perform the analysis and return the result in the specified JSON format.`,
});


const scoreResumeTextFlow = ai.defineFlow(
  {
    name: 'scoreResumeTextFlow',
    inputSchema: ScoreResumeTextInputSchema,
    outputSchema: ScoreResumeTextOutputSchema,
  },
  async input => {
    const {output} = await scoreResumeTextPrompt(input);
    return output!;
  }
);
