"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookCopy, GraduationCap, Loader2, Send, WandSparkles } from "lucide-react";
import { useChat, type Message } from '@ai-sdk/react';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { handleAssessment, handleGenerateQuestion } from "@/app/actions";
import type { AssessTeacherResponseOutput } from "@/ai/flows/assess-teacher-response";
import { ChatMessage } from "@/components/chat-message";
import { AssessmentResult } from "@/components/assessment-result";
import { ThemeToggle } from "@/components/theme-toggle";

const assessmentSchema = z.object({
  teacherResponse: z.string().min(20, "Please provide a comprehensive response for assessment."),
});

const subjects = ["Microteaching", "Child Development", "Home Science", "Art and Craft", "Christian Religious Education"];

export default function Home() {
  
  const { messages, input, handleInputChange, handleSubmit, isLoading: isTutorLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: "assistant",
        content: "Hello! I am your DPTE Co-Pilot. How can I help you with the curriculum today?",
      },
    ]
  });

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [assessmentQuestion, setAssessmentQuestion] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessTeacherResponseOutput | null>(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const isAssessmentLoading = isGeneratingQuestion || isAssessing;
  
  const scrollAreaViewport = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof assessmentSchema>>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      teacherResponse: "",
    },
  });

  useEffect(() => {
    if (scrollAreaViewport.current) {
      scrollAreaViewport.current.scrollTop = scrollAreaViewport.current.scrollHeight;
    }
  }, [messages]);

  
  const onGenerateQuestion = async () => {
    if (!selectedSubject) {
       toast({
        variant: "destructive",
        title: "No Subject Selected",
        description: "Please select a subject before generating a question.",
      });
      return;
    }

    setAssessmentQuestion(null);
    setAssessmentResult(null);
    form.reset();
    setIsGeneratingQuestion(true);

    try {
      const question = await handleGenerateQuestion(selectedSubject);
      setAssessmentQuestion(question);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Failed to Generate Question",
        description: "There was an error generating a new question. Please try again.",
      });
      console.error(error);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const onAssessmentSubmit = async (values: z.infer<typeof assessmentSchema>) => {
    if (!assessmentQuestion) return;

    setAssessmentResult(null);
    setIsAssessing(true);

    try {
      const result = await handleAssessment({
        question: assessmentQuestion,
        teacherResponse: values.teacherResponse
      });
      setAssessmentResult(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Assessment Failed",
        description: "There was an error processing your assessment. Please try again.",
      });
      console.error(error);
    } finally {
      setIsAssessing(false);
    }
  };
  
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setAssessmentQuestion(null);
    setAssessmentResult(null);
    form.reset();
  }

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
                   {isTutorLoading && messages[messages.length -1]?.role === 'user' && <ChatMessage message={{ role: "assistant", content: "" }} isLoading />}
                </div>
              </ScrollArea>
              <div className="p-6 pt-2 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
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
                <div className="flex flex-col items-center text-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Ready to test your knowledge? Select a subject, and the AI will generate a question for you based on the DPTE curriculum.
                  </p>
                  <div className="w-full max-w-sm">
                     <Select onValueChange={handleSubjectChange} value={selectedSubject ?? ""}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a subject..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={onGenerateQuestion} disabled={isAssessmentLoading || !selectedSubject}>
                    {isGeneratingQuestion ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <WandSparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate New Question
                  </Button>
                </div>

                {isGeneratingQuestion && (
                  <div className="flex items-center justify-center pt-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4 text-muted-foreground">Generating question for {selectedSubject}...</p>
                  </div>
                )}
                
                {assessmentQuestion && (
                  <div className="space-y-6 pt-4">
                    <Alert>
                      <AlertTitle className="font-semibold">Your Question for {selectedSubject}:</AlertTitle>
                      <AlertDescription className="text-foreground">
                        {assessmentQuestion}
                      </AlertDescription>
                    </Alert>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onAssessmentSubmit)} className="space-y-4">
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
                        <Button type="submit" disabled={isAssessing} className="w-full">
                          {isAssessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Submit for Assessment
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}

                {isAssessing && (
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
