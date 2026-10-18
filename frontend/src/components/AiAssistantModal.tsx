import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../api';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  currentUser?: {
    name: string;
    companyName: string;
    role: string;
    email?: string;
    avatar?: string;
  } | null;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  currentUser,
}) => {
  const getGreeting = () => {
    if (currentUser?.name) {
      return `Greetings, ${currentUser.name}. I am SoGo, your precision industrial matchmaking intelligence. I have direct access to your ${currentUser.companyName || 'enterprise'} profile and all verified manufacturers in our live database. Ask me to recommend matching suppliers, compare certifications, or evaluate delivery lead times.`;
    }
    return 'Greetings. I am SoGo, your precision industrial matchmaking intelligence. I have direct access to all verified manufacturers, products, and profile data in our live database. Ask me to find verified OEMs by certifications, location, delivery time, or production capacity.';
  };

  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([
    {
      role: 'assistant',
      content: getGreeting(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);

  // Update greeting when currentUser changes if only greeting is in messages
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [{ role: 'assistant', content: getGreeting() }];
      }
      return prev;
    });
  }, [currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // If opened with an initial prompt, send it once
  useEffect(() => {
    if (isOpen && initialPrompt && !hasSentInitial.current) {
      hasSentInitial.current = true;
      sendMessage(initialPrompt);
    }
    if (!isOpen) {
      hasSentInitial.current = false;
    }
  }, [isOpen, initialPrompt]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user' as const, content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send history (excluding the first greeting message)
      const historyForApi = nextMessages.filter(
        (m, i) => !(i === 0 && m.role === 'assistant')
      );

      const data = await sendChatMessage(
        trimmed,
        historyForApi.slice(0, -1),
        currentUser
      );

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '';
      const isNetworkErr = errMsg.includes('fetch') || errMsg.includes('Failed') || errMsg.includes('NetworkError');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isNetworkErr
            ? '⚠️ Could not reach the AI service. Make sure the backend is running (`npm run dev` in the backend folder) and `GROQ_API_KEY` is set in `backend/.env`.'
            : errMsg || 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Helper to render plain text messages cleanly with proper structure
  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="flex flex-col gap-1.5 leading-relaxed">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={lIdx} className="h-1" />;
          }

          // Uppercase section headings (e.g. RECOMMENDATIONS:, COMPARISON SUMMARY:)
          const isHeader =
            (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.endsWith(':')) ||
            /^[A-Z0-9\s/&—–-]+:$/.test(trimmed) ||
            trimmed.startsWith('RECOMMENDED PICK:');

          if (isHeader) {
            return (
              <div
                key={lIdx}
                className="font-bold text-[13px] tracking-wide text-[#4c000c] mt-2 mb-0.5"
              >
                {trimmed}
              </div>
            );
          }

          // Bullet points (- or •)
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-1.5 text-[12.5px] text-[#2c2d2a]">
                <span className="text-[#6c151e] font-bold text-[14px] leading-none mt-1">•</span>
                <span className="flex-1">{trimmed.slice(2)}</span>
              </div>
            );
          }

          // Numbered items (1. , 2. )
          const numMatch = trimmed.match(/^(\d+\.)\s+(.+)$/);
          if (numMatch) {
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-1.5 text-[12.5px] text-[#2c2d2a]">
                <span className="text-[#3b6662] font-semibold text-[12px] min-w-[18px]">
                  {numMatch[1]}
                </span>
                <span className="flex-1">{numMatch[2]}</span>
              </div>
            );
          }

          // Regular paragraph lines
          return (
            <div key={lIdx} className="text-[12.5px] text-[#2c2d2a]">
              {line}
            </div>
          );
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[560px] bg-white rounded-3xl border border-[#4c000c]/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#6c151e] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-amber-200">
                auto_awesome
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-[17px] font-medium leading-none">
                  SoGo Industrial AI
                </h3>
                {currentUser?.companyName && (
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white/90 font-sans font-medium">
                    {currentUser.companyName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#bbe8e4] mt-0.5">
                Live Profile Intelligence & Verified OEM Matchmaking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#fbf9f6]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[90%] ${
                m.role === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-[13px] shadow-xs ${
                  m.role === 'user'
                    ? 'bg-[#6c151e] text-white rounded-tr-xs leading-relaxed whitespace-pre-wrap'
                    : 'bg-white text-[#1b1c1a] border border-[#dcc0bf]/40 rounded-tl-xs'
                }`}
              >
                {m.role === 'user' ? m.content : renderFormattedMessage(m.content)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="self-start flex items-center gap-2 px-3 py-2 text-[12px] text-[#564241]">
              <span className="inline-block w-3.5 h-3.5 border-2 border-[#6c151e] border-t-transparent rounded-full animate-spin" />
              SoGo is analyzing profile data & database records...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Pills */}
        <div className="px-3 py-1.5 bg-white border-t border-[#dcc0bf]/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setInput('Suggest suppliers matching my profile')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df] shrink-0 cursor-pointer font-medium"
          >
            Match my profile
          </button>
          <button
            type="button"
            onClick={() => setInput('What are my profile details and company info?')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df] shrink-0 cursor-pointer font-medium"
          >
            My profile data
          </button>
          <button
            type="button"
            onClick={() => setInput('Show all verified manufacturers in the database with their lead times and certifications')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df] shrink-0 cursor-pointer font-medium"
          >
            All suppliers & certs
          </button>
          <button
            type="button"
            onClick={() => setInput('Compare lead times between CNC gears and sheet cut parts')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df] shrink-0 cursor-pointer font-medium"
          >
            Compare lead times
          </button>
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-[#dcc0bf]/30 flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for supplier recommendations, lead times, or specs..."
            disabled={isLoading}
            className="flex-1 h-10 px-3.5 rounded-full bg-[#f5f3f0] text-[13px] text-[#1b1c1a] placeholder:text-[#564241]/60 focus:outline-none focus:ring-1 focus:ring-[#3b6662] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-[#6c151e] text-white flex items-center justify-center hover:brightness-110 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};