import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Raffle, Ticket } from '../types/raffle';
import { useRaffle } from '../context/RaffleContext';
import {
  Trophy,
  Sparkles,
  Play,
  RotateCcw,
  UserPlus,
  Trash2,
  Edit2,
  Camera,
  CheckCircle2,
  Gift,
  PlusCircle,
  Users,
  X,
  Check,
  Disc,
  Lock,
} from 'lucide-react';

const SLICE_COLORS = [
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
  '#14b8a6', // Teal
];

export const RuletaStudio: React.FC = () => {
  const {
    raffles,
    ticketsMap,
    assignTicketDirectly,
    updateTicketParticipant,
    unassignTicket,
    updateRaffle,
    runRandomDraw,
    isAdminMode,
  } = useRaffle();

  // Selected active raffle (defaults to the first active raffle or creates fallback)
  const activeRaffle = raffles[0] || {
    id: 'raf-default',
    title: 'Sorteo de Producto',
    description: 'Ingresa los nombres de los usuarios participantes y gira la ruleta.',
    prizeImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600',
    prizeValue: 'Premio Especial',
    totalNumbers: 100,
    digits: 2,
    category: 'Tecnología',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const assignedTickets = (ticketsMap[activeRaffle.id] || []).filter((t) => t.status === 'assigned');

  // Input states for quick participant addition
  const [newUserName, setNewUserName] = useState('');
  const [newUserHandle, setNewUserHandle] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState('');
  const [bulkNamesInput, setBulkNamesInput] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Edit participant state
  const [editingTicketNumber, setEditingTicketNumber] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');

  // Edit product details modal state
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [productTitle, setProductTitle] = useState(activeRaffle.title);
  const [productImage, setProductImage] = useState(activeRaffle.prizeImage);
  const [productValue, setProductValue] = useState(activeRaffle.prizeValue);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Spin Wheel animation states
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [winnerTicket, setWinnerTicket] = useState<Ticket | null>(null);

  // Audio synthesizer for ticks and fanfare
  const playTickSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  const playFanfareSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [261.63, 329.63, 392.0, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.45);
      });
    } catch (e) {}
  };

  // Add single participant directly
  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const handle = newUserHandle.trim()
      ? newUserHandle.trim().startsWith('@')
        ? newUserHandle.trim()
        : `@${newUserHandle.trim()}`
      : `@${newUserName.trim().toLowerCase().replace(/\s+/g, '_')}`;

    // Find next available ticket number
    const allTickets = ticketsMap[activeRaffle.id] || [];
    const available = allTickets.filter((t) => t.status === 'available');
    const nextTicketNum = available.length > 0 ? available[0].number : String(assignedTickets.length + 1).padStart(2, '0');

    await assignTicketDirectly(
      activeRaffle.id,
      nextTicketNum,
      newUserName.trim(),
      handle,
      '+57 300 000 0000',
      undefined,
      newUserAvatar || undefined
    );

    setNewUserName('');
    setNewUserHandle('');
    setNewUserAvatar('');
  };

  // Add bulk participants from list/textarea
  const handleAddBulkParticipants = async () => {
    if (!bulkNamesInput.trim()) return;
    const names = bulkNamesInput
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    const allTickets = ticketsMap[activeRaffle.id] || [];
    let availableTickets = allTickets.filter((t) => t.status === 'available');

    for (let i = 0; i < names.length; i++) {
      const nameRaw = names[i];
      const isHandle = nameRaw.startsWith('@');
      const userName = isHandle ? nameRaw.substring(1) : nameRaw;
      const userHandle = isHandle ? nameRaw : `@${nameRaw.toLowerCase().replace(/\s+/g, '_')}`;

      let tNum = String(assignedTickets.length + i + 1).padStart(2, '0');
      if (availableTickets.length > 0) {
        tNum = availableTickets[0].number;
        availableTickets = availableTickets.slice(1);
      }

      await assignTicketDirectly(activeRaffle.id, tNum, userName, userHandle, '+57 300 000 0000');
    }

    setBulkNamesInput('');
    setShowBulkModal(false);
  };

  // Upload product image from Phone camera / file picker
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setProductImage(dataUrl);
        }
        setIsUploadingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save product edit
  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateRaffle(activeRaffle.id, {
      title: productTitle,
      prizeImage: productImage,
      prizeValue: productValue,
    });
    setShowEditProductModal(false);
  };

  // Start Ruleta Spin physics
  const spinRuleta = () => {
    if (!isAdminMode) {
      alert('Acceso restringido: Solo el Administrador puede girar la ruleta.');
      return;
    }
    if (assignedTickets.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setWinnerTicket(null);

    // Notify background music player to pause during spin
    window.dispatchEvent(new CustomEvent('bg-music:spin-start'));

    // Pick random index among current participants
    const randomIndex = Math.floor(Math.random() * assignedTickets.length);
    const selectedWinner = assignedTickets[randomIndex];

    const numSlices = assignedTickets.length;
    const sliceAngle = 360 / numSlices;
    const winnerAngleCenter = randomIndex * sliceAngle + sliceAngle / 2;

    // Pointer is fixed at top (270deg)
    const targetRotation = 360 * 6 + (270 - winnerAngleCenter);

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      playTickSound();
      if (tickCount > 38) clearInterval(tickInterval);
    }, 100);

    setWheelRotation((prev) => prev + targetRotation);

    setTimeout(() => {
      clearInterval(tickInterval);
      setWinnerTicket(selectedWinner);
      setIsSpinning(false);
      playFanfareSound();
      
      // Trigger background music celebration & voice announcement
      window.dispatchEvent(
        new CustomEvent('bg-music:spin-end', {
          detail: {
            winnerName: selectedWinner.participantName || 'Ganador',
            winnerNumber: selectedWinner.number,
          },
        })
      );

      confetti({
        particleCount: 160,
        spread: 95,
        origin: { y: 0.55 },
      });
    }, 4500);
  };

  // Render SVG Ruleta Wheel Slices
  const renderRuletaWheel = () => {
    const total = assignedTickets.length;
    if (total === 0) {
      return (
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-6 bg-gray-50/80 my-4 mx-auto shadow-inner">
          <Disc className="w-12 h-12 text-pink-400 mb-2 animate-bounce" />
          <p className="font-extrabold text-gray-700 text-sm">La ruleta está vacía</p>
          <p className="text-xs text-gray-500 mt-1">
            Escribe abajo el nombre de los usuarios para ponerlos en la ruleta.
          </p>
        </div>
      );
    }

    const sliceAngle = 360 / total;
    const radius = 145;
    const center = 150;

    return (
      <svg viewBox="0 0 300 300" className="w-full h-full max-w-[310px] sm:max-w-[370px] mx-auto drop-shadow-2xl">
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
            const textX = center + radius * 0.65 * Math.cos(midRad);
            const textY = center + radius * 0.65 * Math.sin(midRad);

            const color = SLICE_COLORS[index % SLICE_COLORS.length];
            const displayLabel = t.userHandle || t.userName;

            return (
              <g key={t.number}>
                <path d={pathData} fill={color} stroke="#ffffff" strokeWidth="2.5" />
                <g transform={`translate(${textX}, ${textY}) rotate(${midAngle + 90})`}>
                  <text
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={total > 15 ? '7' : total > 8 ? '8' : '10'}
                    fontWeight="900"
                    dy="3"
                  >
                    {displayLabel.length > 12 ? displayLabel.slice(0, 11) + '…' : displayLabel}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Wheel Outer Rim & Center Pin */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#f59e0b" strokeWidth="6" />
          <circle cx={center} cy={center} r="24" fill="#1e293b" stroke="#ffffff" strokeWidth="3" />
          <circle cx={center} cy={center} r="10" fill="#f59e0b" />
        </g>

        {/* Fixed Red Top Pointer */}
        <polygon
          points="150,2 140,26 160,26"
          fill="#ef4444"
          stroke="#ffffff"
          strokeWidth="2"
          filter="url(#shadow)"
        />
      </svg>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Product Banner & Edit Header */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img
              src={activeRaffle.prizeImage}
              alt={activeRaffle.title}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/60 shadow-lg shrink-0"
            />
            <div>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-black text-[11px] uppercase tracking-wider inline-flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-yellow-300" /> Sorteo con Ruleta
              </span>
              <h1 className="text-xl sm:text-2xl font-black mt-1 leading-tight">{activeRaffle.title}</h1>
              <p className="text-xs text-white/80 font-semibold mt-0.5">Premio: {activeRaffle.prizeValue}</p>
            </div>
          </div>

          {isAdminMode && (
            <button
              onClick={() => {
                setProductTitle(activeRaffle.title);
                setProductImage(activeRaffle.prizeImage);
                setProductValue(activeRaffle.prizeValue);
                setShowEditProductModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center gap-2 border border-white/30 transition shadow"
            >
              <Camera className="w-4 h-4" /> Cambiar Fotos / Producto
            </button>
          )}
        </div>
      </div>

      {/* MAIN RULETA INTERFACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: RULETA WHEEL DISPLAY */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-lg text-center space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Disc className="w-5 h-5 text-pink-600" />
              <h2 className="font-black text-gray-900 text-lg">Ruleta de Ganadores</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-800 font-extrabold text-xs">
              {assignedTickets.length} Participante(s)
            </span>
          </div>

          {/* Interactive Wheel Canvas Box */}
          <div className="p-3 bg-gradient-to-b from-gray-900 via-gray-800 to-slate-900 rounded-3xl border border-pink-500/30 shadow-2xl relative flex items-center justify-center">
            {renderRuletaWheel()}
          </div>

          {/* SPIN BUTTON */}
          <button
            onClick={spinRuleta}
            disabled={isSpinning || assignedTickets.length === 0}
            className={`w-full py-4 rounded-2xl font-black text-base shadow-xl transition flex items-center justify-center gap-2 ${
              isSpinning || assignedTickets.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-700 hover:to-amber-600 text-white shadow-pink-500/30 active:scale-95'
            }`}
          >
            {isSpinning ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                ¡GIRANDO LA RULETA DE LA SUERTE!
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                ¡GIRAR RULETA AHORA!
              </>
            )}
          </button>

          {/* WINNER ANNOUNCEMENT */}
          {winnerTicket && (
            <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl text-white text-center animate-in zoom-in-95 space-y-2 shadow-xl">
              <div className="text-xs font-black uppercase tracking-widest text-emerald-100 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-300" /> ¡GANADOR SELECCIONADO POR LA RULETA!
              </div>
              <div className="flex items-center justify-center gap-3">
                {winnerTicket.userAvatar ? (
                  <img
                    src={winnerTicket.userAvatar}
                    alt={winnerTicket.userName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : null}
                <div>
                  <h3 className="font-black text-2xl sm:text-3xl">{winnerTicket.userName}</h3>
                  <p className="text-sm font-bold text-yellow-200">
                    Usuario: {winnerTicket.userHandle || '@usuario'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PARTICIPANTS LIST & ADMIN CONTROLS */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h2 className="font-black text-gray-900 text-lg">
                {isAdminMode ? 'Colocar Participantes' : 'Lista de Participantes'}
              </h2>
            </div>
            {isAdminMode ? (
              <button
                onClick={() => setShowBulkModal(true)}
                className="text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 px-2.5 py-1 rounded-xl transition"
              >
                + Pegar Varios
              </button>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                100% Sin Registro
              </span>
            )}
          </div>

          {/* Quick Add Form (Admin Only) */}
          {isAdminMode && (
            <form onSubmit={handleAddParticipant} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre o Usuario para la Ruleta:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ej. @maria_lopez o Juan Perez"
                    className="flex-1 px-3.5 py-2.5 rounded-2xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow transition shrink-0"
                  >
                    <UserPlus className="w-4 h-4" /> Agregar
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* PARTICIPANTS LIST ON THE WHEEL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-1">
              <span>Nombres en la Ruleta ({assignedTickets.length}):</span>
              {isAdminMode && assignedTickets.length > 0 && (
                <button
                  onClick={async () => {
                    for (const t of assignedTickets) {
                      await unassignTicket(activeRaffle.id, t.number);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  Vaciar Todo
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {assignedTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  {isAdminMode
                    ? 'Aún no hay participantes puestos. Escribe arriba para colocarlos.'
                    : 'La ruleta está lista. El administrador colocará los participantes.'}
                </div>
              ) : (
                assignedTickets.map((t) => (
                  <div
                    key={t.number}
                    className="p-3 bg-gray-50 hover:bg-pink-50/50 rounded-2xl border border-gray-200/80 flex items-center justify-between text-xs transition"
                  >
                    {isAdminMode && editingTicketNumber === t.number ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 rounded-lg border border-pink-400 text-xs font-bold"
                        />
                        <button
                          onClick={async () => {
                            await updateTicketParticipant(activeRaffle.id, t.number, editName, editName);
                            setEditingTicketNumber(null);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingTicketNumber(null)}
                          className="p-1.5 rounded-lg bg-gray-200 text-gray-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          {t.userAvatar ? (
                            <img
                              src={t.userAvatar}
                              alt={t.userName}
                              className="w-8 h-8 rounded-full object-cover border border-pink-300 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                              {t.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 leading-tight">{t.userName}</div>
                            <div className="text-[10px] text-pink-600 font-bold">{t.userHandle}</div>
                          </div>
                        </div>

                        {isAdminMode && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingTicketNumber(t.number);
                                setEditName(t.userName);
                                setEditHandle(t.userHandle || '');
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-pink-600 hover:bg-white"
                              title="Editar usuario"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => unassignTicket(activeRaffle.id, t.number)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white"
                              title="Quitar de la ruleta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BULK ADD NAMES MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 border border-pink-100 space-y-4">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Pegar Lista de Usuarios</h3>
                <p className="text-xs text-gray-500">Pega los nombres separados por comas o saltos de línea.</p>
              </div>
            </div>

            <textarea
              rows={5}
              value={bulkNamesInput}
              onChange={(e) => setBulkNamesInput(e.target.value)}
              placeholder="Ejemplo:&#10;@maria_01&#10;Carlos Perez&#10;@juan_99, @pedro"
              className="w-full p-3 rounded-2xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddBulkParticipants}
                className="flex-1 py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-lg shadow-pink-600/30"
              >
                Cargar en Ruleta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT / FOTO MODAL */}
      {showEditProductModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 border border-amber-100 space-y-4">
            <button
              onClick={() => setShowEditProductModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Editar Producto Rifado</h3>
                <p className="text-xs text-gray-500">Sube la foto del premio desde tu celular o computadora.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Producto / Premio:</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Foto del Producto:</label>
                <div className="space-y-2">
                  <label className="w-full py-3 px-4 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition">
                    <Camera className="w-4 h-4 text-pink-600" />
                    <span>{isUploadingImage ? 'Procesando Foto...' : 'Subir Imagen desde Celular / Cámara'}</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>

                  {productImage && (
                    <div className="h-32 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={productImage} alt="Premio" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Valor / Descripción Corta:</label>
                <input
                  type="text"
                  value={productValue}
                  onChange={(e) => setProductValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProductModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
