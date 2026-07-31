import React, { useState } from 'react';
import { Raffle } from '../types/raffle';
import { useRaffle } from '../context/RaffleContext';
import {
  X,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Share2,
  Heart,
  Users,
  Sparkles,
  Gift,
  AlertCircle,
  Copy,
  Check,
  Camera,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface ParticipationModalProps {
  raffle: Raffle;
  preSelectedTicketNumber?: string;
  onClose: () => void;
  onSuccess: (ticketNumber: string) => void;
}

export const ParticipationModal: React.FC<ParticipationModalProps> = ({
  raffle,
  preSelectedTicketNumber,
  onClose,
  onSuccess,
}) => {
  const { submitParticipationRequest, userProfile, socialLinks, ticketsMap } = useRaffle();
  const availableTickets = (ticketsMap[raffle.id] || []).filter((t) => t.status === 'available');

  // Steps: 1 = Checklist, 2 = User Info & Ticket, 3 = Ticket Assigned Success Card
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Requirements state checklist
  const [whatsappJoined, setWhatsappJoined] = useState(false);
  const [socialsFollowed, setSocialsFollowed] = useState(false);
  const [postLiked, setPostLiked] = useState(false);
  const [postShared, setPostShared] = useState(false);

  // Tagged friends state
  const [friend1, setFriend1] = useState('');
  const [friend2, setFriend2] = useState('');

  // Screenshot proof state (multiple photos supported)
  const [proofScreenshots, setProofScreenshots] = useState<string[]>([]);

  // User details
  const [userName, setUserName] = useState(userProfile.name || '');
  const [userEmail, setUserEmail] = useState(userProfile.email || '');
  const [userHandle, setUserHandle] = useState(userProfile.socialHandle || '');
  const [selectedTicketNumber, setSelectedTicketNumber] = useState(
    preSelectedTicketNumber || (availableTickets[0]?.number || '')
  );

  const [errorMessage, setErrorMessage] = useState('');
  const [assignedTicket, setAssignedTicket] = useState('');
  const [copied, setCopied] = useState(false);

  // Required tagged friends count from raffle config (default 2)
  const requiredTagsCount =
    raffle.requirements.find((r) => r.type === 'comment_tag_friends')?.requiredTagCount || 2;

  const handleOpenLink = (url: string, onVisit: () => void) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onVisit();
  };

  const isStep1Valid =
    whatsappJoined &&
    socialsFollowed &&
    postLiked &&
    postShared &&
    friend1.trim().length >= 2 &&
    friend2.trim().length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!userName.trim() || !userHandle.trim()) {
      setErrorMessage('Por favor completa tu nombre de usuario y tu cuenta de redes sociales.');
      return;
    }

    const res = submitParticipationRequest(raffle.id, {
      userName: userName.trim(),
      userPhone: '',
      userEmail,
      userHandle: userHandle.trim().startsWith('@') ? userHandle.trim() : `@${userHandle.trim()}`,
      preferredTicketNumber: selectedTicketNumber || undefined,
      whatsappJoined,
      socialsFollowed,
      postLiked,
      postShared,
      commentUrl: 'https://instagram.com/p/variedades_cs_post',
      taggedFriends: [friend1.trim(), friend2.trim()],
      proofScreenshot: proofScreenshots[0] || undefined,
      proofScreenshots: proofScreenshots.length > 0 ? proofScreenshots : undefined,
    });

    if (res.success && res.ticketNumber) {
      setAssignedTicket(res.ticketNumber);
      setStep(3);
      onSuccess(res.ticketNumber);
    } else {
      setErrorMessage(res.message);
    }
  };

  const copyTicketDetails = () => {
    navigator.clipboard.writeText(
      `¡Tengo el boleto #${assignedTicket} para la rifa del ${raffle.title} en Variedades CS Rifas! 100% Gratis.`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 border-b border-gray-100 pb-4">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
            <Gift className="w-4 h-4" /> Rifas Gratuitas Variedades CS
          </span>
          <h2 className="font-black text-gray-900 text-xl md:text-2xl mt-1">{raffle.title}</h2>
          <p className="text-xs text-gray-500 mt-1">
            Paso {step} de 3 • Asignación de boleto en tiempo real
          </p>
        </div>

        {/* STEP 1: Checklist of Requirements */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Instrucciones de Verificación:</strong>
                Haz clic en cada botón para abrir los enlaces oficiales y confirmar que has cumplido el requisito.
              </div>
            </div>

            <div className="space-y-3">
              {/* Requirement 1: WhatsApp */}
              <div
                className={`p-3.5 rounded-2xl border transition ${
                  whatsappJoined ? 'bg-emerald-50/60 border-emerald-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">1. Unirse al WhatsApp Oficial</p>
                      <p className="text-[11px] text-gray-500">Comunidad de Variedades CS</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenLink(
                        socialLinks.find((s) => s.platform === 'whatsapp')?.url || 'https://whatsapp.com',
                        () => setWhatsappJoined(true)
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      whatsappJoined
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {whatsappJoined ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cumplido
                      </>
                    ) : (
                      <>
                        Abrir y Cumplir <ExternalLink className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Requirement 2: Follow Social Media */}
              <div
                className={`p-3.5 rounded-2xl border transition ${
                  socialsFollowed ? 'bg-emerald-50/60 border-emerald-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        2. Seguir en FB, Instagram, TikTok y YouTube
                      </p>
                      <p className="text-[11px] text-gray-500">Páginas oficiales de Variedades CS</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenLink('https://instagram.com/variedades_cs', () => setSocialsFollowed(true))
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      socialsFollowed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                    }`}
                  >
                    {socialsFollowed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cumplido
                      </>
                    ) : (
                      <>
                        Seguir Redes <ExternalLink className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Requirement 3: Like Post */}
              <div
                className={`p-3.5 rounded-2xl border transition ${
                  postLiked ? 'bg-emerald-50/60 border-emerald-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">3. Dar "Me Gusta" a la Publicación</p>
                      <p className="text-[11px] text-gray-500">Imagen de la rifa en redes</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenLink('https://facebook.com/variedadesCSoficial', () => setPostLiked(true))
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      postLiked
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {postLiked ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cumplido
                      </>
                    ) : (
                      <>
                        Dar Me Gusta <ExternalLink className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Requirement 4: Share Post */}
              <div
                className={`p-3.5 rounded-2xl border transition ${
                  postShared ? 'bg-emerald-50/60 border-emerald-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-5 h-5 text-teal-600" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">4. Compartir la Publicación</p>
                      <p className="text-[11px] text-gray-500">En perfil público o historias</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenLink('https://facebook.com/variedadesCSoficial', () => setPostShared(true))
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      postShared
                        ? 'bg-emerald-600 text-white'
                        : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                    }`}
                  >
                    {postShared ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Compartido
                      </>
                    ) : (
                      <>
                        Compartir <ExternalLink className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Requirement 5: Tag Friends */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <Users className="w-4 h-4 text-emerald-600" />
                  5. Etiquetar {requiredTagsCount} o más amigos en los comentarios:
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={friend1}
                    onChange={(e) => setFriend1(e.target.value)}
                    placeholder="@amigo1"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={friend2}
                    onChange={(e) => setFriend2(e.target.value)}
                    placeholder="@amigo2"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Requirement 6: Upload Screenshots of Steps (Multiple Photos Supported) */}
              <div
                className={`p-3.5 rounded-2xl border transition space-y-3 ${
                  proofScreenshots.length > 0 ? 'bg-pink-50/70 border-pink-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-5 h-5 text-pink-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        6. Adjuntar Capturas de Pantalla de los Pasos ({proofScreenshots.length} {proofScreenshots.length === 1 ? 'Foto' : 'Fotos'})
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Sube una o varias fotos desde tu celular confirmando cada paso (WhatsApp, Seguir, Me Gusta, Compartir)
                      </p>
                    </div>
                  </div>
                  <label className="w-full sm:w-auto px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow transition shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{proofScreenshots.length > 0 ? '+ Agregar Otra Captura' : 'Subir Capturas de Pantalla'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const fileList = e.target.files;
                        if (!fileList || fileList.length === 0) return;
                        const files: File[] = Array.from(fileList);
                        
                        files.forEach((file: File) => {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setProofScreenshots((prev) => [...prev, ev.target!.result as string]);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                        e.target.value = ''; // reset file input
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {proofScreenshots.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    {proofScreenshots.map((imgSrc, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-pink-200 bg-black/5 group shadow-sm">
                        <img
                          src={imgSrc}
                          alt={`Captura ${idx + 1}`}
                          className="w-full h-28 object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Foto #{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProofScreenshots((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs shadow transition"
                          title="Eliminar esta foto"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 ${
                isStep1Valid
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continuar a Registro de Nombre de Usuario →
            </button>
          </div>
        )}

        {/* STEP 2: User Username & Social Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tu Nombre de Usuario o Apodo:
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej. MariaGomez"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tu Usuario en Redes Sociales (Instagram / TikTok / Facebook):
              </label>
              <input
                type="text"
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                placeholder="Ej. @maria_gomez"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            {/* Ticket Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Selecciona tu Número Deseado:
              </label>
              <select
                value={selectedTicketNumber}
                onChange={(e) => setSelectedTicketNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {availableTickets.length === 0 ? (
                  <option value="">No hay números disponibles</option>
                ) : (
                  availableTickets.map((t) => (
                    <option key={t.number} value={t.number}>
                      Boleto #{t.number} (Disponible)
                    </option>
                  ))
                )}
              </select>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs"
              >
                ← Volver
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition"
              >
                Confirmar y Obtener Boleto Gratis
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Ticket Assigned Card Celebration */}
        {step === 3 && (
          <div className="text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-extrabold text-gray-900 text-2xl">¡Boleto Asignado con Éxito!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Tus requisitos fueron confirmados de forma transparente.
              </p>
            </div>

            {/* Digital Ticket Badge */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden border border-emerald-400/30">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-200">
                VARIEDADES CS RIFAS
              </div>
              <div className="my-3 py-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                <span className="text-[11px] block text-emerald-100 font-medium">TU NÚMERO DE RIFA</span>
                <span className="font-mono text-4xl font-extrabold tracking-wider text-yellow-300">
                  #{assignedTicket}
                </span>
              </div>
              <div className="text-xs text-emerald-100 space-y-0.5">
                <p className="font-bold truncate">{raffle.title}</p>
                <p className="text-[11px] opacity-80">Titular: {userName}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyTicketDetails}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? '¡Copiado!' : 'Copiar Boleto'}
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
              >
                Entendido y Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
