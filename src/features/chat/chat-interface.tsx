
"use client";

import { useRef, useEffect } from "react";
import { useChat } from '@ai-sdk/react';
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatPanel } from "./chat-panel";
import { SelfAssessmentPanel } from "./self-assessment-panel";

const subjects = ["Microteaching", "Child Development", "Home Science", "Art and Craft", "Christian Religious Education", "Learning Techniques", "Science and Technology", "Mathematics"];

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading: isTutorLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: "assistant",
        content: "Hey, I am CurriculumAI. Let's proceed with your revision.",
      },
    ]
  });

  const scrollAreaViewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaViewport.current) {
      scrollAreaViewport.current.scrollTop = scrollAreaViewport.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl">
      <CardHeader className="text-center relative">
        <CardTitle className="font-headline text-3xl tracking-tight">CurriculumAI</CardTitle>
        <CardDescription className="font-body">Your AI-Powered DPTE Co-Pilot</CardDescription>
        <div className="absolute top-4 right-4 flex items-center gap-2">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline"><GraduationCap className="mr-2" /> Self Assessment</Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Self Assessment</SheetTitle>
                        <SheetDescription>
                            Test your knowledge with AI-generated questions based on the DPTE curriculum.
                        </SheetDescription>
                    </SheetHeader>
                    <SelfAssessmentPanel subjects={subjects} />
                </SheetContent>
            </Sheet>
            <ThemeToggle />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <ChatPanel
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isTutorLoading}
          scrollAreaViewport={scrollAreaViewport}
        />
      </CardContent>
    </Card>
  );
}
