import React from 'react';
import { useRaffle } from '../context/RaffleContext';
import { Logo } from './Logo';
import { ShieldCheck, Heart, CheckCircle, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { socialLinks, toggleAdminMode, isAdminMode } = useRaffle();

  return (
    <footer className="bg-gray-950 text-gray-300 pt-12 pb-8 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="lg" showText={true} lightMode={true} />
            <p className="text-sm text-gray-400 max-w-md leading-relaxed pt-2">
              Plataforma oficial de rifas 100% gratuitas de Variedades CS. No cobramos dinero ni requerimos registro previo para ver los sorteos en vivo.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-pink-950/80 text-pink-400 border border-pink-800">
                <ShieldCheck className="w-4 h-4 text-pink-400" /> Transparencia Total
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-800">
                <CheckCircle className="w-4 h-4 text-purple-400" /> Sorteos en Vivo
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Redes Oficiales</h4>
            <ul className="space-y-2.5 text-sm">
              {socialLinks.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-400 transition flex items-center gap-2 group"
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-500 group-hover:scale-125 transition" />
                    <span>{s.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Legal Compliance */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Garantía Variedades CS</h4>
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-2 text-xs text-gray-400">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> Sin Registro Requerido
              </p>
              <p>
                Los participantes son ingresados por el organizador y el público observa la ruleta en directo sin necesidad de crear cuenta.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Variedades CS. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              Diseñado con 💖 para la comunidad • Sorteos Auditables en Vivo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
