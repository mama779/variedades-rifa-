import React, { useState } from 'react';
import { Logo } from './Logo';
import { sendGmailMessage } from '../lib/gmail';
import { Mail, CheckCircle2, Copy, Send, Sparkles, X, Trophy, AlertTriangle, RefreshCw } from 'lucide-react';

interface WinnerEmailModalProps {
  winnerName: string;
  winnerEmail?: string;
  winnerPhone: string;
  ticketNumber: string;
  raffleTitle: string;
  prizeValue: string;
  onClose: () => void;
}

export const WinnerEmailModal: React.FC<WinnerEmailModalProps> = ({
  winnerName,
  winnerEmail,
  winnerPhone,
  ticketNumber,
  raffleTitle,
  prizeValue,
  onClose,
}) => {
  const [targetEmail, setTargetEmail] = useState(winnerEmail || '');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const emailSubject = `🎉 ¡FELICIDADES! Has ganado en la rifa "${raffleTitle}" de Variedades CS`;
  const emailBody = `¡Hola ${winnerName}!

¡Muchas felicidades! 🥳
Queremos informarte de manera oficial que tu número de boleto #${ticketNumber} ha resultado GANADOR del gran premio: ${prizeValue} en la rifa "${raffleTitle}".

Nos contactaremos contigo muy pronto a través de tu número telefónico registrado (${winnerPhone}) o por este correo electrónico para coordinar los detalles de la entrega de tu premio.

Si tienes alguna pregunta, también puedes contactarnos por nuestro canal oficial de WhatsApp.

¡Gracias por participar en Variedades CS Rifas!

Atentamente,
El Equipo de Variedades CS Rifas 💖`;

  const handleConfirmSendGmail = async () => {
    setShowConfirmDialog(false);
    setErrorMsg('');

    if (!targetEmail.trim()) {
      setErrorMsg('Por favor ingresa un correo electrónico de destino válido.');
      return;
    }

    setIsSending(true);
    try {
      const result = await sendGmailMessage(targetEmail.trim(), emailSubject, emailBody);

      if (result.success) {
        setIsSent(true);
      } else {
        setErrorMsg(result.error || 'Error al enviar el correo a través de Gmail.');
        const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailtoUrl, '_blank');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado al conectar con Gmail.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Asunto: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-pink-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Notificación Oficial de Ganador <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h3>
            <p className="text-xs text-gray-500">
              Envía el correo electrónico oficial a través de la API de Gmail (Solo Administrador).
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email Preview Card */}
        <div className="bg-gradient-to-br from-gray-50 to-pink-50/40 rounded-2xl border border-pink-100/80 p-5 space-y-4 shadow-inner text-left">
          {/* Receiver Info */}
          <div className="space-y-2 pb-3 border-b border-gray-200/60 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 w-24">Para (Gmail):</span>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="correo_ganador@ejemplo.com"
                className="flex-grow px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-bold text-gray-900 text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 w-24">Ganador:</span>
              <span className="font-bold text-gray-900">{winnerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500 w-24">Teléfono:</span>
              <span className="font-medium text-gray-700">{winnerPhone}</span>
            </div>
          </div>

          {/* Email Subject */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Asunto:</p>
            <p className="text-sm font-black text-gray-900 mt-0.5">{emailSubject}</p>
          </div>

          {/* Email Body Template */}
          <div className="bg-white p-4 rounded-xl border border-pink-100 text-xs text-gray-700 font-sans leading-relaxed space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <Logo size="sm" showText={true} />
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-600" /> Boleto #{ticketNumber}
              </span>
            </div>

            <p className="font-bold text-gray-900 text-sm">¡Hola {winnerName}!</p>
            <p>
              ¡Has ganado en la rifa! 🥳 Queremos informarte que tu número de boleto <strong>#{ticketNumber}</strong> ha resultado seleccionado como el <strong>GANADOR</strong> de la rifa:
            </p>
            <div className="bg-pink-50 p-3 rounded-lg border border-pink-200 text-pink-900 font-bold text-center">
              🎁 {raffleTitle} ({prizeValue})
            </div>
            <p className="text-gray-600">
              Nos contactaremos contigo muy pronto al número <strong>{winnerPhone}</strong> o por este correo electrónico para coordinar la entrega oficial de tu premio.
            </p>

            <div className="pt-2 text-gray-500 italic text-[11px] border-t border-gray-100 flex items-center justify-between">
              <span>Variedades CS — Sorteos Gratuitos & Transparentes</span>
              <span>💖</span>
            </div>
          </div>
        </div>

        {/* Confirmation Modal overlay when user clicks Send */}
        {showConfirmDialog && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl p-6 flex flex-col items-center justify-center text-center text-white z-10 animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-lg">¿Confirmas el envío por Gmail?</h4>
              <p className="text-xs text-gray-300 max-w-sm mt-1">
                Se enviará un correo electrónico oficial desde tu cuenta de Gmail de Administrador a <strong>{targetEmail}</strong> notificando su victoria en la rifa.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSendGmail}
                className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-lg flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Confirmar y Enviar por Gmail
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado!' : 'Copiar Texto del Mensaje'}
          </button>

          <button
            onClick={() => setShowConfirmDialog(true)}
            disabled={isSending || isSent}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs text-white shadow-lg transition flex items-center justify-center gap-2 ${
              isSent
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-pink-600/30'
            }`}
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Enviando por Gmail API...
              </>
            ) : isSent ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Correo Enviado Exitosamente por Gmail
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Enviar Correo con Gmail (Admin)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
