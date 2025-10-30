
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssessmentResult } from "@/components/assessment-result";
import { handleAssessment, handleGenerateQuestion } from "@/ai/actions";
import type { AssessTeacherResponseOutput } from "@/ai/flows/assess-teacher-response";

const assessmentSchema = z.object({
  teacherResponse: z.string().min(20, "Please provide a comprehensive response for assessment."),
});

interface SelfAssessmentPanelProps {
  subjects: string[];
}

export function SelfAssessmentPanel({ subjects }: SelfAssessmentPanelProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [assessmentQuestion, setAssessmentQuestion] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessTeacherResponseOutput | null>(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const isAssessmentLoading = isGeneratingQuestion || isAssessing;
  
  const { toast } = useToast();

  const form = useForm<z.infer<typeof assessmentSchema>>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      teacherResponse: "",
    },
  });

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
      <div className="space-y-6">
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
      </div>
  );
}
