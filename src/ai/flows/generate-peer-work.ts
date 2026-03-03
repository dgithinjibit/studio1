/**
 * @fileOverview An AI agent for generating a question and a simulated "peer" response for teacher trainees to critique, based on a specific assessment type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveContext } from '@/lib/rag/dpte-curriculum';

const GeneratePeerWorkInputSchema = z.object({
  subject: z.string().describe('The subject area.'),
  topic: z.string().describe('The specific topic (strand).'),
  assessmentType: z.enum(['formative', 'summative', 'diagnostic', 'authentic']).describe('The pedagogical type of assessment.'),
});
export type GeneratePeerWorkInput = z.infer<typeof GeneratePeerWorkInputSchema>;

const GeneratePeerWorkOutputSchema = z.object({
  question: z.string().describe('A curriculum-based question.'),
  peerResponse: z.string().describe('A simulated response from another teacher trainee for the user to critique.'),
});
export type GeneratePeerWorkOutput = z.infer<typeof GeneratePeerWorkOutputSchema>;

export async function generatePeerWork(input: GeneratePeerWorkInput): Promise<GeneratePeerWorkOutput> {
  return generatePeerWorkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePeerWorkPrompt',
  input: {
    schema: z.object({ 
      curriculumContext: z.string(), 
      topic: z.string(),
      assessmentType: z.string()
    })
  },
  output: {schema: GeneratePeerWorkOutputSchema},
  prompt: `You are a DPTE Teacher Trainer. Your task is to generate:
  1. A clear assessment question for a teacher trainee about the topic of {{{topic}}}, following the **{{{assessmentType}}}** methodology.
  2. A simulated, "average" quality response from a student or peer trainee to that question. This response should have 1-2 identifiable areas for improvement based on the curriculum.

  ASSESSMENT TYPE CONTEXT:
  - **formative**: The question checks for progress; the response should show a common learning error.
  - **summative**: The question is a final evaluation; the response should show partial mastery.
  - **diagnostic**: The question tests prerequisites; the response should show a gap in basic knowledge.
  - **authentic**: The question is a real-world scenario; the response should show a practical but flawed application.

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
  async ({ subject, topic, assessmentType }) => {
    const query = `${subject} ${topic}`;
    const curriculumContext = await retrieveContext(query, 20);
    
    const {output} = await prompt({ curriculumContext, topic, assessmentType });
    return output!;
  }
);
