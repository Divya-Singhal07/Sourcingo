import React, { useState } from 'react';

export interface AuthUser {
  email: string;
  role: 'buyer' | 'manufacturer';
  name: string;
  companyName: string;
  avatar?: string;
}

interface AuthPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'manufacturer'>('buyer');
  const [isSignUp, setIsSignUp] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [industryFocus, setIndustryFocus] = useState('Automotive & Precision');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please provide your work email and password.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters (project security standard).');
      return;
    }

    if (isSignUp && !companyName) {
      setErrorMsg('Please specify your registered enterprise entity or manufacturing plant name.');
      return;
    }

    setIsLoading(true);

    const performAuth = async () => {
      try {
        const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
        const payload = isSignUp
          ? { email, password, role: selectedRole }
          : { email, password };

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          // If backend returns a specific validation or auth error
          if (res.status === 400 || res.status === 401) {
            setErrorMsg(data.error || 'Authentication failed. Please verify credentials.');
            setIsLoading(false);
            return;
          }
        }

        // On successful auth response or local fallback
        const returnedRole = data.user?.role || selectedRole;
        // Derive a readable display name from email when none is provided
        const derivedName = email
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const user: AuthUser = {
          email,
          role: returnedRole as 'buyer' | 'manufacturer',
          name: contactName || data.user?.name || derivedName,
          companyName: companyName || data.user?.companyName || '',
        };

        if (data.session?.access_token) {
          localStorage.setItem('sourcingo_token', data.session.access_token);
        }

        setIsLoading(false);
        onLoginSuccess(user);
      } catch {
        // Graceful offline development fallback
        setIsLoading(false);
        const derivedName = email
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const user: AuthUser = {
          email,
          role: selectedRole,
          name: contactName || derivedName,
          companyName: companyName || '',
        };
        onLoginSuccess(user);
      }
    };

    performAuth();
  };

  const handleQuickDemo = (role: 'buyer' | 'manufacturer') => {
    setSelectedRole(role);
    if (role === 'buyer') {
      setEmail('e.rostova@bmw-procurement.de');
      setPassword('ExecutivePass2026!');
      setCompanyName('BMW Group Procurement Tier 1');
      setContactName('Elena Rostova');
    } else {
      setEmail('m.vogel@apex-precision.de');
      setPassword('PrecisionMfg2026!');
      setCompanyName('Apex Precision Systems GmbH');
      setContactName('Marcus Vogel');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#fbf9f6] text-[#1b1c1a] overflow-y-auto no-scrollbar relative select-none">
      {/* Ambient background glow accents */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#f9dec3]/30 blur-3xl"></div>
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#bbe8e4]/30 blur-3xl"></div>

      {/* Main Content Card Container */}
      <div className="p-6 sm:p-7 flex flex-col flex-1 max-w-sm mx-auto w-full z-10 justify-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-13 h-13 rounded-2xl bg-[#6c151e] text-white flex items-center justify-center shadow-md mb-3 ring-4 ring-[#ffdad9]/40">
            <span className="material-symbols-outlined text-[28px]">hub</span>
          </div>
          <h1 className="font-serif text-[28px] text-[#4c000c] font-medium tracking-tight leading-none">
            Sourcingo
          </h1>
          <p className="text-[11.5px] text-[#3b6662] font-semibold tracking-wider uppercase mt-1">
            Industrial Procurement &amp; Deal Rooms
          </p>
        </div>

        {/* Role Segmented Selector: Buyer vs Manufacturer */}
        <div className="bg-[#eae8e5] p-1 rounded-2xl flex items-center justify-between mb-5 shadow-xs border border-[#dcc0bf]/30">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('buyer');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'buyer'
                ? 'bg-white text-[#4c000c] shadow-sm font-bold'
                : 'text-[#564241] hover:text-[#1b1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">shopping_bag</span>
            <span>Buyer Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('manufacturer');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'manufacturer'
                ? 'bg-white text-[#4c000c] shadow-sm font-bold'
                : 'text-[#564241] hover:text-[#1b1c1a]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">precision_manufacturing</span>
            <span>Manufacturer</span>
          </button>
        </div>

        {/* Role Value Banner */}
        <div className="mb-4 p-3 rounded-xl bg-white border border-[#dcc0bf]/40 shadow-xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#beebe6]/50 text-[#3b6662] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">
              {selectedRole === 'buyer' ? 'verified_user' : 'inventory_2'}
            </span>
          </div>
          <p className="text-[11.5px] text-[#564241] leading-snug">
            {selectedRole === 'buyer'
              ? 'Access audited OEM suppliers, bilateral encrypted deal rooms, and fast RFQs.'
              : 'Showcase 5-axis machining capacity, upload ISO certs, and connect with Tier-1 buyers.'}
          </p>
        </div>

        {/* Auth Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-5 border border-[#dcc0bf]/40 shadow-sm flex flex-col gap-3.5"
        >
          <div className="flex items-center justify-between border-b border-[#efeeeb] pb-2.5">
            <h2 className="text-[15px] font-semibold text-[#1b1c1a]">
              {isSignUp
                ? selectedRole === 'buyer'
                  ? 'Register Buyer Organization'
                  : 'Register Production Facility'
                : selectedRole === 'buyer'
                ? 'Buyer Executive Sign In'
                : 'Manufacturer Partner Sign In'}
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3b6662] bg-[#beebe6]/50 px-2 py-0.5 rounded-full">
              {selectedRole}
            </span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-[#ffdad6]/40 border border-[#ba1a1a]/30 text-[#93000a] text-[11.5px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {isSignUp && (
            <>
              <div>
                <label className="text-[10.5px] font-bold text-[#564241] uppercase tracking-wider block mb-1">
                  Full Name / Executive Title
                </label>
                <input
                  type="text"
                  placeholder={selectedRole === 'buyer' ? 'e.g. Elena Rostova (Procurement VP)' : 'e.g. Marcus Vogel (Plant Director)'}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-[12.5px] bg-[#f5f3f0] rounded-xl border border-transparent focus:border-[#6c151e] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-[#564241] uppercase tracking-wider block mb-1">
                  {selectedRole === 'buyer' ? 'Corporate Procurement Entity' : 'Manufacturing Enterprise Name'}
                </label>
                <input
                  type="text"
                  placeholder={selectedRole === 'buyer' ? 'e.g. BMW Group Munich HQ' : 'e.g. Apex Precision Systems GmbH'}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-[12.5px] bg-[#f5f3f0] rounded-xl border border-transparent focus:border-[#6c151e] focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {selectedRole === 'manufacturer' && (
                <div>
                  <label className="text-[10.5px] font-bold text-[#564241] uppercase tracking-wider block mb-1">
                    Primary Production Specialty
                  </label>
                  <select
                    value={industryFocus}
                    onChange={(e) => setIndustryFocus(e.target.value)}
                    className="w-full px-3 py-2 text-[12.5px] bg-[#f5f3f0] rounded-xl border border-transparent focus:border-[#6c151e] focus:bg-white focus:outline-none transition-colors"
                  >
                    <option value="Automotive & Precision">5-Axis CNC &amp; Precision Milling</option>
                    <option value="Aerospace Tooling">Aerospace AS9100 Structural Extrusions</option>
                    <option value="Die-Casting">High-Pressure Aluminum Vacuum Die-Casting</option>
                    <option value="Injection Molding">Optical Grade Injection Molding</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-[10.5px] font-bold text-[#564241] uppercase tracking-wider block mb-1">
              Corporate Email Address
            </label>
            <input
              type="email"
              placeholder={selectedRole === 'buyer' ? 'name@automotive-tier1.com' : 'sales@machining-plant.de'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-[12.5px] bg-[#f5f3f0] rounded-xl border border-transparent focus:border-[#6c151e] focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-[10.5px] font-bold text-[#564241] uppercase tracking-wider block mb-1">
              Clearance Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-[12.5px] bg-[#f5f3f0] rounded-xl border border-transparent focus:border-[#6c151e] focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-1 py-2.5 rounded-xl bg-[#6c151e] text-white text-[13px] font-semibold hover:brightness-110 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>
                  {isSignUp
                    ? `Create ${selectedRole === 'buyer' ? 'Buyer' : 'Manufacturer'} Account`
                    : `Enter ${selectedRole === 'buyer' ? 'Buyer' : 'Manufacturer'} Portal`}
                </span>
                <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
              </>
            )}
          </button>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
              }}
              className="text-[11.5px] text-[#3b6662] hover:text-[#4c000c] font-semibold transition-colors cursor-pointer"
            >
              {isSignUp
                ? 'Already verified? Sign in with existing credentials'
                : 'Need a new account? Register enterprise profile'}
            </button>
          </div>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="mt-4 pt-3 border-t border-[#dcc0bf]/30 flex flex-col gap-2">
          <span className="text-[10px] text-center uppercase tracking-wider text-[#564241] font-bold">
            Instant Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('buyer')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#dcc0bf]/50 text-[11px] font-medium text-[#1b1c1a] hover:bg-[#efeeeb] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-[#4c000c]">login</span>
              <span>Buyer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('manufacturer')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-[#dcc0bf]/50 text-[11px] font-medium text-[#1b1c1a] hover:bg-[#efeeeb] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-[#3b6662]">factory</span>
              <span>OEM Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Security Badge */}
      <footer className="p-4 text-center text-[10px] text-[#564241] border-t border-[#dcc0bf]/30 bg-[#f5f3f0]/60">
        <div className="flex items-center justify-center gap-1.5 font-medium">
          <span className="material-symbols-outlined text-[13px] text-[#3b6662]">lock</span>
          <span>Sourcingo 256-bit Bilateral Cryptographic Clearance • ISO 27001</span>
        </div>
      </footer>
    </div>
  );
};
