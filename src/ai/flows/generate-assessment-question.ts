
'use server';

/**
 * @fileOverview An AI agent for generating assessment questions for teacher trainees based on a selected subject and topic.
 *
 * - generateAssessmentQuestion - A function that generates a curriculum-based question.
 * - GenerateAssessmentQuestionInput - The input type for the generateAssessmentQuestion function.
 * - GenerateAssessmentQuestionOutput - The return type for the generateAssessmentQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveContext } from '@/lib/rag/dpte-curriculum';

const GenerateAssessmentQuestionInputSchema = z.object({
  subject: z.string().describe('The subject area to generate a question for. e.g., "Home Science".'),
  topic: z.string().describe('The specific topic (strand) within the subject. e.g., "2.0 Food and Nutrition".'),
});
export type GenerateAssessmentQuestionInput = z.infer<typeof GenerateAssessmentQuestionInputSchema>;


const GenerateAssessmentQuestionOutputSchema = z.object({
  question: z.string().describe('A clear, direct question based on the provided curriculum context, suitable for assessing a teacher trainee\'s knowledge of a specific learning outcome. The question should test recall and understanding of the material.'),
});
export type GenerateAssessmentQuestionOutput = z.infer<typeof GenerateAssessmentQuestionOutputSchema>;

export async function generateAssessmentQuestion(input: GenerateAssessmentQuestionInput): Promise<GenerateAssessmentQuestionOutput> {
  return generateAssessmentQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssessmentQuestionPrompt',
  input: {schema: z.object({ curriculumContext: z.string(), topic: z.string() })},
  output: {schema: GenerateAssessmentQuestionOutputSchema},
  prompt: `You are a DPTE Examiner. Your task is to generate one clear and direct assessment question for a teacher trainee about the topic of {{{topic}}}.

The question must be based *strictly* on the provided curriculum context. It should be a "remembering" or "understanding" question that tests knowledge of a specific learning outcome from the given topic, not a complex pedagogical scenario. For example, "List three methods of cooking" is a better question than "Design a lesson plan about cooking."

Curriculum Context:
{{{curriculumContext}}}

Generate a single, precise question about the topic of {{{topic}}} that is directly related to the provided context and suitable for a written exam.
`,
});

const generateAssessmentQuestionFlow = ai.defineFlow(
  {
    name: 'generateAssessmentQuestionFlow',
    inputSchema: GenerateAssessmentQuestionInputSchema,
    outputSchema: GenerateAssessmentQuestionOutputSchema,
  },
  async ({ subject, topic }) => {
    // Retrieve context specifically for the selected topic within the subject.
    const query = `${subject} ${topic}`;
    const curriculumContext = retrieveContext(query, 20);
    
    const {output} = await prompt({ curriculumContext, topic });
    return output!;
  }
);
