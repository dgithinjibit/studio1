"use server";

import { assessTeacherResponse, type AssessTeacherResponseOutput } from "@/ai/flows/assess-teacher-response";
import { generateAssessmentQuestion, type GenerateAssessmentQuestionInput } from "@/ai/flows/generate-assessment-question";
import { generatePeerWork, type GeneratePeerWorkInput, type GeneratePeerWorkOutput } from "@/ai/flows/generate-peer-work";
import { assessPeerReview, type AssessPeerReviewInput, type AssessPeerReviewOutput } from "@/ai/flows/assess-peer-review";
import { retrieveContext } from "@/lib/rag/dpte-curriculum";

/**
 * Generates a new assessment question for the user based on a subject and topic.
 */
export async function handleGenerateQuestion(input: GenerateAssessmentQuestionInput): Promise<string> {
  try {
    const result = await generateAssessmentQuestion(input);
    return result.question;
  } catch (error) {
    console.error("Error in handleGenerateQuestion:", error);
    throw error;
  }
}

/**
 * Handles a submission for self-assessment.
 */
export async function handleAssessment(data: { question: string, teacherResponse: string }): Promise<AssessTeacherResponseOutput> {
  const { question, teacherResponse } = data;
  const relevantContext = await retrieveContext(question);

  try {
    const result = await assessTeacherResponse({
      question,
      teacherResponse,
      relevantContext,
    });
    return result;
  } catch (error) {
    console.error("Error in handleAssessment:", error);
    throw new Error("Failed to process assessment.");
  }
}

/**
 * Generates a question and a peer response for the user to critique.
 */
export async function handleGeneratePeerWork(input: GeneratePeerWorkInput): Promise<GeneratePeerWorkOutput> {
  try {
    return await generatePeerWork(input);
  } catch (error) {
    console.error("Error in handleGeneratePeerWork:", error);
    throw error;
  }
}

/**
 * Handles a submission for peer-assessment (critiquing peer work).
 */
export async function handlePeerAssessment(data: { question: string, peerResponse: string, userReview: string }): Promise<AssessPeerReviewOutput> {
  const { question, peerResponse, userReview } = data;
  const relevantContext = await retrieveContext(question);

  try {
    return await assessPeerReview({
      question,
      peerResponse,
      userReview,
      relevantContext,
    });
  } catch (error) {
    console.error("Error in handlePeerAssessment:", error);
    throw new Error("Failed to process peer assessment.");
  }
}
