// This file simulates a vector database retrieval for the RAG model.
// In a real-world application, this would be replaced by a call to a vector store
// like Firestore with a vector search extension, Pinecone, or similar.

export const dpteKnowledgeBase: string[] = [
  "Foundations of Education: This course explores the historical, philosophical, and sociological foundations of education in Kenya. It examines the development of the education system, key educational policies, and the role of the teacher in society. Core topics include the 8-4-4 system transition to the Competency-Based Curriculum (CBC).",
  "Child Development and Psychology: This area focuses on the physical, cognitive, social, and emotional development of children from birth through adolescence. Trainees learn about major developmental theories from theorists like Piaget, Vygotsky, and Erikson, and how to apply this knowledge to create age-appropriate learning experiences.",
  "Curriculum Studies: Trainees delve into the principles of curriculum design, development, implementation, and evaluation. Special emphasis is placed on understanding and interpreting the Kenyan Competency-Based Curriculum (CBC) framework, including core competencies, learning areas, and assessment methods.",
  "Pedagogy and Instructional Methods: This course covers a wide range of teaching strategies and methods suitable for primary education. It includes learner-centered approaches, inquiry-based learning, project-based learning, and the effective use of instructional materials. The integration of ICT in teaching and learning is a key component.",
  "Classroom Management: This practical course equips trainees with skills for creating a positive, safe, and productive learning environment. Topics include setting expectations, managing learner behavior, organizing classroom resources, and effective communication strategies with learners and parents.",
  "Educational Assessment and Evaluation: Trainees learn how to design and use various assessment tools to monitor and evaluate learner progress. This includes formative, summative, and authentic assessment techniques as prescribed by the CBC, such as portfolios, observation checklists, and project rubrics.",
  "Inclusive Education: This course addresses the needs of learners with diverse backgrounds and abilities. It covers strategies for identifying and supporting learners with special needs, creating inclusive classroom cultures, and adapting instructional materials and methods to ensure every child can succeed.",
  "Micro-teaching and Practicum: This is the practical component where trainees apply their theoretical knowledge in real and simulated classroom settings. Micro-teaching sessions provide opportunities for peer feedback, while the practicum involves supervised teaching in partner primary schools, which is crucial for professional growth.",
  "Environmental Activities Integration: As per the CBC, Environmental Activities should be integrated across various learning areas. For Grade 3, a lesson on 'Local Industries' could involve a nature walk to identify raw materials (Environmental Activity), followed by a modeling exercise using clay (Art and Craft), and writing a short story about a local artisan (Literacy).",
  "Role of Play in Early Years Education: Play is recognized as a primary vehicle for learning in the early years. The DPTE curriculum emphasizes play-based learning to develop social skills, problem-solving abilities, creativity, and language. Activities should be purposeful and guided by the teacher to meet specific learning outcomes.",
];

/**
 * A simple keyword-based retrieval function to simulate finding relevant context.
 * It scores chunks based on the number of matching query words.
 * @param query The user's question.
 * @param k The number of top chunks to return.
 * @returns A single string containing the concatenated relevant context.
 */
export function retrieveContext(query: string, k: number = 3): string {
  const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(word => word.length > 3));

  if (queryWords.size === 0) {
    return dpteKnowledgeBase.slice(0, k).join("\n\n");
  }

  const scoredChunks = dpteKnowledgeBase.map(chunk => {
    const chunkWords = new Set(chunk.toLowerCase().split(/\s+/));
    let score = 0;
    for (const word of queryWords) {
      if (chunkWords.has(word)) {
        score++;
      }
    }
    return { chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  const topChunks = scoredChunks.slice(0, k).map(item => item.chunk);
  
  return topChunks.join("\n\n");
}
