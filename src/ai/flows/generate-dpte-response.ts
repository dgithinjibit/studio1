'use server';

/**
 * @fileOverview A RAG-based AI agent for answering questions about the DPTE curriculum.
 *
 * - generateDPTEResponse - A function that handles the generation of responses to DPTE curriculum questions.
 * - GenerateDPTEResponseInput - The input type for the generateDPTEResponse function.
 * - GenerateDPTEResponseOutput - The return type for the generateDPTEResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDPTEResponseInputSchema = z.object({
  query: z.string().describe('The question from the DPTE teacher trainee.'),
  context: z.string().describe('The relevant DPTE curriculum document chunks.'),
});
export type GenerateDPTEResponseInput = z.infer<typeof GenerateDPTEResponseInputSchema>;

const GenerateDPTEResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response to the query.'),
});
export type GenerateDPTEResponseOutput = z.infer<typeof GenerateDPTEResponseOutputSchema>;

export async function generateDPTEResponse(input: GenerateDPTEResponseInput): Promise<GenerateDPTEResponseOutput> {
  return generateDPTEResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDPTEResponsePrompt',
  input: {schema: GenerateDPTEResponseInputSchema},
  output: {schema: GenerateDPTEResponseOutputSchema},
  prompt: `As an Expert DPTE Master Teacher and Curriculum Specialist, your sole task is to answer the following Trainee Query based STRICTLY and ONLY on the provided Curriculum Context Documents. You must synthesize a concise, pedagogically sound, and encouraging response. DO NOT use external knowledge or state that you are restricted to the provided context; simply deliver the authoritative answer. If the context does not contain the answer, state that the information is not available in the current curriculum documents.\n\nTrainee Query: {{{query}}}\n\nCurriculum Context Documents: {{{context}}}`,
});

const generateDPTEResponseFlow = ai.defineFlow(
  {
    name: 'generateDPTEResponseFlow',
    inputSchema: GenerateDPTEResponseInputSchema,
    outputSchema: GenerateDPTEResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
