import React from 'react';
import type { ProductCard } from '../types';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedProducts: ProductCard[];
  selectedPriceTier: 'Budget' | 'Mid-Tier' | 'Enterprise';
  onChangePriceTier: (tier: 'Budget' | 'Mid-Tier' | 'Enterprise') => void;
  searchRadiusKm: number;
  onChangeSearchRadiusKm: (radius: number) => void;
  autoExpandRadius: boolean;
  onChangeAutoExpandRadius: (enabled: boolean) => void;
  originCity: string;
  onChangeOriginCity: (city: string) => void;
  onOpenShortlist: () => void;
  onNavigateToDealrooms: () => void;
  onOpenVerificationDossiers: () => void;
  onOpenMatchHistory: () => void;
  onOpenActiveRfqs: () => void;
  onSignOut?: () => void;
  currentUser?: { name: string; companyName: string; role: string; avatar?: string } | null;
}

export const NavDrawer: React.FC<NavDrawerProps> = ({
  isOpen,
  onClose,
  savedProducts,
  selectedPriceTier,
  onChangePriceTier,
  searchRadiusKm,
  onChangeSearchRadiusKm,
  autoExpandRadius,
  onChangeAutoExpandRadius,
  originCity,
  onChangeOriginCity,
  onOpenShortlist,
  onNavigateToDealrooms: _onNavigateToDealrooms,
  onOpenVerificationDossiers,
  onOpenMatchHistory,
  onOpenActiveRfqs,
  onSignOut,
  currentUser,
}) => {
  const initialValue =
    selectedPriceTier === 'Budget'
      ? 12000
      : selectedPriceTier === 'Mid-Tier'
      ? 35000
      : 75000;

  const [sliderValue, setSliderValue] = React.useState<number>(initialValue);

  // Sync slider when selectedPriceTier prop changes externally from tier buttons
  const isDraggingRef = React.useRef(false);

  React.useEffect(() => {
    if (!isDraggingRef.current) {
      if (selectedPriceTier === 'Budget') setSliderValue(12000);
      else if (selectedPriceTier === 'Mid-Tier') setSliderValue(35000);
      else if (selectedPriceTier === 'Enterprise') setSliderValue(75000);
    }
  }, [selectedPriceTier]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderValue(val);

    // Automatically sync tier based on value threshold
    if (val < 25000 && selectedPriceTier !== 'Budget') {
      onChangePriceTier('Budget');
    } else if (val >= 25000 && val < 55000 && selectedPriceTier !== 'Mid-Tier') {
      onChangePriceTier('Mid-Tier');
    } else if (val >= 55000 && selectedPriceTier !== 'Enterprise') {
      onChangePriceTier('Enterprise');
    }
  };

  const handleTierSelect = (tier: 'Budget' | 'Mid-Tier' | 'Enterprise') => {
    isDraggingRef.current = false;
    onChangePriceTier(tier);
    if (tier === 'Budget') setSliderValue(12000);
    if (tier === 'Mid-Tier') setSliderValue(35000);
    if (tier === 'Enterprise') setSliderValue(75000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        id="nav-drawer-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Aside Drawer with Smooth Hardware-Accelerated Bezier Slide */}
      <aside
        id="nav-drawer"
        aria-label="Main navigation drawer"
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[340px] bg-[#fbf9f6] z-50 shadow-2xl flex flex-col justify-between transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] border-r border-[#dcc0bf]/40 overflow-hidden will-change-transform ${
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
                <span className="text-[12.5px] font-bold text-[#4c000c] tracking-tight">
                  ${sliderValue.toLocaleString()}
                </span>
              </div>

              {/* Clean Precision Range Slider */}
              <div className="relative flex flex-col gap-1 py-1">
                <div className="relative flex items-center w-full h-6">
                  {/* Underlying Track */}
                  <div className="absolute inset-x-0 h-1.5 bg-[#e4e2df] rounded-full pointer-events-none overflow-hidden">
                    {/* Active Progress Fill */}
                    <div
                      className="h-full bg-[#6c151e] rounded-full transition-all duration-75"
                      style={{
                        width: `${((sliderValue - 1000) / (75000 - 1000)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Transparent Range Input Overlay with Custom Thumb */}
                  <input
                    type="range"
                    min={1000}
                    max={75000}
                    step={500}
                    value={sliderValue}
                    onMouseDown={() => {
                      isDraggingRef.current = true;
                    }}
                    onTouchStart={() => {
                      isDraggingRef.current = true;
                    }}
                    onMouseUp={() => {
                      isDraggingRef.current = false;
                    }}
                    onTouchEnd={() => {
                      isDraggingRef.current = false;
                    }}
                    onChange={handleSliderChange}
                    className="price-range-slider relative z-10"
                    aria-label="Price range target slider"
                  />
                </div>

                <div className="flex items-center justify-between text-[10.5px] text-[#564241] px-0.5">
                  <span className="font-medium">$1,000</span>
                  <span className="font-semibold text-[#4c000c]">
                    Target: ${sliderValue.toLocaleString()}
                  </span>
                  <span className="font-medium">$75,000+</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => handleTierSelect('Budget')}
                  className={`py-1.5 rounded-lg text-[11px] font-medium text-center transition-colors cursor-pointer ${
                    selectedPriceTier === 'Budget'
                      ? 'bg-[#6c151e] text-white font-semibold shadow-sm'
                      : 'bg-[#beebe6]/40 text-[#234e4a] border border-[#a3cfca] hover:bg-[#beebe6]/60'
                  }`}
                >
                  Budget
                </button>
                <button
                  onClick={() => handleTierSelect('Mid-Tier')}
                  className={`py-1.5 rounded-lg text-[11px] text-center transition-colors cursor-pointer ${
                    selectedPriceTier === 'Mid-Tier'
                      ? 'bg-[#6c151e] text-white font-semibold shadow-sm'
                      : 'bg-[#beebe6]/40 text-[#234e4a] border border-[#a3cfca] hover:bg-[#beebe6]/60'
                  }`}
                >
                  Mid-Tier
                </button>
                <button
                  onClick={() => handleTierSelect('Enterprise')}
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

            {/* Search Radius & Location Filter */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#dcc0bf]/40 shadow-sm flex flex-col gap-3">
              {/* Search Origin Selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between leading-none">
                  <div className="flex items-center gap-1.5 text-[#1b1c1a] font-semibold text-[13px]">
                    <span className="material-symbols-outlined text-[17px] text-[#6c151e]">
                      location_on
                    </span>
                    <span>Search Origin</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#6c151e] bg-[#ffdad9]/40 px-2 py-0.5 rounded-full">
                    Buyer Location
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={originCity}
                    onChange={(e) => onChangeOriginCity(e.target.value)}
                    className="w-full h-8.5 px-3 py-1 bg-[#f5f3f0] border border-[#dcc0bf]/50 rounded-xl text-[12px] text-[#1b1c1a] font-medium focus:outline-none focus:ring-1 focus:ring-[#3b6662] cursor-pointer appearance-none pr-8"
                  >
                    <option value="Pune">Pune, Maharashtra (Central Hub)</option>
                    <option value="Bengaluru">Bengaluru, Karnataka (Tech & Precision)</option>
                    <option value="Ahmedabad">Ahmedabad, Gujarat (Heavy Mfg)</option>
                    <option value="Chennai">Chennai, Tamil Nadu (Automotive Corridor)</option>
                    <option value="Mumbai">Mumbai, Maharashtra (Commercial Port)</option>
                    <option value="Delhi">Delhi NCR (Northern Industrial Belt)</option>
                  </select>
                  <span className="material-symbols-outlined text-[16px] text-[#564241] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Radius Options */}
              <div className="flex flex-col gap-1.5 pt-0.5 border-t border-[#eae8e5]">
                <div className="flex items-center justify-between leading-none mt-1">
                  <div className="flex items-center gap-2 text-[#1b1c1a] font-semibold text-[13px]">
                    <span className="material-symbols-outlined text-[17px] text-[#3b6662]">
                      distance
                    </span>
                    <span>Search Radius</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#3b6662]">{searchRadiusKm} km</span>
                </div>

                <div className="grid grid-cols-5 gap-1 pt-1">
                  {([10, 25, 50, 100, 200] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onChangeSearchRadiusKm(r)}
                      className={`py-1.5 rounded-lg text-[11px] text-center transition-all cursor-pointer ${
                        searchRadiusKm === r
                          ? 'font-bold bg-[#3b6662] text-white shadow-sm scale-102'
                          : 'font-medium border border-[#dcc0bf]/40 bg-[#fbf9f6] text-[#1b1c1a] hover:bg-[#bbe8e4]/40'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>

              {/* Automatic Expansion Toggle */}
              <div className="pt-2 border-t border-[#eae8e5] flex flex-col gap-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={autoExpandRadius}
                      onChange={(e) => onChangeAutoExpandRadius(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-[#d8d6d2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#6c151e]"></div>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[12px] font-semibold text-[#1b1c1a] leading-tight">
                      Automatically expand search radius if fewer than 5 manufacturers are found
                    </span>
                    <span className="text-[10px] text-[#564241] mt-0.5 leading-snug">
                      Expands dynamically up to 200 km to guarantee vetted OEM coverage while preserving all filters.
                    </span>
                  </div>
                </label>
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
                    onClose();
                    onOpenVerificationDossiers();
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
                    onClose();
                    onOpenMatchHistory();
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
                    onClose();
                    onOpenActiveRfqs();
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
              <div className="w-9 h-9 rounded-full bg-[#eae8e5] text-[#564241] flex items-center justify-center border border-[#dcc0bf]/50 flex-shrink-0 overflow-hidden">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[22px] text-[#564241]/80">
                    account_circle
                  </span>
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-semibold text-[#1b1c1a] truncate leading-tight">
                  {currentUser ? currentUser.name : 'Elena Rostova'}
                </span>
                <span className="text-[11px] text-[#564241] truncate mt-0.5">
                  {currentUser ? currentUser.companyName : 'BMW Group Procurement Tier'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onSignOut) {
                  onSignOut();
                } else {
                  alert('Signed out of session');
                }
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
