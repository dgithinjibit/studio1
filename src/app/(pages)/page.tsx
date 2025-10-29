import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatInterface } from "@/features/chat/chat-interface";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <Card className="w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl">
        <CardHeader className="text-center relative">
          <CardTitle className="font-headline text-3xl tracking-tight">CurriculumAI</CardTitle>
          <CardDescription className="font-body">Your AI-Powered DPTE Co-Pilot</CardDescription>
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <ChatInterface />
        </CardContent>
      </Card>
    </main>
  );
}
