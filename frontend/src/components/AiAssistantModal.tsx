import React, { useState } from 'react';

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
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Greetings. I am SoGo, your precision industrial matchmaking intelligence. Ask me to find verified OEMs by spindle count, ISO certifications, target tolerances (±0.005mm), or regional logistics radius.',
    },
    ...(initialPrompt
      ? [
          { role: 'user' as const, content: initialPrompt },
          {
            role: 'assistant' as const,
            content: `Analyzing verified manufacturing nodes for "${initialPrompt}". Apex Precision Ltd. (Munich) matches 98% with 12x 5-axis CNC spindles available for Q4 production.`,
          },
        ]
      : []),
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Identified 3 top-tier verified suppliers matching your criteria: Apex Precision (Bavaria), Vanguard Metallics (Stuttgart), and Optima MedTech (Zurich). All have ISO 9001 and bilateral encrypted NDA clearance.`,
        },
      ]);
    }, 900);
  };

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
                className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'bg-[#6c151e] text-white rounded-tr-xs'
                    : 'bg-white text-[#1b1c1a] border border-[#dcc0bf]/40 rounded-tl-xs'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {/* Preset Prompt Pills */}
        <div className="px-3 py-1.5 bg-white border-t border-[#dcc0bf]/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setInput('Compare lead times between CNC and DMLS 3D printing');
            }}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df] shrink-0 cursor-pointer"
          >
            Compare lead times
          </button>
          <button
            onClick={() => {
              setInput('Show suppliers with ISO 13485 cleanroom capacity');
            }}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df] shrink-0 cursor-pointer"
          >
            ISO 13485 Cleanroom
          </button>
          <button
            onClick={() => {
              setInput('Draft RFQ specification for 5,000 pcs die cast batch');
            }}
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
            className="flex-1 h-10 px-3.5 rounded-full bg-[#f5f3f0] text-[13px] text-[#1b1c1a] placeholder:text-[#564241]/60 focus:outline-none focus:ring-1 focus:ring-[#3b6662]"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-[#6c151e] text-white flex items-center justify-center hover:brightness-110 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
