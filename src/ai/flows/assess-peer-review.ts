/**
 * @fileOverview An AI agent for assessing a teacher trainee's review of a peer's response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessPeerReviewInputSchema = z.object({
  question: z.string().describe('The question asked.'),
  peerResponse: z.string().describe('The simulated response the user critiqued.'),
  userReview: z.string().describe('The user\'s critique/assessment of the peer response.'),
  relevantContext: z.string().describe('The relevant DPTE curriculum context.'),
});
export type AssessPeerReviewInput = z.infer<typeof AssessPeerReviewInputSchema>;

const AssessPeerReviewOutputSchema = z.object({
  assessment: z.string().describe('An assessment of the user\'s ability to critique the peer work correctly.'),
  score: z.number().describe('A score (1-10) for the user\'s review quality.'),
  feedback: z.string().describe('Specific feedback on how to improve their pedagogical assessment skills.'),
});
export type AssessPeerReviewOutput = z.infer<typeof AssessPeerReviewOutputSchema>;

export async function assessPeerReview(input: AssessPeerReviewInput): Promise<AssessPeerReviewOutput> {
  return assessPeerReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessPeerReviewPrompt',
  input: {schema: AssessPeerReviewInputSchema},
  output: {schema: AssessPeerReviewOutputSchema},
  prompt: `You are an expert DPTE Master Teacher. You are evaluating a teacher trainee's ability to provide constructive feedback to a peer.

  Question: {{{question}}}
  Peer's Response: {{{peerResponse}}}
  User's (Trainee's) Review of the Peer: {{{userReview}}}
  Curriculum Context: {{{relevantContext}}}

  Evaluate how well the trainee identified strengths and weaknesses in the peer's response based on the curriculum. Did they catch inaccuracies? Was their feedback constructive?
  
  Assign a score (1-10) and provide detailed feedback on their reviewing skills.
  `,
});

const assessPeerReviewFlow = ai.defineFlow(
  {
    name: 'assessPeerReviewFlow',
    inputSchema: AssessPeerReviewInputSchema,
    outputSchema: AssessPeerReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
