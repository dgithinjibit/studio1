"use server";

import { generateDPTEResponse } from "@/ai/flows/generate-dpte-response";
import { assessTeacherResponse, type AssessTeacherResponseOutput } from "@/ai/flows/assess-teacher-response";
import { generateAssessmentQuestion } from "@/ai/flows/generate-assessment-question";
import { retrieveContext } from "@/lib/dpte-curriculum";

/**
 * Handles a query from the AI Tutor chat.
 * It retrieves context and generates a response using an AI flow.
 * @param query The user's question.
 * @returns The AI-generated response string.
 */
export async function handleTutorQuery(query: string): Promise<string> {
  const context = retrieveContext(query);
  
  try {
    const result = await generateDPTEResponse({ query, context });
    return result.response;
  } catch (error) {
    console.error("Error in handleTutorQuery:", error);
    return "I'm sorry, but I encountered an error while generating a response. Please try again.";
  }
}

/**
 * Generates a new assessment question for the user.
 * @returns The AI-generated question.
 */
export async function handleGenerateQuestion(): Promise<string> {
  try {
    const result = await generateAssessmentQuestion();
    return result.question;
  } catch (error) {
    console.error("Error in handleGenerateQuestion:", error);
    throw new Error("Failed to generate a new question.");
  }
}

/**
 * Handles a submission for self-assessment.
 * It retrieves context based on the question and calls an AI flow to assess the user's response.
 * @param data An object containing the question and the teacher's response.
 * @returns The assessment output from the AI.
 */
export async function handleAssessment(data: { question: string, teacherResponse: string }): Promise<AssessTeacherResponseOutput> {
  const { question, teacherResponse } = data;
  const relevantContext = retrieveContext(question);

  try {
    const result = await assessTeacherResponse({
      question,
      teacherResponse,
      relevantContext,
    });
    return result;
  } catch (error) {
    console.error("Error in handleAssessment:", error);
    // Re-throw to be caught by the client-side caller
    throw new Error("Failed to process assessment.");
  }
}
