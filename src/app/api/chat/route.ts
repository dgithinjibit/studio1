import { generateDPTEResponse } from '@/ai/flows/generate-dpte-response';
import { retrieveContext } from '@/lib/rag/dpte-curriculum';
import { CoreMessage, StreamingTextResponse } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const lastMessage = messages[messages.length - 1];
  const context = retrieveContext(lastMessage.content as string);
  
  const result = await generateDPTEResponse({
    query: lastMessage.content as string,
    context,
  });

  return new StreamingTextResponse(result.stream);
}
