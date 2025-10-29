import { Home } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-full">
      <h1 className="text-4xl font-bold">Welcome to CurriculumAI</h1>
      <p className="text-muted-foreground">Your AI-Powered DPTE Co-Pilot</p>
      <Link href="/dashboard" className="flex items-center gap-2 bg-primary text-primary-foreground p-3 rounded-lg">
        <Home />
        <span>Go to Dashboard</span>
      </Link>
    </div>
  )
}
