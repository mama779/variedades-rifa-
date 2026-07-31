import React, { useState } from 'react';
import { useRaffle } from '../../context/RaffleContext';
import { Raffle, SocialLink, ParticipationRequirement, Ticket, WinnerHistoryItem } from '../../types/raffle';
import { Logo } from '../Logo';
import { WinnerEmailModal } from '../WinnerEmailModal';
import { NewRaffleEmailModal } from '../NewRaffleEmailModal';
import {
  Trophy,
  Gift,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Pause,
  Play,
  Share2,
  MessageCircle,
  ShieldCheck,
  Settings,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Search,
  Check,
  X,
  PlusCircle,
  Mail,
  Camera,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  Disc,
  Copy,
  Link,
  UserPlus,
  Edit2,
  Music,
  Volume2,
  Radio,
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
  onLaunchDrawForRaffle: (raffle: Raffle) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onLaunchDrawForRaffle,
}) => {
  const {
    raffles,
    ticketsMap,
    socialLinks,
    verificationRequests,
    winnersHistory,
    autoApproveMode,
    setAutoApproveMode,
    approveVerificationRequest,
    rejectVerificationRequest,
    assignTicketDirectly,
    updateTicketParticipant,
    unassignTicket,
    addWinnerHistory,
    deleteWinnerHistory,
    createRaffle,
    updateRaffle,
    deleteRaffle,
    pauseRaffle,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    resetSystemData,
    musicTracks,
    activeTrackId,
    setActiveTrackId,
    addMusicTrack,
    deleteMusicTrack,
  } = useRaffle();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'ruleta' | 'stats' | 'raffles' | 'verifications' | 'socials' | 'draw' | 'winners' | 'settings' | 'music'
  >('ruleta');

  // Music upload state
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackGenre, setNewTrackGenre] = useState('Personalizada');
  const [newTrackAudioUrl, setNewTrackAudioUrl] = useState('');
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Ruleta Admin Direct Management State
  const [ruletaUserName, setRuletaUserName] = useState('');
  const [ruletaUserHandle, setRuletaUserHandle] = useState('');
  const [ruletaUserAvatar, setRuletaUserAvatar] = useState('');
  const [ruletaBulkInput, setRuletaBulkInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [editingRuletaTicketNum, setEditingRuletaTicketNum] = useState<string | null>(null);
  const [editRuletaName, setEditRuletaName] = useState('');

  // Add Real Winner with Comment Screenshot State
  const [showAddWinnerModal, setShowAddWinnerModal] = useState(false);
  const [wWinnerName, setWWinnerName] = useState('');
  const [wPrizeTitle, setWPrizeTitle] = useState('');
  const [wPrizeValue, setWPrizeValue] = useState('');
  const [wPrizeImage, setWPrizeImage] = useState('');
  const [wUserAvatar, setWUserAvatar] = useState('');
  const [wProofImage, setWProofImage] = useState('');
  const [wProofUrl, setWProofUrl] = useState('');
  const [wTestimonial, setWTestimonial] = useState('');

  // Direct Ticket Assignment State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<{
    raffleId: string;
    ticketNumber: string;
    userName: string;
    userHandle: string;
    userPhone: string;
  } | null>(null);
  const [assignRaffleId, setAssignRaffleId] = useState('');
  const [assignTicketNumber, setAssignTicketNumber] = useState('');
  const [assignUserName, setAssignUserName] = useState('');
  const [assignUserHandle, setAssignUserHandle] = useState('');
  const [assignUserPhone, setAssignUserPhone] = useState('');
  const [assignUserEmail, setAssignUserEmail] = useState('');
  const [assignMessage, setAssignMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Winner Email Modal State
  const [selectedWinnerForEmail, setSelectedWinnerForEmail] = useState<WinnerHistoryItem | null>(null);
  // New Raffle Email Modal State
  const [selectedRaffleForEmail, setSelectedRaffleForEmail] = useState<Raffle | null>(null);

  // Raffle Delete Confirmation Modal State
  const [deletingRaffle, setDeletingRaffle] = useState<Raffle | null>(null);

  // Raffle Form Modal State
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);

  // Form Fields for Raffle Creation/Editing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizeValue, setPrizeValue] = useState('');
  const [prizeImage, setPrizeImage] = useState('');
  const [category, setCategory] = useState<Raffle['category']>('Tecnología');
  const [totalNumbers, setTotalNumbers] = useState(100);
  const [digits, setDigits] = useState(2);
  const [drawDate, setDrawDate] = useState('');
  const [maxTicketsPerUser, setMaxTicketsPerUser] = useState(1);
  const [tagCountRequired, setTagCountRequired] = useState(2);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Social Link Form State
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socName, setSocName] = useState('');
  const [socPlatform, setSocPlatform] = useState<SocialLink['platform']>('facebook');
  const [socUrl, setSocUrl] = useState('');
  const [socLabel, setSocLabel] = useState('');

  // Rejection Reason Modal
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Handle image upload from camera or file picker (phone & desktop)
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
          setPrizeImage(dataUrl);
        }
        setIsUploadingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Calculate stats
  const totalRaffles = raffles.length;
  const activeRafflesCount = raffles.filter((r) => r.status === 'active').length;
  let totalTicketsAssigned = 0;
  (Object.values(ticketsMap) as Ticket[][]).forEach((tickets) => {
    totalTicketsAssigned += tickets.filter((t) => t.status === 'assigned').length;
  });
  const pendingRequestsCount = verificationRequests.filter((r) => r.status === 'pending').length;

  // Open Raffle Form
  const handleOpenRaffleModal = (raffle?: Raffle) => {
    if (raffle) {
      setEditingRaffle(raffle);
      setTitle(raffle.title);
      setDescription(raffle.description);
      setPrizeValue(raffle.prizeValue);
      setPrizeImage(raffle.prizeImage);
      setCategory(raffle.category);
      setTotalNumbers(raffle.totalNumbers);
      setDigits(raffle.digits);
      setDrawDate(raffle.drawDate.slice(0, 16));
      setMaxTicketsPerUser(raffle.maxTicketsPerUser);
    } else {
      setEditingRaffle(null);
      setTitle('');
      setDescription('');
      setPrizeValue('');
      setPrizeImage('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop');
      setCategory('Tecnología');
      setTotalNumbers(100);
      setDigits(2);
      const future = new Date();
      future.setDate(future.getDate() + 5);
      setDrawDate(future.toISOString().slice(0, 16));
      setMaxTicketsPerUser(1);
    }
    setShowRaffleModal(true);
  };

  const handleSaveRaffle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prizeValue.trim()) return;

    if (editingRaffle) {
      updateRaffle(editingRaffle.id, {
        title,
        description,
        prizeValue,
        prizeImage,
        category,
        totalNumbers,
        digits,
        drawDate: new Date(drawDate).toISOString(),
        maxTicketsPerUser,
      });
    } else {
      createRaffle({
        title,
        description,
        prizeValue,
        prizeImage,
        category,
        totalNumbers,
        digits,
        drawDate: new Date(drawDate).toISOString(),
        maxTicketsPerUser,
        requirements: [
          {
            id: 'req-wa',
            type: 'whatsapp_group',
            title: 'Unirse al WhatsApp de Variedades CS',
            description: 'Comunidad oficial de rifas y ofertas',
            url: socialLinks.find((s) => s.platform === 'whatsapp')?.url || 'https://whatsapp.com',
            isMandatory: true,
          },
          {
            id: 'req-soc',
            type: 'follow_instagram',
            title: 'Seguir Redes Oficiales',
            description: 'Facebook, Instagram, TikTok y YouTube',
            url: 'https://instagram.com/variedades_cs',
            isMandatory: true,
          },
          {
            id: 'req-like',
            type: 'like_post',
            title: 'Dar Me Gusta a la Publicación',
            description: 'Dar Me Gusta a la imagen oficial del sorteo',
            url: 'https://instagram.com/variedades_cs',
            isMandatory: true,
          },
          {
            id: 'req-share',
            type: 'share_post',
            title: 'Compartir la Publicación',
            description: 'Compartir en tu perfil o historias',
            url: 'https://facebook.com/variedadesCSoficial',
            isMandatory: true,
          },
          {
            id: 'req-tag',
            type: 'comment_tag_friends',
            title: `Comentar etiquetando a ${tagCountRequired} o más amigos`,
            description: 'Mencionar a amigos reales en los comentarios',
            url: 'https://instagram.com/variedades_cs',
            isMandatory: true,
            requiredTagCount: tagCountRequired,
          },
        ],
      });
    }
    setShowRaffleModal(false);
  };

  const handleSaveSocialLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socName.trim() || !socUrl.trim()) return;

    addSocialLink({
      name: socName,
      platform: socPlatform,
      url: socUrl,
      label: socLabel || socName,
      isActive: true,
    });
    setShowSocialModal(false);
    setSocName('');
    setSocUrl('');
    setSocLabel('');
  };

  const handleConfirmReject = () => {
    if (rejectingRequestId && rejectionReason.trim()) {
      rejectVerificationRequest(rejectingRequestId, rejectionReason);
      setRejectingRequestId(null);
      setRejectionReason('');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl max-w-6xl w-full mx-auto shadow-2xl overflow-hidden border border-gray-100 flex flex-col min-h-[85vh]">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-pink-950 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <Logo size="lg" showText={true} lightMode={true} />
            <div className="h-8 w-px bg-gray-700 hidden sm:block" />
            <span className="text-xs font-bold text-pink-400 uppercase tracking-widest hidden sm:inline">
              Panel de Administración Profesional
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/10"
            >
              Cerrar Panel
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 overflow-x-auto flex items-center gap-2">
          <button
            onClick={() => setActiveAdminTab('ruleta')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'ruleta'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-200/60 font-black'
            }`}
          >
            <Disc className="w-4 h-4 text-pink-300" /> 🎮 Editar Ruleta y Participantes
          </button>

          <button
            onClick={() => setActiveAdminTab('stats')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'stats'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Estadísticas
          </button>

          <button
            onClick={() => setActiveAdminTab('raffles')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'raffles'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <Gift className="w-4 h-4" /> Gestión de Rifas ({raffles.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('verifications')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 relative ${
              activeAdminTab === 'verifications'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> Verificación de Requisitos
            {pendingRequestsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('socials')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'socials'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <Share2 className="w-4 h-4" /> Redes Sociales ({socialLinks.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('draw')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'draw'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <Trophy className="w-4 h-4" /> Ejecutar Sorteos
          </button>

          <button
            onClick={() => setActiveAdminTab('winners')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'winners'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <Mail className="w-4 h-4" /> Notificar Ganadores ({winnersHistory.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('music')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'music'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200/60 font-black'
            }`}
          >
            <Music className="w-4 h-4 text-pink-300" /> 🎵 Música de Fondo ({musicTracks.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 ${
              activeAdminTab === 'settings'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200/60'
            }`}
          >
            <Settings className="w-4 h-4" /> Configuración
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* TAB 0: RULETA DIRECTA Y PARTICIPANTES (ADMIN SECCIONES) */}
          {activeAdminTab === 'ruleta' && (
            <div className="space-y-6">
              {/* Secret Link Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-900 via-pink-950 to-purple-950 text-white border border-pink-500/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-pink-400 text-xs font-black uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> Enlace Secreto de Administrador (Escondido)
                  </div>
                  <p className="text-xs text-gray-300">
                    Solo quien tenga este enlace con <code className="text-pink-300 font-mono font-bold">?admin=true</code> podrá ver el panel y editar los nombres.
                  </p>
                  <p className="text-xs font-mono bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-pink-200 select-all">
                    {window.location.origin}{window.location.pathname}?admin=true
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?admin=true`);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-2 transition shadow shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  {copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace Secreto'}
                </button>
              </div>

              {/* Product Info & Photo Manager */}
              {raffles[0] && (
                <div className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                      <Camera className="w-5 h-5 text-pink-600" /> Producto y Foto de la Ruleta
                    </h3>
                    <span className="text-xs text-gray-400 font-medium">Rifa Principal Activa</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-4">
                      <img
                        src={raffles[0].prizeImage}
                        alt={raffles[0].title}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-100 shadow-md shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{raffles[0].title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Premio: {raffles[0].prizeValue}</p>
                        <p className="text-[11px] text-pink-600 font-semibold mt-1">
                          Categoría: {raffles[0].category}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Título del Producto:</label>
                          <input
                            type="text"
                            value={raffles[0].title}
                            onChange={(e) => updateRaffle(raffles[0].id, { title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Valor / Descripción Premio:</label>
                          <input
                            type="text"
                            value={raffles[0].prizeValue}
                            onChange={(e) => updateRaffle(raffles[0].id, { prizeValue: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Subir o Cambiar Foto del Producto:</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={raffles[0].prizeImage}
                            onChange={(e) => updateRaffle(raffles[0].id, { prizeImage: e.target.value })}
                            placeholder="URL de imagen..."
                            className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
                          />
                          <label className="px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-pink-200 transition shrink-0">
                            <Upload className="w-4 h-4" />
                            <span>{isUploadingImage ? 'Cargando...' : 'Camara / Galería'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploadingImage(true);
                                const reader = new FileReader();
                                reader.onload = async (ev) => {
                                  const dataUrl = ev.target?.result as string;
                                  await updateRaffle(raffles[0].id, { prizeImage: dataUrl });
                                  setIsUploadingImage(false);
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Participant Addition & Management Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Participants */}
                <div className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
                    <UserPlus className="w-4 h-4 text-emerald-600" /> Ingresar Nombres de Participantes
                  </h3>

                  {/* Single Add */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!ruletaUserName.trim() || !raffles[0]) return;
                      const handle = ruletaUserHandle.trim()
                        ? ruletaUserHandle.trim().startsWith('@') ? ruletaUserHandle.trim() : `@${ruletaUserHandle.trim()}`
                        : `@${ruletaUserName.trim().toLowerCase().replace(/\s+/g, '_')}`;

                      const currentTickets = ticketsMap[raffles[0].id] || [];
                      const available = currentTickets.filter(t => t.status === 'available');
                      const assignedCount = currentTickets.filter(t => t.status === 'assigned').length;
                      const nextNum = available.length > 0 ? available[0].number : String(assignedCount + 1).padStart(2, '0');

                      await assignTicketDirectly(
                        raffles[0].id,
                        nextNum,
                        ruletaUserName.trim(),
                        handle,
                        '+57 300 000 0000',
                        undefined,
                        ruletaUserAvatar || undefined
                      );
                      setRuletaUserName('');
                      setRuletaUserHandle('');
                      setRuletaUserAvatar('');
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo o Usuario:</label>
                      <input
                        type="text"
                        value={ruletaUserName}
                        onChange={(e) => setRuletaUserName(e.target.value)}
                        placeholder="Ej. Maria Lopez"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Handle / Instagram (Opcional):</label>
                      <input
                        type="text"
                        value={ruletaUserHandle}
                        onChange={(e) => setRuletaUserHandle(e.target.value)}
                        placeholder="Ej. @maria_lopez"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Foto de Perfil del Participante (Cargar de Celular):</label>
                      <div className="flex items-center gap-2">
                        {ruletaUserAvatar ? (
                          <img
                            src={ruletaUserAvatar}
                            alt="Avatar"
                            className="w-9 h-9 rounded-full object-cover border border-pink-300 shadow-sm"
                          />
                        ) : null}
                        <label className="px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-pink-200 transition">
                          <Camera className="w-4 h-4" />
                          <span>{ruletaUserAvatar ? 'Cambiar Foto' : 'Cargar Foto de Perfil'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setRuletaUserAvatar(ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="hidden"
                          />
                        </label>
                        {ruletaUserAvatar && (
                          <button
                            type="button"
                            onClick={() => setRuletaUserAvatar('')}
                            className="text-xs text-red-500 hover:underline font-bold"
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition"
                    >
                      <UserPlus className="w-4 h-4" /> Agregar Participante con Foto a la Ruleta
                    </button>
                  </form>

                  {/* Bulk Add */}
                  <div className="pt-3 border-t border-gray-100 space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Agregar Lista en Bloque (Pegar nombres):</label>
                    <textarea
                      rows={3}
                      value={ruletaBulkInput}
                      onChange={(e) => setRuletaBulkInput(e.target.value)}
                      placeholder="Pegar nombres separados por coma o por línea: Juan Perez, @ana_gomez, Carlos..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={async () => {
                        if (!ruletaBulkInput.trim() || !raffles[0]) return;
                        const names = ruletaBulkInput.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
                        const allTickets = ticketsMap[raffles[0].id] || [];
                        let availableTickets = allTickets.filter(t => t.status === 'available');
                        const assignedCount = allTickets.filter(t => t.status === 'assigned').length;

                        for (let i = 0; i < names.length; i++) {
                          const n = names[i];
                          const isH = n.startsWith('@');
                          const uName = isH ? n.substring(1) : n;
                          const uHandle = isH ? n : `@${n.toLowerCase().replace(/\s+/g, '_')}`;
                          let tNum = String(assignedCount + i + 1).padStart(2, '0');
                          if (availableTickets.length > 0) {
                            tNum = availableTickets[0].number;
                            availableTickets = availableTickets.slice(1);
                          }
                          await assignTicketDirectly(raffles[0].id, tNum, uName, uHandle, '+57 300 000 0000');
                        }
                        setRuletaBulkInput('');
                      }}
                      className="w-full py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      + Procesar e Inscribir Lista en Bloque
                    </button>
                  </div>
                </div>

                {/* Participant List Management */}
                <div className="p-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-600" /> Lista de Participantes (Ruleta)
                    </h3>
                    {raffles[0] && (ticketsMap[raffles[0].id] || []).filter(t => t.status === 'assigned').length > 0 && (
                      <button
                        onClick={async () => {
                          if (!raffles[0]) return;
                          const assigned = (ticketsMap[raffles[0].id] || []).filter(t => t.status === 'assigned');
                          for (const t of assigned) {
                            await unassignTicket(raffles[0].id, t.number);
                          }
                        }}
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        Vaciar Ruleta
                      </button>
                    )}
                  </div>

                  <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                    {!raffles[0] || (ticketsMap[raffles[0].id] || []).filter(t => t.status === 'assigned').length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        No hay participantes asignados en la ruleta.
                      </div>
                    ) : (
                      (ticketsMap[raffles[0].id] || [])
                        .filter(t => t.status === 'assigned')
                        .map((t) => (
                          <div
                            key={t.number}
                            className="p-3 bg-gray-50 hover:bg-pink-50/50 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs transition"
                          >
                            {editingRuletaTicketNum === t.number ? (
                              <div className="flex items-center gap-2 w-full">
                                <input
                                  type="text"
                                  value={editRuletaName}
                                  onChange={(e) => setEditRuletaName(e.target.value)}
                                  className="flex-1 px-2 py-1 rounded-lg border border-pink-400 text-xs font-bold"
                                />
                                <button
                                  onClick={async () => {
                                    if (raffles[0]) {
                                      await updateTicketParticipant(raffles[0].id, t.number, editRuletaName, editRuletaName);
                                    }
                                    setEditingRuletaTicketNum(null);
                                  }}
                                  className="p-1.5 rounded-lg bg-emerald-600 text-white"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingRuletaTicketNum(null)}
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
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                                      {t.userName.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-gray-900 leading-tight">{t.userName}</div>
                                    <div className="text-[10px] text-pink-600 font-bold">{t.userHandle}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingRuletaTicketNum(t.number);
                                      setEditRuletaName(t.userName);
                                    }}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-pink-600 hover:bg-white"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => raffles[0] && unassignTicket(raffles[0].id, t.number)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: STATS */}
          {activeAdminTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Rifas Activas</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{activeRafflesCount}</p>
                  <p className="text-[11px] text-emerald-700 mt-1">Total creadas: {totalRaffles}</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200">
                  <p className="text-xs font-bold text-indigo-800 uppercase tracking-widest">Boletos Asignados</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{totalTicketsAssigned}</p>
                  <p className="text-[11px] text-indigo-700 mt-1">En todas las rifas</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">Ganadores Registrados</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">{winnersHistory.length}</p>
                  <p className="text-[11px] text-amber-700 mt-1">Premios entregados</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <p className="text-xs font-bold text-purple-800 uppercase tracking-widest">Modo Asignación</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {autoApproveMode ? 'Instantánea (Auto)' : 'Manual (Revisión)'}
                  </p>
                  <p className="text-[11px] text-purple-700 mt-1">Verificación automática activa</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">¿Deseas lanzar una nueva rifa gratuita?</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Configura el premio, la fecha y los requisitos fácilmente.</p>
                </div>
                <button
                  onClick={() => handleOpenRaffleModal()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Crear Nueva Rifa
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RAFFLES MANAGER */}
          {activeAdminTab === 'raffles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-gray-900 text-lg">Todas las Rifas Creadas</h3>
                <button
                  onClick={() => handleOpenRaffleModal()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Crear Rifa
                </button>
              </div>

              <div className="space-y-3">
                {raffles.map((r) => {
                  const tickets = ticketsMap[r.id] || [];
                  const assigned = tickets.filter((t) => t.status === 'assigned').length;

                  return (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-gray-300 transition"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img
                          src={r.prizeImage}
                          alt={r.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-gray-900 text-sm">{r.title}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 text-gray-700 uppercase">
                              {r.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Valor: <strong>{r.prizeValue}</strong> • Asignados: <strong>{assigned}/{r.totalNumbers}</strong>
                          </p>
                          <p className="text-[11px] text-gray-400">
                            Sorteo: {new Date(r.drawDate).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => setSelectedRaffleForEmail(r)}
                          className="px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold transition text-xs flex items-center gap-1.5"
                          title="Anunciar por Gmail"
                        >
                          <Mail className="w-4 h-4 text-pink-600" />
                          <span className="hidden sm:inline">Notificar Gmail</span>
                        </button>
                        <button
                          onClick={() => pauseRaffle(r.id)}
                          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-xs font-bold"
                          title={r.status === 'paused' ? 'Reanudar' : 'Pausar'}
                        >
                          {r.status === 'paused' ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-amber-600" />}
                        </button>
                        <button
                          onClick={() => handleOpenRaffleModal(r)}
                          className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-xs font-bold"
                          title="Editar Rifa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingRaffle(r)}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition text-xs font-bold"
                          title="Eliminar Rifa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: VERIFICATION REQUESTS */}
          {activeAdminTab === 'verifications' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Solicitudes y Asignación Directa</h3>
                  <p className="text-xs text-gray-500">
                    Inspecciona solicitudes o asigna un número directamente introduciendo el nombre y usuario del participante.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAssignMessage(null);
                    setAssignRaffleId(raffles[0]?.id || '');
                    setAssignTicketNumber('');
                    setAssignUserName('');
                    setAssignUserHandle('');
                    setAssignUserPhone('');
                    setAssignUserEmail('');
                    setShowAssignModal(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
                >
                  <PlusCircle className="w-4 h-4" /> Asignar Número Directamente
                </button>
              </div>

              {verificationRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs bg-gray-50 rounded-2xl">
                  No hay solicitudes de verificación pendientes.
                </div>
              ) : (
                <div className="space-y-3">
                  {verificationRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <div>
                          <span className="text-xs font-bold text-emerald-600 uppercase">{req.raffleTitle}</span>
                          <h4 className="font-extrabold text-gray-900 text-sm">
                            {req.userName} ({req.userHandle}) • Tel: {req.userPhone}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              req.status === 'pending'
                                ? 'bg-amber-100 text-amber-900'
                                : req.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-red-100 text-red-900'
                            }`}
                          >
                            {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-50 p-2.5 rounded-xl text-gray-700">
                        <div>
                          WhatsApp: <strong>{req.requirementsAnswers.whatsappJoined ? '🟢 Sí' : '🔴 No'}</strong>
                        </div>
                        <div>
                          Redes Seguidas: <strong>{req.requirementsAnswers.socialsFollowed ? '🟢 Sí' : '🔴 No'}</strong>
                        </div>
                        <div>
                          Like & Share: <strong>{req.requirementsAnswers.postLiked ? '🟢 Sí' : '🔴 No'}</strong>
                        </div>
                        <div>
                          Etiquetados: <strong>{req.requirementsAnswers.taggedFriends.join(', ') || 'Ninguno'}</strong>
                        </div>
                      </div>

                      {/* Capturas de Pantalla Adjuntadas */}
                      {((req.requirementsAnswers.proofScreenshots && req.requirementsAnswers.proofScreenshots.length > 0) ||
                        req.requirementsAnswers.proofScreenshot) && (
                        <div className="bg-pink-50/60 p-2.5 rounded-xl border border-pink-200 space-y-2">
                          <span className="text-[11px] font-extrabold text-pink-700 flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5" /> Capturas de Pantalla de Pasos Adjuntadas por el Usuario (
                            {(req.requirementsAnswers.proofScreenshots?.length || 1)} foto
                            {(req.requirementsAnswers.proofScreenshots?.length || 1) > 1 ? 's' : ''}):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(req.requirementsAnswers.proofScreenshots || [req.requirementsAnswers.proofScreenshot!]).map(
                              (src, idx) => (
                                <a
                                  key={idx}
                                  href={src}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="relative rounded-lg overflow-hidden border border-pink-200 shadow-sm block hover:opacity-90 transition group"
                                >
                                  <img
                                    src={src}
                                    alt={`Captura ${idx + 1}`}
                                    className="w-full h-32 object-cover"
                                  />
                                  <div className="absolute bottom-1 left-1 bg-black/70 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
                                    Foto #{idx + 1}
                                  </div>
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {req.status === 'pending' && (
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => {
                              setRejectingRequestId(req.id);
                              setRejectionReason('Falta etiquetar amigos reales o seguir redes.');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 font-bold text-xs"
                          >
                            Rechazar
                          </button>
                          <button
                            onClick={() => approveVerificationRequest(req.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                          >
                            Aprobar y Asignar Boleto #{req.requestedTicketNumber}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* LIST OF ASSIGNED PARTICIPANTS IN RULETA (EDITABLE) */}
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-gray-900 text-base">Participantes en Ruleta (Editar Nombres y Usuarios)</h4>
                    <p className="text-xs text-gray-500">
                      Modifica directamente los datos o usuario (@handle) de cualquier boleto que participará en la ruleta.
                    </p>
                  </div>
                </div>

                {raffles.map((raffle) => {
                  const assigned = (ticketsMap[raffle.id] || []).filter((t) => t.status === 'assigned');
                  if (assigned.length === 0) return null;

                  return (
                    <div key={raffle.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <h5 className="font-extrabold text-xs text-gray-900 uppercase">
                          {raffle.title} ({assigned.length} Participantes)
                        </h5>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {assigned.map((t) => (
                          <div
                            key={t.number}
                            className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-mono font-black text-emerald-600 text-sm">
                                Boleto #{t.number}
                              </div>
                              <div className="font-bold text-gray-900">{t.userName}</div>
                              <div className="text-pink-600 font-bold text-[11px]">
                                {t.userHandle || '@usuario'}
                              </div>
                              {t.userPhone && (
                                <div className="text-gray-400 text-[10px]">{t.userPhone}</div>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingTicket({
                                    raffleId: raffle.id,
                                    ticketNumber: t.number,
                                    userName: t.userName || '',
                                    userHandle: t.userHandle || '',
                                    userPhone: t.userPhone || '',
                                  })
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-[11px] flex items-center gap-1 transition"
                              >
                                <Edit className="w-3 h-3" /> Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => unassignTicket(raffle.id, t.number)}
                                className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] transition text-center"
                              >
                                Liberar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL LINKS CONFIG */}
          {activeAdminTab === 'socials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Redes Sociales Oficiales</h3>
                  <p className="text-xs text-gray-500">
                    Administra los enlaces oficiales de WhatsApp, Facebook, Instagram, TikTok, YouTube y más.
                  </p>
                </div>
                <button
                  onClick={() => setShowSocialModal(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Agregar Red Social
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialLinks.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-gray-900 text-sm">{link.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 uppercase">
                          {link.platform}
                        </span>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 underline font-mono truncate block max-w-xs mt-1"
                      >
                        {link.url}
                      </a>
                    </div>
                    <button
                      onClick={() => deleteSocialLink(link.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition"
                      title="Eliminar Red"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DRAW EXECUTOR */}
          {activeAdminTab === 'draw' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-gray-900 text-lg">Ejecución de Sorteos Aleatorios</h3>
              <p className="text-xs text-gray-500">
                Selecciona la rifa activa y ejecuta el sorteo aleatorio transparente en vivo.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {raffles.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{r.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Estado: {r.status}</p>
                    </div>

                    {r.status === 'active' ? (
                      <button
                        onClick={() => onLaunchDrawForRaffle(r)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-md"
                      >
                        <Trophy className="w-4 h-4" /> Lanzar Sorteo
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">Finalizada</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: GANADORES REALES Y CAPTURAS */}
          {activeAdminTab === 'winners' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-pink-600" /> Galería de Ganadores Reales y Capturas de Comentarios
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sube capturas reales de comentarios de tus redes sociales (Facebook, Instagram, TikTok, WhatsApp) para mostrar máxima confianza.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddWinnerModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shrink-0 transition"
                >
                  <PlusCircle className="w-4 h-4" /> Cargar Ganador con Foto & Comentario Real
                </button>
              </div>

              {winnersHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  Aún no has registrado ganadores con capturas. Haz clic en "Cargar Ganador con Foto & Comentario Real" arriba.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {winnersHistory.map((winner) => (
                    <div
                      key={winner.id}
                      className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3 hover:border-pink-300 transition flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {winner.userAvatar ? (
                              <img
                                src={winner.userAvatar}
                                alt={winner.winnerName}
                                className="w-9 h-9 rounded-full object-cover border border-pink-300 shadow-sm"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white font-black text-xs flex items-center justify-center">
                                {winner.winnerName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h4 className="font-extrabold text-gray-900 text-sm leading-tight">{winner.winnerName}</h4>
                              <p className="text-[11px] text-pink-600 font-bold">Premio: {winner.prizeValue}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteWinnerHistory(winner.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Eliminar registro de ganador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-xs text-gray-700 font-semibold bg-gray-50 p-2 rounded-xl">
                          Sorteo: <strong>{winner.raffleTitle}</strong>
                        </div>

                        {winner.proofImage && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                              <ImageIcon className="w-3 h-3 text-pink-600" /> Captura de Comentario Real:
                            </span>
                            <img
                              src={winner.proofImage}
                              alt="Comentario real"
                              className="w-full h-36 object-cover rounded-xl border border-pink-200"
                            />
                          </div>
                        )}

                        {winner.testimonial && (
                          <p className="text-xs text-gray-600 italic bg-pink-50/50 p-2.5 rounded-xl border border-pink-100">
                            "{winner.testimonial}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <span className="text-gray-400 text-[10px]">
                          {new Date(winner.drawDate).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => setSelectedWinnerForEmail(winner)}
                          className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
                        >
                          <Mail className="w-3 h-3" /> Notificar por Email
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SYSTEM SETTINGS */}
          {activeAdminTab === 'settings' && (
            <div className="space-y-6 max-w-xl">
              <h3 className="font-extrabold text-gray-900 text-lg">Configuración de Plataforma</h3>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Modo Asignación Automática</h4>
                  <p className="text-xs text-gray-500">
                    Si está activo, los números se asignan inmediatamente tras completar la lista. Si se desactiva, requiere aprobación manual.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoApproveMode(!autoApproveMode)}
                  className={`w-12 h-6 rounded-full transition p-1 ${
                    autoApproveMode ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition transform ${
                      autoApproveMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2">
                <h4 className="font-bold text-red-900 text-sm">Restaurar Datos Iniciales</h4>
                <p className="text-xs text-red-700">
                  Reinicia la plataforma con las rifas y redes por defecto.
                </p>
                <button
                  onClick={resetSystemData}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Restaurar Todo
                </button>
              </div>
            </div>
          )}

          {/* TAB: GESTIÓN Y CARGA DE MÚSICA DE FONDO */}
          {activeAdminTab === 'music' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-5 bg-gradient-to-r from-rose-900 via-pink-900 to-purple-950 text-white rounded-3xl border border-rose-500/30 shadow-md space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-400/30 text-rose-300">
                    <Music className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white">Gestión y Carga de Música de Fondo</h3>
                    <p className="text-xs text-pink-200">
                      Sube tus propias canciones MP3 o pistas de audio directamente desde tu celular/computador, o pega un enlace de audio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form: Subir Nueva Pista */}
                <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Plus className="w-4 h-4 text-pink-600" /> Subir Nueva Canción / Pista
                  </h4>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newTrackName.trim() || (!newTrackAudioUrl && !isUploadingAudio)) {
                        alert('Por favor ingresa un nombre y selecciona un archivo MP3 o enlace de audio.');
                        return;
                      }

                      await addMusicTrack({
                        name: newTrackName.trim(),
                        genre: newTrackGenre.trim() || 'Personalizada',
                        audioUrl: newTrackAudioUrl,
                      });

                      setNewTrackName('');
                      setNewTrackGenre('Personalizada');
                      setNewTrackAudioUrl('');
                      alert('¡Canción de fondo cargada con éxito y seleccionada!');
                    }}
                    className="space-y-3.5 text-xs"
                  >
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Nombre de la Canción / Pista:</label>
                      <input
                        type="text"
                        value={newTrackName}
                        onChange={(e) => setNewTrackName(e.target.value)}
                        placeholder="Ej. Salsa Fiesta Variedades CS 🎶"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Género / Tipo:</label>
                      <select
                        value={newTrackGenre}
                        onChange={(e) => setNewTrackGenre(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white"
                      >
                        <option value="Personalizada">Personalizada 🎧</option>
                        <option value="Alegre & Fiesta">Alegre & Fiesta 🎉</option>
                        <option value="Relajante & Lounge">Relajante & Lounge 🌸</option>
                        <option value="Pop & Sorteo">Pop & Sorteo ✨</option>
                        <option value="Salsa & Cumbia">Salsa & Cumbia 💃</option>
                        <option value="Instrumental">Instrumental 🎷</option>
                      </select>
                    </div>

                    {/* Audio File Upload Picker */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Cargar Archivo MP3 / Audio desde Celular / PC:</label>
                      <label className="w-full py-3 px-4 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs">
                        <Upload className="w-4 h-4 text-pink-600" />
                        <span>{isUploadingAudio ? 'Procesando Audio...' : 'Seleccionar Archivo de Audio (MP3/WAV)'}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setIsUploadingAudio(true);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              setNewTrackAudioUrl(result);
                              if (!newTrackName) {
                                // Auto set track name from file name
                                const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                                setNewTrackName(fileNameWithoutExt);
                              }
                              setIsUploadingAudio(false);
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Or URL input */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">O Enlace Directo (URL MP3):</label>
                      <input
                        type="url"
                        value={newTrackAudioUrl.startsWith('data:') ? '' : newTrackAudioUrl}
                        onChange={(e) => setNewTrackAudioUrl(e.target.value)}
                        placeholder="https://ejemplo.com/musica.mp3"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      />
                    </div>

                    {newTrackAudioUrl && (
                      <div className="p-3 bg-pink-50/80 rounded-xl border border-pink-200 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-pink-800 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Archivo de audio cargado
                        </div>
                        <audio controls src={newTrackAudioUrl} className="w-full h-8" />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUploadingAudio}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" /> Guardar y Activar Música
                    </button>
                  </form>
                </div>

                {/* Track List */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                      <Radio className="w-4 h-4 text-pink-600" /> Pistas Disponibles en la Plataforma ({musicTracks.length})
                    </h4>
                    <span className="text-xs text-gray-500">Haz clic para activar como música de fondo activa</span>
                  </div>

                  <div className="space-y-3">
                    {musicTracks.map((track) => {
                      const isActive = track.id === activeTrackId;
                      return (
                        <div
                          key={track.id}
                          className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isActive
                              ? 'bg-pink-50/80 border-pink-300 shadow-sm ring-2 ring-pink-400/20'
                              : 'bg-gray-50/70 border-gray-200 hover:border-pink-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-gray-900">{track.name}</span>
                              {track.isCustom && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-600" /> Carga Administrador
                                </span>
                              )}
                              {isActive && (
                                <span className="px-2 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-bold">
                                  Música Activa 🎵
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>Género: <strong className="text-gray-700">{track.genre}</strong></span>
                              <span>•</span>
                              <span>
                                {track.audioUrl ? '🔊 Archivo MP3 / Audio' : '🎹 Sintetizador Web Audio'}
                              </span>
                            </div>

                            {/* Player Preview for audioUrl */}
                            {track.audioUrl && (
                              <div className="pt-2">
                                <audio controls src={track.audioUrl} className="h-8 max-w-xs w-full" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isActive && (
                              <button
                                onClick={() => setActiveTrackId(track.id)}
                                className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" /> Activar
                              </button>
                            )}
                            {track.isCustom && (
                              <button
                                onClick={() => {
                                  if (confirm(`¿Seguro que deseas eliminar la pista "${track.name}"?`)) {
                                    deleteMusicTrack(track.id);
                                  }
                                }}
                                className="p-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs transition"
                                title="Eliminar Pista"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raffle Create/Edit Modal */}
      {showRaffleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 my-8">
            <button
              onClick={() => setShowRaffleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-gray-900 text-xl mb-4">
              {editingRaffle ? 'Editar Rifa' : 'Crear Nueva Rifa Gratuita'}
            </h3>

            <form onSubmit={handleSaveRaffle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Título de la Rifa / Premio:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. iPhone 15 Pro Max 256GB"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Descripción:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Valor Estimado ($):</label>
                  <input
                    type="text"
                    value={prizeValue}
                    onChange={(e) => setPrizeValue(e.target.value)}
                    placeholder="Ej. $1,200.00 USD"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Categoría:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none bg-white font-bold"
                  >
                    <option value="Perfumes">Perfumes</option>
                    <option value="Ropa">Ropa</option>
                    <option value="Lencería">Lencería</option>
                    <option value="Bolsos">Bolsos</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Consolas y Gaming">Consolas y Gaming</option>
                    <option value="Electrodomésticos">Electrodomésticos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Imagen del Producto / Premio:</label>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch gap-2">
                    <label className="flex-1 cursor-pointer py-2.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm">
                      <Camera className="w-4 h-4 text-pink-600" />
                      <span>{isUploadingImage ? 'Procesando Foto...' : 'Subir desde Celular / Galería'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={prizeImage}
                      onChange={(e) => setPrizeImage(e.target.value)}
                      placeholder="O pega aquí el enlace directo (URL)..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {prizeImage && (
                    <div className="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group shadow-inner">
                      <img
                        src={prizeImage}
                        alt="Vista previa del premio"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-90 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPrizeImage('')}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Quitar Foto
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Cantidad de Números:</label>
                  <select
                    value={totalNumbers}
                    onChange={(e) => setTotalNumbers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value={50}>50 Números (00-49)</option>
                    <option value={100}>100 Números (00-99)</option>
                    <option value={200}>200 Números (000-199)</option>
                    <option value={500}>500 Números (000-499)</option>
                    <option value={1000}>1,000 Números (000-999)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fecha & Hora del Sorteo:</label>
                  <input
                    type="datetime-local"
                    value={drawDate}
                    onChange={(e) => setDrawDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Guardar Rifa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Link Add Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowSocialModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-gray-900 text-lg mb-4">Agregar Red Social Oficial</h3>

            <form onSubmit={handleSaveSocialLink} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre de la Red:</label>
                <input
                  type="text"
                  value={socName}
                  onChange={(e) => setSocName(e.target.value)}
                  placeholder="Ej. Telegram Oficial Variedades CS"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Plataforma:</label>
                <select
                  value={socPlatform}
                  onChange={(e) => setSocPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="telegram">Telegram</option>
                  <option value="custom">Otra Plataforma</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Enlace Directo (URL):</label>
                <input
                  type="url"
                  value={socUrl}
                  onChange={(e) => setSocUrl(e.target.value)}
                  placeholder="https://t.me/variedadescs"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md mt-2"
              >
                Guardar Red Social
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingRequestId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
            <h3 className="font-bold text-gray-900 text-sm mb-2">Motivo de Rechazo</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-xs mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectingRequestId(null)}
                className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Email Notification Modal */}
      {selectedWinnerForEmail && (
        <WinnerEmailModal
          winnerName={selectedWinnerForEmail.winnerName}
          winnerEmail={selectedWinnerForEmail.winnerPhoneMasked.includes('@') ? selectedWinnerForEmail.winnerPhoneMasked : undefined}
          winnerPhone={selectedWinnerForEmail.winnerPhoneMasked}
          ticketNumber={selectedWinnerForEmail.ticketNumber}
          raffleTitle={selectedWinnerForEmail.raffleTitle}
          prizeValue={selectedWinnerForEmail.prizeValue}
          onClose={() => setSelectedWinnerForEmail(null)}
        />
      )}

      {/* New Raffle Gmail Announcement Modal */}
      {selectedRaffleForEmail && (
        <NewRaffleEmailModal
          raffle={selectedRaffleForEmail}
          onClose={() => setSelectedRaffleForEmail(null)}
        />
      )}

      {/* Direct Ticket Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 border border-emerald-100">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Asignar Número a Participante</h3>
                <p className="text-xs text-gray-500">
                  Entrega un boleto directo a una persona escribiendo su número y su nombre/usuario.
                </p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAssignMessage(null);
                if (!assignRaffleId || !assignTicketNumber || !assignUserName || !assignUserHandle) {
                  setAssignMessage({ type: 'error', text: 'Por favor llena todos los campos obligatorios.' });
                  return;
                }

                const res = await assignTicketDirectly(
                  assignRaffleId,
                  assignTicketNumber,
                  assignUserName,
                  assignUserHandle,
                  assignUserPhone || '+57 300 000 0000',
                  assignUserEmail
                );

                if (res.success) {
                  setAssignMessage({ type: 'success', text: res.message });
                  setTimeout(() => {
                    setShowAssignModal(false);
                  }, 1500);
                } else {
                  setAssignMessage({ type: 'error', text: res.message });
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Seleccionar Rifa:</label>
                <select
                  value={assignRaffleId}
                  onChange={(e) => {
                    setAssignRaffleId(e.target.value);
                    setAssignTicketNumber('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  required
                >
                  {raffles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.totalNumbers} boletos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Número de Boleto (ej. 05, 42, 88):</label>
                <input
                  type="text"
                  value={assignTicketNumber}
                  onChange={(e) => setAssignTicketNumber(e.target.value)}
                  placeholder="Ej. 07"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo:</label>
                  <input
                    type="text"
                    value={assignUserName}
                    onChange={(e) => setAssignUserName(e.target.value)}
                    placeholder="Ej. Andrés Morales"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Usuario en Redes Social:</label>
                  <input
                    type="text"
                    value={assignUserHandle}
                    onChange={(e) => setAssignUserHandle(e.target.value)}
                    placeholder="Ej. @andres_m"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono / WhatsApp:</label>
                  <input
                    type="tel"
                    value={assignUserPhone}
                    onChange={(e) => setAssignUserPhone(e.target.value)}
                    placeholder="Ej. +57 310 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Correo (Opcional para notificar):</label>
                  <input
                    type="email"
                    value={assignUserEmail}
                    onChange={(e) => setAssignUserEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {assignMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    assignMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {assignMessage.text}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> Asignar Boleto Ahora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ticket Participant Modal */}
      {editingTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 border border-pink-100">
            <button
              onClick={() => setEditingTicket(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 font-bold">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Editar Datos del Participante</h3>
                <p className="text-xs text-gray-500">
                  Modifica el nombre y usuario en la ruleta del Boleto #{editingTicket.ticketNumber}
                </p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateTicketParticipant(
                  editingTicket.raffleId,
                  editingTicket.ticketNumber,
                  editingTicket.userName,
                  editingTicket.userHandle,
                  editingTicket.userPhone
                );
                setEditingTicket(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo del Participante:</label>
                <input
                  type="text"
                  value={editingTicket.userName}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, userName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Usuario en Redes (@handle para Ruleta):</label>
                <input
                  type="text"
                  value={editingTicket.userHandle}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, userHandle: e.target.value })
                  }
                  placeholder="Ej. @maria_3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none font-bold text-pink-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono / WhatsApp:</label>
                <input
                  type="tel"
                  value={editingTicket.userPhone}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, userPhone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Real Winner Modal with Social Comment Screenshot */}
      {showAddWinnerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 border border-pink-100 my-8">
            <button
              onClick={() => setShowAddWinnerModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 font-bold">
                <Trophy className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Cargar Ganador con Captura de Comentario</h3>
                <p className="text-xs text-gray-500">
                  Sube fotos de perfil y capturas de pantalla de comentarios de tus redes para generar confianza total.
                </p>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!wWinnerName.trim()) return;
                await addWinnerHistory({
                  raffleId: raffles[0]?.id || 'custom',
                  raffleTitle: wPrizeTitle.trim() || raffles[0]?.title || 'Perfume de Lujo / Ropa',
                  prizeValue: wPrizeValue.trim() || raffles[0]?.prizeValue || 'Producto Oficial',
                  prizeImage: wPrizeImage.trim() || raffles[0]?.prizeImage || 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
                  winnerName: wWinnerName.trim(),
                  userAvatar: wUserAvatar || undefined,
                  proofImage: wProofImage || undefined,
                  proofUrl: wProofUrl.trim() || undefined,
                  testimonial: wTestimonial.trim() || undefined,
                  ticketNumber: '00',
                  drawDate: new Date().toISOString(),
                  winnerPhoneMasked: '+57 3** *** **90'
                });
                setShowAddWinnerModal(false);
                setWWinnerName('');
                setWPrizeTitle('');
                setWPrizeValue('');
                setWPrizeImage('');
                setWUserAvatar('');
                setWProofImage('');
                setWProofUrl('');
                setWTestimonial('');
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nombre Completo del Ganador:</label>
                <input
                  type="text"
                  value={wWinnerName}
                  onChange={(e) => setWWinnerName(e.target.value)}
                  placeholder="Ej. Sofía Rodríguez"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Producto Rifado:</label>
                  <input
                    type="text"
                    value={wPrizeTitle}
                    onChange={(e) => setWPrizeTitle(e.target.value)}
                    placeholder="Ej. Perfume Chanel 100ml"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Detalle / Valor:</label>
                  <input
                    type="text"
                    value={wPrizeValue}
                    onChange={(e) => setWPrizeValue(e.target.value)}
                    placeholder="Ej. Colección Exclusiva"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-semibold focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Foto de Perfil del Ganador:</label>
                <div className="flex items-center gap-2">
                  {wUserAvatar && (
                    <img src={wUserAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-pink-300" />
                  )}
                  <label className="flex-1 px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-pink-200 transition">
                    <Camera className="w-4 h-4" />
                    <span>{wUserAvatar ? 'Cambiar Foto de Perfil' : 'Subir Foto de Perfil'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setWUserAvatar(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Captura del Comentario Real de Redes Sociales:</label>
                <div className="space-y-2">
                  <label className="w-full px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-emerald-200 transition">
                    <Upload className="w-4 h-4" />
                    <span>{wProofImage ? 'Cambiar Captura de Comentario' : 'Subir Captura de Comentario de Celular'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setWProofImage(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                  </label>
                  {wProofImage && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                      <img src={wProofImage} alt="Captura" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setWProofImage('')}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Comentario / Testimonio (Opcional):</label>
                <textarea
                  value={wTestimonial}
                  onChange={(e) => setWTestimonial(e.target.value)}
                  rows={2}
                  placeholder="Ej. ¡Gracias por el perfume! Me llegó perfecto."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWinnerModal(false)}
                  className="flex-1 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" /> Guardar Ganador Real
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Raffle Confirmation Modal */}
      {deletingRaffle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 border border-red-100">
            <button
              onClick={() => setDeletingRaffle(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base">¿Eliminar esta rifa?</h3>
                <p className="text-xs text-gray-500">Esta acción borrará la rifa y sus boletos inmediatamente.</p>
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-2xl border border-red-100 mb-6 flex items-center gap-3">
              <img
                src={deletingRaffle.prizeImage}
                alt={deletingRaffle.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div>
                <h4 className="font-bold text-gray-900 text-xs">{deletingRaffle.title}</h4>
                <p className="text-[11px] text-gray-600">Premio: {deletingRaffle.prizeValue}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingRaffle(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteRaffle(deletingRaffle.id);
                  setDeletingRaffle(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
