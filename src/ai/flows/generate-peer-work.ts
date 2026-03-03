/**
 * @fileOverview An AI agent for generating a question and a simulated "peer" response for teacher trainees to critique.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveContext } from '@/lib/rag/dpte-curriculum';

const GeneratePeerWorkInputSchema = z.object({
  subject: z.string().describe('The subject area.'),
  topic: z.string().describe('The specific topic (strand).'),
});
export type GeneratePeerWorkInput = z.infer<typeof GeneratePeerWorkInputSchema>;

const GeneratePeerWorkOutputSchema = z.object({
  question: z.string().describe('A curriculum-based question.'),
  peerResponse: z.string().describe('A simulated, potentially imperfect response from another teacher trainee for the user to critique.'),
});
export type GeneratePeerWorkOutput = z.infer<typeof GeneratePeerWorkOutputSchema>;

export async function generatePeerWork(input: GeneratePeerWorkInput): Promise<GeneratePeerWorkOutput> {
  return generatePeerWorkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePeerWorkPrompt',
  input: {schema: z.object({ curriculumContext: z.string(), topic: z.string() })},
  output: {schema: GeneratePeerWorkOutputSchema},
  prompt: `You are a DPTE Teacher Trainer. Your task is to generate:
  1. A clear assessment question for a teacher trainee about the topic of {{{topic}}}.
  2. A simulated, "average" quality response from a student or peer trainee to that question. This response should be plausible but have 1-2 identifiable areas for improvement (e.g., missing a key point, slight inaccuracy, or lack of depth).

  The question and response must be based strictly on the provided curriculum context.

  Curriculum Context:
  {{{curriculumContext}}}

  Output both the question and the simulated peer response.
`,
});

const generatePeerWorkFlow = ai.defineFlow(
  {
    name: 'generatePeerWorkFlow',
    inputSchema: GeneratePeerWorkInputSchema,
    outputSchema: GeneratePeerWorkOutputSchema,
  },
  async ({ subject, topic }) => {
    const query = `${subject} ${topic}`;
    const curriculumContext = await retrieveContext(query, 20);
    
    const {output} = await prompt({ curriculumContext, topic });
    return output!;
  }
);
