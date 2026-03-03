/**
 * @fileOverview An AI agent for generating assessment questions for teacher trainees based on a selected subject, topic, and assessment type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { retrieveContext } from '@/lib/rag/dpte-curriculum';

const GenerateAssessmentQuestionInputSchema = z.object({
  subject: z.string().describe('The subject area to generate a question for. e.g., "Home Science".'),
  topic: z.string().describe('The specific topic (strand) within the subject. e.g., "2.0 Food and Nutrition".'),
  assessmentType: z.enum(['formative', 'summative', 'diagnostic', 'authentic']).describe('The pedagogical type of assessment.'),
});
export type GenerateAssessmentQuestionInput = z.infer<typeof GenerateAssessmentQuestionInputSchema>;


const GenerateAssessmentQuestionOutputSchema = z.object({
  question: z.string().describe('A curriculum-based question tailored to the requested assessment type.'),
});
export type GenerateAssessmentQuestionOutput = z.infer<typeof GenerateAssessmentQuestionOutputSchema>;

export async function generateAssessmentQuestion(input: GenerateAssessmentQuestionInput): Promise<GenerateAssessmentQuestionOutput> {
  return generateAssessmentQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAssessmentQuestionPrompt',
  input: {
    schema: z.object({ 
      curriculumContext: z.string(), 
      topic: z.string(),
      assessmentType: z.string()
    })
  },
  output: {schema: GenerateAssessmentQuestionOutputSchema},
  prompt: `You are a DPTE Examiner. Your task is to generate one clear and direct assessment question for a teacher trainee about the topic of {{{topic}}}.

The question must be based *strictly* on the provided curriculum context and must align with the following assessment type: **{{{assessmentType}}}**.

GUIDELINES PER TYPE:
- **formative**: Focus on checking for immediate understanding and identifying common misconceptions. The question should help the trainee realize what they haven't mastered yet.
- **summative**: Focus on overall mastery of the sub-strand. This should be a formal, high-stakes style question that evaluates whether learning goals were met at the end of a unit.
- **diagnostic**: Focus on prior knowledge. Generate a question that tests the foundations required to begin learning this topic, identifying what the trainee already knows.
- **authentic**: Focus on real-world application. Create a scenario-based question where the trainee must apply curriculum knowledge to solve a practical teaching or household problem.

Curriculum Context:
{{{curriculumContext}}}

Generate a single, precise question about {{{topic}}} that matches the **{{{assessmentType}}}** criteria.
`,
});

const generateAssessmentQuestionFlow = ai.defineFlow(
  {
    name: 'generateAssessmentQuestionFlow',
    inputSchema: GenerateAssessmentQuestionInputSchema,
    outputSchema: GenerateAssessmentQuestionOutputSchema,
  },
  async ({ subject, topic, assessmentType }) => {
    const query = `${subject} ${topic}`;
    const curriculumContext = await retrieveContext(query, 20);
    
    const {output} = await prompt({ curriculumContext, topic, assessmentType });
    return output!;
  }
);
