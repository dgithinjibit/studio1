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

export type GenerateDPTEResponseOutput = {
  response: string;
};


export async function generateDPTEResponse(input: GenerateDPTEResponseInput): Promise<ReadableStream<string>> {
    const {stream: responseStream} = await ai.generateStream({
      prompt: `As an Expert DPTE Master Teacher and Curriculum Specialist, your sole task is to answer the following Trainee Query based STRICTLY and ONLY on the provided Curriculum Context Documents. You must synthesize a concise, pedagogically sound, and encouraging response. DO NOT use external knowledge or state that you are restricted to the provided context; simply deliver the authoritative answer. If the context does not contain the answer, state that the information is not available in the current curriculum documents.\n\nTrainee Query: ${input.query}\n\nCurriculum Context Documents: ${input.context}`,
      model: 'googleai/gemini-2.5-flash',
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of responseStream) {
          controller.enqueue(encoder.encode(chunk.text));
        }
        controller.close();
      }
    });

    return readableStream;
}
