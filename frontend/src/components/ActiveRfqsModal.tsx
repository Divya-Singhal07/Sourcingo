import React, { useState } from 'react';

interface ActiveRfqsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeal: (partnerName: string) => void;
}

interface RfqItem {
  id: string;
  partnerName: string;
  projectTitle: string;
  sector: string;
  avatar: string;
  budgetEst: string;
  stage: 'Quote Review' | 'Technical Audit' | 'CAD Feasibility' | 'Milestone 2/4';
  deadline: string;
  statusBadge: string;
  itemsCount: number;
  specsSummary: string;
}

const MOCK_ACTIVE_RFQS: RfqItem[] = [
  {
    id: 'rfq-1',
    partnerName: 'Apex Precision Ltd.',
    projectTitle: '5-Axis Turbine Casing Bracket',
    sector: 'Aerospace & Automotive Tier 1',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf2pK0JMum4ic3HqYJVg9Owx87M9ub90a42bL8-PQQ0_8-Y6dVOcG90kaCXVr8Dgll40xbBmteCbIWjXd8iQxfpdnFcFG1wNA6HksOjW64ET0m-m_kx07pR8c7DAC_MfBMvBnrtRY_S15BE2aoPFa9m6QL2IPxIKwSaJuFDl-TqbDkOlm9z3chz_KT_q0u8PuVVzh0RVJym61byzlZ0jr7OfXPdsMgBrSAaQVzZmBRyJ8mCQMyJVpSxw',
    budgetEst: '€19,250 (500 units)',
    stage: 'Quote Review',
    deadline: 'Due in 3 days',
    statusBadge: 'Supplier Responded',
    itemsCount: 500,
    specsSummary: 'Aerospace 7075-T6 Aluminium, ±0.005mm tolerance, CMM certs required.',
  },
  {
    id: 'rfq-2',
    partnerName: 'Alpine Precision Gears',
    projectTitle: 'Planetary Gearbox Ring Gears',
    sector: 'Gears & Powertrain',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUCIgLrSknq-RVSp7nPNV-NoGVe757t7fiXKkRLZr-CAIVI5Tj5oCAYNuM3fyvLrPGBaZUomgsrR4a1N8j065c0vb5A8re-eI5FXGttVpR-s-IflcdDiQvuqzfM7WKCfzsX13cT4xczpF0HZw_6ZViMCPDu2xn_2QrzZ3-MNIhVdTWI5wB3TJctv5O65-uBCGGX9b8z9Dr3IbBy9e2GFeqmLyywCmA5OaacYjr9hmPYGAucjH74c84nQ',
    budgetEst: '€42,000 (1,200 units)',
    stage: 'Milestone 2/4',
    deadline: 'Due in 8 days',
    statusBadge: 'Escrow Ready',
    itemsCount: 1200,
    specsSummary: 'Carburized case-hardened steel, DIN 3962 Class 6 precision gear grinding.',
  },
  {
    id: 'rfq-3',
    partnerName: 'Hansatech Micro-Optics',
    projectTitle: 'Precision Optical Collimator Lenses',
    sector: 'Injection Molding',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwDpBScwxPqV4scRl-ogr1H5nIBHZ4qDu3DQ4wUUPWYIX1TlIcYebTBSiqDmtla7rK7uXFrChU6bV7YCrC-6ZQ4cnQByTUBjk2MdKtDJ7yseoLEBpmbgUb-_KWuzrJJlCxZWaEbagifu7uApBXDW3qjI5mRwY39Y9uXksXJm-WECJzJGGpDU73-s5wnhJkeKjzHX4vm_7dKEougLvGtTs_eMR5KPWyQINcz1OERteP8WZylvGUhQONyg',
    budgetEst: '€180,000 (25,000 units)',
    stage: 'CAD Feasibility',
    deadline: 'Due in 5 days',
    statusBadge: 'Under Review',
    itemsCount: 25000,
    specsSummary: 'Optical grade PMMA & COP polymer with anti-reflective AR multi-layer coating.',
  },
];

export const ActiveRfqsModal: React.FC<ActiveRfqsModalProps> = ({
  isOpen,
  onClose,
  onOpenDeal,
}) => {
  const [selectedRfq, setSelectedRfq] = useState<RfqItem | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[640px] max-h-[92vh] bg-white rounded-3xl border border-[#4c000c]/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#f5f3f0] border-b border-[#dcc0bf]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6c151e] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[19px]">request_quote</span>
            </div>
            <div>
              <h3 className="font-serif text-[17px] text-[#4c000c] font-medium leading-none">
                Active RFQs
              </h3>
              <p className="text-[11px] text-[#564241] mt-0.5">
                3 Live Requests for Quotation &amp; Negotiations
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#fbf9f6]">
          {selectedRfq ? (
            /* RFQ Detail Deep-Dive */
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setSelectedRfq(null)}
                className="self-start inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#3b6662] hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to RFQs List</span>
              </button>

              <div className="p-4 bg-white rounded-2xl border border-[#dcc0bf]/40 shadow-xs flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#6c151e] bg-[#ffdad9]/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedRfq.stage}
                    </span>
                    <h4 className="font-semibold text-[16px] text-[#1b1c1a] mt-1.5 leading-snug">
                      {selectedRfq.projectTitle}
                    </h4>
                    <p className="text-[11.5px] text-[#564241]">{selectedRfq.partnerName}</p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    {selectedRfq.deadline}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#efeeeb]">
                  <div className="bg-[#f5f3f0] p-2.5 rounded-xl">
                    <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">
                      Estimated Deal Value
                    </span>
                    <p className="text-[13.5px] font-bold text-[#1b1c1a] mt-0.5">
                      {selectedRfq.budgetEst}
                    </p>
                  </div>
                  <div className="bg-[#f5f3f0] p-2.5 rounded-xl">
                    <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">
                      Volume Batch
                    </span>
                    <p className="text-[13.5px] font-bold text-[#3b6662] mt-0.5">
                      {selectedRfq.itemsCount.toLocaleString()} units
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#efeeeb]">
                  <h5 className="text-[11px] font-bold text-[#564241] uppercase tracking-wider mb-1">
                    Technical Specifications
                  </h5>
                  <p className="text-[12px] text-[#1b1c1a] bg-[#fbf9f6] p-2.5 rounded-xl border border-[#dcc0bf]/30">
                    {selectedRfq.specsSummary}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#564241]">Status: <strong className="text-[#3b6662]">{selectedRfq.statusBadge}</strong></span>
                  <button
                    onClick={() => {
                      onOpenDeal(selectedRfq.partnerName);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#6c151e] text-white text-[12px] font-semibold hover:brightness-110 shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Open Bilateral Deal Room</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* RFQ List */
            MOCK_ACTIVE_RFQS.map((rfq) => (
              <div
                key={rfq.id}
                onClick={() => setSelectedRfq(rfq)}
                className="p-3.5 bg-white rounded-2xl border border-[#dcc0bf]/40 flex flex-col gap-2.5 shadow-xs hover:border-[#6c151e] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rfq.avatar}
                      alt={rfq.partnerName}
                      className="w-11 h-11 rounded-xl object-cover border border-[#dcc0bf]/30"
                    />
                    <div>
                      <h4 className="text-[13.5px] font-semibold text-[#1b1c1a] leading-tight">
                        {rfq.projectTitle}
                      </h4>
                      <p className="text-[11px] text-[#564241] mt-0.5">{rfq.partnerName}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad9]/50 text-[#4c000c]">
                    {rfq.stage}
                  </span>
                </div>

                <p className="text-[11px] text-[#564241] bg-[#f5f3f0] p-2 rounded-xl line-clamp-2">
                  {rfq.specsSummary}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#efeeeb]">
                  <span className="font-semibold text-[#3b6662]">{rfq.budgetEst}</span>
                  <div className="flex items-center gap-1 text-[#6c151e] font-semibold">
                    <span>Manage RFQ</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
