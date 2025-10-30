
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { SelfAssessmentPanel } from "@/features/chat/self-assessment-panel";

const subjects = ["Microteaching", "Child Development", "Home Science", "Art and Craft", "Christian Religious Education", "Learning Techniques", "Science and Technology", "Mathematics"];

export default function Home() {
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
            <SelfAssessmentPanel subjects={subjects} />
        </CardContent>
      </Card>
    </main>
  );
}
