"use server";

import { assessTeacherResponse, type AssessTeacherResponseOutput } from "@/ai/flows/assess-teacher-response";
import { generateAssessmentQuestion } from "@/ai/flows/generate-assessment-question";
import { retrieveContext } from "@/lib/dpte-curriculum";

/**
 * Generates a new assessment question for the user based on a subject.
 * @param subject The subject to generate a question for.
 * @returns The AI-generated question.
 */
export async function handleGenerateQuestion(subject: string): Promise<string> {
  try {
    const result = await generateAssessmentQuestion({ subject });
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
