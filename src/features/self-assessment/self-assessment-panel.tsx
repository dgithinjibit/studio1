'use client';
import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { 
  handleGenerateQuestion, 
  handleAssessment, 
  handleGeneratePeerWork, 
  handlePeerAssessment 
} from '@/ai/actions';
import { useToast } from '@/hooks/use-toast';
import { AssessmentResult } from '@/components/assessment-result';
import type { AssessTeacherResponseOutput } from "@/ai/flows/assess-teacher-response";
import { CurriculumData } from '@/app/page';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Users, ClipboardCheck, RotateCcw } from 'lucide-react';

const FormSchema = z.object({
  mode: z.enum(['self', 'peer'], { required_error: 'Please select an assessment mode.' }),
  assessmentType: z.enum(['formative', 'summative', 'diagnostic', 'authentic'], { required_error: 'Please select an assessment type.' }),
  subject: z.string({ required_error: 'Please select a learning area.' }),
  topic: z.string({ required_error: 'Please select a topic.' }),
  userResponse: z.string().optional(),
});

interface SelfAssessmentPanelProps {
  curriculumData: CurriculumData[];
}

export function SelfAssessmentPanel({ curriculumData }: SelfAssessmentPanelProps) {
  const [question, setQuestion] = React.useState<string | null>(null);
  const [peerResponse, setPeerResponse] = React.useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = React.useState<AssessTeacherResponseOutput | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isAssessing, setIsAssessing] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mode: 'self',
      assessmentType: 'formative',
    }
  });

  const selectedSubject = form.watch('subject');
  const selectedMode = form.watch('mode');
  
  const topicsForSelectedSubject = React.useMemo(() => {
    return curriculumData.find((data) => data.subject === selectedSubject)?.topics || [];
  }, [selectedSubject, curriculumData]);

  // Reset topic and results when subject or mode changes
  React.useEffect(() => {
    form.setValue('topic', '');
    setQuestion(null);
    setPeerResponse(null);
    setAssessmentResult(null);
  }, [selectedSubject, selectedMode, form]);

  const handleReset = () => {
    setQuestion(null);
    setPeerResponse(null);
    setAssessmentResult(null);
    form.setValue('userResponse', '');
    form.setValue('topic', '');
    form.setValue('subject', '');
  };

  async function onGenerate(data: z.infer<typeof FormSchema>) {
    setIsGenerating(true);
    setQuestion(null);
    setPeerResponse(null);
    setAssessmentResult(null);
    form.setValue('userResponse', '');
    try {
      if (data.mode === 'self') {
        const generatedQuestion = await handleGenerateQuestion({
          subject: data.subject,
          topic: data.topic,
          assessmentType: data.assessmentType,
        });
        setQuestion(generatedQuestion);
      } else {
        const result = await handleGeneratePeerWork({
          subject: data.subject,
          topic: data.topic,
          assessmentType: data.assessmentType,
        });
        setQuestion(result.question);
        setPeerResponse(result.peerResponse);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate content. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function onAssess(data: z.infer<typeof FormSchema>) {
    if (!question || !data.userResponse) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a response/review.",
        });
      return;
    }
    setIsAssessing(true);
    setAssessmentResult(null);
    try {
      if (data.mode === 'self') {
        const result = await handleAssessment({
          question,
          teacherResponse: data.userResponse,
        });
        setAssessmentResult(result);
      } else {
        const result = await handlePeerAssessment({
          question,
          peerResponse: peerResponse!,
          userReview: data.userResponse,
        });
        setAssessmentResult(result);
      }
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
            <CardTitle className="text-xl">Interactive Assessment</CardTitle>
            <CardDescription>Practice by answering questions or critiquing peer work using specific pedagogical methods.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            <Form {...form}>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField
                            control={form.control}
                            name="mode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assessment Mode</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select mode" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="self">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} /> Self Assessment
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="peer">
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} /> Peer Assessment
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="assessmentType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assessment Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="formative">
                                                <div className="flex items-center gap-2">
                                                    <ClipboardCheck size={16} className="text-blue-500" /> Formative
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="summative">
                                                <div className="flex items-center gap-2">
                                                    <ClipboardCheck size={16} className="text-red-500" /> Summative
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="diagnostic">
                                                <div className="flex items-center gap-2">
                                                    <ClipboardCheck size={16} className="text-green-500" /> Diagnostic
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="authentic">
                                                <div className="flex items-center gap-2">
                                                    <ClipboardCheck size={16} className="text-purple-500" /> Authentic
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Learning Area</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select area" />
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
                                                <SelectValue placeholder="Select topic" />
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

                    {!question && (
                      <div className="flex gap-2">
                        <Button 
                            type="button" 
                            onClick={form.handleSubmit(onGenerate)}
                            disabled={isGenerating || !form.getValues('subject') || !form.getValues('topic')}
                            className="w-full sm:w-auto"
                        >
                            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {selectedMode === 'self' ? 'Generate Question' : 'Generate Peer Work'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={handleReset}
                          className="w-full sm:w-auto"
                        >
                          Reset
                        </Button>
                      </div>
                    )}

                    {question && (
                        <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <Separator />
                            <div className="grid gap-4">
                                <Card className="bg-secondary/30">
                                    <CardHeader className="py-3 px-4">
                                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                            Question ({form.getValues('assessmentType')})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2 px-4">
                                        <p className="text-base font-medium">{question}</p>
                                    </CardContent>
                                </Card>

                                {peerResponse && (
                                    <Card className="border-orange-200 bg-orange-50/30 dark:bg-orange-900/10">
                                        <CardHeader className="py-3 px-4">
                                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">Peer Response (To Critique)</CardTitle>
                                        </CardHeader>
                                        <CardContent className="py-2 px-4">
                                            <p className="text-sm italic text-muted-foreground">"{peerResponse}"</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {!assessmentResult && (
                              <>
                                <FormField
                                    control={form.control}
                                    name="userResponse"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {selectedMode === 'self' ? 'Your Response' : 'Your Assessment of the Peer'}
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={selectedMode === 'self' ? "Type your answer here..." : "Critique the peer's response. What is correct? What is missing? How can they improve?"}
                                                    rows={6}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-2">
                                  <Button 
                                      type="button"
                                      onClick={form.handleSubmit(onAssess)}
                                      disabled={isAssessing}
                                      className="w-full sm:w-auto"
                                  >
                                      {isAssessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                      Submit for AI Review
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setQuestion(null)}
                                    disabled={isAssessing}
                                  >
                                    Back to Topic Selection
                                  </Button>
                                </div>
                              </>
                            )}
                        </div>
                    )}

                    {isAssessing && (
                        <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                            <span className="text-lg">AI is evaluating...</span>
                        </div>
                    )}

                    {assessmentResult && (
                        <div className="pt-4 animate-in zoom-in-95 duration-500">
                           <Separator />
                           <div className="mt-6 space-y-4">
                            <AssessmentResult result={assessmentResult} />
                            <div className="flex justify-center">
                              <Button 
                                onClick={handleReset} 
                                variant="default"
                                size="lg"
                                className="gap-2"
                              >
                                <RotateCcw size={18} />
                                Start New Assessment
                              </Button>
                            </div>
                           </div>
                        </div>
                    )}
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
