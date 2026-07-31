import React, { useState, useEffect } from 'react';
import { Raffle, Ticket } from '../types/raffle';
import { useRaffle } from '../context/RaffleContext';
import {
  Clock,
  Gift,
  CheckCircle,
  Users,
  Grid,
  Share2,
  Trophy,
  Flame,
  ChevronRight,
} from 'lucide-react';

interface RaffleCardProps {
  raffle: Raffle;
  onParticipate: (raffle: Raffle) => void;
  onViewGrid: (raffle: Raffle) => void;
  onLaunchDraw?: (raffle: Raffle) => void;
}

export const RaffleCard: React.FC<RaffleCardProps> = ({
  raffle,
  onParticipate,
  onViewGrid,
  onLaunchDraw,
}) => {
  const { ticketsMap, isAdminMode } = useRaffle();
  const tickets: Ticket[] = ticketsMap[raffle.id] || [];

  const assignedCount = tickets.filter((t) => t.status === 'assigned').length;
  const totalCount = raffle.totalNumbers;
  const percentFilled = Math.min(100, Math.round((assignedCount / totalCount) * 100));

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(raffle.drawDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [raffle.drawDate]);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group">
      {/* Card Header & Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <img
          src={raffle.prizeImage}
          alt={raffle.title}
          className="w-[#100%] h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Category & Prize Value Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs">
            {raffle.category}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-xs shadow-md">
            Valor: {raffle.prizeValue}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {raffle.status === 'active' && !timeLeft.isExpired && (
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-md animate-pulse">
              <Flame className="w-3.5 h-3.5" /> Activa
            </span>
          )}
          {raffle.status === 'active' && timeLeft.isExpired && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center gap-1 shadow-md">
              <Clock className="w-3.5 h-3.5" /> En Sorteo
            </span>
          )}
          {raffle.status === 'completed' && (
            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center gap-1 shadow-md">
              <Trophy className="w-3.5 h-3.5" /> Finalizada
            </span>
          )}
          {raffle.status === 'paused' && (
            <span className="px-3 py-1 rounded-full bg-gray-600 text-white font-bold text-xs">
              Pausada
            </span>
          )}
        </div>

        {/* Floating Title on Image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-extrabold text-lg sm:text-xl leading-snug drop-shadow-md">
            {raffle.title}
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {raffle.description}
        </p>

        {/* Countdown Timer Block */}
        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2 font-medium">
            <span className="flex items-center gap-1 font-semibold text-gray-700">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> Sorteo en:
            </span>
            <span>{new Date(raffle.drawDate).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
          </div>

          {timeLeft.isExpired ? (
            <div className="text-center font-bold text-amber-600 text-xs py-1">
              ⌛ ¡Tiempo transcurrido! Listo para sorteo.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
              <div className="bg-white p-1.5 rounded-xl border border-gray-200">
                <span className="block font-bold text-gray-900 text-base">{timeLeft.days}</span>
                <span className="text-[10px] text-gray-400">Días</span>
              </div>
              <div className="bg-white p-1.5 rounded-xl border border-gray-200">
                <span className="block font-bold text-gray-900 text-base">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-gray-400">Horas</span>
              </div>
              <div className="bg-white p-1.5 rounded-xl border border-gray-200">
                <span className="block font-bold text-gray-900 text-base">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-gray-400">Min</span>
              </div>
              <div className="bg-white p-1.5 rounded-xl border border-gray-200">
                <span className="block font-bold text-emerald-600 text-base">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-gray-400">Seg</span>
              </div>
            </div>
          )}
        </div>

        {/* Winner Announcement if Completed */}
        {raffle.status === 'completed' && raffle.winnerInfo && (
          <div className="p-3 bg-pink-50 rounded-2xl border border-pink-200 text-xs">
            <div className="flex items-center gap-2 font-bold text-pink-900">
              <Trophy className="w-4 h-4 text-pink-600" /> Ganador del Sorteo:
            </div>
            <p className="font-extrabold text-gray-900 text-sm mt-1">
              {raffle.winnerInfo.name}
            </p>
          </div>
        )}

        {/* Actions Footer Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          {raffle.status === 'active' && (
            <button
              onClick={() => onParticipate(raffle)}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
            >
              <Gift className="w-4 h-4" />
              Participar Gratis
            </button>
          )}

          <button
            onClick={() => onViewGrid(raffle)}
            className="py-3 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
            title="Ver mapa de números en tiempo real"
          >
            <Grid className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Ver Números</span>
          </button>

          {/* Admin Draw Execution Button */}
          {isAdminMode && raffle.status === 'active' && onLaunchDraw && (
            <button
              onClick={() => onLaunchDraw(raffle)}
              className="py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-md"
              title="Ejecutar Sorteo Aleatorio Ahora (Modo Admin)"
            >
              <Trophy className="w-4 h-4" />
              Sorteo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
