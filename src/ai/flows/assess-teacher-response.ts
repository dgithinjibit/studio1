'use server';

/**
 * @fileOverview An AI agent for assessing teacher trainee responses to curriculum-based questions.
 *
 * - assessTeacherResponse - A function that assesses the teacher trainee's response.
 * - AssessTeacherResponseInput - The input type for the assessTeacherResponse function.
 * - AssessTeacherResponseOutput - The return type for the assessTeacherResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessTeacherResponseInputSchema = z.object({
  question: z.string().describe('The curriculum-based question asked to the teacher trainee.'),
  teacherResponse: z.string().describe('The response provided by the teacher trainee.'),
  relevantContext: z.string().describe('The relevant DPTE curriculum context documents.'),
});
export type AssessTeacherResponseInput = z.infer<typeof AssessTeacherResponseInputSchema>;

const AssessTeacherResponseOutputSchema = z.object({
  assessment: z.string().describe('The assessment of the teacher trainee response, including strengths, weaknesses, and areas for improvement.'),
  score: z.number().describe('A numerical score representing the quality of the response on a scale of 1 to 10.'),
  feedback: z.string().describe('Specific feedback for the teacher trainee to improve their understanding and application of the curriculum.'),
});
export type AssessTeacherResponseOutput = z.infer<typeof AssessTeacherResponseOutputSchema>;

export async function assessTeacherResponse(input: AssessTeacherResponseInput): Promise<AssessTeacherResponseOutput> {
  return assessTeacherResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessTeacherResponsePrompt',
  input: {schema: AssessTeacherResponseInputSchema},
  output: {schema: AssessTeacherResponseOutputSchema},
  prompt: `You are an expert DPTE Educator responsible for assessing teacher trainee responses to curriculum-based questions.

  Evaluate the teacher trainee's response to the following question, using the provided curriculum context.

  Question: {{{question}}}
  Teacher Trainee Response: {{{teacherResponse}}}
  Curriculum Context: {{{relevantContext}}}

  Provide a detailed assessment, including strengths, weaknesses, and specific feedback for improvement. Assign a numerical score (1-10) reflecting the quality of the response.
  Ensure the assessment is pedagogically sound and aligned with the DPTE curriculum goals.

  Output format should be JSON with keys assessment, score, and feedback.
  `,
});

const assessTeacherResponseFlow = ai.defineFlow(
  {
    name: 'assessTeacherResponseFlow',
    inputSchema: AssessTeacherResponseInputSchema,
    outputSchema: AssessTeacherResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
