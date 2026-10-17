import React, { useState } from 'react';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeal: (partnerName: string) => void;
}

interface MatchRecord {
  id: string;
  partnerName: string;
  category: string;
  location: string;
  avatar: string;
  decision: 'connected' | 'passed';
  timestamp: string;
  compatibilityScore: number;
  tags: string[];
  notes: string;
}

const MOCK_MATCH_HISTORY: MatchRecord[] = [
  {
    id: 'mat-1',
    partnerName: 'Apex Precision Ltd.',
    category: 'Precision CNC',
    location: 'Munich, Germany',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf2pK0JMum4ic3HqYJVg9Owx87M9ub90a42bL8-PQQ0_8-Y6dVOcG90kaCXVr8Dgll40xbBmteCbIWjXd8iQxfpdnFcFG1wNA6HksOjW64ET0m-m_kx07pR8c7DAC_MfBMvBnrtRY_S15BE2aoPFa9m6QL2IPxIKwSaJuFDl-TqbDkOlm9z3chz_KT_q0u8PuVVzh0RVJym61byzlZ0jr7OfXPdsMgBrSAaQVzZmBRyJ8mCQMyJVpSxw',
    decision: 'connected',
    timestamp: 'Today, 10:14 AM',
    compatibilityScore: 98,
    tags: ['ISO 9001', 'AS9100D', '±0.005mm'],
    notes: 'Matched via Bilateral Deal Room. Active RFQ in progress for turbine brackets.',
  },
  {
    id: 'mat-2',
    partnerName: 'KUKA Automation Partner',
    category: 'Automotive',
    location: 'Stuttgart, Germany',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD6f0eGcH1-Uqgz5BT8kN_4A_3d9EPgsbdsREWpmGNQyopd2dYkOUd4K6BpflgggtC6MK8E_Zok9CGV3a-dA8P2uP3pvaz16pq7JTT5WOkGhdkNU8cW5Jbfr6Q3mBlUCaMbuNkbd6JQXJRZ3rBVhVp-GCaOOkfAsL-rITsrkUv1TKM3wvGBWD09dQkeL8Y9_fjudhOJ2UXnUGQdvHEybhLaLVtq-RXUqfshtDChNJAmBgHSUyxuFpt0w',
    decision: 'connected',
    timestamp: 'Yesterday, 3:20 PM',
    compatibilityScore: 95,
    tags: ['IATF 16949', 'Robotics', 'A380 Alloy'],
    notes: 'Saved to shortlist. Initial tech review completed with positive capability index.',
  },
  {
    id: 'mat-3',
    partnerName: 'Nordic Tooling & Extrusions',
    category: 'Aerospace',
    location: 'Helsinki, Finland',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUCIgLrSknq-RVSp7nPNV-NoGVe757t7fiXKkRLZr-CAIVI5Tj5oCAYNuM3fyvLrPGBaZUomgsrR4a1N8j065c0vb5A8re-eI5FXGttVpR-s-IflcdDiQvuqzfM7WKCfzsX13cT4xczpF0HZw_6ZViMCPDu2xn_2QrzZ3-MNIhVdTWI5wB3TJctv5O65-uBCGGX9b8z9Dr3IbBy9e2GFeqmLyywCmA5OaacYjr9hmPYGAucjH74c84nQ',
    decision: 'connected',
    timestamp: 'May 18, 2026',
    compatibilityScore: 99,
    tags: ['Titanium', 'Wire EDM', 'AS9100D'],
    notes: 'Sample evaluation approved. Production capacity verified for 500 pcs/month.',
  },
  {
    id: 'mat-4',
    partnerName: 'Valo High-Tech Die-Casting',
    category: 'Packaging',
    location: 'Lyon, France',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUG2PKUQCpjhoa0WA1B8cW1yHgUXtGzA5kGEpnggMLu7w9m0AZ_hTBK4I36gVgr1Fb-VUS6Z1lGO3BWve7hyF1BEO4r-4CzFlTSp7LLm9l2FHZVGeI_VsSoexcQagODnWtbYJAc9GuO-gO0aaQktcBwB7nNK_XspQY1fAOCpwsLy25YsjDATzYODGiF020Y6sMAHCIJvIIfJ5NBZ_2AQDVeZvZSgPESQ1fQ9WX-CRs0wGi10OZBMOB-Q',
    decision: 'passed',
    timestamp: 'May 16, 2026',
    compatibilityScore: 74,
    tags: ['Die-Casting', 'Lead Time 18d'],
    notes: 'Passed due to minimum order quantity requirement exceeding pilot requirements.',
  },
  {
    id: 'mat-5',
    partnerName: 'Hansatech Micro-Optics',
    category: 'Injection Molding',
    location: 'Stuttgart, Germany',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwDpBScwxPqV4scRl-ogr1H5nIBHZ4qDu3DQ4wUUPWYIX1TlIcYebTBSiqDmtla7rK7uXFrChU6bV7YCrC-6ZQ4cnQByTUBjk2MdKtDJ7yseoLEBpmbgUb-_KWuzrJJlCxZWaEbagifu7uApBXDW3qjI5mRwY39Y9uXksXJm-WECJzJGGpDU73-s5wnhJkeKjzHX4vm_7dKEougLvGtTs_eMR5KPWyQINcz1OERteP8WZylvGUhQONyg',
    decision: 'connected',
    timestamp: 'May 14, 2026',
    compatibilityScore: 92,
    tags: ['Micro-Optics', 'Cleanroom ISO 7'],
    notes: 'Specification dossier under technical bilateral review.',
  },
];

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenDeal,
}) => {
  const [filter, setFilter] = useState<'all' | 'connected' | 'passed'>('all');

  if (!isOpen) return null;

  const filtered = MOCK_MATCH_HISTORY.filter((item) => {
    if (filter === 'all') return true;
    return item.decision === filter;
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[640px] max-h-[92vh] bg-white rounded-3xl border border-[#4c000c]/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#f5f3f0] border-b border-[#dcc0bf]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2d1f0e] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[19px]">history</span>
            </div>
            <div>
              <h3 className="font-serif text-[17px] text-[#4c000c] font-medium leading-none">
                Match History
              </h3>
              <p className="text-[11px] text-[#564241] mt-0.5">
                Past Sourcing Swipes, Matches &amp; Decisions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#564241] hover:text-[#4c000c] shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-white border-b border-[#dcc0bf]/20 flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#4c000c] text-white shadow-xs'
                : 'bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df]'
            }`}
          >
            All Activity ({MOCK_MATCH_HISTORY.length})
          </button>
          <button
            onClick={() => setFilter('connected')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
              filter === 'connected'
                ? 'bg-[#3b6662] text-white shadow-xs'
                : 'bg-[#beebe6]/40 text-[#234e4a] hover:bg-[#beebe6]/60'
            }`}
          >
            Connected ({MOCK_MATCH_HISTORY.filter((m) => m.decision === 'connected').length})
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
              filter === 'passed'
                ? 'bg-[#897171] text-white shadow-xs'
                : 'bg-[#efeeeb] text-[#564241] hover:bg-[#e4e2df]'
            }`}
          >
            Passed ({MOCK_MATCH_HISTORY.filter((m) => m.decision === 'passed').length})
          </button>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#fbf9f6]">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-white rounded-2xl border border-[#dcc0bf]/40 flex flex-col gap-2.5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.avatar}
                    alt={item.partnerName}
                    className="w-11 h-11 rounded-xl object-cover border border-[#dcc0bf]/30"
                  />
                  <div>
                    <h4 className="text-[13.5px] font-semibold text-[#1b1c1a] leading-tight">
                      {item.partnerName}
                    </h4>
                    <p className="text-[11px] text-[#564241] mt-0.5">
                      {item.category} • {item.location}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  {item.decision === 'connected' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#beebe6] text-[#00201e]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3b6662]"></span>
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#efeeeb] text-[#564241]">
                      Passed
                    </span>
                  )}
                  <span className="text-[10px] text-[#564241] mt-1">{item.timestamp}</span>
                </div>
              </div>

              <p className="text-[11.5px] text-[#1b1c1a] bg-[#f5f3f0] p-2 rounded-xl">
                {item.notes}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-[#efeeeb]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10.5px] text-[#564241] font-medium">Fit Score:</span>
                  <span className="text-[11.5px] font-bold text-[#3b6662]">
                    {item.compatibilityScore}%
                  </span>
                </div>

                {item.decision === 'connected' && (
                  <button
                    onClick={() => {
                      onOpenDeal(item.partnerName);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-full bg-[#6c151e] text-white text-[11px] font-semibold hover:brightness-110 shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>View Deal Room</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
