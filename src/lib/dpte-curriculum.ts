// This file is deprecated. The logic has been moved to src/lib/rag/dpte-curriculum.ts
// to better organize the RAG components.
// This file can be safely deleted.

export const dpteKnowledgeBase: string[] = [];

export function retrieveContext(query: string, k: number = 10): string {
  return "This function is deprecated. Please use the retriever from src/lib/rag/dpte-curriculum.ts";
}
