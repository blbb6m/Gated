import React, { useState, useRef, useEffect } from 'react';
import { getStylingAdvice } from '../services/geminiService';
import { ChatMessage, ClothingItem } from '../models/types';
import { Send, Sparkles, User, Bot } from 'lucide-react';

interface StylistScreenProps {
  wardrobe: ClothingItem[];
}

const StylistScreen: React.FC<StylistScreenProps> = ({ wardrobe }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Welcome to your personal AI Stylist. I have access to your wardrobe. Ask me for outfit ideas, color matching advice, or what to wear for a specific event!",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    const responseText = await getStylingAdvice(userMsg.text, wardrobe);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh)] bg-[#0f0f0f] relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="p-6 md:p-10 pb-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
             <h2 className="text-2xl font-bold text-white">AI Stylist</h2>
             <p className="text-sm text-neutral-400">Powered by Gemini 2.5</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 py-4 space-y-6 z-10 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-neutral-700' : 'bg-neutral-800 border border-neutral-700'}`}>
              {msg.role === 'user' ? <User size={20} className="text-neutral-300" /> : <Bot size={20} className="text-blue-400" />}
            </div>
            
            <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-white text-black rounded-tr-none' 
                : 'bg-neutral-800 text-gray-200 border border-neutral-700 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{msg.text}</p>
              <p className="text-[10px] opacity-50 mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0">
               <Sparkles size={20} className="text-blue-400 animate-pulse" />
             </div>
             <div className="bg-neutral-800 border border-neutral-700 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center">
               <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 md:p-10 pt-4 z-10 bg-[#0f0f0f]/80 backdrop-blur-lg">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask for an outfit idea (e.g., 'Date night outfit with my black jacket')"
            className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-2xl pl-6 pr-14 py-4 focus:outline-none focus:border-neutral-500 shadow-lg shadow-black/20"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!query.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-xl hover:bg-neutral-200 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StylistScreen;