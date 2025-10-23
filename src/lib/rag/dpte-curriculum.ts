// This file simulates a vector database retrieval for the RAG model.
// In a real-world application, this would be replaced by a call to a vector store
// like Firestore with a vector search extension, Pinecone, or similar.

// IMPORTANT: This file has been refactored to dynamically load all .json files
// from the src/data/ directory. You no longer need to manually import them.
// The `scripts/process-pdfs.ts` script will convert PDFs into new .json files
// in this directory, and they will be automatically included in the knowledge base.
import fs from 'fs';
import path from 'path';

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

function loadKnowledgeBase(): string[] {
  const dataDirectory = path.join(process.cwd(), 'src', 'data');
  let allKnowledge: string[] = [];

  try {
    const files = fs.readdirSync(dataDirectory);
    
    for (const file of files) {
      if (path.extname(file).toLowerCase() === '.json') {
        const filePath = path.join(dataDirectory, file);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const jsonData = JSON.parse(fileContent);
          const extracted = extractText(jsonData);
          allKnowledge = allKnowledge.concat(extracted);
          console.log(`Successfully loaded and processed ${file}`);
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading data directory ${dataDirectory}:`, error);
  }
  
  // Remove duplicates
  return [...new Set(allKnowledge)];
}

// Load the knowledge base dynamically on server start
export const dpteKnowledgeBase: string[] = loadKnowledgeBase();


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
