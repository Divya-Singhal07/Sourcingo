import React, { useState } from 'react';

interface ProfileViewProps {
  onOpenVerificationDossiers?: () => void;
  onOpenMatchHistory?: () => void;
  onOpenActiveRfqs?: () => void;
  onSignOut?: () => void;
  currentUser?: { name: string; companyName: string; role: string; avatar?: string; email?: string } | null;
  onUpdateAvatar?: (avatarUrl: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenVerificationDossiers,
  onOpenMatchHistory,
  onOpenActiveRfqs,
  onSignOut,
  currentUser,
  onUpdateAvatar,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const isBuyer = currentUser?.role !== 'manufacturer';
  const accentColor = isBuyer ? '#6c151e' : '#3b6662';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full pb-safe bg-[#fbf9f6] select-none">
      <div className="flex flex-col w-full pb-10 max-w-md mx-auto">

        {/* Role Badge Banner — locked to registered role, no switcher */}
        <div className="px-5 pt-4 pb-2">
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: isBuyer ? '#fff3f3' : '#edf7f6', border: `1px solid ${accentColor}20` }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: accentColor }}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isBuyer ? 'shopping_bag' : 'precision_manufacturing'}
              </span>
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                {isBuyer ? 'Procurement Buyer Account' : 'OEM Manufacturer Account'}
              </p>
              <p className="text-[11px] text-[#564241]">
                {isBuyer ? 'Sourcing & RFQ platform access' : 'Supplier listing & deal room access'}
              </p>
            </div>
          </div>
        </div>

        {/* Identity Card */}
        <div className="px-5 pt-1">
          <div className="bg-white rounded-xl p-5 shadow-sm relative overflow-hidden ring-1 ring-[#dcc0bf]/30">
            <div className="flex items-center gap-4">
              <div
                onClick={() => setIsAvatarPickerOpen(true)}
                title="Click to change profile picture"
                className="relative shrink-0 cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#eae8e5] shadow-sm ring-2 ring-[#4c000c]/15 flex items-center justify-center transition-transform group-hover:scale-105">
                  {currentUser?.avatar ? (
                    <img className="w-full h-full object-cover" src={currentUser.avatar} alt="Profile" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#eae8e5]">
                      <span className="material-symbols-outlined text-[46px] text-[#564241]/80">account_circle</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-[#4c000c] text-white rounded-full p-1.5 shadow-sm flex items-center justify-center ring-2 ring-white hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-[1.4rem] text-[#1b1c1a] tracking-tight truncate font-medium">
                    {currentUser?.name || 'Executive Partner'}
                  </h2>
                  <button
                    aria-label="Change Profile Picture"
                    onClick={() => setIsAvatarPickerOpen(true)}
                    className="p-1 text-[#564241] hover:text-[#4c000c] transition-colors rounded-lg cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  </button>
                </div>
                <p className="text-[13px] font-medium mt-0.5" style={{ color: accentColor }}>
                  {isBuyer ? 'Procurement Buyer' : 'Manufacturing Supplier'}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-[#eae8e5]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#3b6662]">domain</span>
                <span className="text-[12.5px] text-[#1b1c1a] font-medium truncate">
                  {currentUser?.companyName || '—'}
                </span>
              </div>
              {currentUser?.email && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#564241]">mail</span>
                  <span className="text-[11.5px] text-[#564241] truncate">{currentUser.email}</span>
                </div>
              )}
              <div>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ backgroundColor: isBuyer ? '#ffdad9' : '#bbe8e4', color: isBuyer ? '#4c000c' : '#406a66' }}
                >
                  <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  {isBuyer ? 'Verified Buyer' : 'Verified OEM'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Metrics — all start at 0, no fake numbers */}
        <div className="px-5 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[1.05rem] text-[#1b1c1a] tracking-tight font-semibold">
              {isBuyer ? 'Procurement Activity' : 'Supplier Activity'}
            </h3>
            <span className="text-[10px] text-[#564241] uppercase tracking-wider font-semibold">Current Session</span>
          </div>

          {isBuyer ? (
            <div className="grid grid-cols-3 gap-2.5">
              <div
                onClick={() => onOpenActiveRfqs?.()}
                className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full border border-[#dcc0bf]/30 hover:border-[#6c151e] cursor-pointer transition-colors"
              >
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">Active RFQs</span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#1b1c1a] tracking-tight my-1 font-semibold">0</p>
                <span className="text-[11px] text-[#3b6662] font-semibold block">This session</span>
              </div>
              <div
                onClick={() => onOpenMatchHistory?.()}
                className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full border border-[#dcc0bf]/30 hover:border-[#3b6662] cursor-pointer transition-colors"
              >
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">Matches</span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#1b1c1a] tracking-tight my-1 font-semibold">0</p>
                <span className="text-[11px] text-[#564241] font-normal block">Partners</span>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full border border-[#dcc0bf]/30">
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block leading-none font-bold">
                    Deal Rooms
                  </span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#6c151e] tracking-tight my-1 font-semibold">0</p>
                <span className="text-[11px] text-[#3b6662] font-semibold block">Active</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full border border-[#dcc0bf]/30">
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">Inquiries</span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#3b6662] tracking-tight my-1 font-semibold">0</p>
                <span className="text-[11px] text-[#564241] font-normal block">Received</span>
              </div>
              <div
                onClick={() => onOpenMatchHistory?.()}
                className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full border border-[#dcc0bf]/30 hover:border-[#3b6662] cursor-pointer transition-colors"
              >
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">Matches</span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#1b1c1a] tracking-tight my-1 font-semibold">0</p>
                <span className="text-[11px] text-[#564241] font-normal block">Partners</span>
              </div>
              <div
                onClick={() => onOpenActiveRfqs?.()}
                className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full border border-[#dcc0bf]/30 hover:border-[#3b6662] cursor-pointer transition-colors"
              >
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">RFQs</span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#6c151e] tracking-tight my-1 font-semibold">0</p>
                <span className="text-[11px] text-[#3b6662] font-semibold block">Active</span>
              </div>
            </div>
          )}
        </div>

        {/* Role-specific Dossier Panel */}
        <div className="px-5 pt-3">
          {isBuyer ? (
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3.5 border border-[#dcc0bf]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6c151e] text-[20px]">dataset</span>
                  <h3 className="text-[1.1rem] font-semibold text-[#1b1c1a]">Buyer Profile</h3>
                </div>
                <span className="text-[11px] text-[#4c000c] font-semibold bg-[#ffdad9]/40 px-2.5 py-0.5 rounded-full">
                  Procurement
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#f5f3f0] p-2.5 rounded-lg border border-[#dcc0bf]/20">
                  <p className="text-[10px] font-bold text-[#564241] uppercase tracking-wider">Company</p>
                  <p className="text-[12.5px] text-[#1b1c1a] font-semibold mt-0.5 truncate">
                    {currentUser?.companyName || '—'}
                  </p>
                </div>
                <div className="bg-[#f5f3f0] p-2.5 rounded-lg border border-[#dcc0bf]/20">
                  <p className="text-[10px] font-bold text-[#564241] uppercase tracking-wider">Contact</p>
                  <p className="text-[12.5px] text-[#1b1c1a] font-semibold mt-0.5 truncate">
                    {currentUser?.name || '—'}
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] border-t border-[#eae8e5]">
                <div className="flex items-center gap-1.5 text-[#3b6662] font-medium">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Encrypted Bilateral NDA</span>
                </div>
                <span className="text-[#4c000c] font-semibold uppercase">Secured</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dcc0bf]/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3b6662] text-[20px]">factory</span>
                  <h3 className="text-[1.1rem] font-semibold text-[#1b1c1a]">Manufacturer Profile</h3>
                </div>
                <span className="text-[11px] text-[#3b6662] font-semibold bg-[#bbe8e4] px-2.5 py-0.5 rounded-full">
                  OEM Verified
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#f5f3f0] p-2.5 rounded-lg border border-[#dcc0bf]/20">
                  <p className="text-[10px] font-bold text-[#564241] uppercase tracking-wider">Company</p>
                  <p className="text-[12.5px] text-[#1b1c1a] font-semibold mt-0.5 truncate">
                    {currentUser?.companyName || '—'}
                  </p>
                </div>
                <div className="bg-[#f5f3f0] p-2.5 rounded-lg border border-[#dcc0bf]/20">
                  <p className="text-[10px] font-bold text-[#564241] uppercase tracking-wider">Contact</p>
                  <p className="text-[12.5px] text-[#1b1c1a] font-semibold mt-0.5 truncate">
                    {currentUser?.name || '—'}
                  </p>
                </div>
              </div>
              <div className="pt-3 flex items-center justify-between text-[11px] border-t border-[#eae8e5] mt-3">
                <div className="flex items-center gap-1.5 text-[#3b6662] font-medium">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Encrypted Bilateral NDA</span>
                </div>
                <span className="text-[#3b6662] font-semibold uppercase">Active</span>
              </div>
            </div>
          )}
        </div>

        {/* Governance Menu */}
        <div className="px-5 pt-3">
          <h3 className="text-[1.05rem] text-[#1b1c1a] font-semibold tracking-tight mb-2">
            Dealmaking & Governance
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#dcc0bf]/30 divide-y divide-[#efeeeb]">
            {[
              { icon: 'tune', label: 'Matching Preferences', color: '#4c000c', action: () => showToast('Matching preferences opened') },
              { icon: 'smart_toy', label: 'Deal Rooms & RFQ Automation', color: '#3b6662', action: () => showToast('RFQ automation opened') },
              {
                icon: 'folder_managed', label: 'Verification & Documents', color: '#2d1f0e',
                action: () => onOpenVerificationDossiers ? onOpenVerificationDossiers() : showToast('Verification dossiers opened'),
              },
              { icon: 'enhanced_encryption', label: 'Security & Escrow', color: '#1b1c1a', action: () => showToast('Security & Escrow vault verified') },
            ].map(({ icon, label, color, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#f5f3f0] transition-colors cursor-pointer"
                type="button"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#eae8e5] flex items-center justify-center" style={{ color }}>
                    <span className="material-symbols-outlined text-[19px]">{icon}</span>
                  </div>
                  <p className="text-[13px] font-medium text-[#1b1c1a]">{label}</p>
                </div>
                <span className="material-symbols-outlined text-[#564241] text-[20px]">chevron_right</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <div className="px-5 pt-4 flex flex-col gap-2">
          <button
            className="w-full py-2 px-4 text-center text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => onSignOut ? onSignOut() : showToast('Signed out')}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
          <p className="text-center text-[10.5px] text-[#564241]/80 pt-1">
            Sourcingo v1.0 • {currentUser?.role === 'manufacturer' ? 'OEM Supplier Portal' : 'Procurement Buyer Portal'}
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  onUpdateAvatar?.(reader.result);
                  showToast('Custom profile picture updated');
                  setIsAvatarPickerOpen(false);
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        />

        {/* PFP Selector Dialog */}
        {isAvatarPickerOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3">
            <div className="w-full max-w-sm bg-white rounded-3xl border border-[#4c000c]/20 shadow-2xl flex flex-col overflow-hidden">
              <div className="p-4 bg-[#f5f3f0] border-b border-[#dcc0bf]/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#6c151e] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-[16px] text-[#4c000c] font-medium leading-none">Select Profile Picture</h3>
                    <p className="text-[11px] text-[#564241] mt-0.5">Choose an avatar or upload your own</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAvatarPickerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#564241] hover:text-[#4c000c] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="p-4 flex flex-col gap-3.5 bg-[#fbf9f6]">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#6c151e]/40 hover:bg-[#ffdad9]/30 text-[#4c000c] text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  <span>Upload from Device</span>
                </button>

                <div>
                  <label className="text-[10px] font-bold text-[#564241] uppercase tracking-wider block mb-2">Default Avatars</label>
                  <div className="grid grid-cols-4 gap-2.5">
                    <button
                      onClick={() => { onUpdateAvatar?.(''); showToast('Reset to default'); setIsAvatarPickerOpen(false); }}
                      className={`h-16 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                        !currentUser?.avatar ? 'border-[#6c151e] bg-[#ffdad9]/40 ring-2 ring-[#6c151e]/30' : 'border-[#dcc0bf]/50 bg-white hover:bg-[#efeeeb]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[26px] text-[#564241]">account_circle</span>
                      <span className="text-[9.5px] font-bold text-[#564241] mt-0.5">Default</span>
                    </button>

                    {[
                      { label: 'Executive', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80' },
                      { label: 'Engineer', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80' },
                      { label: 'Plant Lead', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80' },
                      { label: 'Procurement', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=240&q=80' },
                      { label: 'Director', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80' },
                      { label: 'Technical', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80' },
                      { label: 'OEM VP', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80' },
                    ].map((av, idx) => (
                      <button
                        key={idx}
                        onClick={() => { onUpdateAvatar?.(av.url); showToast(`Selected ${av.label} avatar`); setIsAvatarPickerOpen(false); }}
                        className={`h-16 rounded-2xl overflow-hidden border p-0.5 transition-all cursor-pointer ${
                          currentUser?.avatar === av.url ? 'border-[#6c151e] ring-2 ring-[#6c151e]/30 scale-105' : 'border-[#dcc0bf]/50 hover:scale-105'
                        }`}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full object-cover rounded-xl" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 inset-x-5 bg-[#30312f] text-[#f2f0ed] py-3 px-4 rounded-xl shadow-xl flex items-center justify-between z-50">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#beebe6] text-[20px]">check_circle</span>
              <span className="text-xs">{toastMessage}</span>
            </div>
            <button className="text-[#f2f0ed]/60 hover:text-white cursor-pointer" onClick={() => setToastMessage(null)} type="button">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
