import React, { useState, useRef, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { ProductCard } from '../types';
import { getProductImage } from '../productImages';
interface SwipeDeckProps {
  products: ProductCard[];
  searchMetadata?: import('../types').SearchMetadata | null;
  onSwipe: (product: ProductCard, action: 'like' | 'pass') => Promise<string | null>;
  onSaveBookmark: (product: ProductCard) => void;
  onOpenAiAssistant: (initialPrompt?: string) => void;
  onSelectTab: (tab: 'matchmaker' | 'dealrooms' | 'profile') => void;
  onEnterDealRoom: (roomId: string) => void;
}

const SECTORS = [
  'All Sectors',
  'Automotive',
  'Aerospace',
  'Medical Devices',
  'Electronics',
  'Precision CNC',
  'Renewables',
  'Packaging',
];

// Threshold (px) to commit a swipe
const SWIPE_THRESHOLD = 110;
// Threshold (px) to show the stamp label
const STAMP_THRESHOLD = 60;

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  products,
  searchMetadata,
  onSwipe,
  onSaveBookmark,
  onOpenAiAssistant,
  onSelectTab,
  onEnterDealRoom,
}) => {
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [matchModalProduct, setMatchModalProduct] = useState<ProductCard | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reset to first card when products list updates
  useEffect(() => {
    setCurrentIndex(0);
  }, [products]);

  // ─── Drag engine: all refs — zero React re-renders during drag ───────────
  const cardRef = useRef<HTMLDivElement>(null);
  const likeStampRef = useRef<HTMLDivElement>(null);
  const passStampRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false); // true while flying off screen / snapping back
  const dragStartRef = useRef({ x: 0, y: 0 });
  const currentDeltaRef = useRef({ x: 0, y: 0 });

  // Keep a ref to current card product so pointer-up handler is always fresh
  const activeProductRef = useRef<ProductCard | null>(null);

  const filteredProducts = products.filter(
    (p) =>
      selectedSector === 'All Sectors' ||
      p.category.toLowerCase().includes(selectedSector.toLowerCase()) ||
      selectedSector.toLowerCase().includes(p.category.toLowerCase())
  );
  const activeProduct = filteredProducts[currentIndex];
  // Next 3 cards in the deck stack behind active card for a 4-card physical stack
  const stackProducts: ProductCard[] = [];
  if (activeProduct) {
    for (let i = 1; i <= 3; i++) {
      if (currentIndex + i < filteredProducts.length) {
        stackProducts.push(filteredProducts[currentIndex + i]);
      } else if (filteredProducts.length > 1) {
        const wrapIdx = (currentIndex + i) % filteredProducts.length;
        if (filteredProducts[wrapIdx] && filteredProducts[wrapIdx].id !== activeProduct.id) {
          stackProducts.push(filteredProducts[wrapIdx]);
        }
      }
    }
  }

  // Keep ref in sync
  useEffect(() => {
    activeProductRef.current = activeProduct ?? null;
  }, [activeProduct]);

  // ─── DOM helpers (no setState) ────────────────────────────────────────────
  const setCardTransform = useCallback((x: number, y: number, transition = '') => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transition = transition;
    card.style.transform = `translate3d(${x}px, ${y * 0.35}px, 0) rotate(${x * 0.045}deg)`;
  }, []);

  const setStamps = useCallback((x: number) => {
    const likeEl = likeStampRef.current;
    const passEl = passStampRef.current;
    if (!likeEl || !passEl) return;
    if (x > STAMP_THRESHOLD) {
      const progress = Math.min((x - STAMP_THRESHOLD) / 50, 1);
      likeEl.style.opacity = progress.toString();
      passEl.style.opacity = '0';
    } else if (x < -STAMP_THRESHOLD) {
      const progress = Math.min((-x - STAMP_THRESHOLD) / 50, 1);
      passEl.style.opacity = progress.toString();
      likeEl.style.opacity = '0';
    } else {
      likeEl.style.opacity = '0';
      passEl.style.opacity = '0';
    }
  }, []);

  const resetCard = useCallback(() => {
    setCardTransform(0, 0, 'transform 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275)');
    setStamps(0);
  }, [setCardTransform, setStamps]);

  // ─── Commit swipe (called from pointer-up or button click) ───────────────
  const commitSwipe = useCallback((action: 'like' | 'pass') => {
    const product = activeProductRef.current;
    if (!product || isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const flyX = action === 'like' ? 600 : -600;
    setCardTransform(flyX, 0, 'transform 0.32s cubic-bezier(0.55, 0, 1, 0.45)');
    setStamps(flyX);

    setTimeout(() => {
      onSwipe(product, action);
      if (action === 'like') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6c151e', '#3b6662', '#f9dec3'],
        });
        setMatchModalProduct(product);
      }
      // Reset for next card
      const card = cardRef.current;
      if (card) {
        card.style.transition = 'none';
        card.style.transform = 'none';
      }
      if (likeStampRef.current) likeStampRef.current.style.opacity = '0';
      if (passStampRef.current) passStampRef.current.style.opacity = '0';
      isAnimatingRef.current = false;
      setCurrentIndex((prev) => prev + 1);
    }, 320);
  }, [onSwipe, setCardTransform, setStamps]);

  // ─── Pointer Events (handles both mouse & touch uniformly) ───────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isAnimatingRef.current) return;
    // Capture so we keep getting events even if pointer leaves the element
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    currentDeltaRef.current = { x: 0, y: 0 };

    const card = cardRef.current;
    if (card) card.style.transition = 'none';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const x = e.clientX - dragStartRef.current.x;
    const y = e.clientY - dragStartRef.current.y;
    currentDeltaRef.current = { x, y };

    // Schedule DOM update via RAF — coalesces multiple events per frame
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setCardTransform(x, y);
      setStamps(x);
    });
  }, [setCardTransform, setStamps]);

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    cancelAnimationFrame(rafRef.current);

    const { x } = currentDeltaRef.current;
    if (x > SWIPE_THRESHOLD) {
      commitSwipe('like');
    } else if (x < -SWIPE_THRESHOLD) {
      commitSwipe('pass');
    } else {
      resetCard();
    }
  }, [commitSwipe, resetCard]);

  // Cancel drag if pointer is lost (e.g. system gesture)
  const handlePointerCancel = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    resetCard();
  }, [resetCard]);

  // ─── Utility ─────────────────────────────────────────────────────────────
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBookmark = () => {
    if (!activeProduct) return;
    onSaveBookmark(activeProduct);
    triggerToast(`Added ${activeProduct.manufacturer.name} to Saved Dossiers`);
  };

  return (
    <div
      className="flex-1 flex flex-col relative w-full pb-safe pb-4 px-4 overflow-hidden justify-between select-none"
      style={{
        background:
          'radial-gradient(circle at 50% 10%, rgba(246, 228, 209, 0.55) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(243, 223, 220, 0.5) 0%, transparent 55%), radial-gradient(circle at 15% 45%, rgba(245, 218, 191, 0.35) 0%, transparent 50%), linear-gradient(175deg, rgb(251, 249, 246) 0%, rgb(249, 237, 226) 45%, rgb(243, 223, 220) 100%)',
      }}
    >
      {/* Subtle Background Watermark SVG Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-[#f9dec3]/50 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 -right-20 w-80 rounded-full bg-[#ffdad9]/30 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-[#ffdad9]/30 blur-2xl pointer-events-none"></div>

        <svg
          className="w-full h-full object-cover"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 430 932"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="watermarkWavePrimary" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#6c151e" stopOpacity="0.18"></stop>
              <stop offset="50%" stopColor="#4c000c" stopOpacity="0.24"></stop>
              <stop offset="100%" stopColor="#81252c" stopOpacity="0.14"></stop>
            </linearGradient>
            <linearGradient id="watermarkWaveAmber" x1="100%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#f9dec3" stopOpacity="0.35"></stop>
              <stop offset="60%" stopColor="#dcc2a8" stopOpacity="0.25"></stop>
              <stop offset="100%" stopColor="#6c151e" stopOpacity="0.12"></stop>
            </linearGradient>
            <linearGradient id="watermarkWaveSecondary" x1="0%" x2="100%" y1="100%" y2="0%">
              <stop offset="0%" stopColor="#3b6662" stopOpacity="0.14"></stop>
              <stop offset="50%" stopColor="#6c151e" stopOpacity="0.18"></stop>
              <stop offset="100%" stopColor="#f9dec3" stopOpacity="0.22"></stop>
            </linearGradient>
          </defs>
          <path
            d="M -40 640 C 90 580, 210 710, 470 630 L 470 940 L -40 940 Z"
            fill="url(#watermarkWaveAmber)"
            opacity="0.85"
          ></path>
          <path
            d="M -50 705 C 110 635, 240 765, 480 690 L 480 940 L -50 940 Z"
            fill="url(#watermarkWaveSecondary)"
            opacity="0.9"
          ></path>
          <path
            d="M -30 775 C 120 710, 270 815, 480 750 L 480 950 L -30 950 Z"
            fill="url(#watermarkWavePrimary)"
            opacity="0.95"
          ></path>
          <path
            d="M -40 640 C 90 580, 210 710, 470 630"
            fill="none"
            stroke="#dcc2a8"
            strokeWidth="1.5"
            opacity="0.45"
          ></path>
          <path
            d="M -50 705 C 110 635, 240 765, 480 690"
            fill="none"
            stroke="#3b6662"
            strokeWidth="1.25"
            strokeDasharray="6 6"
            opacity="0.35"
          ></path>
          <path
            d="M -30 775 C 120 710, 270 815, 480 750"
            fill="none"
            stroke="#6c151e"
            strokeWidth="1.5"
            opacity="0.4"
          ></path>
        </svg>
      </div>

      <div className="flex flex-col items-center justify-between w-full flex-1 relative pb-1 gap-3 z-10 pt-1 max-w-md mx-auto">
        {/* Category Filter Chips Horizontal Bar */}
        <div
          className="w-full overflow-x-auto flex items-center gap-2 px-1 pt-2 select-none z-20 no-scrollbar flex-shrink-0 pb-1"
        >
          {SECTORS.map((sector) => {
            const isActive = selectedSector === sector;
            return (
              <button
                key={sector}
                onClick={() => {
                  setSelectedSector(sector);
                  setCurrentIndex(0);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-[13px] shadow-sm tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6c151e] text-[#ffffff]'
                    : 'bg-[#ffffff] border border-[#dcc0bf]/40 text-[#234e4a] hover:bg-[#beebe6]/30 active:scale-95'
                }`}
              >
                {sector}
              </button>
            );
          })}
        </div>

        {/* Dynamic Radius Expansion Notification Banner */}
        {searchMetadata?.expanded && searchMetadata.expansionMessage && (
          <div className="w-full px-1">
            <div className="bg-[#fff8f2] border border-[#f9dec3] rounded-2xl p-3 shadow-xs flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[19px] text-[#b45309] mt-0.5 shrink-0">
                radar
              </span>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#b45309]">
                    Search Radius Expanded
                  </span>
                  <span className="text-[10px] text-[#564241]">
                    ({searchMetadata.initialRadiusKm} km → {searchMetadata.finalRadiusKm} km)
                  </span>
                </div>
                <p className="text-[12px] text-[#451a03] font-medium leading-snug mt-0.5">
                  {searchMetadata.expansionMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Center Discovery Deck & Card */}
        <div className="w-full flex-1 flex flex-col justify-center items-center gap-3.5 my-auto">
          {activeProduct ? (
            <div className="w-full relative select-none flex flex-col">
              {/* Stack Background Cards (3 layers visible underneath the top card for at least 4 cards in the stack) */}
              {stackProducts.map((cardProduct, stackIdx) => {
                const layer = stackIdx + 1; // 1, 2, 3
                const scale = 1 - layer * 0.04; // 0.96, 0.92, 0.88
                const translateY = layer * 9; // 9px, 18px, 27px
                const zIndex = 10 - layer; // 9, 8, 7
                const opacity = Math.max(0.45, 1 - layer * 0.18); // 0.82, 0.64, 0.46

                return (
                  <div
                    key={cardProduct.id || `stack-${stackIdx}`}
                    className="absolute inset-0 rounded-2xl bg-white border border-[#4c000c]/12 shadow-[0_10px_25px_-5px_rgba(76,0,12,0.1)] overflow-hidden pointer-events-none transition-all duration-300"
                    style={{
                      transform: `scale(${scale}) translateY(${translateY}px)`,
                      zIndex,
                      opacity,
                    }}
                  >
                    <div className="h-64 w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={getProductImage(cardProduct.name, cardProduct.image_url, cardProduct.category)}
                        alt={cardProduct.name}
                        className="w-full h-full object-cover object-center filter blur-[0.3px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"></div>
                      <div className="absolute top-3 right-3 bg-[#fbf9f6]/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#4c000c]/10 text-[11px] font-semibold text-[#1b1c1a] shadow-xs">
                        {cardProduct.value_label || 'Verified OEM'}
                      </div>
                    </div>
                    <div className="p-4 bg-white flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-[18px] text-[#4c000c] font-medium truncate max-w-[240px]">
                          {cardProduct.manufacturer.name}
                        </span>
                        <div className="flex items-center text-[#D97706] text-[13px] font-bold">
                          ★ {cardProduct.manufacturer.rating || '4.8'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#564241]">
                        <span className="material-symbols-outlined text-[14px] text-[#3b6662]">location_on</span>
                        <span>{cardProduct.manufacturer.city}, {cardProduct.manufacturer.state}</span>
                        {typeof cardProduct.manufacturer.distance_km === 'number' && (
                          <span className="text-[#6c151e] font-semibold text-[10.5px] bg-[#ffdad9]/60 px-2 py-0.5 rounded-full ml-1">
                            {cardProduct.manufacturer.distance_km} km away
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── Top Interactive Card ── */}
              {/*
                touch-action: none  → prevents browser scroll hijack on mobile
                will-change: transform → GPU-composite the layer upfront
                onPointerDown/Move/Up → unified mouse + touch API
              */}
              <div
                ref={cardRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                style={{
                  zIndex: 10,
                  willChange: 'transform',
                  touchAction: 'none',
                  userSelect: 'none',
                }}
                className="relative w-full rounded-2xl bg-[#ffffff] shadow-[0_22px_45px_-12px_rgba(76,0,12,0.18),0_8px_20px_-6px_rgba(59,102,98,0.12)] border border-[#4c000c]/15 overflow-hidden flex flex-col cursor-grab active:cursor-grabbing"
              >
                {/* CONNECT stamp — opacity driven via ref (no re-renders) */}
                <div
                  ref={likeStampRef}
                  style={{ opacity: 0, pointerEvents: 'none' }}
                  className="absolute top-6 left-6 z-30 border-4 border-emerald-600 bg-emerald-500/20 text-emerald-700 font-extrabold text-lg px-4 py-1 rounded-xl rotate-[-12deg] tracking-wider uppercase backdrop-blur-xs"
                >
                  CONNECT
                </div>

                {/* PASS stamp — opacity driven via ref */}
                <div
                  ref={passStampRef}
                  style={{ opacity: 0, pointerEvents: 'none' }}
                  className="absolute top-6 right-6 z-30 border-4 border-[#897171] bg-slate-500/20 text-[#6c151e] font-extrabold text-lg px-4 py-1 rounded-xl rotate-[12deg] tracking-wider uppercase backdrop-blur-xs"
                >
                  PASS
                </div>

                {/* Facility Image with Verified OEM Pill */}
                <div className="relative w-full flex-1 overflow-hidden border-b border-[#dcc0bf]/30 h-64">
                  <img
                    alt={activeProduct.manufacturer.name}
                    className="w-full h-full object-cover object-center pointer-events-none"
                    src={getProductImage(activeProduct.name, activeProduct.image_url)}
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
                  <div className="absolute top-3 right-3 z-20 bg-[#fbf9f6]/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#4c000c]/10 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="text-[12px] font-semibold text-[#1b1c1a]">
                      {activeProduct.value_label || 'Verified OEM'}
                    </span>
                  </div>
                </div>

                {/* Card Information */}
                <div className="flex flex-col gap-2.5 bg-[#ffffff] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <h1 className="font-serif text-[24px] text-[#4c000c] tracking-tight font-medium leading-tight">
                        {activeProduct.manufacturer.name}
                      </h1>
                      <div className="flex items-center gap-1.5 text-[#564241] text-[13px] mt-0.5 flex-wrap">
                        <span className="material-symbols-outlined text-[16px] text-[#3b6662]">
                          location_on
                        </span>
                        <span>
                          {activeProduct.manufacturer.city}, {activeProduct.manufacturer.state}
                        </span>
                        {typeof activeProduct.manufacturer.distance_km === 'number' && (
                          <>
                            <span className="mx-0.5 text-[#dcc0bf]">•</span>
                            <span className="text-[#6c151e] font-semibold text-[11px] bg-[#ffdad9]/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">near_me</span>
                              {activeProduct.manufacturer.distance_km} km away
                            </span>
                          </>
                        )}
                        <span className="mx-0.5 text-[#dcc0bf]">•</span>
                        <span className="text-[#3b6662] font-semibold">
                          {activeProduct.certifications[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="flex items-center text-[#D97706]">
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="font-bold text-[#1b1c1a] text-[15px] ml-0.5">
                          {activeProduct.manufacturer.rating}
                        </span>
                      </div>
                      <span className="text-[#564241] text-[11px]">
                        ({activeProduct.manufacturer.rating_count} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[12px] px-2.5 py-1 rounded-full bg-[#3b6662]/10 border border-[#3b6662]/20 font-medium text-[#234e4a]">
                      {activeProduct.category}
                    </span>
                    <span className="text-[12px] px-2.5 py-1 rounded-full bg-[#f9dec3]/45 border border-[#dcc2a8] font-medium text-[#261908]">
                      Rapid Prototyping
                    </span>
                    <span className="text-[12px] px-2.5 py-1 rounded-full bg-[#beebe6]/40 border border-[#a3cfca] font-medium text-[#234e4a]">
                      MOQ: {activeProduct.moq.toLocaleString()} pcs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full rounded-2xl bg-white border border-[#dcc0bf]/40 p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#bbe8e4]/60 text-[#3b6662] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[32px]">
                  {products.length === 0 ? 'travel_explore' : 'fact_check'}
                </span>
              </div>
              <h3 className="text-xl font-serif text-[#4c000c] font-medium">
                {products.length === 0
                  ? 'No Matching Manufacturers Found'
                  : 'All Vetted Suppliers Reviewed'}
              </h3>
              <p className="text-xs text-[#564241] mt-1 max-w-xs leading-relaxed">
                {products.length === 0
                  ? `No verified OEMs matched your search within ${searchMetadata?.finalRadiusKm || searchMetadata?.initialRadiusKm || 'the selected'} km. Try expanding your search radius or enabling automatic radius expansion in the filter menu.`
                  : 'Check Deal Rooms for active RFQs or reset filters to discover more global suppliers.'}
              </p>
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setSelectedSector('All Sectors');
                }}
                className="mt-4 px-5 py-2.5 rounded-full bg-[#6c151e] text-white font-semibold text-xs shadow-sm hover:brightness-110 cursor-pointer"
              >
                Reset Discovery Deck
              </button>
            </div>
          )}

          {/* Action HUD Controls: Bookmark & Connect */}
          {activeProduct && (
            <div className="w-full flex items-center justify-center gap-2.5 z-10">
              <button
                onClick={handleBookmark}
                aria-label="Save to shortlist"
                className="h-12 w-12 min-h-[48px] min-w-[48px] rounded-full bg-white border border-[#3b6662]/30 shadow-sm flex items-center justify-center text-[#3b6662] hover:bg-[#beebe6]/30 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">bookmark</span>
              </button>

              <button
                onClick={() => commitSwipe('like')}
                aria-label={`Connect with ${activeProduct.manufacturer.name}`}
                className="flex-1 h-12 min-h-[48px] rounded-full bg-[#6c151e] text-white shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all px-5 font-semibold text-[14px] tracking-wide cursor-pointer"
              >
                <span>Connect</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        {/* Ask SoGo Intelligence Prompt Bar */}
        <div className="w-full flex flex-col gap-1.5 z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (aiPrompt.trim()) {
                onOpenAiAssistant(aiPrompt);
                setAiPrompt('');
              }
            }}
            className="w-full h-12 min-h-[48px] flex items-center gap-2.5 px-3.5 rounded-full bg-[#ffffff] border border-[#dcc0bf]/40 shadow-sm hover:border-[#3b6662]/30 transition-all"
          >
            {/* Custom Sourcingo / SoGo Icon SVG */}
            <div className="flex items-center justify-center w-5 h-5 flex-shrink-0 text-[#6c151e]">
              <svg
                className="w-[18px] h-[18px]"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.5 7.5C8.5 5.84315 9.84315 4.5 11.5 4.5H14.5C16.433 4.5 18 6.067 18 8C18 9.933 16.433 11.5 14.5 11.5H9.5C7.567 11.5 6 13.067 6 15C6 16.933 7.567 18.5 9.5 18.5H12.5C14.1569 18.5 15.5 17.1569 15.5 15.5"
                  stroke="#6C151E"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <circle cx="15.5" cy="15.5" r="1.5" fill="#6C151E"></circle>
                <circle cx="8.5" cy="7.5" r="1.5" fill="#6C151E"></circle>
                <path
                  d="M15.5 13.5V15.5H13"
                  stroke="#6C151E"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>

            <input
              className="flex-1 bg-transparent text-[13.5px] text-[#1b1c1a] placeholder:text-[#564241] font-medium focus:outline-none min-w-0"
              placeholder="Ask SoGo anything..."
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => onOpenAiAssistant('Find ISO 9001 CNC suppliers in Bavaria under €50')}
                aria-label="Voice input"
                className="w-9 h-9 rounded-full bg-[#efeeeb] flex items-center justify-center text-[#564241] hover:text-[#4c000c] active:scale-95 transition-all cursor-pointer"
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>

              <button
                type="submit"
                aria-label="Send prompt"
                className="w-9 h-9 rounded-full bg-[#6c151e] text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <svg
                  className="w-4 h-4 stroke-current"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </form>

          {/* iOS / Mobile Home Indicator Bar */}
          <div className="w-full flex justify-center pt-1 pb-0.5 pointer-events-none">
            <div className="w-32 h-1 bg-[#1b1c1a]/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="absolute bottom-20 inset-x-4 z-50 flex justify-center pointer-events-none">
          <div className="bg-[#30312f] text-[#f2f0ed] px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px] text-[#beebe6]">
              check_circle
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Mutual Match Modal */}
      {matchModalProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-[#4c000c]/20 shadow-2xl p-6 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#bbe8e4] text-[#234e4a] flex items-center justify-center shadow-inner mb-3">
              <span className="material-symbols-outlined text-[36px]">handshake</span>
            </div>

            <span className="text-[11px] font-bold tracking-widest text-[#234e4a] uppercase bg-[#beebe6]/50 px-3 py-1 rounded-full border border-[#a3cfca]">
              Mutual Intent Verified
            </span>

            <h2 className="text-2xl font-serif text-[#4c000c] font-medium mt-2">
              Procurement Match!
            </h2>

            <p className="text-[13px] text-[#564241] mt-1">
              You and <strong className="text-[#1b1c1a]">{matchModalProduct.manufacturer.name}</strong>{' '}
              have connected. A bilateral encrypted deal room is initialized.
            </p>

            <div className="w-full my-4 p-3 bg-[#f5f3f0] rounded-2xl border border-[#dcc0bf]/40 flex items-center gap-3 text-left">
              <img
                src={getProductImage(matchModalProduct.name, matchModalProduct.image_url)}
                alt={matchModalProduct.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#1b1c1a] truncate">
                  {matchModalProduct.manufacturer.name}
                </p>
                <p className="text-[11px] text-[#3b6662] truncate">
                  MOQ {matchModalProduct.moq} pcs • {matchModalProduct.manufacturer.city}
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                onClick={async () => {
                  if (!matchModalProduct) return;
                  const roomId = await onSwipe(matchModalProduct, 'like');
                  setMatchModalProduct(null);
                  if (roomId) {
                    onEnterDealRoom(roomId);
                  } else {
                    onSelectTab('dealrooms');
                  }
                }}
                className="w-full py-2.5 rounded-full bg-[#6c151e] text-white font-semibold text-sm shadow-md hover:brightness-110 cursor-pointer"
              >
                Enter Deal Room
              </button>
              <button
                onClick={() => setMatchModalProduct(null)}
                className="w-full py-2 rounded-full text-[#564241] font-medium text-xs hover:bg-[#efeeeb] cursor-pointer"
              >
                Keep Exploring Suppliers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
