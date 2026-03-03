// This file simulates a vector database retrieval for the RAG model.
import fs from 'fs';
import path from 'path';

/**
 * System prompt for the DPTE Assistant.
 */
export const systemPrompt = `You are an expert DPTE (Diploma in Teacher Education) Assistant and Curriculum Specialist. 
Your goal is to help teacher trainees understand the curriculum, prepare for assessments, and improve their pedagogical skills. 
Always refer to the provided curriculum context documents to provide authoritative and accurate answers.
If the context does not contain the answer, politely state that the information is not available in the current curriculum guides.`;

// Function to recursively extract text from a JSON object
function extractTextFromObject(obj: any): string[] {
  let texts: string[] = [];
  if (obj === null || typeof obj !== 'object') {
    return texts;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'string') {
         // A simple heuristic to combine keys and values into meaningful sentences
         if (key !== 'document_title' && value.length < 100) {
            texts.push(`${key.replace(/_/g, ' ')}: ${value}`);
         } else {
            texts.push(value);
         }
      } else if (Array.isArray(value)) {
        texts = texts.concat(value.flatMap(item => extractTextFromObject(item)));
      } else if (typeof value === 'object') {
        texts = texts.concat(extractTextFromObject(value));
      }
    }
  }
  return texts;
}

function loadKnowledgeBase(): string[] {
  const dataDirectory = path.join(process.cwd(), 'src', 'data');
  
  if (!fs.existsSync(dataDirectory)) {
    console.warn(`Data directory not found at ${dataDirectory}`);
    return [];
  }

  const allFiles = fs.readdirSync(dataDirectory);
  const curriculumFiles = allFiles.filter(
    (file) => (file.startsWith('dpte-') && file.endsWith('.json'))
  );

  let allKnowledge: string[] = [];

  curriculumFiles.forEach(file => {
    try {
      const filePath = path.join(dataDirectory, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      allKnowledge.push(...extractTextFromObject(jsonData));
    } catch (error) {
      console.error(`Error loading or processing ${file}:`, error);
    }
  });
  
  // Filter out very short, non-descriptive lines and remove duplicates
  return [...new Set(allKnowledge)].filter(line => line.length > 20);
}

const dpteKnowledgeBase: string[] = loadKnowledgeBase();

/**
 * A simple keyword-based retrieval function to simulate finding relevant context.
 * It scores chunks based on the number of matching query words.
 * @param query The user's question or topic.
 * @param k The number of top chunks to return.
 * @returns A single string containing the concatenated relevant context.
 */
export async function retrieveContext(query: string, k: number = 10): Promise<string> {
  const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(word => word.length > 2));

  if (queryWords.size === 0) {
    return ""; // Return empty if query is meaningless
  }

  const scoredChunks = dpteKnowledgeBase.map(chunk => {
    let score = 0;
    const chunkLower = chunk.toLowerCase();
    for (const word of queryWords) {
      if (chunkLower.includes(word)) {
        score++;
      }
    }
    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  const relevantChunks = scoredChunks.filter(item => item.score > 0);
  
  if(relevantChunks.length === 0){
      return "I could not find specific information on that topic in the curriculum documents."
  }

  const topChunks = relevantChunks.slice(0, k).map(item => item.chunk);
  
  return topChunks.join('\n\n---\n\n');
}
