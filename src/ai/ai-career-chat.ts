'use server';

/**
 * @fileOverview Implements an AI-powered career guidance chatbot using Gemini.
 *
 * - careerChat - A function that interacts with the chatbot for career guidance.
 * - CareerChatInput - The input type for the careerChat function, including the user's message.
 * - CareerChatOutput - The return type for the careerChat function, containing the chatbot's response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerChatInputSchema = z.object({
  message: z.string().describe('The user message to be sent to the chatbot.'),
  chatHistory: z.array(z.object({
    sender: z.enum(['user', 'assistant']),
    message: z.string(),
  })).optional().describe('Previous chat messages in the conversation.'),
});
export type CareerChatInput = z.infer<typeof CareerChatInputSchema>;

const CareerChatOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message.'),
});
export type CareerChatOutput = z.infer<typeof CareerChatOutputSchema>;

export async function careerChat(input: CareerChatInput): Promise<CareerChatOutput> {
  return careerChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerChatPrompt',
  input: {schema: CareerChatInputSchema},
  output: {schema: CareerChatOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are a career guidance chatbot designed to provide personalized advice to users.
      Take into account the previous chat history to provide more relevant and helpful responses.

      {{#if chatHistory}}
      Previous chat history:
      {{#each chatHistory}}
        {{#ifEquals sender 'user'}}
          User: {{{message}}}
        {{else}}
          Assistant: {{{message}}}
        {{/ifEquals}}
      {{/each}}
      {{/if}}

      User: {{{message}}}
      Assistant: `,
  templateHelpers: {
    ifEquals: function(arg1: any, arg2: any, options: any) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    },
  },
});

const careerChatFlow = ai.defineFlow(
  {
    name: 'careerChatFlow',
    inputSchema: CareerChatInputSchema,
    outputSchema: CareerChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      response: output!.response,
    };
  }
);
