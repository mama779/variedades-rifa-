import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Raffle, Ticket } from '../types/raffle';
import { useRaffle } from '../context/RaffleContext';
import { WinnerEmailModal } from './WinnerEmailModal';
import { Trophy, Sparkles, X, Play, RefreshCw, CheckCircle2, Mail, Disc, Lock } from 'lucide-react';

interface LiveDrawModalProps {
  raffle: Raffle;
  onClose: () => void;
}

const SLICE_COLORS = [
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#84cc16', // Lime
];

export const LiveDrawModal: React.FC<LiveDrawModalProps> = ({ raffle, onClose }) => {
  const { ticketsMap, runRandomDraw, isAdminMode } = useRaffle();
  const assignedTickets = (ticketsMap[raffle.id] || []).filter((t) => t.status === 'assigned');

  const [drawMode, setDrawMode] = useState<'ruleta' | 'digital'>('ruleta');
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayNumber, setDisplayNumber] = useState('??');
  const [winnerTicket, setWinnerTicket] = useState<Ticket | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Ruleta rotation state
  const [wheelRotation, setWheelRotation] = useState(0);

  // Audio synthesizer for draw sounds
  const playTickSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Ignore audio restriction errors
    }
  };

  const playFanfareSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.15, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    } catch (e) {}
  };

  // Start Ruleta or Digital Draw
  const startDraw = () => {
    if (!isAdminMode) {
      alert('Solo el Administrador de la plataforma puede girar la ruleta.');
      return;
    }
    if (assignedTickets.length === 0) return;

    setIsSpinning(true);
    setWinnerTicket(null);

    // Notify background music player to pause during spin
    window.dispatchEvent(new CustomEvent('bg-music:spin-start'));

    // Run authoritative draw to get winner
    const winner = runRandomDraw(raffle.id);
    if (!winner) {
      setIsSpinning(false);
      return;
    }

    if (drawMode === 'ruleta') {
      // Find winner's index in assignedTickets
      const winnerIndex = assignedTickets.findIndex((t) => t.number === winner.number);
      const safeIndex = winnerIndex >= 0 ? winnerIndex : 0;
      const numSlices = assignedTickets.length;
      const sliceAngle = 360 / numSlices;

      // Pointer is at TOP (270deg in standard SVG circle angle).
      // Angle for slice i center is: i * sliceAngle + sliceAngle / 2
      // To bring slice i center to the TOP (270deg or -90deg):
      // Rotation needed = 270 - (i * sliceAngle + sliceAngle / 2) + extra full turns
      const winnerAngleCenter = safeIndex * sliceAngle + sliceAngle / 2;
      const targetRotation = 360 * 6 + (270 - winnerAngleCenter);

      // Spin audio tick interval
      let tickCount = 0;
      const tickInterval = setInterval(() => {
        tickCount++;
        playTickSound();
        if (tickCount > 35) clearInterval(tickInterval);
      }, 100);

      setWheelRotation((prev) => prev + targetRotation);

      setTimeout(() => {
        clearInterval(tickInterval);
        setDisplayNumber(winner.number);
        setWinnerTicket(winner);
        setIsSpinning(false);
        playFanfareSound();

        // Trigger celebration fanfare and voice announcement
        window.dispatchEvent(
          new CustomEvent('bg-music:spin-end', {
            detail: {
              winnerName: winner.participantName || 'Ganador',
              winnerNumber: winner.number,
            },
          })
        );

        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
        });
      }, 4500);
    } else {
      // Digital counter mode
      let counter = 0;
      const totalTicks = 45;
      let delay = 50;

      const spinDigital = () => {
        const randomIndex = Math.floor(Math.random() * assignedTickets.length);
        const randomNum = assignedTickets[randomIndex].number;
        setDisplayNumber(randomNum);
        playTickSound();

        counter++;
        if (counter < totalTicks) {
          if (counter > 30) delay += 20;
          if (counter > 38) delay += 50;
          setTimeout(spinDigital, delay);
        } else {
          setDisplayNumber(winner.number);
          setWinnerTicket(winner);
          setIsSpinning(false);
          playFanfareSound();

          window.dispatchEvent(
            new CustomEvent('bg-music:spin-end', {
              detail: {
                winnerName: winner.participantName || 'Ganador',
                winnerNumber: winner.number,
              },
            })
          );

          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
          });
        }
      };

      spinDigital();
    }
  };

  // Render SVG Slices for the Ruleta
  const renderRuletaWheel = () => {
    const total = assignedTickets.length;
    if (total === 0) return null;

    const sliceAngle = 360 / total;
    const radius = 140;
    const center = 150;

    return (
      <svg viewBox="0 0 300 300" className="w-full h-full max-w-[280px] sm:max-w-[320px] mx-auto drop-shadow-2xl">
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3" />
          </filter>
        </defs>

        <g
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            transformOrigin: '150px 150px',
            transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
          }}
        >
          {assignedTickets.map((t, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = (index + 1) * sliceAngle;

            const startRad = (Math.PI / 180) * startAngle;
            const endRad = (Math.PI / 180) * endAngle;

            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);

            const largeArcFlag = sliceAngle > 180 ? 1 : 0;
            const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const midAngle = startAngle + sliceAngle / 2;
            const midRad = (Math.PI / 180) * midAngle;
            const textX = center + (radius * 0.68) * Math.cos(midRad);
            const textY = center + (radius * 0.68) * Math.sin(midRad);

            const color = SLICE_COLORS[index % SLICE_COLORS.length];
            const displayLabel = `#${t.number}`;
            const userHandle = t.userHandle || t.userName.split(' ')[0] || `@usr${t.number}`;

            return (
              <g key={t.number}>
                <path d={pathData} fill={color} stroke="#ffffff" strokeWidth="2" />
                <g transform={`translate(${textX}, ${textY}) rotate(${midAngle + 90})`}>
                  <text
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={total > 12 ? '8' : '10'}
                    fontWeight="900"
                    fontFamily="monospace"
                    dy="-2"
                  >
                    {displayLabel}
                  </text>
                  <text
                    textAnchor="middle"
                    fill="#fef08a"
                    fontSize={total > 12 ? '6' : '7'}
                    fontWeight="700"
                    dy="8"
                  >
                    {userHandle.length > 9 ? userHandle.slice(0, 8) + '…' : userHandle}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Wheel Outer Border & Center Pin */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#f59e0b" strokeWidth="6" />
          <circle cx={center} cy={center} r="22" fill="#1e293b" stroke="#ffffff" strokeWidth="3" />
          <circle cx={center} cy={center} r="10" fill="#f59e0b" />
        </g>

        {/* Pointer Pin (Fixed at top pointing down) */}
        <polygon
          points="150,2 140,24 160,24"
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth="2"
          filter="url(#shadow)"
        />
      </svg>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-center space-y-5 animate-in zoom-in-95 my-6 border border-pink-100">
          <button
            onClick={onClose}
            disabled={isSpinning}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs tracking-wider uppercase inline-flex items-center gap-1 shadow-sm">
              <Trophy className="w-3.5 h-3.5 text-amber-600" /> Gran Sorteo Transparente
            </span>
            <h3 className="font-black text-gray-900 text-xl md:text-2xl mt-1.5">{raffle.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Participantes verificado(s): <strong>{assignedTickets.length} boletos</strong>
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center justify-center gap-2 bg-gray-100 p-1.5 rounded-2xl max-w-xs mx-auto text-xs font-bold">
            <button
              onClick={() => setDrawMode('ruleta')}
              disabled={isSpinning}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                drawMode === 'ruleta'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Disc className="w-4 h-4" /> Ruleta de la Suerte
            </button>
            <button
              onClick={() => setDrawMode('digital')}
              disabled={isSpinning}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                drawMode === 'digital'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Bombo Digital
            </button>
          </div>

          {/* RULETA MODE */}
          {drawMode === 'ruleta' && (
            <div className="py-2 flex flex-col items-center justify-center relative">
              {assignedTickets.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500 text-xs">
                  No hay boletos asignados para girar la ruleta.
                </div>
              ) : (
                <div className="relative p-2 bg-gradient-to-b from-gray-900 via-gray-800 to-pink-950 rounded-3xl border border-pink-500/30 shadow-2xl w-full flex items-center justify-center">
                  {renderRuletaWheel()}
                </div>
              )}
            </div>
          )}

          {/* DIGITAL COUNTER MODE */}
          {drawMode === 'digital' && (
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-950 p-8 rounded-3xl border border-emerald-500/30 shadow-2xl relative overflow-hidden">
              <div className="text-[11px] font-mono text-emerald-400 tracking-widest uppercase mb-2">
                NÚMERO GANADOR ALEATORIO
              </div>

              <div className="text-6xl sm:text-7xl font-mono font-black tracking-widest text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.4)] my-2">
                #{displayNumber}
              </div>

              {isSpinning && (
                <div className="text-xs text-emerald-300 animate-pulse font-mono mt-2">
                  🎲 Mezclando números...
                </div>
              )}
            </div>
          )}

          {/* Winner Announcement Card */}
          {winnerTicket && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center animate-in fade-in slide-in-from-bottom-3 space-y-2 shadow-sm">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ¡FELICIDADES AL GANADOR!
              </div>
              <h4 className="font-black text-gray-900 text-xl">{winnerTicket.userName}</h4>
              <p className="text-xs text-emerald-800 font-bold">
                Usuario: <span className="text-pink-700">{winnerTicket.userHandle || '@usuario'}</span>
              </p>
              <p className="text-[11px] text-gray-500 font-mono">
                Contacto: {winnerTicket.userPhone} • {winnerTicket.userEmail}
              </p>

              <button
                onClick={() => setShowEmailModal(true)}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs shadow flex items-center justify-center gap-2 transition"
              >
                <Mail className="w-4 h-4" /> Notificar por Gmail al Ganador
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {!winnerTicket && (
              <button
                onClick={startDraw}
                disabled={isSpinning || assignedTickets.length === 0}
                className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition flex items-center justify-center gap-2 ${
                  isSpinning || assignedTickets.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 via-pink-600 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white shadow-pink-500/30'
                }`}
              >
                {isSpinning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    ¡Girando Ruleta de la Suerte!
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    ¡GIRAR RULETA Y ELEGIR GANADOR!
                  </>
                )}
              </button>
            )}

            {winnerTicket && (
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md"
              >
                Publicar Ganador y Finalizar Sorteo
              </button>
            )}
          </div>
        </div>
      </div>

      {showEmailModal && winnerTicket && (
        <WinnerEmailModal
          winnerName={winnerTicket.userName || 'Ganador'}
          winnerEmail={winnerTicket.userEmail}
          winnerPhone={winnerTicket.userPhone || ''}
          ticketNumber={winnerTicket.number}
          raffleTitle={raffle.title}
          prizeValue={raffle.prizeValue}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
};

