// This file simulates a vector database retrieval for the RAG model.
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
        // Exclude keys that are just for structure
        if (key !== 'document_title' && key !== 'title' && key !== 'unique_edge' && key !== 'thesis') {
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
  const constitutionPath = path.join(dataDirectory, 'bitkumon-constitution.json');
  let allKnowledge: string[] = [];

  try {
    const fileContent = fs.readFileSync(constitutionPath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    // Exclude the raw system prompt itself from the general RAG context
    const { system_prompt, ...restOfCoreEngine } = jsonData.ai_core_engine;
    const contextData = {
        ...jsonData.validation,
        ...restOfCoreEngine,
        ...jsonData.webapp_features,
        ...jsonData.monetization,
        ...jsonData.mvp
    };
    allKnowledge = extractText(contextData);
    console.log(`Successfully loaded and processed bitkumon-constitution.json`);
  } catch (error) {
    console.error(`Error loading or processing bitkumon-constitution.json:`, error);
  }
  
  // Remove duplicates and filter out very short, non-descriptive lines
  return [...new Set(allKnowledge)].filter(line => line.length > 10);
}


function getSystemPrompt(): string {
  const dataDirectory = path.join(process.cwd(), 'src', 'data');
  const constitutionPath = path.join(dataDirectory, 'bitkumon-constitution.json');
  try {
    const fileContent = fs.readFileSync(constitutionPath, 'utf-8');
    const jsonData = JSON.parse(fileContent);
    return jsonData.ai_core_engine.system_prompt;
  } catch (error) {
    console.error('Failed to load system prompt:', error);
    // Fallback prompt
    return "You are a helpful AI assistant.";
  }
}

// Load the knowledge base and system prompt dynamically on server start
export const knowledgeBase: string[] = loadKnowledgeBase();
export const systemPrompt = getSystemPrompt();


/**
 * A simple keyword-based retrieval function to simulate finding relevant context.
 * It scores chunks based on the number of matching query words.
 * @param query The user's question.
 * @param k The number of top chunks to return.
 * @returns A single string containing the concatenated relevant context.
 */
export function retrieveContext(query: string, k: number = 15): string {
  const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(word => word.length > 2));

  if (queryWords.size === 0) {
    return "Welcome to BitKumon! I am here to guide you on your Bitcoin journey. Ask me anything to get started, or tell me about your learning goals.";
  }

  const scoredChunks = knowledgeBase.map(chunk => {
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
      return "I could not find specific information on that in my constitution. Please ask another question about Bitcoin or your learning path."
  }

  const topChunks = relevantChunks.slice(0, k).map(item => item.chunk);
  
  return topChunks.join('\n\n---\n\n');
}
