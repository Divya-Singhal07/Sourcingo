import React from 'react';
import type { ProductCard } from '../types';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedProducts: ProductCard[];
  selectedPriceTier: 'Budget' | 'Mid-Tier' | 'Enterprise';
  onChangePriceTier: (tier: 'Budget' | 'Mid-Tier' | 'Enterprise') => void;
  searchRadius: '50 km' | '250 km' | '1000 km' | 'Global';
  onChangeSearchRadius: (radius: '50 km' | '250 km' | '1000 km' | 'Global') => void;
  onOpenShortlist: () => void;
  onNavigateToDealrooms: () => void;
}

export const NavDrawer: React.FC<NavDrawerProps> = ({
  isOpen,
  onClose,
  savedProducts,
  selectedPriceTier,
  onChangePriceTier,
  searchRadius,
  onChangeSearchRadius,
  onOpenShortlist,
  onNavigateToDealrooms,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div
        id="nav-drawer-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Aside Drawer (Exact Stitch Screen 1 Drawer) */}
      <aside
        id="nav-drawer"
        aria-label="Main navigation drawer"
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[340px] bg-[#fbf9f6] z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#dcc0bf]/40 overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full bg-[#fbf9f6]">
          {/* Header */}
          <div className="p-4 border-b border-[#dcc0bf]/30 bg-[#f5f3f0]/70 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#6c151e] text-white flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">hub</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-serif text-[18px] text-[#4c000c] font-medium tracking-tight leading-none">
                    Sourcingo
                  </h2>
                  <p className="text-[11px] text-[#3b6662] font-semibold tracking-wide uppercase mt-1">
                    Supplier Vault &amp; Filters
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close navigation menu"
                className="w-8 h-8 rounded-full bg-[#efeeeb] hover:bg-[#e4e2df] text-[#564241] flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3.5 no-scrollbar">
            {/* Saved Suppliers Card */}
            <div
              onClick={() => {
                onOpenShortlist();
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-white border border-[#dcc0bf]/40 shadow-sm flex items-center justify-between hover:border-[#3b6662]/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#bbe8e4]/60 text-[#3b6662] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">bookmark</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13.5px] font-semibold text-[#1b1c1a] leading-tight">
                    Saved Suppliers
                  </span>
                  <span className="text-[11px] text-[#564241] mt-0.5">Shortlisted OEM partners</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#6c151e] text-white font-bold shadow-sm">
                  {savedProducts.length || 14} Saved
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#564241]">
                  chevron_right
                </span>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#dcc0bf]/40 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between leading-none">
                <div className="flex items-center gap-2 text-[#1b1c1a] font-semibold text-[13px]">
                  <span className="material-symbols-outlined text-[17px] text-[#3b6662]">
                    payments
                  </span>
                  <span>Price Range</span>
                </div>
                <span className="text-[12px] font-bold text-[#4c000c]">$1k – $50k+</span>
              </div>

              <div className="relative flex items-center py-1 mt-0.5">
                <div className="w-full h-1.5 bg-[#e4e2df] rounded-full relative overflow-hidden">
                  <div
                    className="h-full bg-[#6c151e] rounded-full transition-all duration-300"
                    style={{
                      width:
                        selectedPriceTier === 'Budget'
                          ? '35%'
                          : selectedPriceTier === 'Mid-Tier'
                          ? '70%'
                          : '100%',
                    }}
                  ></div>
                </div>
                <div
                  className="absolute w-4 h-4 bg-[#6c151e] border-2 border-white rounded-full shadow top-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{
                    left:
                      selectedPriceTier === 'Budget'
                        ? 'calc(35% - 8px)'
                        : selectedPriceTier === 'Mid-Tier'
                        ? 'calc(70% - 8px)'
                        : 'calc(100% - 16px)',
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-[#564241] px-0.5">
                <span className="font-medium">$1,000</span>
                <span className="font-semibold text-[#4c000c]">
                  Target:{' '}
                  {selectedPriceTier === 'Budget'
                    ? '$12,000'
                    : selectedPriceTier === 'Mid-Tier'
                    ? '$35,000'
                    : '$75,000'}
                </span>
                <span className="font-medium">$50k+</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => onChangePriceTier('Budget')}
                  className={`py-1.5 rounded-lg text-[11px] font-medium text-center transition-colors cursor-pointer ${
                    selectedPriceTier === 'Budget'
                      ? 'bg-[#6c151e] text-white font-semibold shadow-sm'
                      : 'bg-[#beebe6]/40 text-[#234e4a] border border-[#a3cfca] hover:bg-[#beebe6]/60'
                  }`}
                >
                  Budget
                </button>
                <button
                  onClick={() => onChangePriceTier('Mid-Tier')}
                  className={`py-1.5 rounded-lg text-[11px] text-center transition-colors cursor-pointer ${
                    selectedPriceTier === 'Mid-Tier'
                      ? 'bg-[#6c151e] text-white font-semibold shadow-sm'
                      : 'bg-[#beebe6]/40 text-[#234e4a] border border-[#a3cfca] hover:bg-[#beebe6]/60'
                  }`}
                >
                  Mid-Tier
                </button>
                <button
                  onClick={() => onChangePriceTier('Enterprise')}
                  className={`py-1.5 rounded-lg text-[11px] font-medium text-center transition-colors cursor-pointer ${
                    selectedPriceTier === 'Enterprise'
                      ? 'bg-[#6c151e] text-white font-semibold shadow-sm'
                      : 'bg-[#f9dec3]/50 text-[#261908] border border-[#dcc2a8] hover:bg-[#f9dec3]/80'
                  }`}
                >
                  Enterprise
                </button>
              </div>
            </div>

            {/* Search Radius Filter */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#dcc0bf]/40 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between leading-none">
                <div className="flex items-center gap-2 text-[#1b1c1a] font-semibold text-[13px]">
                  <span className="material-symbols-outlined text-[17px] text-[#3b6662]">
                    distance
                  </span>
                  <span>Search Radius</span>
                </div>
                <span className="text-[12px] font-bold text-[#3b6662]">{searchRadius}</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {(['50 km', '250 km', '1000 km', 'Global'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => onChangeSearchRadius(r)}
                    className={`py-1.5 rounded-lg text-[11px] text-center transition-colors cursor-pointer ${
                      searchRadius === r
                        ? 'font-bold bg-[#3b6662] text-white shadow-sm'
                        : 'font-medium border border-[#dcc0bf]/40 bg-[#fbf9f6] text-[#1b1c1a] hover:bg-[#bbe8e4]/40'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Executive Links */}
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[11px] font-semibold text-[#564241] uppercase tracking-wider px-1 pb-1">
                Executive Links
              </span>
              <div className="flex flex-col gap-1 rounded-2xl bg-white border border-[#dcc0bf]/40 p-1.5 shadow-sm">
                <button
                  onClick={() => {
                    onNavigateToDealrooms();
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#1b1c1a] hover:bg-[#efeeeb] font-medium text-[13px] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#3b6662]">
                      verified_user
                    </span>
                    <span>Verification Dossiers</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-[#564241]">
                    arrow_forward
                  </span>
                </button>

                <button
                  onClick={() => {
                    onNavigateToDealrooms();
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#1b1c1a] hover:bg-[#efeeeb] font-medium text-[13px] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#3b6662]">
                      history
                    </span>
                    <span>Match History</span>
                  </div>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#f9dec3]/60 text-[#261908] font-semibold">
                    12 Recent
                  </span>
                </button>

                <button
                  onClick={() => {
                    onNavigateToDealrooms();
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-[#1b1c1a] hover:bg-[#efeeeb] font-medium text-[13px] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#3b6662]">
                      request_quote
                    </span>
                    <span>Active RFQs</span>
                  </div>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#beebe6]/60 text-[#234e4a] font-semibold">
                    3 New
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer User Profile */}
          <div className="p-4 border-t border-[#dcc0bf]/30 bg-[#f5f3f0] flex flex-col gap-3 flex-shrink-0">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-full bg-[#bbe8e4]/60 text-[#3b6662] flex items-center justify-center font-bold text-[12.5px] border border-[#a3cfca]/50 flex-shrink-0">
                PE
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-semibold text-[#1b1c1a] truncate leading-tight">
                  Elena Rostova
                </span>
                <span className="text-[11px] text-[#564241] truncate mt-0.5">
                  BMW Group Procurement Tier
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Signed out of session');
                onClose();
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#4c000c] bg-[#ffdad9]/30 hover:bg-[#ffdad9]/50 text-[13px] font-semibold transition-colors w-full shadow-sm border border-[#4c000c]/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
