import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, CourseSession } from '../types';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  BookOpen, 
  GraduationCap, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';

interface FloatingChatbotProps {
  currentUser: UserProfile;
  courseSessions: CourseSession[];
  onOpenExamPredictor?: (unitCode: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  currentUser,
  courseSessions,
  onOpenExamPredictor
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${currentUser.fullName.split(' ')[0]}! 🎓 I am your **University of Eldoret AI Academic Assistant**.\n\nI can help you understand lecture concepts, synthesize course revision, predict exam questions, or guide you on how to answer UoE examination papers. How can I assist your studies today?`,
      timestamp: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Predict COM 220 Exam Paper',
    'How do examiners mark 70-mark papers at UoE?',
    'Explain Database Normalization in simple terms',
    'Summarize Data Structures for CAT 2',
    'Tips for writing clean pseudocode'
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const courseSummary = courseSessions.map((c) => `${c.unitCode}: ${c.unitTitle} (${c.lecturer})`).join('; ');
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          courseContext: `Student: ${currentUser.fullName}, Reg: ${currentUser.regNumber}, Email: ${currentUser.email}, Program: ${currentUser.program}, Year ${currentUser.yearOfStudy} Sem ${currentUser.semester}. Enrolled Units: ${courseSummary}`
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      const aiReply = data.reply || 'I received your question and am here to help. Please ask any specific topic from your syllabus!';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('API chat fallback triggered:', err);
      // Fallback response for offline or development resilience
      let fallbackText = `Regarding **"${text}"**:\n\n1. **Core Principle**: Ensure you write clear definitions, state theorems, and sketch labeled diagrams where relevant.\n2. **UoE Exam Structure**: Section A compulsory questions demand direct precision (4-6 marks each). Section B analytical questions require step-by-step derivations and real-world application examples.\n3. **Need Full Prediction?**: Check the **AI Exam Predictor** tab in your top navigation to generate complete predicted papers with marking schemes!`;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-full shadow-2xl border border-amber-400/40 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-700/30"
          aria-label="Open UoE AI Academic Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-sm">
              <Bot className="w-5 h-5 text-emerald-950" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-emerald-950 animate-ping" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold text-amber-300 block leading-none">
              UoE AI Academic Bot
            </span>
            <span className="text-[10px] text-emerald-200">Exam Revision & Tutoring</span>
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-stone-300 w-[92vw] sm:w-[410px] h-[540px] flex flex-col overflow-hidden animate-fade-in transition-all">
          {/* Chat Header */}
          <div className="bg-emerald-950 text-white px-4 py-3 flex items-center justify-between border-b border-emerald-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-sm">
                <Bot className="w-5 h-5 text-emerald-950" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white leading-tight">
                  UoE AI Academic Assistant
                </h3>
                <p className="text-[10px] text-emerald-300 leading-none mt-0.5">
                  Flame Tree Tutor · 24/7 Study & Exam Prep
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors"
                title="Clear chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/60 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs leading-relaxed ${
                      isUser
                        ? 'bg-emerald-800 text-white rounded-br-none'
                        : 'bg-white text-stone-900 border border-stone-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs">
                      {m.text}
                    </div>
                    <div
                      className={`text-[9px] mt-1.5 text-right ${
                        isUser ? 'text-emerald-200' : 'text-stone-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs flex items-center gap-2 text-stone-500 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>Synthesizing academic answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-stone-100 border-t border-stone-200 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-[11px] px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 rounded-full border border-stone-200 whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-stone-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about lecture units, revision, or exams..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
