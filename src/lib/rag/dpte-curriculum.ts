// This file simulates a vector database retrieval for the RAG model.
// In a real-world application, this would be replaced by a call to a vector store
// like Firestore with a vector search extension, Pinecone, or similar.
import microteachingGuide from '@/data/dpte-curriculum-guide.json';
import childDevelopmentGuide from '@/data/dpte-child-development-guide.json';
import homeScienceGuide from '@/data/dpte-home-science-guide.json';
import learningTechniquesGuide from '@/data/learning-techniques-guide.json';
import artAndCraftGuide from '@/data/dpte-art-and-craft-guide.json';
import creGuide from '@/data/dpte-cre-guide.json';
// Import any other structured JSONs you have
// For example: import kiswahiliGuide from '@/data/dpte-kiswahili-guide.json';

// Note: The `process-pdfs.ts` script will generate new JSON files in /data.
// After running the script, you would manually import them here to include them in the knowledge base.
// This is a placeholder for dynamically loading all JSONs in a real app.

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

const allGuides = [
  microteachingGuide,
  childDevelopmentGuide,
  homeScienceGuide,
  learningTechniquesGuide,
  artAndCraftGuide,
  creGuide,
  // Add other imported guides here, e.g., kiswahiliGuide
];

const allKnowledgeBases = allGuides.flatMap(guide => extractText(guide));

// Combine all knowledge bases and remove duplicates
export const dpteKnowledgeBase: string[] = [...new Set(allKnowledgeBases)];


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
    const summary = `The available documents cover various DPTE subjects including Microteaching, Child Development, Home Science, Art and Craft, and CRE. They cover Strands like "The Practice of Microteaching", "Curriculum Design Interpretation", "Theories of Learning", and "Guidance and Counselling".`;
    return summary;
  }

  const scoredChunks = dpteKnowledgeBase.map(chunk => {
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
      return "The provided curriculum guides do not seem to contain specific information on that topic. Please try rephrasing your question."
  }

  const topChunks = relevantChunks.slice(0, k).map(item => item.chunk);
  
  return topChunks.join('\n\n---\n\n');
}
