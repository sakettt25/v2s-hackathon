"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot, User } from "lucide-react";
import { askSituationRoom } from "@/app/(dashboard)/command/actions";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "ai"; content: string; id: string };

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Welcome to the AI Situation Room. I have live access to all community reports. Ask me for summaries, hotspot analysis, or action plans.", id: "1" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    const newMsgId = Date.now().toString();
    setMessages(prev => [...prev, { role: "user", content: userMsg, id: newMsgId }]);
    
    setIsLoading(true);
    const result = await askSituationRoom(userMsg);
    
    if (result.success && result.answer) {
      setMessages(prev => [...prev, { role: "ai", content: result.answer, id: newMsgId + "ai" }]);
    } else {
      setMessages(prev => [...prev, { role: "ai", content: `Error: ${result.error}`, id: newMsgId + "err" }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-xl overflow-hidden bg-background shadow-sm">
      <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
        <Bot className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-sm">Situation Intelligence Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border"}`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 border"}`}>
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-muted text-muted-foreground border">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Analyzing civic data...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t bg-muted/10">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about hotspots, priority issues, or generate an action plan..."
            className="flex-1 pr-12 rounded-lg"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="absolute right-1 top-1 h-8 w-8 rounded-md">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
