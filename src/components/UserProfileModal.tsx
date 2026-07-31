import React, { useState } from 'react';
import { useRaffle } from '../context/RaffleContext';
import { registerWithEmail, loginWithEmail, sendPasswordReset, loginWithGoogle, logoutUser } from '../lib/firebase';
import { Ticket, Raffle } from '../types/raffle';
import { Logo } from './Logo';
import {
  User,
  Gift,
  CheckCircle,
  X,
  Copy,
  Check,
  Save,
  LogIn,
  Mail,
  Lock,
  Phone,
  KeyRound,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface UserProfileModalProps {
  onClose: () => void;
  onOpenAdmin?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose, onOpenAdmin }) => {
  const { userProfile, updateUserProfile, raffles, ticketsMap, currentUser, toggleAdminMode, isAdminMode } = useRaffle();

  // Auth Modes: 'profile' | 'login' | 'register' | 'forgot_password'
  const [authTab, setAuthTab] = useState<'profile' | 'login' | 'register' | 'forgot_password'>(
    currentUser || isAdminMode ? 'profile' : 'login'
  );

  // Form States
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);
  const [email, setEmail] = useState(userProfile.email || currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState(userProfile.socialHandle);

  // Status Message States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedTicket, setCopiedTicket] = useState<string | null>(null);

  // User Tickets Calculation
  const userTicketsList: { raffle: Raffle; ticket: Ticket }[] = [];
  raffles.forEach((r) => {
    const tickets = ticketsMap[r.id] || [];
    tickets.forEach((t) => {
      if (
        (t.userId && t.userId === userProfile.id) ||
        (t.userEmail && t.userEmail === email) ||
        (t.userPhone && t.userPhone === phone)
      ) {
        userTicketsList.push({ raffle: r, ticket: t });
      }
    });
  });

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('¡Inicio de sesión exitoso con Google!');
      setAuthTab('profile');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    
    // Direct Admin Login credentials handler
    if (cleanEmail === 'urielroques604@gmail.com' && password === '190710') {
      toggleAdminMode('190710');
      updateUserProfile({
        name: 'Administrador Uriel',
        email: 'urielroques604@gmail.com',
      });
      setSuccessMsg('¡Bienvenido Administrador! Acceso al panel activado correctamente.');
      setAuthTab('profile');
      setLoading(false);
      return;
    }

    try {
      await loginWithEmail(email, password);
      if (cleanEmail === 'urielroques604@gmail.com') {
        toggleAdminMode('190710');
      }
      setSuccessMsg('¡Sesión iniciada correctamente!');
      setAuthTab('profile');
    } catch (err: any) {
      if (cleanEmail === 'urielroques604@gmail.com' && password === '190710') {
        toggleAdminMode('190710');
        updateUserProfile({
          name: 'Administrador Uriel',
          email: 'urielroques604@gmail.com',
        });
        setSuccessMsg('¡Bienvenido Administrador! Acceso al panel activado.');
        setAuthTab('profile');
      } else {
        setErrorMsg('Correo o contraseña incorrectos. Revisa tus datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Por favor ingresa tu Nombre Completo Legal.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Por favor ingresa tu número de WhatsApp/Teléfono.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, name, phone);
      updateUserProfile({ name, phone, email, socialHandle: handle });
      setSuccessMsg('¡Cuenta registrada con éxito! Bienvenido a Variedades CS.');
      setAuthTab('profile');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la cuenta. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!email.trim()) {
      setErrorMsg('Ingresa tu correo electrónico registrado.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccessMsg(`¡Se ha enviado un correo de restablecimiento a ${email}! Revisa tu bandeja de entrada.`);
    } catch (err: any) {
      setErrorMsg('No se pudo enviar el correo de recuperación. Verifica la dirección.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, phone, email, socialHandle: handle });
    setSuccessMsg('¡Datos de perfil guardados correctamente!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLogout = async () => {
    await logoutUser();
    setSuccessMsg('Has cerrado sesión correctamente.');
    setAuthTab('login');
  };

  const copyTicketCard = (ticketNum: string, raffleTitle: string) => {
    navigator.clipboard.writeText(
      `Mi boleto oficial en Variedades CS Rifas: #${ticketNum} para "${raffleTitle}". 100% Gratis.`
    );
    setCopiedTicket(ticketNum);
    setTimeout(() => setCopiedTicket(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 my-8 border border-pink-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <Logo size="md" showText={false} />
          <div>
            <span className="text-xs font-bold text-pink-600 uppercase tracking-widest flex items-center gap-1">
              Variedades CS <Sparkles className="w-3 h-3 text-amber-500" />
            </span>
            <h3 className="font-black text-gray-900 text-xl tracking-tight">
              {currentUser ? userProfile.name : 'Mi Cuenta de Participante'}
            </h3>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 mb-6 gap-2 text-xs font-bold overflow-x-auto pb-1">
          {currentUser && (
            <button
              onClick={() => {
                setAuthTab('profile');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`px-3 py-2 rounded-xl transition ${
                authTab === 'profile'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Mis Boletos & Datos
            </button>
          )}

          <button
            onClick={() => {
              setAuthTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`px-3 py-2 rounded-xl transition ${
              authTab === 'login' ? 'bg-pink-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Iniciar Sesión
          </button>

          <button
            onClick={() => {
              setAuthTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`px-3 py-2 rounded-xl transition ${
              authTab === 'register' ? 'bg-pink-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Registrarse
          </button>

          <button
            onClick={() => {
              setAuthTab('forgot_password');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`px-3 py-2 rounded-xl transition ${
              authTab === 'forgot_password'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Restablecer Clave
          </button>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
            ✅ {successMsg}
          </div>
        )}

        {/* TAB 1: PROFILE & ASSIGNED TICKETS */}
        {authTab === 'profile' && (
          <div className="space-y-6">
            {(isAdminMode || userProfile.email === 'urielroques604@gmail.com') && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-pink-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-pink-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Panel de Administrador Activado</h4>
                    <p className="text-[11px] text-pink-200">Acceso completo a rifas, boletos y correos de Gmail</p>
                  </div>
                </div>
                {onOpenAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdmin();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 shrink-0"
                  >
                    <ShieldCheck className="w-4 h-4" /> Abrir Panel Admin
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
              <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
                Datos Legales y de Contacto
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Nombre Completo Legal:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. María Josefa Rodríguez"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Correo Electrónico (Gmail):
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      WhatsApp / Teléfono:
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Usuario Redes Sociales (Instagram/FB):
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@mi_usuario_oficial"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
                >
                  <Save className="w-3.5 h-3.5" /> Actualizar Datos
                </button>

                {currentUser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3.5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
                  </button>
                )}
              </div>
            </form>

            {/* User Assigned Tickets */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Gift className="w-4 h-4 text-pink-600" /> Mis Boletos Oficiales ({userTicketsList.length})
              </h4>

              {userTicketsList.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  No tienes boletos asignados aún. Elige cualquier rifa activa y participa gratis.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {userTicketsList.map(({ raffle, ticket }) => (
                    <div
                      key={`${raffle.id}-${ticket.number}`}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 text-white font-mono font-black text-lg flex items-center justify-center shadow-md">
                          #{ticket.number}
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 text-xs">{raffle.title}</h5>
                          <span className="text-[10px] text-gray-500 font-medium">
                            Premio: {raffle.prizeValue}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => copyTicketCard(ticket.number, raffle.title)}
                        className="p-2.5 rounded-xl bg-white text-pink-700 hover:bg-pink-100 transition text-xs font-bold flex items-center gap-1 border border-pink-200 shadow-sm"
                      >
                        {copiedTicket === ticket.number ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INICIAR SESIÓN */}
        {authTab === 'login' && (
          <div className="space-y-5">
            {/* Google Sign-In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-xs text-gray-700 shadow-sm transition flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar con Google
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                O con tu Correo y Contraseña
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Correo Electrónico:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Contraseña:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setAuthTab('forgot_password')}
                  className="text-xs text-pink-600 font-bold hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-pink-600/30 transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: REGISTRO */}
        {authTab === 'register' && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-white border border-gray-300 hover:bg-gray-50 font-bold text-xs text-gray-700 shadow-sm transition flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Registrarse con Google
            </button>

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Nombre Completo Legal:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Carlos Pérez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Número de WhatsApp / Celular:
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 312 000 0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Contraseña de Seguridad:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-pink-600/30 transition"
              >
                Crear Cuenta de Participante
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: RESTABLECER CONTRASEÑA */}
        {authTab === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="text-center space-y-1 mb-2">
              <KeyRound className="w-8 h-8 text-pink-600 mx-auto" />
              <h4 className="font-extrabold text-gray-900 text-sm">Restablecer Contraseña</h4>
              <p className="text-xs text-gray-500">
                Ingresa tu correo registrado y te enviaremos un enlace oficial de recuperación de clave.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Correo Electrónico Registrado:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-pink-600/30 transition flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" /> Enviar Correo de Restablecimiento
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

