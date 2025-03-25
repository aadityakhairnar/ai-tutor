
import React, { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Sparkles } from 'lucide-react';
import { getOpenAIKey } from '@/services/openai';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DoubtsChatProps {
  isOpen: boolean;
  onClose: () => void;
  context: string;
  selectedText: string;
}

const DoubtsChat: React.FC<DoubtsChatProps> = ({ isOpen, onClose, context, selectedText }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Reset messages when selectedText changes or sidebar is opened
  useEffect(() => {
    if (selectedText && isOpen) {
      setMessages([
        {
          role: 'assistant',
          content: `I'll help you understand: "${selectedText.length > 50 ? selectedText.substring(0, 50) + '...' : selectedText}"`
        }
      ]);
    } else if (isOpen && messages.length === 0) {
      // Welcome message when opened for the first time
      setMessages([
        {
          role: 'assistant',
          content: 'How can I help you understand this topic?'
        }
      ]);
    }
  }, [isOpen, selectedText]);
  
  useEffect(() => {
    // Focus on the input when opened
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      toast.error("OpenAI API key is not set. Please add your API key in settings.");
      return;
    }
    
    // Add user message to chat
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Determine which context to use
      const contextToUse = selectedText || context;
      
      // Create the system prompt
      const systemPrompt = selectedText 
        ? `You are a helpful AI tutor. The user has selected the following text and has a question about it: "${selectedText}". Answer their question while focusing on this specific text.` 
        : `You are a helpful AI tutor. The user is learning about the following topic: "${context.substring(0, 100)}...". Help them understand any concepts they're struggling with.`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Context: ${contextToUse}\n\nQuestion: ${input}` }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: data.choices[0].message.content 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      toast.error('Failed to get an answer. Please try again.');
      
      // Add error message
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while processing your question. Please try again.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col h-full">
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              Topic Assistant
            </SheetTitle>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div 
                key={i} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg px-4 py-2 bg-muted">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messageEndRef} />
          </div>
        </ScrollArea>
        
        <Separator />
        
        <SheetFooter className="px-4 py-3">
          <div className="flex items-center w-full gap-2">
            <Textarea
              ref={inputRef}
              placeholder="Ask a question about this topic..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none min-h-[60px]"
              maxLength={500}
            />
            <Button 
              size="icon" 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()}
              className="shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default DoubtsChat;
