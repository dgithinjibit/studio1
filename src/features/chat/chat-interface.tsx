
"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from '@ai-sdk/react';
import { BookCopy, GraduationCap } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatPanel } from "./chat-panel";
import { SelfAssessmentPanel } from "./self-assessment-panel";

const subjects = ["Microteaching", "Child Development", "Home Science", "Art and Craft", "Christian Religious Education", "Learning Techniques", "Science and Technology"];

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading: isTutorLoading, error } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: "assistant",
        content: "Welcome to your revision pilot. The 14-day countdown has begun, and our mission is to master the fundamentals. Let's not waste a second on passive learning.\n\nTo start, which core subject are we focusing on today? We can immediately apply high-efficiency techniques like Active Recall.\n\nOr, choose a specific function:\n\n📝 **Take notes on this text: [your text]**\n🎯 **Help me prepare for an exam.**\n🗺️ **Show me the main menu.**",
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
    <Tabs defaultValue="tutor" className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tutor"><BookCopy className="mr-2" />AI Tutor</TabsTrigger>
          <TabsTrigger value="assessment"><GraduationCap className="mr-2" />Self Assessment</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="tutor" className="flex-1 flex flex-col overflow-hidden mt-0">
        <ChatPanel
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isTutorLoading}
          scrollAreaViewport={scrollAreaViewport}
        />
      </TabsContent>
      <TabsContent value="assessment" className="flex-1 overflow-hidden mt-0">
        <SelfAssessmentPanel subjects={subjects} />
      </TabsContent>
    </Tabs>
  );
}
