import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NavDrawer } from './components/NavDrawer';
import { SwipeDeck } from './components/SwipeDeck';
import { DealRooms } from './components/DealRooms';
import { ProfileView } from './components/ProfileView';
import { ShortlistModal } from './components/ShortlistModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { fetchProducts, postSwipe } from './api';
import { INITIAL_PRODUCTS, MOCK_DEAL_ROOMS, MOCK_NEW_MATCHES } from './mockData';
import type { ProductCard, DealRoomItem } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<'matchmaker' | 'dealrooms' | 'profile'>('matchmaker');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShortlistOpen, setIsShortlistOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');

  const [products, setProducts] = useState<ProductCard[]>(INITIAL_PRODUCTS);
  const [savedProducts, setSavedProducts] = useState<ProductCard[]>([INITIAL_PRODUCTS[0]]);
  const [dealRooms, setDealRooms] = useState<DealRoomItem[]>(MOCK_DEAL_ROOMS);
  const [priceTier, setPriceTier] = useState<'Budget' | 'Mid-Tier' | 'Enterprise'>('Mid-Tier');
  const [searchRadius, setSearchRadius] = useState<'50 km' | '250 km' | '1000 km' | 'Global'>('250 km');

  useEffect(() => {
    fetchProducts().then((data) => {
      if (data && data.length > 0) {
        setProducts(data);
      }
    });
  }, []);

  const handleSwipe = async (product: ProductCard, action: 'like' | 'pass') => {
    await postSwipe(product.manufacturer.id, action);

    if (action === 'like') {
      const exists = dealRooms.some((d) => d.partnerName === product.manufacturer.name);
      if (!exists) {
        const newRoom: DealRoomItem = {
          id: `deal-${Date.now()}`,
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
      }
    }
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
        {/* Header Navigation */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          savedCount={savedProducts.length}
        />

        {/* Main Screen Content with scrolling support */}
        <main className="flex-1 flex flex-col w-full relative overflow-y-auto overflow-x-hidden no-scrollbar">
          {currentTab === 'matchmaker' && (
            <SwipeDeck
              products={products}
              onSwipe={handleSwipe}
              onSaveBookmark={handleSaveBookmark}
              onOpenAiAssistant={handleOpenAiWithPrompt}
            />
          )}

          {currentTab === 'dealrooms' && (
            <DealRooms
              dealRooms={dealRooms}
              newMatches={MOCK_NEW_MATCHES}
              onOpenMatchmaker={() => setCurrentTab('matchmaker')}
            />
          )}

          {currentTab === 'profile' && <ProfileView />}
        </main>

        {/* Off-canvas Filter & Vault Drawer */}
        <NavDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          savedProducts={savedProducts}
          selectedPriceTier={priceTier}
          onChangePriceTier={setPriceTier}
          searchRadius={searchRadius}
          onChangeSearchRadius={setSearchRadius}
          onOpenShortlist={() => setIsShortlistOpen(true)}
          onNavigateToDealrooms={() => setCurrentTab('dealrooms')}
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
        />
      </div>
    </div>
  );
}

export default App;
