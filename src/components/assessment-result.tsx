"use client";

import { TrendingUp, PenLine, Lightbulb } from "lucide-react";
import { RadialBar, RadialBarChart, PolarGrid } from "recharts";

import type { AssessTeacherResponseOutput } from "@/ai/flows/assess-teacher-response";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";

interface AssessmentResultProps {
  result: AssessTeacherResponseOutput;
}

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function AssessmentResult({ result }: AssessmentResultProps) {
  // Multiply score by 10 to fit the 0-100 scale of the chart
  const chartScore = result.score * 10;
  const chartData = [{ name: "Score", score: chartScore, fill: "var(--color-score)" }];

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <TrendingUp />
          Assessment Results
        </CardTitle>
        <CardDescription>Here's the breakdown of your response.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 rounded-lg border bg-card p-6">
          <div className="flex flex-col items-center">
            <p className="text-sm font-medium text-muted-foreground">Your Score</p>
            <p className="text-5xl font-bold text-primary">{result.score}<span className="text-2xl text-muted-foreground">/10</span></p>
          </div>
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-32 w-32">
            <RadialBarChart
              data={chartData}
              startAngle={90}
              endAngle={-270}
              innerRadius="70%"
              outerRadius="100%"
              barSize={12}
              cy="50%"
            >
              <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted last:fill-background" />
              <RadialBar dataKey="score" background cornerRadius={5} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                    hideLabel 
                    formatter={(value) => `${(Number(value) / 10).toFixed(1)} / 10`}
                  />
                }
              />
            </RadialBarChart>
          </ChartContainer>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2 text-lg"><PenLine size={20}/>Overall Assessment</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.assessment}</p>
          </div>
          
          <Separator />

          <div>
            <h3 className="font-semibold flex items-center gap-2 text-lg"><Lightbulb size={20}/>Actionable Feedback</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.feedback}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
