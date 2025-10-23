import { config } from 'dotenv';
config();

import '@/ai/flows/assess-teacher-response.ts';
import '@/ai/flows/generate-dpte-response.ts';
import '@/ai/flows/generate-assessment-question.ts';
import '@/ai/flows/structure-curriculum-flow.ts';
import '@/ai/flows/generate-study-plan.ts';
