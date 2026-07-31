import React, { useState } from 'react';
import { Raffle, Ticket } from '../types/raffle';
import { useRaffle } from '../context/RaffleContext';
import { Search, Filter, CheckCircle, Clock, User, ShieldCheck, X } from 'lucide-react';

interface TicketGridProps {
  raffle: Raffle;
  onSelectTicket?: (ticketNumber: string) => void;
  onClose?: () => void;
}

export const TicketGrid: React.FC<TicketGridProps> = ({ raffle, onSelectTicket, onClose }) => {
  const { ticketsMap } = useRaffle();
  const tickets: Ticket[] = ticketsMap[raffle.id] || [];

  const [filter, setFilter] = useState<'all' | 'available' | 'assigned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectTicket, setInspectTicket] = useState<Ticket | null>(null);

  const availableCount = tickets.filter((t) => t.status === 'available').length;
  const assignedCount = tickets.filter((t) => t.status === 'assigned').length;

  const filteredTickets = tickets.filter((t) => {
    // Filter status
    if (filter === 'available' && t.status !== 'available') return false;
    if (filter === 'assigned' && t.status !== 'assigned') return false;

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matchNumber = t.number.includes(query);
      const matchUser = t.userName?.toLowerCase().includes(query);
      const matchHandle = t.userHandle?.toLowerCase().includes(query);
      return matchNumber || matchUser || matchHandle;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 max-w-4xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Tablero de Números en Tiempo Real
          </span>
          <h3 className="font-black text-gray-900 text-xl md:text-2xl">{raffle.title}</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center bg-gray-100 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-1 sm:flex-none ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Todos ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-1 sm:flex-none ${
              filter === 'available'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-white/60'
            }`}
          >
            Disponibles ({availableCount})
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-1 sm:flex-none ${
              filter === 'assigned'
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-600 hover:bg-white/60'
            }`}
          >
            Asignados ({assignedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar número o nombre..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Grid Status Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Disponible (Clic para solicitar)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /> Asignado / Verificado
        </span>
      </div>

      {/* Number Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-96 overflow-y-auto p-2 bg-gray-50/70 rounded-2xl border border-gray-100">
        {filteredTickets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 text-xs">
            No se encontraron números con este filtro o búsqueda.
          </div>
        ) : (
          filteredTickets.map((t) => {
            const isAvailable = t.status === 'available';
            const isAssigned = t.status === 'assigned';

            return (
              <button
                key={t.number}
                onClick={() => {
                  if (isAvailable && onSelectTicket) {
                    onSelectTicket(t.number);
                  } else if (isAssigned) {
                    setInspectTicket(t);
                  }
                }}
                className={`p-2 rounded-xl text-center font-mono text-sm font-bold transition transform active:scale-95 flex flex-col items-center justify-center relative group ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer'
                    : 'bg-gray-200 text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-300'
                }`}
              >
                <span>{t.number}</span>
                {isAssigned && (
                  <span className="text-[9px] font-sans font-bold truncate max-w-full text-pink-700 group-hover:text-pink-900">
                    {t.userHandle || t.userName?.split(' ')[0]}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Ticket Inspector Modal */}
      {inspectTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setInspectTicket(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white font-mono font-bold text-xl flex items-center justify-center">
                #{inspectTicket.number}
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase">Boleto Asignado</span>
                <h4 className="font-extrabold text-gray-900 text-lg">{inspectTicket.userName}</h4>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Usuario Redes:</span>
                <span className="font-bold text-gray-900">{inspectTicket.userHandle || '@usuario'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Fecha de Asignación:</span>
                <span className="font-semibold text-gray-800">
                  {inspectTicket.assignedAt
                    ? new Date(inspectTicket.assignedAt).toLocaleString()
                    : 'Verificado'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estado de Requisitos:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 100% Cumplidos
                </span>
              </div>
            </div>

            <button
              onClick={() => setInspectTicket(null)}
              className="w-full mt-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
