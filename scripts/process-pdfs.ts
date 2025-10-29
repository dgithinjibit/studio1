
import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import { structureCurriculum, StructureCurriculumOutput } from '@/ai/flows/structure-curriculum-flow';

const pdfsDirectory = path.join(process.cwd(), 'src', 'data', 'pdfs');
const outputDirectory = path.join(process.cwd(), 'src', 'data');
const rawTextOutputFilePath = path.join(outputDirectory, 'processed-pdfs.json'); // This will now be mostly empty, but we'll keep it to avoid breaking things.

async function processPdfs() {
  console.log('Starting PDF to Structured JSON conversion...');
  try {
    // Ensure the output directory exists
    await fs.mkdir(outputDirectory, { recursive: true });

    const files = await fs.readdir(pdfsDirectory);
    
    for (const file of files) {
      if (path.extname(file).toLowerCase() === '.pdf') {
        const pdfPath = path.join(pdfsDirectory, file);
        const outputJsonFileName = `${path.parse(file).name}.json`;
        const outputJsonFilePath = path.join(outputDirectory, outputJsonFileName);
        
        console.log(`Processing: ${file}`);
        
        try {
          const dataBuffer = await fs.readFile(pdfPath);
          const data = await pdf(dataBuffer);
          
          const cleanedText = data.text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
            
          if (cleanedText.length < 100) {
            console.log(`Skipping ${file} due to insufficient text content.`);
            continue;
          }

          console.log(`Extracted text from ${file}. Now structuring with AI...`);

          // Use the AI flow to structure the text
          const structuredData = await structureCurriculum({ rawText: cleanedText });
          
          // Save the structured JSON to a new file in the /data directory
          await fs.writeFile(outputJsonFilePath, JSON.stringify(structuredData, null, 2), 'utf-8');
          console.log(`Successfully structured and saved to ${outputJsonFilePath}`);

        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
        }
      }
    }
    
    // We keep this file to ensure the build doesn't break, but it's no longer the primary source.
    await fs.writeFile(rawTextOutputFilePath, JSON.stringify([]), 'utf-8');
    console.log('PDF processing complete. Structured JSON files have been created in src/data/.');

  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`PDFs directory not found at ${pdfsDirectory}. Skipping PDF processing.`);
      await fs.writeFile(rawTextOutputFilePath, JSON.stringify([]), 'utf-8');
    } else {
      console.error('An error occurred during PDF processing:', error);
      process.exit(1);
    }
  }
}

processPdfs();
