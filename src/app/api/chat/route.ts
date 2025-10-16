import { generateDPTEResponse } from '@/ai/flows/generate-dpte-response';
import { retrieveContext } from '@/lib/dpte-curriculum';
import { CoreMessage, StreamingTextResponse } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const lastMessage = messages[messages.length - 1];
  const context = retrieveContext(lastMessage.content as string);
  
  const stream = await generateDPTEResponse({
    query: lastMessage.content as string,
    context,
  });

  const decoder = new TextDecoder();
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(decoder.decode(chunk));
    },
  });

  stream.pipeTo(transformStream.writable);

  return new StreamingTextResponse(transformStream.readable);
}
