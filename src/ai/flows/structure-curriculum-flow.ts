'use server';
/**
 * @fileOverview An AI agent for structuring raw curriculum text into a JSON format.
 *
 * - structureCurriculum - A function that takes raw text and converts it into a structured curriculum guide.
 * - StructureCurriculumInput - The input type for the structureCurriculum function.
 * - StructureCurriculumOutput - The return type for the structureCurriculum function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Based on the structure of existing curriculum guides like dpte-cre-guide.json
const AssessmentRubricLevelSchema = z.object({
  "Exceeds Expectation": z.string(),
  "Meets Expectation": z.string(),
  "Approaches Expectation": z.string(),
  "Below Expectation": z.string(),
});

const AssessmentRubricSchema = z.object({
  ability: z.string(),
  levels: AssessmentRubricLevelSchema,
});

const SubStrandSchema = z.object({
  name: z.string().describe("The name of the sub-strand."),
  specific_learning_outcomes: z.array(z.string()).describe("List of specific learning outcomes."),
  suggested_learning_experiences: z.array(z.string()).describe("List of suggested learning experiences."),
  core_competencies: z.array(z.string()).describe("List of core competencies developed."),
  values: z.array(z.string()).describe("List of values instilled."),
  assessment_rubric: z.array(AssessmentRubricSchema).optional().describe("Assessment rubric for the sub-strand."),
});

const ModuleSchema = z.object({
  strand: z.string().describe("The name of the strand, e.g., '1.0 Introduction to Christianity'."),
  sub_strands: z.array(SubStrandSchema),
});

const StructureCurriculumOutputSchema = z.object({
  document_title: z.string().describe("The main title of the curriculum document."),
  modules: z.array(ModuleSchema),
}).describe("A structured representation of a curriculum guide.");


export const StructureCurriculumInputSchema = z.object({
  rawText: z.string().describe('The raw, unstructured text extracted from a curriculum PDF.'),
});

export type StructureCurriculumInput = z.infer<typeof StructureCurriculumInputSchema>;
export type StructureCurriculumOutput = z.infer<typeof StructureCurriculumOutputSchema>;


export async function structureCurriculum(input: StructureCurriculumInput): Promise<StructureCurriculumOutput> {
  return structureCurriculumFlow(input);
}

const prompt = ai.definePrompt({
  name: 'structureCurriculumPrompt',
  input: {schema: StructureCurriculumInputSchema},
  output: {schema: StructureCurriculumOutputSchema},
  prompt: `You are an expert at parsing and structuring educational documents. Your task is to convert the following raw text from a DPTE curriculum guide into a structured JSON format.

  Pay close attention to the hierarchy: Strands contain Sub-Strands, which in turn contain outcomes, experiences, competencies, values, and assessment rubrics.

  Analyze the provided text and map it accurately to the required JSON schema. Ensure all fields are correctly populated.

  Raw Curriculum Text:
  {{{rawText}}}
  `,
});

const structureCurriculumFlow = ai.defineFlow(
  {
    name: 'structureCurriculumFlow',
    inputSchema: StructureCurriculumInputSchema,
    outputSchema: StructureCurriculumOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
