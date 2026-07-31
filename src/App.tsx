import React, { useState, useEffect } from 'react';
import { RaffleProvider, useRaffle } from './context/RaffleContext';
import { Header } from './components/Header';
import { RuletaStudio } from './components/RuletaStudio';
import { HeroBanner } from './components/HeroBanner';
import { RaffleCard } from './components/RaffleCard';
import { TicketGrid } from './components/TicketGrid';
import { ParticipationModal } from './components/ParticipationModal';
import { LiveDrawModal } from './components/LiveDrawModal';
import { WinnersList } from './components/WinnersList';
import { UserProfileModal } from './components/UserProfileModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Footer } from './components/Footer';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { Raffle } from './types/raffle';
import { Gift, Search, Filter, Sparkles, CheckCircle2 } from 'lucide-react';

function MainApp() {
  const { raffles, isAdminMode, toggleAdminMode } = useRaffle();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'ruleta' | 'raffles' | 'winners' | 'transparency'>('ruleta');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Controllers
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const [selectedRaffleForParticipation, setSelectedRaffleForParticipation] = useState<Raffle | null>(null);
  const [selectedRaffleForGrid, setSelectedRaffleForGrid] = useState<Raffle | null>(null);
  const [selectedRaffleForDraw, setSelectedRaffleForDraw] = useState<Raffle | null>(null);
  const [preSelectedTicket, setPreSelectedTicket] = useState<string | undefined>(undefined);

  // Auto-detect secret admin URL parameter (?admin=true)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');
    if (adminParam === 'true' || adminParam === 'secret') {
      if (!isAdminMode) {
        toggleAdminMode();
      }
      setShowAdminDashboard(true);
    }
  }, []);

  // Filtered Raffles calculation
  const categories = ['Todas', 'Perfumes', 'Ropa', 'Lencería', 'Bolsos'];

  const filteredRaffles = raffles.filter((r) => {
    if (categoryFilter !== 'Todas' && r.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      return matchTitle || matchDesc;
    }
    return true;
  });

  const handleOpenParticipation = (raffle: Raffle, preferredTicket?: string) => {
    setSelectedRaffleForParticipation(raffle);
    setPreSelectedTicket(preferredTicket);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      <div>
        {/* Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenAdmin={() => setShowAdminDashboard(true)}
          onOpenHowItWorks={() => setShowHowItWorksModal(true)}
        />

        {/* Main Body Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          {/* TAB 0: RULETA DIRECTA STUDIO */}
          {activeTab === 'ruleta' && <RuletaStudio />}

          {/* TAB 1: RIFAS ACTIVAS */}
          {activeTab === 'raffles' && (
            <div className="space-y-8">
              {/* Hero Banner */}
              <HeroBanner
                onExploreClick={() => {
                  const el = document.getElementById('raffles-grid-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenHowItWorks={() => setShowHowItWorksModal(true)}
              />

              {/* Filters & Search Header Section */}
              <div id="raffles-grid-section" className="space-y-4 pt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                      <Gift className="w-7 h-7 text-emerald-600" /> Rifas Activas en Tiempo Real
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Elige la rifa que deseas, cumple los requisitos en redes y participa en la ruleta.
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por premio o marca..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Raffles Grid */}
              {filteredRaffles.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                  <Gift className="w-12 h-12 text-gray-300 mx-auto" />
                  <h3 className="font-bold text-gray-700 text-base">No se encontraron rifas</h3>
                  <p className="text-xs text-gray-400">Prueba ajustando el filtro de búsqueda o categoría.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {filteredRaffles.map((raffle) => (
                    <RaffleCard
                      key={raffle.id}
                      raffle={raffle}
                      onParticipate={(r) => handleOpenParticipation(r)}
                      onViewGrid={(r) => setSelectedRaffleForGrid(r)}
                      onLaunchDraw={(r) => setSelectedRaffleForDraw(r)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GANADORES */}
          {activeTab === 'winners' && <WinnersList />}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* MODALS & DRAWERS */}
      {/* Participation Modal */}
      {selectedRaffleForParticipation && (
        <ParticipationModal
          raffle={selectedRaffleForParticipation}
          preSelectedTicketNumber={preSelectedTicket}
          onClose={() => {
            setSelectedRaffleForParticipation(null);
            setPreSelectedTicket(undefined);
          }}
          onSuccess={(ticketNum) => {
            // Keep open to step 3 or user closes
          }}
        />
      )}

      {/* Live Ticket Grid Inspector Modal */}
      {selectedRaffleForGrid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <TicketGrid
            raffle={selectedRaffleForGrid}
            onSelectTicket={(num) => {
              const raffle = selectedRaffleForGrid;
              setSelectedRaffleForGrid(null);
              handleOpenParticipation(raffle, num);
            }}
            onClose={() => setSelectedRaffleForGrid(null)}
          />
        </div>
      )}

      {/* Live Draw Modal */}
      {selectedRaffleForDraw && (
        <LiveDrawModal
          raffle={selectedRaffleForDraw}
          onClose={() => setSelectedRaffleForDraw(null)}
        />
      )}

      {/* User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          onClose={() => setShowProfileModal(false)}
          onOpenAdmin={() => {
            setShowProfileModal(false);
            setShowAdminDashboard(true);
          }}
        />
      )}

      {/* How It Works Modal */}
      {showHowItWorksModal && (
        <HowItWorksModal onClose={() => setShowHowItWorksModal(false)} />
      )}

      {/* Admin Dashboard */}
      {showAdminDashboard && (
        <AdminDashboard
          onClose={() => setShowAdminDashboard(false)}
          onLaunchDrawForRaffle={(raffle) => {
            setShowAdminDashboard(false);
            setSelectedRaffleForDraw(raffle);
          }}
        />
      )}

      {/* Floating Background Music Player */}
      <BackgroundMusicPlayer />
    </div>
  );
}

export default function App() {
  return (
    <RaffleProvider>
      <MainApp />
    </RaffleProvider>
  );
}
