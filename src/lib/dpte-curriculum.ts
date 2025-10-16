// This file simulates a vector database retrieval for the RAG model.
// In a real-world application, this would be replaced by a call to a vector store
// like Firestore with a vector search extension, Pinecone, or similar.
import microteachingGuide from './dpte-curriculum-guide.json';
import childDevelopmentGuide from './dpte-child-development-guide.json';
import homeScienceGuide from './dpte-home-science-guide.json';
import learningTechniquesGuide from './learning-techniques-guide.json';
import artAndCraftGuide from './dpte-art-and-craft-guide.json';

// Function to recursively extract text from a JSON object
function extractText(obj: any): string[] {
  let texts: string[] = [];
  if (obj === null || typeof obj !== 'object') {
    return texts;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        // Create meaningful sentences from key-value pairs
        if (key !== 'document_title' && key !== 'name' && key !== 'strand' && !key.includes('_id') && !key.includes('reference')) {
           texts.push(`${key.replace(/_/g, ' ')}: ${value}`);
        } else {
            texts.push(value);
        }
      } else if (Array.isArray(value)) {
        texts = texts.concat(value.flatMap(item => extractText(item)));
      } else if (typeof value === 'object') {
        texts = texts.concat(extractText(value));
      }
    }
  }
  return texts;
}

// Convert the JSON guides into flat arrays of strings
const microteachingKnowledgeBase: string[] = extractText(microteachingGuide);
const childDevelopmentKnowledgeBase: string[] = extractText(childDevelopmentGuide);
const homeScienceKnowledgeBase: string[] = extractText(homeScienceGuide);
const learningTechniquesKnowledgeBase: string[] = extractText(learningTechniquesGuide);
const artAndCraftKnowledgeBase: string[] = extractText(artAndCraftGuide);

// Combine knowledge bases
export const dpteKnowledgeBase: string[] = [...new Set([...microteachingKnowledgeBase, ...childDevelopmentKnowledgeBase, ...homeScienceKnowledgeBase, ...learningTechniquesKnowledgeBase, ...artAndCraftKnowledgeBase])];


/**
 * A simple keyword-based retrieval function to simulate finding relevant context.
 * It scores chunks based on the number of matching query words.
 * @param query The user's question.
 * @param k The number of top chunks to return.
 * @returns A single string containing the concatenated relevant context.
 */
export function retrieveContext(query: string, k: number = 10): string {
  const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(word => word.length > 3));

  if (queryWords.size === 0) {
    // If query is empty or has no meaningful words, return a summary or top-level info.
    const summary = `The available documents are the "Diploma in Teacher Education (DTE) - Microteaching Guide" and the "Child Development and Psychology Curriculum Design". They cover Strands like "The Practice of Microteaching", "Curriculum Design Interpretation", "Theories of Learning", and "Guidance and Counselling".`;
    return summary;
  }

  const scoredChunks = dpteKnowledgeBase.map(chunk => {
    const chunkWords = new Set(chunk.toLowerCase().split(/\s+/));
    let score = 0;
    for (const word of queryWords) {
      if (chunk.toLowerCase().includes(word)) { // Use 'includes' for partial matches
        score++;
      }
    }
    // Boost score for chunks that are more 'complete' sentences or definitions.
    if(chunk.includes(':')) score += 0.5;

    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  // Filter out chunks with a score of 0
  const relevantChunks = scoredChunks.filter(item => item.score > 0);
  
  // If no relevant chunks are found, provide a generic message.
  if(relevantChunks.length === 0){
      return "The provided curriculum guides do not seem to contain specific information on that topic. Please try rephrasing your question or ask about microteaching, child development, curriculum design, or professional documents."
  }

  const topChunks = relevantChunks.slice(0, k).map(item => item.chunk);
  
  return topChunks.join("\n\n");
}