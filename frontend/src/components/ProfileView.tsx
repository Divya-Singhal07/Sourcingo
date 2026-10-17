import React, { useState } from 'react';

export const ProfileView: React.FC = () => {
  const [rolePerspective, setRolePerspective] = useState<'buyer' | 'oem'>('buyer');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col relative w-full pb-safe bg-[#fbf9f6] select-none">
      <div className="flex flex-col w-full pb-10 max-w-md mx-auto">
        {/* Segmented Executive Perspective Switcher (Exact Stitch Screen 3) */}
        <div className="px-5 pt-3 pb-2">
          <div className="bg-[#eae8e5] p-1 rounded-xl flex items-center justify-between relative shadow-sm">
            <button
              id="btn-buyer-view"
              onClick={() => {
                setRolePerspective('buyer');
                showToast('Switched to Procurement Buyer Perspective');
              }}
              className={`flex-1 py-2 px-2 rounded-lg text-center font-medium text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                rolePerspective === 'buyer'
                  ? 'bg-[#6c151e] text-white shadow-sm'
                  : 'text-[#564241] hover:text-[#1b1c1a]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
              <span>Procurement Buyer</span>
            </button>
            <button
              id="btn-oem-view"
              onClick={() => {
                setRolePerspective('oem');
                showToast('Switched to OEM Fabricator Perspective');
              }}
              className={`flex-1 py-2 px-2 rounded-lg text-center font-medium text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                rolePerspective === 'oem'
                  ? 'bg-[#3b6662] text-white shadow-sm'
                  : 'text-[#564241] hover:text-[#1b1c1a]'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">precision_manufacturing</span>
              <span>OEM Manufacturer</span>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2.5 px-1">
            <div className="flex items-center gap-1.5 text-[#564241]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3b6662]"></span>
              <p className="text-[11px] text-[#564241]">
                {rolePerspective === 'buyer'
                  ? 'Active: Buyer Dossier (Perspective preview active)'
                  : 'Active: OEM Supplier Dossier (Preview perspective)'}
              </p>
            </div>
          </div>
        </div>

        {/* Executive Identity Card */}
        <div className="px-5 pt-1">
          <div className="bg-white rounded-xl p-5 shadow-sm relative overflow-hidden ring-1 ring-[#dcc0bf]/30">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#f5f3f0] shadow-sm ring-2 ring-[#4c000c]/15">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-cRg-WExfp8LQpb0_qDNnoNvhSxj1XvMwTnRor9GS0ENtaO8jKNCqXhpmQ069xu4yJ0_Y5XW4PndKSDERoVuZen2Kj7H2od-LMzXnkw4qU8iDBQaQNz0w9YNb8zg6JzIPjSATYa7WsAOBx6Gr4Fqbzry25C8ZlZeOyt3rleHWebydYe5-gKVQbzkpmisnhzb_fY3WGfmQFZHeSsZf9_gdB5Y5bHIBKgZHpjNMI_FA6LLi9DsFtdw1OQ"
                    alt="Elena Rostova portrait"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-[#3b6662] text-white rounded-full p-1 shadow-sm flex items-center justify-center ring-2 ring-white">
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-[1.4rem] text-[#1b1c1a] tracking-tight truncate font-medium">
                    Elena Rostova
                  </h2>
                  <button
                    aria-label="Edit Profile"
                    onClick={() => showToast('Edit profile dossier modal simulated')}
                    className="p-1 text-[#564241] hover:text-[#4c000c] transition-colors rounded-lg cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit_note</span>
                  </button>
                </div>
                <p className="text-[13px] text-[#4c000c] font-medium mt-0.5">
                  VP of Global Hardware Sourcing
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#564241] mt-3 pt-3 border-t border-[#eae8e5] flex-wrap">
              <div className="flex items-center gap-1 min-w-0">
                <span className="material-symbols-outlined text-[16px] shrink-0 text-[#3b6662]">
                  domain
                </span>
                <span className="text-[12.5px] text-[#1b1c1a] font-medium">
                  AeroDrive Systems GmbH
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#bbe8e4] text-[#406a66] text-[11px] font-semibold shrink-0">
                <span
                  className="material-symbols-outlined text-[13px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span className="leading-none">Tier-1</span>
              </span>
            </div>
          </div>
        </div>

        {/* Operational Metrics Mosaic */}
        <div className="px-5 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[1.05rem] text-[#1b1c1a] tracking-tight font-semibold">
              {rolePerspective === 'buyer'
                ? 'Executive Pipeline Overview'
                : 'Manufacturing Production Metrics'}
            </h3>
            <span className="text-[10px] text-[#564241] uppercase tracking-wider font-semibold">
              Q3 Industrial Index
            </span>
          </div>

          {/* Buyer Metrics */}
          {rolePerspective === 'buyer' ? (
            <div className="grid grid-cols-3 gap-2.5 transition-opacity duration-300">
              <div className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full border border-[#dcc0bf]/30">
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">
                    Active RFQs
                  </span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#1b1c1a] tracking-tight my-1 font-semibold">
                  3
                </p>
                <span className="text-[11px] text-[#3b6662] font-semibold block">Live</span>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full border border-[#dcc0bf]/30">
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">
                    Matches
                  </span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#1b1c1a] tracking-tight my-1 font-semibold">
                  28
                </p>
                <span className="text-[11px] text-[#564241] font-normal block">Partners</span>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full border border-[#dcc0bf]/30">
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block leading-none font-bold">
                    Loyalty Score
                  </span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#6c151e] tracking-tight my-1 font-semibold">
                  98%
                </p>
                <span className="text-[11px] text-[#3b6662] font-semibold block">Top 2% Index</span>
              </div>
            </div>
          ) : (
            /* OEM Metrics */
            <div className="grid grid-cols-3 gap-2.5 transition-opacity duration-300">
              <div className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full min-w-0 overflow-hidden border border-[#dcc0bf]/30">
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">
                    Capacity
                  </span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#3b6662] tracking-tight my-1 truncate font-semibold">
                  85%
                </p>
                <span className="text-[11px] text-[#564241] font-normal block truncate">
                  Allocated
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full min-w-0 overflow-hidden border border-[#dcc0bf]/30">
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">
                    Spindles
                  </span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#1b1c1a] tracking-tight my-1 truncate font-semibold">
                  24
                </p>
                <span className="text-[11px] text-[#564241] font-normal block truncate">
                  5-Axis CNC
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm text-center flex flex-col justify-between h-full min-w-0 overflow-hidden border border-[#dcc0bf]/30">
                <div className="h-7 flex items-center justify-center">
                  <span className="text-[10px] text-[#564241] uppercase tracking-wider block text-center leading-none font-bold">
                    Turnaround
                  </span>
                </div>
                <p className="font-serif text-[1.6rem] text-[#6c151e] tracking-tight my-1 truncate font-semibold">
                  12d
                </p>
                <span className="text-[11px] text-[#3b6662] font-semibold block truncate">
                  Expedited
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Role Dynamic Dossier Content */}
        <div className="px-5 pt-3">
          {rolePerspective === 'buyer' ? (
            /* Buyer View Dossier */
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3.5 border border-[#dcc0bf]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6c151e] text-[20px]">
                    dataset
                  </span>
                  <h3 className="text-[1.1rem] font-semibold text-[#1b1c1a]">
                    Procurement Mandate
                  </h3>
                </div>
                <span className="text-[11px] text-[#4c000c] font-semibold bg-[#ffdad9]/40 px-2.5 py-0.5 rounded-full">
                  Tier 1 Target
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#564241] uppercase tracking-wider block mb-2">
                  Key Technologies
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#efeeeb] text-[12px] font-semibold text-[#1b1c1a]">
                    5-Axis CNC Milling
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#efeeeb] text-[12px] font-semibold text-[#1b1c1a]">
                    High-Pressure Die Casting
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#efeeeb] text-[12px] font-semibold text-[#1b1c1a]">
                    Rapid DMLS Metal 3D
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-[#f5f3f0] p-2.5 rounded-lg border border-[#dcc0bf]/20">
                  <p className="text-[10px] font-bold text-[#564241] uppercase tracking-wider">
                    Allocation
                  </p>
                  <p className="text-[13.5px] text-[#4c000c] font-semibold mt-0.5">
                    €5M – €15M / yr
                  </p>
                </div>
                <div className="bg-[#f5f3f0] p-2.5 rounded-lg border border-[#dcc0bf]/20">
                  <p className="text-[10px] font-bold text-[#564241] uppercase tracking-wider">
                    MOQ Appetite
                  </p>
                  <p className="text-[13.5px] text-[#1b1c1a] font-semibold mt-0.5">
                    100 – 25,000 pcs
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[#564241] text-[11px] border-t border-[#eae8e5]">
                <div className="flex items-center gap-1.5 text-[#3b6662] font-medium">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>ISO 9001 • ISO 13485 • RoHS</span>
                </div>
                <span className="text-[#4c000c] font-semibold uppercase text-[11px]">
                  Encrypted Bilateral NDA
                </span>
              </div>
            </div>
          ) : (
            /* OEM Manufacturer View Dossier */
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dcc0bf]/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3b6662] text-[20px]">
                    factory
                  </span>
                  <h3 className="text-[1.1rem] font-semibold text-[#1b1c1a]">
                    Production Facility Dossier
                  </h3>
                </div>
                <span className="text-[11px] text-[#3b6662] font-semibold bg-[#bbe8e4] px-2.5 py-0.5 rounded-full">
                  OEM Verified
                </span>
              </div>

              {/* Facility Preview Thumbnail */}
              <div className="w-full h-32 rounded-lg overflow-hidden relative mb-3 bg-[#efeeeb]">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwDpBScwxPqV4scRl-ogr1H5nIBHZ4qDu3DQ4wUUPWYIX1TlIcYebTBSiqDmtla7rK7uXFrChU6bV7YCrC-6ZQ4cnQByTUBjk2MdKtDJ7yseoLEBpmbgUb-_KWuzrJJlCxZWaEbagifu7uApBXDW3qjI5mRwY39Y9uXksXJm-WECJzJGGpDU73-s5wnhJkeKjzHX4vm_7dKEougLvGtTs_eMR5KPWyQINcz1OERteP8WZylvGUhQONyg"
                  alt="High-tech European precision machining manufacturing hall"
                />
                <div className="absolute bottom-2 left-2 bg-[#30312f]/85 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium">
                  Facility Hub: Bavaria Advanced Plant 02 (4,800 m²)
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#564241] uppercase tracking-wider block mb-1.5">
                    Machine Cell Capabilities
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-[#efeeeb] text-[12px] text-[#1b1c1a] font-medium">
                      5-Axis Hermle C42U MT
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#efeeeb] text-[12px] text-[#1b1c1a] font-medium">
                      Wire EDM (±0.002mm)
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#efeeeb] text-[12px] text-[#1b1c1a] font-medium">
                      Zeiss CMM Laser Scanning
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#efeeeb] text-[12px] text-[#1b1c1a] font-medium">
                      Class 7 Cleanroom Assy
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-[#f5f3f0] p-2.5 rounded-lg border border-[#dcc0bf]/20">
                    <p className="text-[10px] font-bold text-[#564241] uppercase tracking-wider">
                      Minimum Order Qty
                    </p>
                    <p className="text-[13px] text-[#3b6662] font-semibold mt-0.5">
                      50 pcs (Prototypes: 1 pc)
                    </p>
                  </div>
                  <div className="bg-[#f5f3f0] p-2.5 rounded-lg border border-[#dcc0bf]/20">
                    <p className="text-[10px] font-bold text-[#564241] uppercase tracking-wider">
                      Fast-Track Turnaround
                    </p>
                    <p className="text-[13px] text-[#1b1c1a] font-semibold mt-0.5">
                      10 – 18 Working Days
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#564241] uppercase tracking-wider block mb-1.5">
                    Audited Manufacturing Standards
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f9dec3] text-[#261908] text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[12px]">verified</span>{' '}
                      AS9100D Aerospace
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#bbe8e4] text-[#406a66] text-[11px] font-semibold">
                      <span
                        className="material-symbols-outlined text-[13px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      <span>Tier-1</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#efeeeb] text-[11px] font-semibold text-[#1b1c1a]">
                      <span className="material-symbols-outlined text-[12px]">military_tech</span>{' '}
                      ITAR Compliant
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Executive Settings & Operations Menu */}
        <div className="px-5 pt-3">
          <h3 className="text-[1.05rem] text-[#1b1c1a] font-semibold tracking-tight mb-2">
            Dealmaking &amp; Governance
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#dcc0bf]/30 divide-y divide-[#efeeeb]">
            <button
              onClick={() => showToast('Matching preferences opened')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#f5f3f0] transition-colors cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#eae8e5] flex items-center justify-center text-[#4c000c]">
                  <span className="material-symbols-outlined text-[19px]">tune</span>
                </div>
                <p className="text-[13px] font-medium text-[#1b1c1a]">Matching Preferences</p>
              </div>
              <span className="material-symbols-outlined text-[#564241] text-[20px]">
                chevron_right
              </span>
            </button>

            <button
              onClick={() => showToast('Deal rooms & RFQ automation opened')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#f5f3f0] transition-colors cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#eae8e5] flex items-center justify-center text-[#3b6662]">
                  <span className="material-symbols-outlined text-[19px]">smart_toy</span>
                </div>
                <p className="text-[13px] font-medium text-[#1b1c1a]">
                  Deal Rooms &amp; RFQ Automation
                </p>
              </div>
              <span className="material-symbols-outlined text-[#564241] text-[20px]">
                chevron_right
              </span>
            </button>

            <button
              onClick={() => showToast('Verification dossiers & documents opened')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#f5f3f0] transition-colors cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#eae8e5] flex items-center justify-center text-[#2d1f0e]">
                  <span className="material-symbols-outlined text-[19px]">folder_managed</span>
                </div>
                <p className="text-[13px] font-medium text-[#1b1c1a]">
                  Verification &amp; Documents
                </p>
              </div>
              <span className="material-symbols-outlined text-[#564241] text-[20px]">
                chevron_right
              </span>
            </button>

            <button
              onClick={() => showToast('Security & Escrow vault verified')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-[#f5f3f0] transition-colors cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#eae8e5] flex items-center justify-center text-[#1b1c1a]">
                  <span className="material-symbols-outlined text-[19px]">
                    enhanced_encryption
                  </span>
                </div>
                <p className="text-[13px] font-medium text-[#1b1c1a]">Security &amp; Escrow</p>
              </div>
              <span className="material-symbols-outlined text-[#564241] text-[20px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {/* Enterprise Consortia & Switch Org Actions */}
        <div className="px-5 pt-4 flex flex-col gap-2">
          <button
            className="w-full py-2.5 px-4 rounded-lg bg-[#eae8e5] text-[#1b1c1a] font-medium text-xs flex items-center justify-center gap-2 hover:bg-[#dbdad7] transition-colors cursor-pointer"
            onClick={() => showToast('Switching entity: AeroDrive Systems GmbH (DE-HQ)...')}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">cached</span>
            <span>Switch Entity (AeroDrive DE)</span>
          </button>

          <button
            className="w-full py-2 px-4 text-center text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            onClick={() => showToast('Signed out of executive session')}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>

          <p className="text-center text-[10.5px] text-[#564241]/80 pt-1">
            Sourcingo Core v4.12 • Enterprise Pipeline
          </p>
        </div>

        {/* Notification Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 inset-x-5 bg-[#30312f] text-[#f2f0ed] py-3 px-4 rounded-xl shadow-xl flex items-center justify-between z-50 transition-all">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#beebe6] text-[20px]">
                check_circle
              </span>
              <span className="text-xs text-[#f2f0ed]">{toastMessage}</span>
            </div>
            <button
              className="text-[#f2f0ed]/60 hover:text-white cursor-pointer"
              onClick={() => setToastMessage(null)}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
