"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookCopy, GraduationCap, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

import { handleTutorQuery, handleAssessment } from "@/app/actions";
import type { AssessTeacherResponseOutput } from "@/ai/flows/assess-teacher-response";
import { ChatMessage, type Message } from "@/components/chat-message";
import { AssessmentResult } from "@/components/assessment-result";
import { ThemeToggle } from "@/components/theme-toggle";

const assessmentSchema = z.object({
  question: z.string().min(10, "Please enter a more detailed question."),
  teacherResponse: z.string().min(20, "Please provide a comprehensive response for assessment."),
});

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your DPTE Co-Pilot. How can I help you with the curriculum today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTutorLoading, startTutorTransition] = useTransition();
  const [isAssessmentLoading, startAssessmentTransition] = useTransition();
  const [assessmentResult, setAssessmentResult] = useState<AssessTeacherResponseOutput | null>(null);
  
  const scrollAreaViewport = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof assessmentSchema>>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      question: "",
      teacherResponse: "",
    },
  });

  useEffect(() => {
    if (scrollAreaViewport.current) {
      scrollAreaViewport.current.scrollTop = scrollAreaViewport.current.scrollHeight;
    }
  }, [messages]);

  const onTutorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isTutorLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    startTutorTransition(async () => {
      const response = await handleTutorQuery(input);
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    });
  };

  const onAssessmentSubmit = (values: z.infer<typeof assessmentSchema>) => {
    setAssessmentResult(null);
    startAssessmentTransition(async () => {
      try {
        const result = await handleAssessment(values);
        setAssessmentResult(result);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Assessment Failed",
          description: "There was an error processing your assessment. Please try again.",
        });
        console.error(error);
      }
    });
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <Card className="w-full max-w-3xl h-[90vh] flex flex-col shadow-2xl">
        <CardHeader className="text-center relative">
          <CardTitle className="font-headline text-3xl tracking-tight">CurriculumAI</CardTitle>
          <CardDescription className="font-body">Your AI-Powered DPTE Co-Pilot</CardDescription>
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
        </CardHeader>
        <Tabs defaultValue="tutor" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tutor"><BookCopy className="mr-2" />AI Tutor</TabsTrigger>
              <TabsTrigger value="assessment"><GraduationCap className="mr-2" />Self Assessment</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="tutor" className="flex-1 flex flex-col overflow-hidden mt-0">
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-6" viewportRef={scrollAreaViewport}>
                <div className="space-y-6">
                  {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                  ))}
                   {isTutorLoading && <ChatMessage message={{ role: "assistant", content: "" }} isLoading />}
                </div>
              </ScrollArea>
              <div className="p-6 pt-2 border-t">
                <form onSubmit={onTutorSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about the DPTE curriculum..."
                    className="flex-1"
                    disabled={isTutorLoading}
                  />
                  <Button type="submit" size="icon" disabled={isTutorLoading || !input.trim()}>
                    {isTutorLoading ? <Loader2 className="animate-spin" /> : <Send />}
                  </Button>
                </form>
              </div>
            </CardContent>
          </TabsContent>
          <TabsContent value="assessment" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <CardContent className="p-6 space-y-6">
                <p className="text-sm text-muted-foreground">
                  Test your knowledge. Enter a curriculum question and your response. Our AI will assess your answer based on the official DPTE documents.
                </p>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAssessmentSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Curriculum Question</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Explain the role of play in early childhood education." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="teacherResponse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Response</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your detailed response here..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isAssessmentLoading} className="w-full">
                      {isAssessmentLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit for Assessment
                    </Button>
                  </form>
                </Form>

                {isAssessmentLoading && (
                  <div className="flex items-center justify-center pt-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Analyzing your response...</p>
                  </div>
                )}
                
                {assessmentResult && (
                  <div className="pt-6">
                    <AssessmentResult result={assessmentResult} />
                  </div>
                )}
              </CardContent>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}
