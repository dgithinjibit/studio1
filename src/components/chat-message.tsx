"use client";

import { Sparkles, User, Loader2, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from '@ai-sdk/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { render } from 'ai/rsc';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const CodeBlock = ({ content }: { content: string }) => {
  const { toast } = useToast();
  const onCopy = () => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard' });
  };
  return (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-md my-2 overflow-x-auto text-sm">
        <code>{content}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7"
        onClick={onCopy}
      >
        <Copy size={16} />
      </Button>
    </div>
  );
};


export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const { role, content, toolInvocations } = message;
  const isAssistant = role === 'assistant';
  const { toast } = useToast();

  const renderedContent = render({
    schema: {
      code: {
        description: 'A block of code to be displayed.',
        parameters: z.object({
          content: z.string().describe('The code content.'),
        }),
      },
    },
    content: content,
    render: ({ code }) => <CodeBlock content={code.content} />,
  });

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
          <div className="whitespace-pre-wrap">{renderedContent}</div>
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
