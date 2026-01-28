'use client';
import { useChat } from '@ai-sdk/react';
import { ChatPanel } from './chat-panel';
import { ChatMessage } from '@/components/chat-message';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRef, useEffect } from 'react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaViewportRef.current) {
      scrollAreaViewportRef.current.scrollTo({
        top: scrollAreaViewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const initialMessage = {
    id: '0',
    role: 'assistant' as const,
    content: "Welcome to BitKumon! To get started, tell me a bit about yourself. Are you a developer, an investor, or completely new to Bitcoin? What's your main goal for learning?"
  };
  
  const displayMessages = messages.length > 0 ? messages : [initialMessage];

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl tracking-tight">BitKumon</CardTitle>
        <CardDescription>Your AI-Powered Bitcoin Coach</CardDescription>
      </CardHeader>
      <ScrollArea className="h-[50vh] w-full" viewportRef={scrollAreaViewportRef}>
        <div className="px-6 space-y-4">
            {displayMessages.map((m) => (
                <ChatMessage key={m.id} message={m} />
            ))}
        </div>
      </ScrollArea>
      <ChatPanel
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </>
  );
}
