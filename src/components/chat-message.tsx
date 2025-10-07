"use client";

import { Sparkles, User, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const { role, content } = message;
  const isAssistant = role === 'assistant';

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {isAssistant && (
        <Avatar className="h-8 w-8 border-2 border-primary/50">
          <AvatarImage src="/assistant-avatar.png" alt="Assistant" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-md rounded-lg px-4 py-3 text-sm shadow',
          isAssistant
            ? 'bg-card rounded-tl-none'
            : 'bg-primary text-primary-foreground rounded-tr-none'
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
      {!isAssistant && (
         <Avatar className="h-8 w-8 border-2 border-muted">
         <AvatarImage src="/user-avatar.png" alt="User" />
         <AvatarFallback className="bg-muted-foreground text-background">
           <User className="h-5 w-5" />
         </AvatarFallback>
       </Avatar>
      )}
    </div>
  );
}
