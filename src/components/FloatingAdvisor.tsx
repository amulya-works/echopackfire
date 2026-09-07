import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  MessageSquare,
  Bot,
  User as UserIcon,
  ChevronRight,
  Check,
  Package,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext.js';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  structuredRequirements?: {
    productName?: string;
    fragility?: 'Low' | 'Medium' | 'High' | 'Very High';
    budget?: number;
    category?: string;
  };
}

export const FloatingAdvisor: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, activeDesign } = useProject();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hello! I am EchoCopilot, your packaging decision intelligence advisor. All my answers are grounded in your project's deterministic calculations (Cost, Carbon, ASTM drop simulations, and logistics). How can I assist with ${activeProject?.name || 'your packaging project'} today?`,
      timestamp: 'Just now',
    },
  ]);

  const quickPrompts = [
    'Why is the Recommended design chosen?',
    'Explain the ASTM D5276 drop test results',
    'I need packaging for a fragile electronic device under ₹22, plastic-free',
    'How do we reduce carbon footprint by 35% without losing protection?',
  ];

  const handleSendMessage = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: text,
          projectId: activeProject?.id,
          activeDesignId: activeDesign?.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to get advisor response');
      const data = await res.json();

      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        structuredRequirements: data.structuredRequirements,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('AI Advisor error:', err);
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'I could not reach the server advisor model right now, but your backend calculation engine is fully active. Please try again or test scenarios directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyRequirements = (reqs: NonNullable<Message['structuredRequirements']>) => {
    sessionStorage.setItem('prefilled_project_reqs', JSON.stringify(reqs));
    setIsOpen(false);
    navigate('/projects/new');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 p-2 pr-4 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-xl hover:border-emerald-300 hover:shadow-2xl transition-all cursor-pointer group"
          title="Open EcoPack AI Advisor"
        >
          <div className="sleek-ai-avatar group-hover:scale-105 transition-transform">
            EP
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>EchoCopilot</span>
              <span className="sleek-tag text-[9px] py-0 px-1.5">Grounded AI</span>
            </div>
            <div className="text-[11px] text-slate-500 font-normal truncate max-w-[170px]">
              Ask design & simulation advice
            </div>
          </div>
        </button>
      )}

      {/* Slide-out / Floating Modal Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3.5 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="sleek-ai-avatar">
                EC
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">EchoCopilot</h3>
                <p className="text-[10px] text-slate-400">Grounded Decision Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Badge */}
          {activeProject && (
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Active Project:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                {activeProject.name}
              </span>
              <span className="sleek-tag text-[9px]">Live Context</span>
            </div>
          )}

          {/* Message History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="sleek-ai-avatar w-6 h-6 text-[10px] shrink-0 mt-0.5">
                    EP
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Extracted Requirements Action Card */}
                  {msg.structuredRequirements && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-950">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
                        <Package className="w-3.5 h-3.5" />
                        <span>Parsed Project Requirements</span>
                      </div>
                      <div className="space-y-0.5 text-slate-600">
                        <div>
                          • Product: <strong className="text-slate-800">{msg.structuredRequirements.productName}</strong>
                        </div>
                        <div>
                          • Fragility: <strong className="text-slate-800">{msg.structuredRequirements.fragility}</strong>
                        </div>
                        <div>
                          • Budget:{' '}
                          <strong className="text-slate-800">₹{msg.structuredRequirements.budget?.toFixed(2)}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplyRequirements(msg.structuredRequirements!)}
                        className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Create Project with These Specs</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    U
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Consulting backend engineering advisor...</span>
              </div>
            )}
          </div>

          {/* Suggested Quick Prompts */}
          <div className="p-2 border-t border-slate-200 bg-white flex overflow-x-auto gap-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition-colors shrink-0 cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask for packaging advice..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isTyping}
              className="p-2.5 rounded-lg bg-emerald-500 text-white disabled:opacity-40 hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
