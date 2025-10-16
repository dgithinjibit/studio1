'use server';

/**
 * @fileOverview An AI agent for generating assessment questions for teacher trainees.
 *
 * - generateAssessmentQuestion - A function that generates a curriculum-based question.
 * - GenerateAssessmentQuestionOutput - The return type for the generateAssessmentQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {dpteKnowledgeBase} from '@/lib/dpte-curriculum';

const GenerateAssessmentQuestionOutputSchema = z.object({
  question: z.string().describe('A challenging, open-ended question based on the provided curriculum context, suitable for assessing a teacher trainee\'s understanding.'),
});
export type GenerateAssessmentQuestionOutput = z.infer<typeof GenerateAssessmentQuestionOutputSchema>;

// This gives the AI a broad understanding of the curriculum's scope.
const curriculumOverview = dpteKnowledgeBase.slice(0, 30).join('\n');

export async function generateAssessmentQuestion(): Promise<GenerateAssessmentQuestionOutput> {
  return generateAssessmentQuestionFlow();
}

const prompt = ai.definePrompt({
  name: 'generateAssessmentQuestionPrompt',
  output: {schema: GenerateAssessmentQuestionOutputSchema},
  prompt: `You are a DPTE Master Teacher and Curriculum Specialist. Your task is to generate one thought-provoking assessment question for a teacher trainee.

The question should be based on the provided DPTE curriculum overview. It must be open-ended and require the trainee to apply their knowledge, not just recall facts.

Curriculum Overview:
${curriculumOverview}

Generate a single, clear, and concise question.
`,
});

const generateAssessmentQuestionFlow = ai.defineFlow(
  {
    name: 'generateAssessmentQuestionFlow',
    outputSchema: GenerateAssessmentQuestionOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
