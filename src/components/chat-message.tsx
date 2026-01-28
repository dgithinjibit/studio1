'use client';

import { Message } from 'ai';
import { cn } from '@/lib/utils';

export function ChatMessage({ message }: { message: Message }) {
  return (
    <div
      className={cn(
        'group relative flex items-start',
        message.role === 'user' && 'justify-end'
      )}
    >
      <div
        className={cn(
          'flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
          message.role === 'user' ? 'bg-background' : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? '🧑‍💻' : '🤖'}
      </div>
      <div className={cn('ml-4 flex-1 space-y-2 overflow-hidden px-1', message.role === 'user' ? 'mr-4' : '')}>
        <div
          className={cn(
            'whitespace-pre-wrap rounded-md border p-4',
            message.role === 'user' ? 'bg-muted' : 'bg-card'
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
