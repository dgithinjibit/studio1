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

// Official DPTE Subject Mapping to clean up and standardize names from the JSON files
const SUBJECT_MAP: Record<string, string> = {
  "Art and Craft": "Art & Craft",
  "Child Development and Psychology": "Child Development & Psychology",
  "Christian Religious Education (CRE)": "Christian Religious Education",
  "Microteaching": "Microteaching",
  "Home Science": "Home Science",
  "Mathematics": "Mathematics",
  "Science and Technology": "Science & Technology",
  "Physical and Health Education": "Physical Education",
  "Research": "Research Skills"
};

export default function Home() {
  const dataDirectory = path.join(process.cwd(), 'src', 'data');
  
  if (!fs.existsSync(dataDirectory)) {
    return (
      <main className="container flex h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Data directory missing</h1>
          <p className="text-muted-foreground">Please ensure src/data exists and contains curriculum guides.</p>
        </div>
      </main>
    );
  }

  const allFiles = fs.readdirSync(dataDirectory);
  const curriculumFiles = allFiles.filter(
    (file) => file.startsWith('dpte-') && file.endsWith('-guide.json')
  );

  const curriculumData: CurriculumData[] = curriculumFiles.map((file) => {
    const filePath = path.join(dataDirectory, file);
    const jsonContent = safeJsonParse(filePath);
    
    // Extract raw subject from title
    let rawSubject = jsonContent?.document_title
      ?.replace('Diploma in Teacher Education - ', '')
      ?.replace('Diploma in Teacher Education (DTE) - ', '')
      ?.replace(' Curriculum', '')
      ?.replace(' Guide', '') || 'Unknown Subject';

    // Map to official subject name if a mapping exists
    const subject = SUBJECT_MAP[rawSubject] || rawSubject;

    const topics = jsonContent?.modules?.map((mod: any) => mod.strand) || [];

    return { subject, topics };
  }).filter(data => data.topics.length > 0);

  // Sort subjects alphabetically for a better user experience
  curriculumData.sort((a, b) => a.subject.localeCompare(b.subject));

  return (
    <main className="relative container flex h-screen flex-col items-center justify-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-4xl rounded-lg border bg-card text-card-foreground shadow-lg p-6">
        <div className="text-center mb-8">
            <h1 className="font-headline text-4xl tracking-tight mb-2">CurriculumAI</h1>
            <p className="text-muted-foreground text-lg">Your AI-Powered DPTE Co-Pilot</p>
        </div>
        <SelfAssessmentPanel curriculumData={curriculumData} />
      </div>
    </main>
  );
}
