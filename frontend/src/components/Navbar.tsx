import React from 'react';

interface NavbarProps {
  currentTab: 'matchmaker' | 'dealrooms' | 'profile';
  onSelectTab: (tab: 'matchmaker' | 'dealrooms' | 'profile') => void;
  onOpenDrawer: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenDrawer,
}) => {
  // Mobile status bar component (9:41, icons)
  const renderStatusBar = () => (
    <div className="flex justify-between items-center px-6 pt-safe pt-2.5 pb-1 text-[#1b1c1a] text-[14px] font-semibold tracking-tight select-none">
      <span className="tracking-tight font-medium">9:41</span>
      <div className="flex items-center gap-1.5 text-[#1b1c1a]">
        <span className="material-symbols-outlined text-[17px]">signal_cellular_4_bar</span>
        <span className="material-symbols-outlined text-[17px]">wifi</span>
        <span className="material-symbols-outlined text-[19px]">battery_charging_full</span>
      </div>
    </div>
  );

  if (currentTab === 'dealrooms') {
    return (
      <header className="bg-[#fbf9f6]/90 backdrop-blur-xl border-b border-[#dcc0bf]/30 select-none flex-shrink-0">
        <div className="w-full max-w-md mx-auto">
          {renderStatusBar()}
          <div className="h-12 px-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                aria-label="Back to Discover and Matchmaker"
                onClick={() => onSelectTab('matchmaker')}
                className="min-w-[40px] min-h-[40px] -ml-2 rounded-lg flex items-center justify-center text-[#4c000c] hover:bg-[#f9dec3]/30 active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-[1.2rem] font-semibold text-[#1b1c1a] tracking-tight">
                  Messages &amp; Chats
                </h1>
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#6c151e] text-white text-[11px] font-semibold">
                  4
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Search and Filter"
                onClick={onOpenDrawer}
                className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-[#564241] hover:text-[#4c000c] transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">tune</span>
              </button>
              <button
                aria-label="View Profile"
                onClick={() => onSelectTab('profile')}
                className="w-8 h-8 rounded-full bg-[#4c000c] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-white text-[18px]">person</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (currentTab === 'profile') {
    return (
      <header className="bg-[#fbf9f6]/90 backdrop-blur-xl border-b border-[#dcc0bf]/30 select-none flex-shrink-0">
        <div className="w-full max-w-md mx-auto">
          {renderStatusBar()}
          <div className="h-12 px-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                aria-label="Go back to Matchmaker"
                onClick={() => onSelectTab('matchmaker')}
                className="min-w-[40px] min-h-[40px] -ml-2 rounded-lg flex items-center justify-center text-[#1b1c1a] hover:text-[#4c000c] active:scale-95 transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
              <h1 className="text-[1.2rem] font-semibold text-[#1b1c1a] tracking-tight truncate max-w-[220px]">
                Profile &amp; Organization
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Executive Options"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-[#3b6662] hover:text-[#1b1c1a] transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-[#4c000c] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[18px]">person</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Default Matchmaker screen header (Exact Stitch Screen 1)
  return (
    <header className="bg-[#fbf9f6]/90 backdrop-blur-xl border-b border-[#dcc0bf]/30 select-none flex-shrink-0">
      <div className="w-full max-w-md mx-auto">
        {renderStatusBar()}
        <div className="h-12 px-4 flex items-center justify-between">
          {/* Left Buttons: Drawer (Menu) and Messages */}
          <div className="flex items-center gap-2">
            <button
              id="menu-btn"
              aria-label="Open navigation menu"
              onClick={onOpenDrawer}
              className="relative w-11 h-11 rounded-full bg-white border border-[#3b6662]/20 shadow-sm flex items-center justify-center text-[#3b6662] hover:bg-[#3b6662]/10 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#6c151e] rounded-full border-2 border-white"></span>
            </button>

            <button
              aria-label="Messages"
              onClick={() => onSelectTab('dealrooms')}
              className="relative w-11 h-11 rounded-full bg-white border border-[#3b6662]/20 shadow-sm flex items-center justify-center text-[#3b6662] hover:bg-[#3b6662]/10 active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#6c151e] rounded-full border-2 border-white"></span>
            </button>
          </div>

          {/* Center Title */}
          <div
            onClick={() => onSelectTab('matchmaker')}
            className="flex flex-col items-center justify-center cursor-pointer select-none"
          >
            <span className="font-serif text-[25px] tracking-tight text-[#4c000c] font-medium leading-none">
              Sourcingo
            </span>
          </div>

          {/* Right Button: Profile */}
          <button
            aria-label="Profile"
            onClick={() => onSelectTab('profile')}
            className="relative w-11 h-11 rounded-full bg-white border border-[#3b6662]/20 shadow-sm flex items-center justify-center text-[#3b6662] hover:bg-[#3b6662]/10 active:scale-95 transition-all cursor-pointer"
          >
            <svg
              className="w-5 h-5 stroke-[#3b6662]"
              fill="none"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-600 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
