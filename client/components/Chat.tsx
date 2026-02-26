import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { chatWithCoach } from '../services/geminiService';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface ChatProps {
  user: UserProfile;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Namaste ${user.name}! I am Aarogya AI. I'm here to help you reach your goal of ${user.goal}. Ask me anything about your diet, exercises, or local healthy food options!`,
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert internal chat history to Gemini API format
      const apiHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await chatWithCoach(apiHistory, user, userMsg.text);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm having trouble connecting to my fitness database right now. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
         id: (Date.now() + 1).toString(),
         role: 'model',
         text: "Something went wrong. Please check your connection.",
         timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[600px] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="bg-orange-50 dark:bg-orange-950/20 p-4 border-b border-orange-100 dark:border-orange-900/30 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
           <Bot size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Coach Aarogya</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Online • Speaking {user.language}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-white dark:bg-slate-900">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-orange-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
              <Loader2 className="animate-spin text-orange-600 dark:text-orange-400" size={16} />
              <span className="text-sm text-slate-500 dark:text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about diet, form, or nutrition..."
            className="flex-1 p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-orange-600 dark:bg-orange-500 text-white rounded-xl hover:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;