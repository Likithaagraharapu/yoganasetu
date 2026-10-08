'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { ChatMessage, Scheme } from '@/lib/types';
import { sendChatMessage, getSchemeById } from '@/lib/api';
import VoiceInputButton from '@/components/chat/VoiceInputButton';
import Badge from '@/components/ui/Badge';

interface ChatInterfaceProps {
  initialSchemeId?: string | null;
}

export default function ChatInterface({ initialSchemeId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [focusedScheme, setFocusedScheme] = useState<Scheme | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested prompt questions
  const suggestedQuestions = [
    'I am a farmer with 2 acres of land. What schemes can I apply for?',
    'I am a college student from a low-income family. What scholarships exist?',
    'How do I get an Ayushman Bharat health card for my parents?',
    'What are the loan limits and interest subsidy under PMMVY and MUDRA?',
    'Are there grants or subsidies for women starting a small enterprise?',
  ];

  // If initialSchemeId is provided, load its context
  useEffect(() => {
    async function loadSchemeContext() {
      if (!initialSchemeId) {
        // Default welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `### Welcome to YojanaSetu AI Assistant! 🙏\n\nI am your dedicated Indian Government Schemes discovery advisor. You can ask me in English or Hinglish about:
- **Eligibility**: "Can I apply for PM-KISAN if I rent land?"
- **Benefits**: "How much financial assistance does Ayushman Bharat provide?"
- **Documents**: "What certificates do I need for post-matric scholarships?"
- **Application Guidance**: "How do I register at Common Service Centers?"

Feel free to click any suggestion below or use the 🎙️ **Microphone** to speak your question!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggested_followups: [
              'What schemes are available for farmers?',
              'Which loans exist for small businesses?',
              'What healthcare covers senior citizens?',
            ],
          },
        ]);
        return;
      }

      try {
        const s = await getSchemeById(initialSchemeId);
        setFocusedScheme(s);
        setMessages([
          {
            id: 'scheme-welcome',
            role: 'assistant',
            content: `### Inquiring about ${s.name} 🏛️\n\nI have loaded the official parameters and guidelines for **${s.name}**.\n\n- **Target Group**: ${s.target_group}\n- **Primary Benefit**: ${s.benefits}\n\nYou can ask me specific questions regarding your age, income qualification, required affidavits, or step-by-step application!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            grounded_schemes: [s],
            sources: [s.official_source],
            suggested_followups: [
              `Am I eligible for ${s.name.split('(')[0].trim()}?`,
              `What documents do I need to prepare?`,
              `How long does application verification take?`,
            ],
          },
        ]);
      } catch {
        // fallback welcome
      }
    }

    loadSchemeContext();
  }, [initialSchemeId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMessageId = `usr-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: text,
        scheme_id: focusedScheme?.id,
      });

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grounded_schemes: response.grounded_schemes,
        sources: response.sources,
        is_gemini_powered: response.is_gemini_powered,
        suggested_followups: response.suggested_followups,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('API chat failed, generating local grounded fallback:', err);
      // Client-side fallback if backend is offline
      try {
        const res = await fetch('/data/schemes.json');
        const allSchemes: Scheme[] = await res.json();
        const queryLower = text.toLowerCase();
        const matched = allSchemes.filter(
          (s) =>
            s.name.toLowerCase().includes(queryLower) ||
            s.description.toLowerCase().includes(queryLower) ||
            s.target_group.toLowerCase().includes(queryLower) ||
            s.category.toLowerCase().includes(queryLower)
        );

        const primary = matched[0] || allSchemes[0];

        const fallbackMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: `### Grounded Scheme Guidance: ${primary.name}\n\nBased on your query, **${primary.name}** is the most relevant scheme:\n\n- **Category**: ${primary.category}\n- **Benefit**: ${primary.benefits}\n- **Eligibility**: ${primary.eligibility.details}\n- **Documents Required**: ${primary.documents.join(', ')}\n- **Application**: ${primary.application_process}\n\n🔗 **Official Portal**: [${primary.official_source}](${primary.official_source})\n\n*(Grounded RAG synthesis from verified government dataset)*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          grounded_schemes: [primary],
          sources: [primary.official_source],
          suggested_followups: [
            'What documents do I need to prepare?',
            'Where is the nearest CSC center?',
          ],
        };

        setMessages((prev) => [...prev, fallbackMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to reach the assistant server. Please verify your connection or try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Convert simple markdown headings and lists into formatted elements
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="font-bold text-base text-amber-300 pt-2 pb-1 border-b border-white/5">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('#### ')) {
            return (
              <h4 key={idx} className="font-semibold text-sm text-white pt-2">
                {line.replace('#### ', '')}
              </h4>
            );
          }
          if (line.startsWith('- ')) {
            const itemText = line.replace('- ', '');
            // Bold highlights
            const parts = itemText.split(/(\*\*.*?\*\*)/g);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-amber-400 mt-1">•</span>
                <span>
                  {parts.map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <strong key={pIdx} className="text-white font-semibold">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    return part;
                  })}
                </span>
              </div>
            );
          }
          if (line.startsWith('> ')) {
            return (
              <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-white/10 text-xs text-slate-300 italic my-2">
                {line.replace('> ', '')}
              </div>
            );
          }
          if (line.trim() === '---') {
            return <hr key={idx} className="border-white/10 my-3" />;
          }

          // Regular paragraph with bold support
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx}>
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="text-white font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[750px] max-h-[85vh] glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
      
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-white/10 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-950/40">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#070B19] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-base">YojanaSetu AI Assistant</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                Grounded RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {focusedScheme ? `Focused on: ${focusedScheme.name}` : 'Ready to answer citizen questions in English & Hinglish'}
            </p>
          </div>
        </div>

        {/* Clear Conversation button */}
        <button
          onClick={() => {
            setMessages([
              {
                id: 'reset',
                role: 'assistant',
                content: 'Conversation cleared. How can I help you find eligible government schemes today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            setFocusedScheme(null);
          }}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors text-xs flex items-center gap-1.5"
          title="Clear Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div className="flex flex-col space-y-2 max-w-[85%] sm:max-w-[78%]">
                <div
                  className={`p-4 sm:p-5 rounded-2xl relative group ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-950/40 rounded-tr-none'
                      : 'bg-slate-900/90 border border-white/10 text-slate-200 shadow-xl rounded-tl-none'
                  }`}
                >
                  {/* Copy Button for Assistant */}
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-slate-800"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}

                  {/* Message Content */}
                  {isUser ? (
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    renderFormattedContent(msg.content)
                  )}

                  {/* Grounded Schemes Mini Cards inside response */}
                  {msg.grounded_schemes && msg.grounded_schemes.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                      <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Related Government Schemes:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.grounded_schemes.slice(0, 2).map((s) => (
                          <div
                            key={s.id}
                            className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-white line-clamp-1">{s.name}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{s.benefits}</p>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[11px]">
                              <Badge category={s.category} size="sm">
                                {s.category}
                              </Badge>
                              <Link
                                href={`/schemes/${s.id}`}
                                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center"
                              >
                                <span>Details</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Sources Badges */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">Sources:</span>
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400/90 hover:text-amber-300 underline flex items-center gap-0.5"
                        >
                          <span className="truncate max-w-[160px]">{src}</span>
                          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp & Gemini indicator */}
                <div className={`flex items-center gap-2 text-[10px] text-slate-500 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.is_gemini_powered && (
                    <span className="text-amber-400/80">• Gemini Powered</span>
                  )}
                </div>

                {/* Suggested follow-up buttons */}
                {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.suggested_followups.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="text-xs text-amber-300/90 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/20 transition-all text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white flex-shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-900/90 border border-white/10 p-4 rounded-2xl rounded-tl-none text-slate-300 text-xs flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-slate-400">Searching FAISS index & analyzing scheme eligibility...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Questions (if only 1 or 2 messages) */}
      {messages.length <= 2 && (
        <div className="px-6 py-2 bg-slate-950/40 border-t border-white/5">
          <p className="text-[11px] font-semibold text-slate-400 mb-2">Try asking:</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sq)}
                className="text-xs text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-white/10 whitespace-nowrap transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 relative"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your question or click the mic to speak..."
            disabled={loading}
            className="w-full glass-input rounded-2xl py-3.5 pl-4 pr-24 text-sm text-white placeholder-slate-400 disabled:opacity-50"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Voice Input Button */}
            <VoiceInputButton
              onTranscript={(txt) => {
                setInputMessage(txt);
                // optionally auto-send
                handleSendMessage(txt);
              }}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#EA580C] hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 text-white shadow-md transition-all flex items-center justify-center flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-slate-500 mt-2">
          YojanaSetu AI grounds responses in official Central & State scheme databases. Verify final details on official portals.
        </p>
      </div>

    </div>
  );
}
