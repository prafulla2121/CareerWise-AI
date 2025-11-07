import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full border border-primary/20 bg-primary/10 p-3">
            <Bot className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">AI Career Chat</h2>
        <p className="text-muted-foreground">This feature is under construction.</p>
      </div>
    </div>
  );
}
