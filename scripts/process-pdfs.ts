import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';

const pdfsDirectory = path.join(process.cwd(), 'src', 'data', 'pdfs');
const outputFilePath = path.join(process.cwd(), 'src', 'data', 'processed-pdfs.json');

async function processPdfs() {
  console.log('Starting PDF processing...');
  try {
    // Ensure the output directory exists
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });

    const pdfFiles = await fs.readdir(pdfsDirectory);
    const allPdfTexts: string[] = [];

    for (const pdfFile of pdfFiles) {
      if (path.extname(pdfFile).toLowerCase() === '.pdf') {
        const pdfPath = path.join(pdfsDirectory, pdfFile);
        console.log(`Processing: ${pdfFile}`);
        
        try {
          const dataBuffer = await fs.readFile(pdfPath);
          const data = await pdf(dataBuffer);
          
          // Basic text cleaning
          const cleanedText = data.text
            .split('\n')
            .map(line => line.trim()) // Trim whitespace from each line
            .filter(line => line.length > 0) // Remove empty lines
            .join('\n');
            
          allPdfTexts.push(cleanedText);
        } catch (error) {
          console.error(`Error processing file ${pdfFile}:`, error);
        }
      }
    }

    // Save the combined text to a JSON file
    await fs.writeFile(outputFilePath, JSON.stringify(allPdfTexts, null, 2), 'utf-8');
    console.log(`Successfully processed ${pdfFiles.length} PDFs and saved to ${outputFilePath}`);

  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn(`PDFs directory not found at ${pdfsDirectory}. Skipping PDF processing.`);
      // Create an empty JSON file if the directory doesn't exist to prevent build errors
      await fs.writeFile(outputFilePath, JSON.stringify([], null, 2), 'utf-8');
    } else {
      console.error('An error occurred during PDF processing:', error);
      process.exit(1);
    }
  }
}

processPdfs();
