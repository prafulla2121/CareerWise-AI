'use server';
/**
 * @fileOverview Searches for job postings based on a job title.
 *
 * - searchForJobs - A function that finds job listings.
 * - JobSearchInput - The input type for the searchForJobs function.
 * - JobSearchOutput - The return type for the searchForJobs function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Mock Job Search Tool
const findJobListingsTool = ai.defineTool(
  {
    name: 'findJobListings',
    description: 'Finds job listings for a given job title on popular job portals.',
    inputSchema: z.object({
      jobTitle: z.string().describe('The job title to search for.'),
    }),
    outputSchema: z.array(
      z.object({
        id: z.string().describe('A unique identifier for the job listing.'),
        title: z.string().describe('The title of the job.'),
        company: z.string().describe('The name of the company hiring.'),
        location: z.string().describe('The location of the job.'),
        description: z.string().describe('A brief description of the job.'),
        applyLink: z.string().url().describe('A direct link to apply for the job.'),
      })
    ),
  },
  async (input) => {
    // This is a mock implementation.
    // In a real application, you would call a real job search API here.
    console.log(`Searching for jobs with title: ${input.jobTitle}`);
    const companies = ['Innovate Inc.', 'DataDriven Corp.', 'Cloud Solutions', 'NextGen Soft', 'QuantumLeap'];
    const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Remote'];
    
    return Array.from({ length: 6 }, (_, i) => ({
      id: `${input.jobTitle.replace(/\s+/g, '-')}-${i}`,
      title: `${input.jobTitle}`,
      company: companies[i % companies.length],
      location: locations[i % locations.length],
      description: `Seeking a talented ${input.jobTitle} to join our dynamic team. This role involves working on cutting-edge projects and collaborating with cross-functional teams.`,
      applyLink: 'https://www.google.com/search?q=example+job+application',
    }));
  }
);


const JobSearchInputSchema = z.object({
  jobTitle: z.string().describe('The job title to search for.'),
});
export type JobSearchInput = z.infer<typeof JobSearchInputSchema>;

const JobSearchOutputSchema = z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      company: z.string(),
      location: z.string(),
      description: z.string(),
      applyLink: z.string().url(),
    })
  ).describe('An array of job listings found.');
export type JobSearchOutput = z.infer<typeof JobSearchOutputSchema>;

export async function searchForJobs(input: JobSearchInput): Promise<JobSearchOutput> {
  return jobSearchFlow(input);
}

const jobSearchFlow = ai.defineFlow(
  {
    name: 'jobSearchFlow',
    inputSchema: JobSearchInputSchema,
    outputSchema: JobSearchOutputSchema,
  },
  async (input) => {
    console.log(`Job Search Flow started for: ${input.jobTitle}`);
    
    const { output } = await ai.generate({
        prompt: `Find jobs for the title: ${input.jobTitle}`,
        tools: [findJobListingsTool],
        model: 'googleai/gemini-2.5-flash',
    });

    if (!output) {
      throw new Error('The AI model did not return any output.');
    }

    // Check if the model decided to use the tool
    const toolCalls = output.references.filter(ref => ref.toolRequest);
    if (toolCalls.length > 0 && toolCalls[0].toolRequest?.name === 'findJobListings') {
        const toolResponse = toolCalls[0].toolResponse;
        if (toolResponse?.output) {
            return toolResponse.output as JobSearchOutput;
        }
    }

    // Fallback if the tool wasn't called or failed
    console.log('Tool was not called, returning empty array.');
    return [];
  }
);
