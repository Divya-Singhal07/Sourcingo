import React, { useState } from 'react';
import type { DealRoomItem, MatchAvatar } from '../types';

interface DealRoomsProps {
  dealRooms: DealRoomItem[];
  newMatches: MatchAvatar[];
  onOpenMatchmaker: () => void;
}

export const DealRooms: React.FC<DealRoomsProps> = ({
  dealRooms,
  newMatches,
  onOpenMatchmaker: _onOpenMatchmaker,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'rfq' | 'oem' | 'archived'>('all');
  const [selectedDeal, setSelectedDeal] = useState<DealRoomItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: 'Apex Precision Ltd.',
      text: 'Good morning Elena. We have reviewed your CAD files for the 5-axis turbine casing bracket.',
      time: '10:14 AM',
    },
    {
      sender: 'You',
      text: 'Excellent. What is the verified CMM lead time for the first pilot batch of 500 pcs?',
      time: '10:16 AM',
    },
    {
      sender: 'Apex Precision Ltd.',
      text: 'With our current spindle allocation, we can deliver sample approval in 8 days and the full batch in 14 days under ISO 9001 audit.',
      time: '10:20 AM',
    },
  ]);
  const [newMessageText, setNewMessageText] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const filteredDeals = dealRooms.filter((deal) => {
    const matchesSearch =
      deal.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.partnerLocation.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'rfq') return deal.rfqStatus === 'Active RFQ';
    if (activeFilter === 'oem') return deal.verified;
    if (activeFilter === 'archived') return false;
    return true;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'You',
        text: newMessageText,
        time: 'Just now',
      },
    ]);
    setNewMessageText('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: selectedDeal ? selectedDeal.partnerName : 'Supplier',
          text: 'Acknowledged. Technical RFQ parameter updated in the encrypted bilateral room.',
          time: 'Just now',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col relative w-full bg-[#fbf9f6] flex-1 select-none">
      <div className="flex flex-col w-full relative pb-10 max-w-md mx-auto">
        {/* Subtle Ambient Watermark Wave Gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-96 opacity-40 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#f9dec3]/30 via-[#eae8e5]/20 to-transparent"></div>

        {/* Search & Filter Controls */}
        <section className="px-5 pt-2 pb-3 flex flex-col gap-2">
          <div className="relative w-full flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[#564241] text-[20px] pointer-events-none">
              search
            </span>
            <input
              id="dealroom-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats, suppliers, or RFQ specs..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-white text-[#1b1c1a] text-[13px] shadow-[0_2px_8px_rgba(45,31,14,0.04)] focus:outline-none focus:bg-[#f5f3f0] transition-all placeholder:text-[#564241]/60 border border-[#dcc0bf]/30"
              type="text"
            />
            {searchQuery && (
              <button
                aria-label="Clear search input"
                className="absolute right-3 text-[#564241] hover:text-[#4c000c] transition-colors cursor-pointer"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 -mx-5 px-5 no-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#4c000c] text-white'
                  : 'bg-[#f5f3f0] text-[#564241] hover:bg-[#efeeeb]'
              }`}
              type="button"
            >
              All (5)
            </button>
            <button
              onClick={() => setActiveFilter('rfq')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                activeFilter === 'rfq'
                  ? 'bg-[#4c000c] text-white'
                  : 'bg-[#f5f3f0] text-[#564241] hover:bg-[#efeeeb]'
              }`}
              type="button"
            >
              Active RFQ (3)
            </button>
            <button
              onClick={() => setActiveFilter('oem')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                activeFilter === 'oem'
                  ? 'bg-[#4c000c] text-white'
                  : 'bg-[#f5f3f0] text-[#564241] hover:bg-[#efeeeb]'
              }`}
              type="button"
            >
              Verified OEM (4)
            </button>
            <button
              onClick={() => setActiveFilter('archived')}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                activeFilter === 'archived'
                  ? 'bg-[#4c000c] text-white'
                  : 'bg-[#f5f3f0] text-[#564241] hover:bg-[#efeeeb]'
              }`}
              type="button"
            >
              Archived
            </button>
          </div>
        </section>

        {/* Pinned "New Matches / Ready to Connect" Section (Exact Stitch Screen 2) */}
        <section className="py-1 mb-2">
          <div className="px-5 flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6662]"></span>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#564241]">
                New Matches Ready to Connect
              </h2>
            </div>
            <span className="text-[11px] text-[#3b6662] font-semibold">4 Verified</span>
          </div>

          {/* Horizontal supplier avatars scroll */}
          <div className="flex items-start gap-4 overflow-x-auto px-5 pb-2 -mt-1 no-scrollbar">
            {newMatches.map((supplier) => (
              <div
                key={supplier.id}
                className="flex flex-col items-center gap-1.5 shrink-0 w-[76px] cursor-pointer group"
                onClick={() => {
                  setSearchQuery(supplier.company);
                  showToast(`Filtered for ${supplier.company}`);
                }}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-[#efeeeb] shadow-sm p-0.5 group-hover:scale-105 transition-transform">
                    <img
                      className="w-full h-full rounded-full object-cover"
                      src={supplier.avatar}
                      alt={supplier.company}
                    />
                  </div>
                  {supplier.isNew ? (
                    <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-[#6c151e] text-white text-[9px] font-bold rounded-full shadow-sm">
                      NEW
                    </span>
                  ) : (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#3b6662] rounded-full flex items-center justify-center text-white shadow-sm">
                      <span className="material-symbols-outlined text-[10px]">check</span>
                    </span>
                  )}
                </div>
                <div className="text-center w-full">
                  <p className="text-[12px] text-[#1b1c1a] font-semibold truncate leading-tight">
                    {supplier.company}
                  </p>
                  <span className="text-[10px] text-[#564241]">{supplier.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section Title */}
        <div className="px-5 flex items-center justify-between mb-2 pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 className="text-[1.1rem] text-[#1b1c1a] font-semibold tracking-tight">
              Executive Deal Rooms
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#bbe8e4] text-[#00201e] text-[11px] font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6662]"></span>4 Active
            </span>
          </div>
          <div className="flex items-center gap-1 text-[#564241] text-[11px] font-medium shrink-0">
            <span className="material-symbols-outlined text-[13px] text-[#3b6662]">lock</span>
            <span>Encrypted P2P</span>
          </div>
        </div>

        {/* Active Conversations List (Executive Deal Rooms) */}
        <section className="px-5 flex flex-col gap-2.5" id="deal-rooms-list">
          {filteredDeals.length > 0 ? (
            filteredDeals.map((deal, idx) => (
              <article
                key={deal.id}
                onClick={() => {
                  setSelectedDeal(deal);
                  showToast(`Entering confidential room with ${deal.partnerName}`);
                }}
                className="p-4 rounded-xl bg-white shadow-[0_2px_12px_rgba(45,31,14,0.04)] hover:shadow-[0_4px_16px_rgba(108,21,30,0.08)] transition-all cursor-pointer relative overflow-hidden border border-[#dcc0bf]/30"
              >
                {/* Dual tone heritage prestige accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6c151e] via-[#6c151e] to-[#3b6662]"></div>

                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-[1.05rem] text-[#1b1c1a] font-semibold truncate">
                      {deal.partnerName}
                    </h3>
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#bbe8e4] text-[#00201e] text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3b6662]"></span>
                      {deal.verified ? 'Verified OEM' : 'ISO 13485'}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <time className="text-[11px] text-[#564241] block">{deal.timestamp}</time>
                    {deal.unreadCount > 0 ? (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#6c151e] text-white text-[10px] font-bold mt-1 shadow-sm">
                        {deal.unreadCount}
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px] text-[#3b6662] mt-1">
                        done_all
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[13px] text-[#1b1c1a] mb-2 line-clamp-2 leading-relaxed">
                  <span className="font-semibold text-[#4c000c]">
                    {idx === 0
                      ? 'RFQ #8492 updated: '
                      : idx === 1
                      ? 'Heinrich: '
                      : idx === 2
                      ? 'You sent: '
                      : 'Contract draft: '}
                  </span>
                  {deal.lastMessage}
                </p>

                {/* Tags & Milestone Indicators */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#efeeeb] text-[#564241] text-[11px]">
                    {deal.partnerLocation}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#efeeeb] text-[#564241] text-[11px]">
                    {deal.sector}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#f9dec3] text-[#261908] text-[11px] font-semibold">
                    {deal.rfqStatus}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#beebe6] text-[#234e4a] text-[11px] font-semibold">
                    {deal.dealValue}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="px-5 py-8 text-center flex flex-col items-center justify-center bg-white rounded-xl border border-[#dcc0bf]/30">
              <div className="w-12 h-12 rounded-full bg-[#efeeeb] flex items-center justify-center text-[#564241] mb-2">
                <span className="material-symbols-outlined text-[24px]">folder_off</span>
              </div>
              <h3 className="text-[1rem] font-semibold text-[#1b1c1a]">No matching Deal Rooms</h3>
              <p className="text-xs text-[#564241] mt-1 max-w-xs">
                Try searching for other specifications, suppliers, or clearance levels.
              </p>
            </div>
          )}
        </section>

        {/* Interactive Modal Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 inset-x-5 z-50 transition-opacity flex justify-center">
            <div className="bg-[#30312f] text-[#f2f0ed] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px] text-[#beebe6]">
                check_circle
              </span>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Live Chat & Negotiation Dialog */}
        {selectedDeal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
            <div className="w-full max-w-sm h-[580px] max-h-[90vh] bg-white rounded-3xl border border-[#4c000c]/20 shadow-2xl flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 bg-[#f5f3f0] border-b border-[#dcc0bf]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedDeal.avatar}
                    alt={selectedDeal.partnerName}
                    className="w-10 h-10 rounded-full object-cover border border-[#dcc0bf]/40"
                  />
                  <div>
                    <h3 className="font-serif text-[16px] text-[#4c000c] font-medium leading-none">
                      {selectedDeal.partnerName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#564241] mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Encrypted Deal Room</span>
                      <span>•</span>
                      <span className="text-[#3b6662] font-semibold">{selectedDeal.dealValue}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDeal(null)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#564241] hover:text-[#4c000c] shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Status Banner */}
              <div className="px-4 py-2 bg-[#bbe8e4]/40 border-b border-[#a3cfca]/40 flex items-center justify-between text-[11px] text-[#234e4a]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  Bilateral NDA Executed • ISO 9001
                </span>
                <span className="font-bold text-[#4c000c]">{selectedDeal.rfqStatus}</span>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#fbf9f6]">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === 'You' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <span className="text-[10px] text-[#564241] px-1 mb-0.5">
                      {msg.sender} • {msg.time}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-[12.5px] leading-relaxed shadow-xs ${
                        msg.sender === 'You'
                          ? 'bg-[#6c151e] text-white rounded-tr-xs'
                          : 'bg-white text-[#1b1c1a] border border-[#dcc0bf]/40 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-[#dcc0bf]/30 flex items-center gap-2"
              >
                <input
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type requirement or inquiry..."
                  className="flex-1 h-10 px-3.5 rounded-full bg-[#f5f3f0] text-[12.5px] text-[#1b1c1a] placeholder:text-[#564241]/60 focus:outline-none focus:ring-1 focus:ring-[#3b6662]"
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
        )}
      </div>
    </div>
  );
};
