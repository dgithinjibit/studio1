import { generateDPTEResponse } from '@/ai/flows/generate-dpte-response';
import { retrieveContext } from '@/lib/dpte-curriculum';
import { CoreMessage, streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const lastMessage = messages[messages.length - 1];
  const context = retrieveContext(lastMessage.content as string);

  const stream = createStreamableValue();

  (async () => {
    const { response } = await generateDPTEResponse({
      query: lastMessage.content as string,
      context,
    });
    for await (const delta of response) {
      stream.update(delta);
    }
    stream.done();
  })();

  return new Response(stream.value);
}
