import React, { useState } from 'react';
import { ChevronLeft, Info, Check, ShieldCheck } from 'lucide-react';

interface FavorDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: () => void;
  favorData?: {
    titulo?: string;
    descripcion?: string;
    tipo?: string;
    distancia?: string;
    vecino?: string;
    vistosBuenos?: number;
  };
}

export const FavorDetalleModal: React.FC<FavorDetalleModalProps> = ({
  isOpen,
  onClose,
  onOpenChat,
  favorData = {
    titulo: 'Presto taladro percutor con brocas',
    descripcion: 'Para el fin de semana. Solo pido que lo devuelvas limpio.',
    tipo: 'Presto',
    distancia: '150 m',
    vecino: 'Julio R. · Mz. A',
    vistosBuenos: 23,
  }
}) => {
  const [solicitado, setSolicitado] = useState(false);

  if (!isOpen) return null;

  const handlePedir = () => {
    setSolicitado(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#f6f7f3] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-gray-200">
        
        {/* Cabecera */}
        <div className="bg-white px-5 py-4 flex items-center gap-3 border-b border-gray-150">
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Favor</h2>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* Tarjeta principal del favor */}
          <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#e0e7fb] text-[#2b4290]">
                {favorData.tipo || 'Presto'}
              </span>
              <span className="text-xs text-gray-500 font-semibold">{favorData.distancia || '150 m'}</span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 leading-snug">
              {favorData.titulo || 'Presto taladro percutor con brocas'}
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed">
              {favorData.descripcion || 'Para el fin de semana. Solo pido que lo devuelvas limpio.'}
            </p>

            {/* Chips de condiciones */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#f3f4f6] text-gray-700">
                Disponible: fin de semana
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#f3f4f6] text-gray-700">
                Préstamo máximo: 3 días
              </span>
            </div>

            {/* Fila del autor */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#e0e7fb] text-[#2b4290] font-bold flex items-center justify-center text-sm shrink-0">
                JR
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-900 truncate">
                  {favorData.vecino || 'Julio R. · Mz. A'}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#144e40]" />
                  <span>Vecino verificado · {favorData.vistosBuenos || 23} vistos buenos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Caja de aviso comunitario */}
          <div className="bg-[#e6f0ed] rounded-2xl p-4 flex items-start gap-3 border border-[#c4e1d7]">
            <Info className="w-4.5 h-4.5 text-[#144e40] shrink-0 mt-0.5" />
            <p className="text-xs text-[#144e40] leading-relaxed font-medium">
              Al pedirlo prestado te comprometes a devolverlo en la fecha acordada. Julio podrá darte su visto bueno al recibirlo.
            </p>
          </div>

          {/* Confirmación si ya fue pedido */}
          {solicitado && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2 animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <h4 className="font-bold text-emerald-950 text-sm">¡Solicitud Enviada a Julio R.!</h4>
              <p className="text-xs text-emerald-800">
                Coordinen la entrega y devolución directamente por el chat interno.
              </p>
              {onOpenChat && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat();
                  }}
                  className="mt-2 w-full py-2.5 bg-[#144e40] text-white rounded-xl font-bold text-xs hover:bg-[#103e33] transition cursor-pointer"
                >
                  Ir al chat vecinal
                </button>
              )}
            </div>
          )}

        </div>

        {/* Barra inferior fija */}
        {!solicitado && (
          <div className="p-4 bg-white border-t border-gray-150">
            <button
              onClick={handlePedir}
              className="w-full py-3.5 bg-[#111827] text-white rounded-2xl font-bold text-sm hover:bg-black transition shadow-md cursor-pointer"
            >
              Pedir prestado
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
