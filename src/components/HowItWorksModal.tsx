import React from 'react';
import { useRaffle } from '../context/RaffleContext';
import { ShieldCheck, Gift, CheckCircle2, MessageCircle, Heart, Share2, Users, X, HelpCircle } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose }) => {
  const { socialLinks } = useRaffle();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Transparencia & Seguridad
          </span>
          <h3 className="font-extrabold text-gray-900 text-2xl mt-1">¿Cómo Funcionan las Rifas Gratuitas?</h3>
        </div>

        {/* Steps Guide */}
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Sin Pagos ni Tarjetas de Crédito</h4>
              <p className="text-gray-600 mt-0.5 leading-relaxed">
                En Variedades CS Rifas nunca solicitamos dinero para otorgar boletos. La participación es 100% gratuita.
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Cumple los Pasos en Redes Sociales</h4>
              <p className="text-gray-600 mt-0.5 leading-relaxed">
                Para mantener la comunidad activa, solicitamos unirte a nuestro canal de WhatsApp, seguir nuestras cuentas oficiales (Facebook, Instagram, TikTok, YouTube), dar me gusta y etiquetar a 2 o más amigos.
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Registro con Nombre de Usuario</h4>
              <p className="text-gray-600 mt-0.5 leading-relaxed">
                Una vez completados los pasos de verificación, registras tu nombre de usuario para participar en el sorteo de forma gratuita.
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Sorteo Aleatorio en Vivo</h4>
              <p className="text-gray-600 mt-0.5 leading-relaxed">
                Al finalizar la cuenta regresiva, se ejecuta el sorteo aleatorio certificado. El ganador se publica inmediatamente en la plataforma y en nuestras redes.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
        >
          ¡Entendido, Quiero Participar!
        </button>
      </div>
    </div>
  );
};
