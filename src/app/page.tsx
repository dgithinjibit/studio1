
import fs from 'fs/promises';
import path from 'path';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { SelfAssessmentPanel } from "@/features/chat/self-assessment-panel";
import { title } from 'process';

type CurriculumData = {
  [subject: string]: string[];
};

// Helper function to format file names into subject names
function formatSubjectName(fileName: string): string {
  return fileName
    .replace('dpte-', '')
    .replace('-guide.json', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function getCurriculumData(): Promise<CurriculumData> {
  const dataDirectory = path.join(process.cwd(), 'src', 'data');
  const curriculumData: CurriculumData = {};

  try {
    const files = await fs.readdir(dataDirectory);
    for (const file of files) {
      // Process only the guide files
      if (path.extname(file) === '.json' && file.endsWith('-guide.json')) {
        const filePath = path.join(dataDirectory, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        
        const subjectName = formatSubjectName(file);
        
        if (jsonData.modules && Array.isArray(jsonData.modules)) {
          const topics = jsonData.modules.map((module: any) => module.strand).filter(Boolean);
          if (topics.length > 0) {
            curriculumData[subjectName] = topics;
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to load curriculum data:", error);
    // Return a default structure in case of an error
    return { "Microteaching": ["1.0 The Practice of Microteaching", "2.0 Curriculum Design Interpretation"] };
  }

  return curriculumData;
}


export default async function Home() {
  const curriculumData = await getCurriculumData();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center relative">
          <CardTitle className="font-headline text-3xl tracking-tight">DPTE Self-Assessment</CardTitle>
          <CardDescription className="font-body">Your AI-Powered Study Partner</CardDescription>
          <div className="absolute top-4 right-4">
              <ThemeToggle />
          </div>
        </CardHeader>
        <CardContent>
            <SelfAssessmentPanel curriculumData={curriculumData} />
        </CardContent>
      </Card>
    </main>
  );
}
