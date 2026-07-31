import React, { useState } from 'react';
import { useRaffle } from '../context/RaffleContext';
import { Logo } from './Logo';
import {
  Gift,
  Trophy,
  ShieldCheck,
  User,
  Bell,
  MessageCircle,
  X,
  LogIn,
  Mail,
  KeyRound,
  Disc,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'ruleta' | 'raffles' | 'winners' | 'transparency';
  setActiveTab: (tab: 'ruleta' | 'raffles' | 'winners' | 'transparency') => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenHowItWorks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenAdmin,
  onOpenHowItWorks,
}) => {
  const {
    notifications,
    markNotificationRead,
    clearAllNotifications,
    isAdminMode,
    toggleAdminMode,
    socialLinks,
    currentUser,
    userProfile,
  } = useRaffle();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const whatsappLink = socialLinks.find((s) => s.platform === 'whatsapp')?.url || 'https://whatsapp.com';

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white text-xs md:text-sm py-2 px-4 text-center font-medium shadow-sm flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider">
          100% GRATIS
        </span>
        <span>¡Participa en las rifas oficiales de Variedades CS sin costo!</span>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 underline hover:text-pink-100 font-semibold ml-2 transition"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Canal WhatsApp
        </a>
      </div>

      {/* Main Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="cursor-pointer" onClick={() => setActiveTab('ruleta')}>
              <Logo size="md" showText={true} />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-pink-50/60 p-1.5 rounded-2xl border border-pink-100">
              <button
                onClick={() => setActiveTab('ruleta')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                  activeTab === 'ruleta'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Disc className="w-4 h-4 text-pink-300" />
                Ruleta Directa
              </button>

              <button
                onClick={() => setActiveTab('raffles')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                  activeTab === 'raffles'
                    ? 'bg-white text-pink-700 shadow-sm border border-pink-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Gift className="w-4 h-4 text-pink-600" />
                Catálogo Rifas
              </button>

              <button
                onClick={() => setActiveTab('winners')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                  activeTab === 'winners'
                    ? 'bg-white text-pink-700 shadow-sm border border-pink-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                Ganadores
              </button>

              <button
                onClick={onOpenHowItWorks}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-white/60 transition"
              >
                <ShieldCheck className="w-4 h-4 text-pink-600" />
                Transparencia
              </button>
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-xl text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition relative"
                  aria-label="Notificaciones"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-pink-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        <Bell className="w-4 h-4 text-pink-600" /> Notificaciones
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-pink-600 font-medium hover:underline"
                        >
                          Marcar leídas
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 text-sm">
                          No tienes notificaciones aún
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-3.5 hover:bg-pink-50/50 cursor-pointer transition ${
                              !n.read ? 'bg-pink-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-bold text-gray-900">{n.title}</p>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Admin Access Button (Only visible when secret Admin Mode is active) */}
              {isAdminMode && (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-gray-900 to-pink-950 text-white border border-pink-500/30 hover:bg-black shadow-md transition"
                  title="Abrir Panel de Administración"
                >
                  <ShieldCheck className="w-4 h-4 text-pink-400" />
                  <span>Panel Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

