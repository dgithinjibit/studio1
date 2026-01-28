'use client';
import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { handleGenerateQuestion, handleAssessment } from '@/ai/actions';
import { useToast } from '@/hooks/use-toast';
import { AssessmentResult } from '@/components/assessment-result';
import type { AssessTeacherResponseOutput } from "@/ai/flows/assess-teacher-response";
import { CurriculumData } from '@/app/page';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

const FormSchema = z.object({
  subject: z.string({ required_error: 'Please select a learning area.' }),
  topic: z.string({ required_error: 'Please select a topic.' }),
  teacherResponse: z.string().optional(),
});

interface SelfAssessmentPanelProps {
  curriculumData: CurriculumData[];
}

export function SelfAssessmentPanel({ curriculumData }: SelfAssessmentPanelProps) {
  const [question, setQuestion] = React.useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = React.useState<AssessTeacherResponseOutput | null>(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = React.useState(false);
  const [isAssessing, setIsAssessing] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const selectedSubject = form.watch('subject');
  const topicsForSelectedSubject = React.useMemo(() => {
    return curriculumData.find((data) => data.subject === selectedSubject)?.topics || [];
  }, [selectedSubject, curriculumData]);

  React.useEffect(() => {
    // Reset topic when subject changes
    form.setValue('topic', '');
  }, [selectedSubject, form]);


  async function onGenerateQuestion(data: z.infer<typeof FormSchema>) {
    setIsGeneratingQuestion(true);
    setQuestion(null);
    setAssessmentResult(null);
    form.setValue('teacherResponse', '');
    try {
      const generatedQuestion = await handleGenerateQuestion({
        subject: data.subject,
        topic: data.topic,
      });
      setQuestion(generatedQuestion);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate a new question. Please try again.",
      });
    } finally {
      setIsGeneratingQuestion(false);
    }
  }

  async function onAssessResponse(data: z.infer<typeof FormSchema>) {
    if (!question || !data.teacherResponse) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a response to the question.",
        });
      return;
    }
    setIsAssessing(true);
    setAssessmentResult(null);
    try {
      const result = await handleAssessment({
        question,
        teacherResponse: data.teacherResponse,
      });
      setAssessmentResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get assessment. Please try again.",
      });
    } finally {
      setIsAssessing(false);
    }
  }

  return (
    <Card className="border-none shadow-none">
        <CardHeader className="text-left p-0 mb-6">
            <CardTitle className="text-xl">Self Assessment</CardTitle>
            <CardDescription>Select a learning area and topic to get a practice question.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Form {...form}>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Learning Area</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a learning area" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {curriculumData.map((data) => (
                                                <SelectItem key={data.subject} value={data.subject}>
                                                    {data.subject}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="topic"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Topic / Strand</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSubject}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a topic" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {topicsForSelectedSubject.map((topic) => (
                                                <SelectItem key={topic} value={topic}>
                                                    {topic}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button 
                        type="button" 
                        onClick={form.handleSubmit(onGenerateQuestion)}
                        disabled={isGeneratingQuestion || !form.getValues('subject') || !form.getValues('topic')}
                        className="w-full sm:w-auto"
                    >
                        {isGeneratingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate New Question
                    </Button>

                    {isGeneratingQuestion && (
                         <div className="flex items-center justify-center p-4 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Generating question...</span>
                        </div>
                    )}

                    {question && (
                        <div className="space-y-6 pt-4">
                            <Separator />
                            <Card className="bg-secondary/30">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">Your Question:</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{question}</p>
                                </CardContent>
                            </Card>
                            <FormField
                                control={form.control}
                                name="teacherResponse"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Response</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Type your response to the question here..."
                                                rows={8}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button 
                                type="button"
                                onClick={form.handleSubmit(onAssessResponse)}
                                disabled={isAssessing}
                                className="w-full sm:w-auto"
                            >
                                {isAssessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit for Assessment
                            </Button>
                        </div>
                    )}

                    {isAssessing && (
                        <div className="flex items-center justify-center p-4 text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Assessing your response...</span>
                        </div>
                    )}

                    {assessmentResult && (
                        <div className="pt-4">
                           <Separator />
                           <div className="mt-6">
                            <AssessmentResult result={assessmentResult} />
                           </div>
                        </div>
                    )}
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
