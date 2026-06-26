"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

export function ChatWidget({ contextData }: { contextData: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'agent', content: string}[]>([
    { role: 'agent', content: 'Hi there! I am your AI Research Analyst. I have analyzed ' + (contextData?.ticker || 'the company') + '. What would you like to know?' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput("");
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: `Based on my analysis of ${contextData?.ticker || 'this stock'}, that's an interesting point. The company's current financial health score is ${contextData?.scores?.financialHealth?.toFixed(1) || 'N/A'}/10.` 
      }]);
    }, 1500);
  };

  if (!contextData) return null;

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 p-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 z-40 ${isOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100'}`}
      >
        <MessageSquare className="h-6 w-6" />
        {/* Unread badge mock */}
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-rose-500 border-2 border-black animate-pulse"></span>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-8 right-8 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-[#0a0a0c] border border-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 z-50 overflow-hidden ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center border-2 border-gray-900">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-gray-900"></span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pro Analyst</h3>
              <p className="text-xs text-blue-300">Online | {contextData?.ticker || 'Ready'}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-gray-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111115]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-blue-600/20 text-blue-400 border border-blue-500/20'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`p-3 rounded-2xl max-w-[75%] text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-gray-800/60 text-gray-200 border border-gray-700/50 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3 flex-row">
              <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600/20 text-blue-400 border border-blue-500/20">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-gray-800/60 border border-gray-700/50 rounded-tl-sm flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-800 bg-[#0a0a0c]">
          <div className="relative flex items-center bg-[#1a1a20] border border-gray-700 rounded-xl focus-within:border-blue-500 transition-colors">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about this analysis..."
              className="w-full bg-transparent text-white placeholder-gray-500 outline-none px-4 py-3 text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="mr-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
