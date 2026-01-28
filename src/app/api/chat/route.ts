import { bitkumonFlow } from '@/ai/flows/bitkumon-flow';
import { CoreMessage, StreamingTextResponse } from 'ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();
  const stream = await bitkumonFlow({ messages });
  return new StreamingTextResponse(stream);
}
