'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

type ChatPanelProps = {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
};

export function ChatPanel({ input, handleInputChange, handleSubmit, isLoading }: ChatPanelProps) {
  return (
    <CardContent className="pt-6">
      <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
        <Input
          id="message"
          placeholder="e.g., 'I'm a newbie and want to learn self-custody...'"
          className="flex-1"
          autoComplete="off"
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input}>
          <ArrowUp className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </CardContent>
  );
}
