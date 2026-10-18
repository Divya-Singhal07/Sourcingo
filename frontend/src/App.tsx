import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NavDrawer } from './components/NavDrawer';
import { SwipeDeck } from './components/SwipeDeck';
import { DealRooms } from './components/DealRooms';
import { ProfileView } from './components/ProfileView';
import { ShortlistModal } from './components/ShortlistModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { VerificationDossiersModal } from './components/VerificationDossiersModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { ActiveRfqsModal } from './components/ActiveRfqsModal';
import { AuthPage, type AuthUser } from './components/AuthPage';
import { fetchProducts, postSwipe } from './api';
import { INITIAL_PRODUCTS, MOCK_DEAL_ROOMS, MOCK_NEW_MATCHES } from './mockData';
import type { ProductCard, DealRoomItem } from './types';

const SESSION_KEY = 'sourcingo_user';

export function App() {
  // Authentication State: restored from localStorage so refresh doesn't log out
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const [currentTab, setCurrentTab] = useState<'matchmaker' | 'dealrooms' | 'profile'>('matchmaker');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');

  // Feature modals state
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isMatchHistoryOpen, setIsMatchHistoryOpen] = useState(false);
  const [isActiveRfqsOpen, setIsActiveRfqsOpen] = useState(false);

  // Which deal room to open immediately when switching to dealrooms tab
  const [activeDealRoomId, setActiveDealRoomId] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductCard[]>(INITIAL_PRODUCTS);
  const [savedProducts, setSavedProducts] = useState<ProductCard[]>([INITIAL_PRODUCTS[0]]);
  const [dealRooms, setDealRooms] = useState<DealRoomItem[]>(MOCK_DEAL_ROOMS);
  const [priceTier, setPriceTier] = useState<'Budget' | 'Mid-Tier' | 'Enterprise'>('Mid-Tier');
  const [searchRadius, setSearchRadius] = useState<number>(50);
  const [autoExpandRadius, setAutoExpandRadius] = useState<boolean>(true);
  const [originCity, setOriginCity] = useState<string>('Pune');
  const [searchMetadata, setSearchMetadata] = useState<import('./types').SearchMetadata | null>(null);

  const handleLoginSuccess = (user: AuthUser) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleSignOut = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('sourcingo_token');
    setCurrentUser(null);
    setActiveDealRoomId(null);
    setIsDrawerOpen(false);
    setIsShortlistOpen(false);
    setIsAiModalOpen(false);
    setIsVerificationOpen(false);
    setIsMatchHistoryOpen(false);
    setIsActiveRfqsOpen(false);
    setCurrentTab('matchmaker');
  };

  useEffect(() => {
    fetchProducts({
      radiusKm: searchRadius,
      autoExpand: autoExpandRadius,
      originCity,
    }).then((res) => {
      if (res && res.products) {
        setProducts(res.products);
        setSearchMetadata(res.searchMetadata ?? null);
      }
    });
  }, [searchRadius, autoExpandRadius, originCity]);

  const handleSwipe = async (product: ProductCard, action: 'like' | 'pass'): Promise<string | null> => {
    await postSwipe(product.manufacturer.id, action);

    if (action === 'like') {
      const existing = dealRooms.find((d) => d.partnerName === product.manufacturer.name);
      if (existing) return existing.id;

      const newRoomId = `deal-${Date.now()}`;
      const newRoom: DealRoomItem = {
        id: newRoomId,
        partnerName: product.manufacturer.name,
        partnerRole: `${product.category} • ${product.manufacturer.city}`,
        partnerLocation: `${product.manufacturer.city}, ${product.manufacturer.state}`,
        avatar: product.manufacturer.avatar || product.image_url,
        lastMessage: `Match initiated for ${product.name}. Bilateral room initialized.`,
        timestamp: 'Just now',
        unreadCount: 1,
        rfqStatus: 'Active RFQ',
        dealValue: `€${(product.unit_price * product.moq).toLocaleString()}`,
        sector: product.category,
        verified: true,
        ndaSigned: true,
      };
      setDealRooms((prev) => [newRoom, ...prev]);
      return newRoomId;
    }
    return null;
  };

  const handleSaveBookmark = (product: ProductCard) => {
    if (!savedProducts.some((p) => p.id === product.id)) {
      setSavedProducts((prev) => [...prev, product]);
    }
  };

  const handleRemoveBookmark = (id: string) => {
    setSavedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStartDealFromShortlist = (product: ProductCard) => {
    handleSwipe(product, 'like');
    setCurrentTab('dealrooms');
  };

  const handleOpenAiWithPrompt = (prompt?: string) => {
    setAiInitialPrompt(prompt || '');
    setIsAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#ede9e2] sm:py-6 flex justify-center items-center selection:bg-[#ffdad9] selection:text-[#4c000c]">
      {/* Mobile Frame Container (Exact mobile dimensions, centered on desktop, native on mobile) */}
      <div className="w-full sm:max-w-[430px] min-h-screen sm:min-h-[880px] sm:h-[880px] bg-[#fbf9f6] text-[#1b1c1a] flex flex-col relative sm:rounded-[36px] sm:shadow-[0_25px_60px_rgba(45,31,14,0.18)] sm:border border-[#dcc0bf]/50 overflow-hidden">
        {!currentUser ? (
          /* Authentication Screen shown first before data, and shown again upon signout */
          <AuthPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {/* Header Navigation */}
            <Navbar
              currentTab={currentTab}
              onSelectTab={setCurrentTab}
              onOpenDrawer={() => setIsDrawerOpen(true)}
              savedCount={savedProducts.length}
              currentUser={currentUser}
            />

            {/* Main Screen Content with scrolling support */}
            <main className="flex-1 flex flex-col w-full relative overflow-y-auto overflow-x-hidden no-scrollbar">
              {currentTab === 'matchmaker' && (
                <SwipeDeck
                  products={products}
                  searchMetadata={searchMetadata}
                  onSwipe={handleSwipe}
                  onSaveBookmark={handleSaveBookmark}
                  onOpenAiAssistant={handleOpenAiWithPrompt}
                  onSelectTab={setCurrentTab}
                  onEnterDealRoom={(roomId) => {
                    setActiveDealRoomId(roomId);
                    setCurrentTab('dealrooms');
                  }}
                />
              )}

              {currentTab === 'dealrooms' && (
                <DealRooms
                  dealRooms={dealRooms}
                  newMatches={MOCK_NEW_MATCHES}
                  onOpenMatchmaker={() => setCurrentTab('matchmaker')}
                  initialRoomId={activeDealRoomId}
                  onRoomOpened={() => setActiveDealRoomId(null)}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileView
                  onOpenVerificationDossiers={() => setIsVerificationOpen(true)}
                  onOpenMatchHistory={() => setIsMatchHistoryOpen(true)}
                  onOpenActiveRfqs={() => setIsActiveRfqsOpen(true)}
                  onSignOut={handleSignOut}
                  currentUser={currentUser}
                  onUpdateAvatar={(avatarUrl) => {
                    setCurrentUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
                  }}
                />
              )}
            </main>

            {/* Off-canvas Filter & Vault Drawer */}
            <NavDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              savedProducts={savedProducts}
              selectedPriceTier={priceTier}
              onChangePriceTier={setPriceTier}
              searchRadiusKm={searchRadius}
              onChangeSearchRadiusKm={setSearchRadius}
              autoExpandRadius={autoExpandRadius}
              onChangeAutoExpandRadius={setAutoExpandRadius}
              originCity={originCity}
              onChangeOriginCity={setOriginCity}
              onOpenShortlist={() => setIsShortlistOpen(true)}
              onNavigateToDealrooms={() => setCurrentTab('dealrooms')}
              onOpenVerificationDossiers={() => setIsVerificationOpen(true)}
              onOpenMatchHistory={() => setIsMatchHistoryOpen(true)}
              onOpenActiveRfqs={() => setIsActiveRfqsOpen(true)}
              onSignOut={handleSignOut}
              currentUser={currentUser}
            />

            {/* Shortlist Dossier Modal */}
            <ShortlistModal
              isOpen={isShortlistOpen}
              onClose={() => setIsShortlistOpen(false)}
              savedProducts={savedProducts}
              onRemoveBookmark={handleRemoveBookmark}
              onStartDealRoom={handleStartDealFromShortlist}
            />

            {/* AI Intelligence Dialog */}
            <AiAssistantModal
              isOpen={isAiModalOpen}
              onClose={() => setIsAiModalOpen(false)}
              initialPrompt={aiInitialPrompt}
              currentUser={currentUser}
            />

            {/* Verification Dossiers Modal */}
            <VerificationDossiersModal
              isOpen={isVerificationOpen}
              onClose={() => setIsVerificationOpen(false)}
              onOpenDeal={(partner) => {
                const product = products.find((p) => p.manufacturer.name === partner);
                if (product) {
                  handleSwipe(product, 'like');
                }
                setCurrentTab('dealrooms');
              }}
            />

            {/* Match History Modal */}
            <MatchHistoryModal
              isOpen={isMatchHistoryOpen}
              onClose={() => setIsMatchHistoryOpen(false)}
              onOpenDeal={(partner) => {
                const product = products.find((p) => p.manufacturer.name === partner);
                if (product) {
                  handleSwipe(product, 'like');
                }
                setCurrentTab('dealrooms');
              }}
            />

            {/* Active RFQs Modal */}
            <ActiveRfqsModal
              isOpen={isActiveRfqsOpen}
              onClose={() => setIsActiveRfqsOpen(false)}
              onOpenDeal={(partner) => {
                const product = products.find((p) => p.manufacturer.name === partner);
                if (product) {
                  handleSwipe(product, 'like');
                }
                setCurrentTab('dealrooms');
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
