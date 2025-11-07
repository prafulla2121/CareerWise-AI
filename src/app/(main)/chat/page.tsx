'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { Bot, Send, User as UserIcon, Loader2 } from 'lucide-react';
import { careerChat, CareerChatInput, CareerChatOutput } from '@/ai/ai-career-chat';
import { cn } from '@/lib/utils';
import placeholderData from '@/lib/placeholder-images.json';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  message: string;
}

const generateColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 50%)`;
};


export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', message: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ sender: m.sender, message: m.message }));
      const chatInput: CareerChatInput = { message: input, chatHistory };
      const result: CareerChatOutput = await careerChat(chatInput);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        message: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling career chat flow:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        message: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const userName = user?.displayName || 'User';
  const avatarColor = generateColor(userName);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
        <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-6 max-w-4xl mx-auto">
                {messages.length === 0 && (
                    <div className="flex h-[calc(100vh-14rem)] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-4 rounded-full border border-primary/20 bg-primary/10 p-3">
                                <Bot className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold">AI Career Chat</h2>
                            <p className="text-muted-foreground">Ask me anything about your career!</p>
                        </div>
                    </div>
                )}
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={cn(
                        'flex items-start gap-4',
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                    >
                    {message.sender === 'assistant' && (
                        <Avatar className="h-9 w-9">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        'max-w-md rounded-lg px-4 py-3 text-sm md:max-w-lg lg:max-w-xl',
                        message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                    >
                        <p className="whitespace-pre-wrap">{message.message}</p>
                    </div>
                    {message.sender === 'user' && (
                        <Avatar className="h-9 w-9">
                            {user?.photoURL ? (
                                <AvatarImage src={user.photoURL} alt="User Avatar" />
                            ) : (
                                <AvatarFallback style={{ backgroundColor: avatarColor, color: 'white' }}>
                                    {userName.charAt(0)}
                                </AvatarFallback>
                            )}
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-start gap-4 justify-start">
                        <Avatar className="h-9 w-9">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                        </Avatar>
                        <div className="max-w-md rounded-lg px-4 py-3 text-sm bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
        </div>
        <div className="border-t bg-background px-4 py-3">
            <form onSubmit={handleSubmit} className="flex w-full max-w-4xl mx-auto items-center space-x-2">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for career advice..."
                className="flex-1"
                disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
            </Button>
            </form>
        </div>
    </div>
  );
}
