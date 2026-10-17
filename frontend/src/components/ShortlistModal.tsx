import React from 'react';
import type { ProductCard } from '../types';

interface ShortlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProducts: ProductCard[];
  onRemoveBookmark: (id: string) => void;
  onStartDealRoom: (product: ProductCard) => void;
}

export const ShortlistModal: React.FC<ShortlistModalProps> = ({
  isOpen,
  onClose,
  savedProducts,
  onRemoveBookmark,
  onStartDealRoom,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[540px] bg-white rounded-3xl border border-[#4c000c]/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#f5f3f0] border-b border-[#dcc0bf]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6c151e] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">bookmark</span>
            </div>
            <div>
              <h3 className="font-serif text-[17px] text-[#4c000c] font-medium leading-none">
                Supplier Shortlist
              </h3>
              <p className="text-[11px] text-[#564241] mt-0.5">
                {savedProducts.length} Saved Manufacturer Dossiers
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

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-[#fbf9f6]">
          {savedProducts.length > 0 ? (
            savedProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-white rounded-2xl border border-[#dcc0bf]/40 flex items-center justify-between gap-3 shadow-xs"
              >
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-14 h-14 rounded-xl object-cover border border-[#dcc0bf]/30"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-[13.5px] font-semibold text-[#1b1c1a] truncate leading-tight">
                    {p.manufacturer.name}
                  </h4>
                  <p className="text-[11px] text-[#3b6662] truncate mt-0.5">{p.name}</p>
                  <p className="text-[10.5px] text-[#564241] mt-0.5">
                    MOQ {p.moq} pcs • {p.manufacturer.city} • Lead {p.lead_time_days}d
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      onStartDealRoom(p);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-full bg-[#6c151e] text-white text-[11px] font-semibold hover:brightness-110 shadow-xs cursor-pointer"
                  >
                    Open Deal
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(p.id)}
                    className="w-7 h-7 rounded-full bg-[#efeeeb] text-[#564241] flex items-center justify-center hover:text-red-700 cursor-pointer"
                    title="Remove from saved"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#564241]">
              <span className="material-symbols-outlined text-[36px] text-[#dcc0bf] mb-2">
                bookmark_border
              </span>
              <p className="text-sm font-medium">No suppliers bookmarked yet.</p>
              <p className="text-xs text-[#564241]/80 mt-1 max-w-xs">
                Tap the bookmark icon on any card in the Swipe Deck to store them in your private
                executive vault.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
