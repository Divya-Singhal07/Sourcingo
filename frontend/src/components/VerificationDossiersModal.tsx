import React, { useState } from 'react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeal: (partnerName: string) => void;
}

interface DossierItem {
  id: string;
  company: string;
  tier: string;
  auditScore: number;
  location: string;
  avatar: string;
  status: 'Audited & Verified' | 'Pending ISO Check' | 'Recertification Due';
  clearanceLevel: 'Level 1 Tier-A' | 'Level 2 OEM' | 'AS9100 Certified';
  certs: string[];
  lastAudit: string;
  complianceDoc: string;
  capabilities: string[];
}

const MOCK_DOSSIERS: DossierItem[] = [
  {
    id: 'dos-1',
    company: 'Apex Precision Ltd.',
    tier: 'Tier 1 Strategic Partner',
    auditScore: 99.4,
    location: 'Munich, Germany',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAf2pK0JMum4ic3HqYJVg9Owx87M9ub90a42bL8-PQQ0_8-Y6dVOcG90kaCXVr8Dgll40xbBmteCbIWjXd8iQxfpdnFcFG1wNA6HksOjW64ET0m-m_kx07pR8c7DAC_MfBMvBnrtRY_S15BE2aoPFa9m6QL2IPxIKwSaJuFDl-TqbDkOlm9z3chz_KT_q0u8PuVVzh0RVJym61byzlZ0jr7OfXPdsMgBrSAaQVzZmBRyJ8mCQMyJVpSxw',
    status: 'Audited & Verified',
    clearanceLevel: 'Level 1 Tier-A',
    certs: ['ISO 9001:2015', 'AS9100D Aerospace', 'ITAR Registered'],
    lastAudit: 'Oct 2026 • Bureau Veritas',
    complianceDoc: 'BMW-AUDIT-2026-APX.pdf',
    capabilities: ['5-Axis High Precision CNC', 'CMM Coordinate Metrology', '±0.005mm Tolerance'],
  },
  {
    id: 'dos-2',
    company: 'KUKA Partner Systems',
    tier: 'Robotics & Automation OEM',
    auditScore: 97.8,
    location: 'Stuttgart, Germany',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD6f0eGcH1-Uqgz5BT8kN_4A_3d9EPgsbdsREWpmGNQyopd2dYkOUd4K6BpflgggtC6MK8E_Zok9CGV3a-dA8P2uP3pvaz16pq7JTT5WOkGhdkNU8cW5Jbfr6Q3mBlUCaMbuNkbd6JQXJRZ3rBVhVp-GCaOOkfAsL-rITsrkUv1TKM3wvGBWD09dQkeL8Y9_fjudhOJ2UXnUGQdvHEybhLaLVtq-RXUqfshtDChNJAmBgHSUyxuFpt0w',
    status: 'Audited & Verified',
    clearanceLevel: 'Level 2 OEM',
    certs: ['IATF 16949 Automotive', 'ISO 14001 Environmental', 'CE Compliance'],
    lastAudit: 'Sep 2026 • TÜV SÜD',
    complianceDoc: 'TUV-SUD-AUTO-7729.pdf',
    capabilities: ['Automated Robotic Cells', 'Optical In-line Inspection', 'A380 Die-Casting'],
  },
  {
    id: 'dos-3',
    company: 'Nordic Tooling Oy',
    tier: 'Aerospace Structural Tooling',
    auditScore: 98.9,
    location: 'Helsinki, Finland',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUCIgLrSknq-RVSp7nPNV-NoGVe757t7fiXKkRLZr-CAIVI5Tj5oCAYNuM3fyvLrPGBaZUomgsrR4a1N8j065c0vb5A8re-eI5FXGttVpR-s-IflcdDiQvuqzfM7WKCfzsX13cT4xczpF0HZw_6ZViMCPDu2xn_2QrzZ3-MNIhVdTWI5wB3TJctv5O65-uBCGGX9b8z9Dr3IbBy9e2GFeqmLyywCmA5OaacYjr9hmPYGAucjH74c84nQ',
    status: 'Audited & Verified',
    clearanceLevel: 'AS9100 Certified',
    certs: ['AS9100D', 'ISO 9001', 'ESA Space Certified'],
    lastAudit: 'Aug 2026 • DNV GL',
    complianceDoc: 'DNV-AERO-TOOL-004.pdf',
    capabilities: ['Titanium Grade 5 Extrusions', 'Wire EDM Sub-micron', 'Thermal Stress Relief'],
  },
  {
    id: 'dos-4',
    company: 'Valo Casting SAS',
    tier: 'Foundry & Structural Housing',
    auditScore: 95.2,
    location: 'Lyon, France',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUG2PKUQCpjhoa0WA1B8cW1yHgUXtGzA5kGEpnggMLu7w9m0AZ_hTBK4I36gVgr1Fb-VUS6Z1lGO3BWve7hyF1BEO4r-4CzFlTSp7LLm9l2FHZVGeI_VsSoexcQagODnWtbYJAc9GuO-gO0aaQktcBwB7nNK_XspQY1fAOCpwsLy25YsjDATzYODGiF020Y6sMAHCIJvIIfJ5NBZ_2AQDVeZvZSgPESQ1fQ9WX-CRs0wGi10OZBMOB-Q',
    status: 'Audited & Verified',
    clearanceLevel: 'Level 2 OEM',
    certs: ['ISO 9001', 'EN AC-43400 Spec', 'RoHS / REACH'],
    lastAudit: 'Jul 2026 • SGS France',
    complianceDoc: 'SGS-FOUNDRY-FR-918.pdf',
    capabilities: ['Vacuum Die Casting', 'Structural Automotive Castings', 'Spectrometry Analysis'],
  },
];

export const VerificationDossiersModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onOpenDeal,
}) => {
  const [selectedDossier, setSelectedDossier] = useState<DossierItem | null>(null);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = MOCK_DOSSIERS.filter(
    (d) =>
      d.company.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase()) ||
      d.certs.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[640px] max-h-[92vh] bg-white rounded-3xl border border-[#4c000c]/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#f5f3f0] border-b border-[#dcc0bf]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3b6662] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[19px]">verified_user</span>
            </div>
            <div>
              <h3 className="font-serif text-[17px] text-[#4c000c] font-medium leading-none">
                Verification Dossiers
              </h3>
              <p className="text-[11px] text-[#564241] mt-0.5">
                Vetted Supplier Audits &amp; Compliance Vault
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

        {/* Search Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-[#dcc0bf]/20">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#564241] text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Search by supplier, standard or ISO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-[12px] bg-[#f5f3f0] rounded-xl border border-transparent focus:border-[#3b6662] focus:bg-white focus:outline-none transition-colors text-[#1b1c1a]"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#fbf9f6]">
          {selectedDossier ? (
            /* Detailed Dossier View */
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setSelectedDossier(null)}
                className="self-start inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#3b6662] hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back to Dossiers List</span>
              </button>

              <div className="p-4 bg-white rounded-2xl border border-[#dcc0bf]/40 shadow-xs flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedDossier.avatar}
                      alt={selectedDossier.company}
                      className="w-12 h-12 rounded-xl object-cover border border-[#dcc0bf]/30"
                    />
                    <div>
                      <h4 className="font-semibold text-[15px] text-[#1b1c1a]">
                        {selectedDossier.company}
                      </h4>
                      <p className="text-[11px] text-[#564241]">{selectedDossier.location}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#beebe6] text-[#00201e]">
                        {selectedDossier.clearanceLevel}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#564241] uppercase tracking-wider block font-bold">
                      Audit Score
                    </span>
                    <span className="font-serif text-[20px] font-bold text-[#3b6662]">
                      {selectedDossier.auditScore}%
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#efeeeb] pt-3">
                  <h5 className="text-[11px] font-bold text-[#564241] uppercase tracking-wider mb-1.5">
                    Verified Certifications &amp; Standards
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDossier.certs.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#efeeeb] text-[#1b1c1a] text-[11px] font-medium"
                      >
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">
                          verified
                        </span>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#efeeeb] pt-3">
                  <h5 className="text-[11px] font-bold text-[#564241] uppercase tracking-wider mb-1.5">
                    Inspected Manufacturing Capabilities
                  </h5>
                  <ul className="text-[12px] text-[#1b1c1a] space-y-1">
                    {selectedDossier.capabilities.map((cap) => (
                      <li key={cap} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6c151e]"></span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#efeeeb] pt-3 bg-[#f5f3f0] -mx-4 -mb-4 p-4 rounded-b-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#6c151e]">
                      picture_as_pdf
                    </span>
                    <div className="leading-tight">
                      <p className="text-[11.5px] font-semibold text-[#1b1c1a]">
                        {selectedDossier.complianceDoc}
                      </p>
                      <p className="text-[10px] text-[#564241]">{selectedDossier.lastAudit}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onOpenDeal(selectedDossier.company);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#6c151e] text-white text-[11.5px] font-semibold hover:brightness-110 shadow-xs cursor-pointer"
                  >
                    Initiate RFQ
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Dossier Cards List */
            filtered.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDossier(d)}
                className="p-3.5 bg-white rounded-2xl border border-[#dcc0bf]/40 flex flex-col gap-2.5 shadow-xs hover:border-[#3b6662] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={d.avatar}
                      alt={d.company}
                      className="w-11 h-11 rounded-xl object-cover border border-[#dcc0bf]/30"
                    />
                    <div>
                      <h4 className="text-[13.5px] font-semibold text-[#1b1c1a] leading-tight">
                        {d.company}
                      </h4>
                      <p className="text-[11px] text-[#564241] mt-0.5">{d.location}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#beebe6] text-[#00201e]">
                      {d.auditScore}% Score
                    </span>
                    <span className="text-[10px] text-[#3b6662] font-semibold mt-1">
                      {d.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {d.certs.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-md bg-[#efeeeb] text-[#2d1f0e] text-[10px] font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10.5px] text-[#564241] pt-1 border-t border-[#efeeeb]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#3b6662]">
                      verified
                    </span>
                    {d.lastAudit}
                  </span>
                  <span className="font-semibold text-[#6c151e] flex items-center gap-0.5">
                    View Audit
                    <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
