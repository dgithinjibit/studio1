'use server';

/**
 * @fileOverview An AI agent for generating assessment questions for teacher trainees based on a selected subject.
 *
 * - generateAssessmentQuestion - A function that generates a curriculum-based question.
 * - GenerateAssessmentQuestionInput - The input type for the generateAssessmentQuestion function.
 * - GenerateAssessmentQuestionOutput - The return type for the generateAssessmentQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveContext } from '@/lib/rag/dpte-curriculum';

const GenerateAssessmentQuestionInputSchema = z.object({
  subject: z.string().describe('The subject to generate a question for. e.g., "Microteaching", "Child Development", "Home Science".'),
});
export type GenerateAssessmentQuestionInput = z.infer<typeof GenerateAssessmentQuestionInputSchema>;


const GenerateAssessmentQuestionOutputSchema = z.object({
  question: z.string().describe('A challenging, open-ended question based on the provided curriculum context, suitable for assessing a teacher trainee\'s understanding.'),
});
export type GenerateAssessmentQuestionOutput = z.infer<typeof GenerateAssessmentQuestionOutputSchema>;

export async function generateAssessmentQuestion(input: GenerateAssessmentQuestionInput): Promise<GenerateAssessmentQuestionOutput> {
  return generateAssessmentQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssessmentQuestionPrompt',
  input: {schema: z.object({ curriculumContext: z.string() })},
  output: {schema: GenerateAssessmentQuestionOutputSchema},
  prompt: `You are a DPTE Master Teacher and Curriculum Specialist. Your task is to generate one thought-provoking assessment question for a teacher trainee.

The question should be based on the provided DPTE curriculum context. It must be open-ended and require the trainee to apply their knowledge, not just recall facts.

Curriculum Context:
{{{curriculumContext}}}

Generate a single, clear, and concise question that is directly related to the provided context.
`,
});

const generateAssessmentQuestionFlow = ai.defineFlow(
  {
    name: 'generateAssessmentQuestionFlow',
    inputSchema: GenerateAssessmentQuestionInputSchema,
    outputSchema: GenerateAssessmentQuestionOutputSchema,
  },
  async ({ subject }) => {
    // Retrieve a broad context for the selected subject.
    const curriculumContext = retrieveContext(subject, 20);
    
    const {output} = await prompt({ curriculumContext });
    return output!;
  }
);
