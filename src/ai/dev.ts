'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/resume-builder.ts';
import '@/ai/flows/report-generation.ts';
import '@/ai/flows/resume-analysis.ts';
import '@/ai/flows/job-description-analysis.ts';
