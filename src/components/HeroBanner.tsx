import React from 'react';
import { useRaffle } from '../context/RaffleContext';
import { Logo } from './Logo';
import { Gift, Trophy, CheckCircle2, MessageCircle, Sparkles, Flame, Heart } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onOpenHowItWorks: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick, onOpenHowItWorks }) => {
  const { raffles, winnersHistory, socialLinks } = useRaffle();

  const activeCount = raffles.filter((r) => r.status === 'active').length;
  const whatsappUrl = socialLinks.find((s) => s.platform === 'whatsapp')?.url || 'https://whatsapp.com';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-pink-950 to-purple-950 text-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-2xl mb-12 border border-pink-900/40">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Left Text */}
        <div className="flex-1 text-center md:text-left space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Flame className="w-4 h-4 text-pink-400" /> Plataforma Oficial Variedades CS
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Participa Gratis en <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200">
              Nuestras Rifas Oficiales
            </span>
          </h1>

          <p className="text-pink-100/90 text-sm sm:text-base leading-relaxed max-w-xl">
            <strong>Pasos a seguir:</strong> Sigue nuestras redes sociales oficiales (Facebook, Instagram, TikTok, WhatsApp) y participa en nuestros sorteos con la ruleta en vivo. ¡Sin compras ni cobros!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-2">
            <button
              onClick={onExploreClick}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-xl shadow-pink-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Gift className="w-5 h-5" />
              Ver Rifas Disponibles ({activeCount})
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5 text-pink-400" />
              Canal WhatsApp
            </a>

            <button
              onClick={onOpenHowItWorks}
              className="px-4 py-3.5 rounded-2xl text-pink-200 hover:text-white font-medium text-xs sm:text-sm underline transition"
            >
              ¿Cómo funciona?
            </button>
          </div>

          {/* Key Trust Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 max-w-md">
            <div className="text-center md:text-left">
              <p className="text-xl sm:text-2xl font-black text-pink-300">{activeCount}</p>
              <p className="text-[11px] text-pink-200 font-medium">Rifas Activas</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xl sm:text-2xl font-black text-amber-400">{winnersHistory.length}</p>
              <p className="text-[11px] text-gray-300 font-medium">Ganadores Reales</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-xl sm:text-2xl font-black text-purple-300">100%</p>
              <p className="text-[11px] text-purple-200 font-medium">Transparente</p>
            </div>
          </div>
        </div>

        {/* Right Graphic Card */}
        <div className="w-full md:w-auto flex justify-center">
          <div className="relative bg-gradient-to-b from-white/10 to-white/5 p-6 rounded-3xl border border-pink-500/30 backdrop-blur-xl text-center shadow-2xl max-w-xs">
            <div className="flex justify-center mb-3">
              <Logo size="xl" showText={false} />
            </div>
            <h3 className="font-extrabold text-white text-base">¡Elige tu Número Feliz!</h3>
            <p className="text-xs text-pink-100/80 mt-1 mb-4">
              Cada rifa asigna boletos numerados en tiempo real. ¡Elige el tuyo antes de que se agoten!
            </p>
            <div className="bg-pink-950/80 p-3 rounded-xl border border-pink-800 text-xs font-semibold text-pink-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-pink-400" /> Asignación 100% Directa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
