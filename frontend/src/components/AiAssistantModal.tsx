import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../api';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
}) => {
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([
    {
      role: 'assistant',
      content:
        'Greetings. I am SoGo, your precision industrial matchmaking intelligence. Ask me to find verified OEMs by certifications, location, delivery time, or production capacity.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitial = useRef(false);

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
      // Send only history (exclude the welcome message if you prefer)
      const historyForApi = nextMessages.filter(
        (m, i) => !(i === 0 && m.role === 'assistant')
      );

      const data = await sendChatMessage(trimmed, historyForApi.slice(0, -1));

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err?.message ||
            'Sorry, I could not reach the AI service right now. Please try again.',
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[540px] bg-white rounded-3xl border border-[#4c000c]/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#6c151e] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-amber-200">
                auto_awesome
              </span>
            </div>
            <div>
              <h3 className="font-serif text-[17px] font-medium leading-none">
                SoGo Industrial AI
              </h3>
              <p className="text-[11px] text-[#bbe8e4] mt-0.5">
                Supply Chain Analysis & Spec Parsing
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
              className={`flex flex-col max-w-[85%] ${
                m.role === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-xs whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[#6c151e] text-white rounded-tr-xs'
                    : 'bg-white text-[#1b1c1a] border border-[#dcc0bf]/40 rounded-tl-xs'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="self-start flex items-center gap-2 px-3 py-2 text-[12px] text-[#564241]">
              <span className="inline-block w-3.5 h-3.5 border-2 border-[#6c151e] border-t-transparent rounded-full animate-spin" />
              SoGo is thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Pills */}
        <div className="px-3 py-1.5 bg-white border-t border-[#dcc0bf]/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setInput('Compare lead times between CNC and DMLS 3D printing')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df] shrink-0 cursor-pointer"
          >
            Compare lead times
          </button>
          <button
            type="button"
            onClick={() => setInput('Show suppliers with ISO 13485 cleanroom capacity')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df] shrink-0 cursor-pointer"
          >
            ISO 13485 Cleanroom
          </button>
          <button
            type="button"
            onClick={() => setInput('Draft RFQ specification for 5,000 pcs die cast batch')}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df] shrink-0 cursor-pointer"
          >
            Draft RFQ Spec
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
            placeholder="Ask technical question or specify tolerance..."
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