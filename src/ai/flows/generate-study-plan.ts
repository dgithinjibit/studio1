'use server';
/**
 * @fileOverview An AI agent for creating personalized study plans.
 *
 * - createStudyPlan - A Genkit tool that generates a detailed study plan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudyPlanInputSchema = z.object({
  timeUntilExams: z.string().describe("The total time available before the exams (e.g., '14 days', '4 weeks')."),
  dailyStudyHours: z.string().describe("The approximate number of hours the student can study each day."),
  subjects: z.array(z.string()).describe("The list of subjects the student needs to study."),
  levelOfEducation: z.string().optional().describe("The student's current level of education (e.g., 'High School', 'University')."),
  examType: z.string().optional().describe("The type of exam the student is preparing for (e.g., 'final exams', 'mid-terms')."),
});

export const createStudyPlan = ai.defineTool(
  {
    name: 'createStudyPlan',
    description: 'Creates a comprehensive, week-by-week study plan for a student based on their time constraints and subjects. Also provides effective study techniques.',
    inputSchema: StudyPlanInputSchema,
    outputSchema: z.string().describe("A detailed, formatted study plan with weekly breakdowns and study tips."),
  },
  async (input) => {
    // This is where the logic from the user's example is implemented.
    // In a real scenario, we might use another LLM call here to generate a more dynamic plan.
    // For now, we'll use a template based on the user's provided example to ensure consistency.

    const totalWeeks = parseInt(input.timeUntilExams.split(" ")[0]) / 7 || 4; // Simple calculation
    const numSubjects = input.subjects.length;

    let plan = `Of course, I'd be happy to help you create a comprehensive study plan for your ${input.examType || 'exams'}! Here's a suggested study plan that takes into account your time constraints and subject requirements:\n\n`;

    for (let i = 1; i <= totalWeeks; i++) {
        plan += `Week ${i}:\n\n`;
        if (i < totalWeeks) {
            plan += `- Divide your study time of ${input.dailyStudyHours} each day equally among the subjects: ${input.subjects.join(', ')}.\n`;
            plan += `- Start by reviewing the key concepts and topics in each subject. Make a list of any areas where you feel less confident.\n`;
            plan += `- Begin practicing with sample questions or past exam papers to get familiar with the format.\n`;
            plan += `- Allocate some time to create summary notes or flashcards for each subject to aid in revision later on.\n\n`;
        } else {
            // Final week
            plan += `- This week is for intensive revision and final preparation.\n`;
            plan += `- Focus on practicing past exam papers or sample questions under timed conditions to simulate the exam environment.\n`;
            plan += `- Identify any recurring mistakes or areas of weakness and prioritize them for further revision.\n`;
            plan += `- Review your summary notes or flashcards extensively to consolidate your knowledge.\n`;
            plan += `- Make sure to get enough rest, eat well, and maintain a balanced lifestyle to ensure optimal performance during the exams.\n\n`;
        }
    }

    plan += `Effective study techniques and strategies for maintaining focus during your study sessions include:\n\n`;
    plan += `- **Pomodoro Technique:** Break down your study sessions into smaller, manageable chunks of time (e.g., 25-30 minutes) with short breaks in between. This helps maintain focus and prevents burnout.\n`;
    plan += `- **Quiet Environment:** Create a quiet and comfortable study environment free from distractions like your phone or social media.\n`;
    plan += `- **Active Learning:** Use active learning techniques, such as summarizing information in your own words or teaching it to someone else, to reinforce your understanding.\n`;
    plan += `- **Visual Aids:** Utilize visual aids, such as diagrams, mind maps, or flowcharts, to help organize and remember information.\n`;
    plan += `- **Practice Retrieval:** Test yourself with flashcards, quizzes, or sample questions to reinforce your memory and identify areas that need more attention.\n`;
    plan += `- **Take Breaks:** Take regular breaks to rest, relax, and rejuvenate. Short breaks can help improve productivity and prevent mental fatigue.\n\n`;
    plan += `Remember, it's essential to stay motivated and maintain a positive mindset throughout your study period. Believe in yourself, stay organized, and stay consistent with your study plan. Good luck with your exams!`;

    return plan;
  }
);
