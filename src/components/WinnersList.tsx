import React from 'react';
import { useRaffle } from '../context/RaffleContext';
import { Trophy, CheckCircle, ExternalLink, MessageSquare, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export const WinnersList: React.FC = () => {
  const { winnersHistory } = useRaffle();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100 text-pink-900 border border-pink-300 text-xs font-bold uppercase tracking-widest">
          <Trophy className="w-4 h-4 text-pink-600" /> Galería de Ganadores Reales
        </div>
        <h2 className="text-3xl font-black text-gray-900">Sorteos Entregados & Comentarios Reales</h2>
        <p className="text-sm text-gray-500 max-w-xl mx-auto">
          Comentarios y capturas directas de nuestros seguidores en redes sociales oficiales (Facebook, Instagram, TikTok, WhatsApp).
        </p>
      </div>

      {/* Winners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {winnersHistory.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-gray-200/80 shadow-xl overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col justify-between"
          >
            {/* Winner Prize Image & Badge */}
            <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
              <img
                src={item.prizeImage}
                alt={item.raffleTitle}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3 bg-pink-600 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow">
                Premio: {item.prizeValue}
              </div>
              <div className="absolute top-3 right-3 bg-emerald-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Ganador Verificado
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-extrabold text-lg line-clamp-1">{item.raffleTitle}</h4>
              </div>
            </div>

            {/* Winner Details */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {item.userAvatar ? (
                    <img
                      src={item.userAvatar}
                      alt={item.winnerName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-pink-300 shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {item.winnerName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm leading-none">{item.winnerName}</p>
                    <p className="text-[11px] text-pink-600 font-bold mt-1">Sorteado en Vivo</p>
                  </div>
                </div>

                {/* Real Comment Screenshot */}
                {item.proofImage ? (
                  <div className="mt-3 space-y-1">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-pink-600" /> Captura de Comentario en Redes:
                    </span>
                    <div className="rounded-2xl overflow-hidden border border-pink-200 shadow-sm bg-gray-50">
                      <img
                        src={item.proofImage}
                        alt="Comentario real en redes sociales"
                        className="w-full h-44 object-cover hover:scale-105 transition duration-300 cursor-pointer"
                        onClick={() => window.open(item.proofImage, '_blank')}
                      />
                    </div>
                  </div>
                ) : item.testimonial ? (
                  <div className="mt-3 p-3 bg-pink-50/50 rounded-2xl border border-pink-100 text-xs text-gray-700 italic relative">
                    <MessageSquare className="w-3.5 h-3.5 text-pink-600 inline mr-1" />
                    "{item.testimonial}"
                  </div>
                ) : null}
              </div>

              {/* Draw Timestamp & Proof Link */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Fecha: {new Date(item.drawDate).toLocaleDateString()}</span>
                {item.proofUrl && (
                  <a
                    href={item.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 font-bold hover:underline flex items-center gap-1"
                  >
                    Ver en Redes <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
