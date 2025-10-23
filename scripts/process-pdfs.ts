import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import { structureCurriculum, StructureCurriculumOutput } from '@/ai/flows/structure-curriculum-flow';

const pdfsDirectory = path.join(process.cwd(), 'src', 'data', 'pdfs');
const outputDirectory = path.join(process.cwd(), 'src', 'data');
const rawTextOutputFilePath = path.join(outputDirectory, 'processed-pdfs.json'); // Keep this for debugging/fallback

async function processPdfs() {
  console.log('Starting PDF processing...');
  try {
    // Ensure the output directory exists
    await fs.mkdir(outputDirectory, { recursive: true });

    const pdfFiles = await fs.readdir(pdfsDirectory);
    const allProcessedJSONs: StructureCurriculumOutput[] = [];

    for (const pdfFile of pdfFiles) {
      if (path.extname(pdfFile).toLowerCase() === '.pdf') {
        const pdfPath = path.join(pdfsDirectory, pdfFile);
        console.log(`Processing: ${pdfFile}`);
        
        try {
          const dataBuffer = await fs.readFile(pdfPath);
          const data = await pdf(dataBuffer);
          
          const cleanedText = data.text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
            
          console.log(`Extracted text from ${pdfFile}. Now structuring with AI...`);

          // Use the AI flow to structure the text
          const structuredData = await structureCurriculum({ rawText: cleanedText });
          
          // Save the structured JSON to a new file
          const outputJsonFileName = `${path.parse(pdfFile).name}.json`;
          const outputJsonFilePath = path.join(outputDirectory, outputJsonFileName);
          await fs.writeFile(outputJsonFilePath, JSON.stringify(structuredData, null, 2), 'utf-8');
          console.log(`Successfully structured and saved to ${outputJsonFilePath}`);

          // We will add the structured data to our knowledge base later
          // For now, let's keep the old file for raw text as a fallback
          allProcessedJSONs.push(structuredData);

        } catch (error) {
          console.error(`Error processing file ${pdfFile}:`, error);
        }
      }
    }
    
    // For now, we will save the raw text from all PDFs to processed-pdfs.json as a fallback.
    // In a future step, we will use the individual structured JSON files directly.
    const allPdfTexts = allProcessedJSONs.map(json => JSON.stringify(json));
    await fs.writeFile(rawTextOutputFilePath, JSON.stringify(allPdfTexts, null, 2), 'utf-8');
    console.log(`Successfully processed ${pdfFiles.length} PDFs. Raw text fallback saved to ${rawTextOutputFilePath}`);


  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`PDFs directory not found at ${pdfsDirectory}. Skipping PDF processing.`);
      await fs.writeFile(rawTextOutputFilePath, JSON.stringify([], null, 2), 'utf-8');
    } else {
      console.error('An error occurred during PDF processing:', error);
      process.exit(1);
    }
  }
}

processPdfs();
