'use server';
/**
 * @fileOverview Searches for job postings based on a job title.
 *
 * - searchForJobs - A function that finds job listings.
 * - JobSearchInput - The input type for the searchForJobs function.
 * - JobSearchOutput - The return type for the searchForJobs function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { subDays, format } from 'date-fns';

// Mock Job Search Tool
const findJobListingsTool = ai.defineTool(
  {
    name: 'findJobListings',
    description: 'Finds recent job listings for a given job title on popular job portals like LinkedIn, Indeed, etc. It provides direct links to apply.',
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
        postedOn: z.string().describe('The date the job was posted.'),
      })
    ),
  },
  async (input) => {
    // This is a mock implementation.
    // In a real application, you would call APIs from services like LinkedIn, Indeed,
    // or a job aggregator here to fetch jobs posted within the last 10 days.
    console.log(`Searching for recent jobs with title: ${input.jobTitle}`);
    
    const companies = ['Innovate Inc.', 'DataDriven Corp.', 'Cloud Solutions', 'NextGen Soft', 'QuantumLeap', 'Strive AI'];
    const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Remote', 'Boston, MA'];
    const jobPortals = ['linkedin.com', 'indeed.com', 'glassdoor.com'];

    // Simulate jobs posted in the last 10 days
    return Array.from({ length: 6 }, (_, i) => {
        const daysAgo = Math.floor(Math.random() * 10);
        const postedDate = subDays(new Date(), daysAgo);
        
        return {
            id: `${input.jobTitle.replace(/\s+/g, '-')}-${i}`,
            title: `${input.jobTitle}`,
            company: companies[i % companies.length],
            location: locations[i % locations.length],
            description: `Seeking a talented ${input.jobTitle} to join our dynamic team. This role involves working on cutting-edge projects and collaborating with cross-functional teams to deliver high-quality software.`,
            applyLink: `https://${jobPortals[i % jobPortals.length]}/jobs/view/${input.jobTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now() + i}`,
            postedOn: format(postedDate, 'yyyy-MM-dd'),
        }
    });
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
      postedOn: z.string(),
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
        model: 'googleai/gemini-pro',
    });

    if (!output) {
      throw new Error('The AI model did not return any output.');
    }

    // Check if the model decided to use the tool
    const toolCalls = output.references.filter(ref => ref.toolRequest);
    if (toolCalls.length > 0 && toolCalls[0].toolRequest?.name === 'findJobListings') {
        const toolResponse = toolCalls[0].toolRequest?.getToolResponse();
        if (toolResponse?.output) {
            return toolResponse.output as JobSearchOutput;
        }
    }

    // Fallback if the tool wasn't called or failed
    console.log('Tool was not called, returning empty array.');
    return [];
  }
);
