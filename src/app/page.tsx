import { ChatInterface } from "@/features/chat/chat-interface";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="relative container flex h-screen flex-col items-center justify-center">
        <div className="absolute top-4 right-4">
            <ThemeToggle />
        </div>
      <div className="w-full max-w-3xl rounded-lg border bg-card text-card-foreground shadow-lg">
        <ChatInterface />
      </div>
    </main>
  );
}
