import fs from 'fs';
import path from 'path';
import { SelfAssessmentPanel } from '@/features/self-assessment/self-assessment-panel';
import { ThemeToggle } from '@/components/theme-toggle';

// Function to safely parse JSON
const safeJsonParse = (filePath: string) => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading or parsing ${filePath}:`, error);
    return null;
  }
};

export type CurriculumData = {
  subject: string;
  topics: string[];
};

export default function Home() {
  const dataDirectory = path.join(process.cwd(), 'src', 'data');
  const allFiles = fs.readdirSync(dataDirectory);
  const curriculumFiles = allFiles.filter(
    (file) => file.startsWith('dpte-') && file.endsWith('-guide.json')
  );

  const curriculumData: CurriculumData[] = curriculumFiles.map((file) => {
    const filePath = path.join(dataDirectory, file);
    const jsonContent = safeJsonParse(filePath);
    
    const subject = jsonContent?.document_title
      ?.replace('Diploma in Teacher Education - ', '')
      .replace(' Curriculum', '')
      .replace(' Guide', '') || 'Unknown Subject';

    const topics = jsonContent?.modules?.map((mod: any) => mod.strand) || [];

    return { subject, topics };
  }).filter(data => data.topics.length > 0); // Filter out subjects with no topics

  return (
    <main className="relative container flex h-screen flex-col items-center justify-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-3xl rounded-lg border bg-card text-card-foreground shadow-lg p-6">
        <div className="text-center mb-6">
            <h1 className="font-headline text-3xl tracking-tight">CurriculumAI</h1>
            <p className="text-muted-foreground">Your AI-Powered DPTE Co-Pilot</p>
        </div>
        <SelfAssessmentPanel curriculumData={curriculumData} />
      </div>
    </main>
  );
}
