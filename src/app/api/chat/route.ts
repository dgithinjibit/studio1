import { handleTutorQuery } from '@/app/actions';
import { StreamingTextResponse } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];
  
  const stream = await handleTutorQuery(lastMessage.content);
  
  return new StreamingTextResponse(stream);
}
