import { ai } from '@/ai/genkit';
import { retrieveContext, systemPrompt } from '@/lib/rag/dpte-curriculum';
import { CoreMessage } from 'ai';

export async function bitkumonFlow(input: { messages: CoreMessage[] }) {
  const userQuery = input.messages[input.messages.length - 1]?.content;

  if (typeof userQuery !== 'string') {
    throw new Error('Invalid user query');
  }

  // Retrieve context relevant to the latest user query
  const context = await retrieveContext(userQuery);

  // Map the message history to the format expected by the Genkit model
  const history = input.messages.map(msg => ({
    role: msg.role as 'user' | 'model',
    content: [{ text: msg.content as string }],
  }));

  const { stream } = await ai.generateStream({
    model: 'googleai/gemini-1.5-flash-latest', // A capable model for complex instructions
    // Provide the AI with the system prompt, relevant context, and the full conversation history
    prompt: `Based on the following context, answer the user's query.\n\nContext: ${context}`,
    system: systemPrompt,
    history: history, // Pass the entire history for conversational context
  });

  return stream;
}
