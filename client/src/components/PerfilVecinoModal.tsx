import React, { useState } from 'react';
import { ChevronLeft, Share2, Star, ThumbsUp, MessageSquare, Check } from 'lucide-react';

export interface VecinoData {
  id: string;
  iniciales: string;
  nombre: string;
  rubro: string;
  experiencia?: string;
  distancia: string;
  ubicacion: string;
  vistosBuenos: number;
  calificacion: number;
  resenasCount: number;
}

interface Props {
  vecino: VecinoData;
  onClose: () => void;
  onOpenEscribirResena: () => void;
  onContactar: () => void;
}

export const PerfilVecinoModal: React.FC<Props> = ({
  vecino,
  onClose,
  onOpenEscribirResena,
  onContactar,
}) => {
  const [dioVistoBueno, setDioVistoBueno] = useState(false);
  const [vistosCount, setVistosCount] = useState(vecino.vistosBuenos || 42);

  const toggleVistoBueno = () => {
    if (!dioVistoBueno) {
      setDioVistoBueno(true);
      setVistosCount(c => c + 1);
      alert(`Has recomendado a ${vecino.nombre} en tu cuadrante.`);
    } else {
      setDioVistoBueno(false);
      setVistosCount(c => c - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f7f8f4] flex flex-col select-none overflow-y-auto">
      
      {/* Cabecera Verde del Perfil */}
      <div className="bg-[#144e40] text-white p-5 pb-6 rounded-b-3xl shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button 
            onClick={() => alert(`Enlace vecinal copiado para compartir a ${vecino.nombre}`)}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#d6eee2] text-[#144e40] flex items-center justify-center font-black text-2xl shrink-0">
            {vecino.iniciales}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black truncate">{vecino.nombre}</h2>
            <p className="text-xs text-emerald-200 mt-0.5 font-medium">
              {vecino.rubro} · {vecino.experiencia || '12 años de oficio'}
            </p>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              A {vecino.distancia} · {vecino.ubicacion || 'Mz. D, Los Pinos'}
            </p>
          </div>
        </div>

        {/* Reputación Stats */}
        <div className="flex bg-white/15 rounded-2xl p-3 text-center divide-x divide-white/20">
          <div className="flex-1">
            <span className="block text-lg font-black">{vistosCount}</span>
            <span className="block text-[11px] text-emerald-200 font-medium">vistos buenos</span>
          </div>

          <div className="flex-1">
            <span className="flex items-center justify-center gap-1 text-lg font-black">
              {vecino.calificacion?.toFixed(1) || '4.9'} <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </span>
            <span className="block text-[11px] text-emerald-200 font-medium">{vecino.resenasCount || 18} reseñas</span>
          </div>
        </div>
      </div>

      {/* Tarjeta Visto Bueno */}
      <div className="px-5 -mt-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d6eee2] text-[#144e40] flex items-center justify-center shrink-0">
              <ThumbsUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Visto Bueno Vecinal</h4>
              <p className="text-xs text-gray-500">Solo opinan vecinos verificados de Los Pinos</p>
            </div>
          </div>

          <button 
            onClick={toggleVistoBueno}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
              dioVistoBueno 
                ? 'bg-[#144e40] text-white shadow-xs' 
                : 'border-2 border-[#144e40] text-[#144e40] hover:bg-[#d6eee2]'
            }`}
          >
            {dioVistoBueno ? (
              <>
                <Check className="w-4 h-4" />
                <span>Visto bueno registrado</span>
              </>
            ) : (
              <span>✓ Dar mi visto bueno</span>
            )}
          </button>
        </div>
      </div>

      {/* Sección Reseñas */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-gray-900 text-base">Lo que dicen tus vecinos</h3>
          <button 
            onClick={onOpenEscribirResena}
            className="px-3 py-1.5 rounded-full bg-[#d6eee2] text-[#144e40] text-xs font-bold hover:bg-[#bfe6d3] transition cursor-pointer"
          >
            Escribir reseña
          </button>
        </div>

        {/* Reseña 1 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                CM
              </div>
              <div>
                <h5 className="font-bold text-gray-900 text-xs">Carmen M.</h5>
                <span className="text-[11px] text-gray-400">Mz. B · a 2 cuadras</span>
              </div>
            </div>

            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-700 leading-relaxed">
            Vino en menos de media hora por una fuga en la cocina. Cobró lo que dijo y dejó todo limpio.
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span className="bg-[#d6eee2] text-[#144e40] text-[10px] font-bold px-2 py-0.5 rounded-md">
              Vecino verificado
            </span>
            <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-md">
              Hace 3 días
            </span>
          </div>
        </div>
      </div>

      {/* Botón Inferior Fijo: Contactar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-40">
        <button 
          onClick={onContactar}
          className="w-full py-3.5 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span>Contactar a {vecino.nombre.split(' ')[0]}</span>
        </button>
      </div>

    </div>
  );
};
