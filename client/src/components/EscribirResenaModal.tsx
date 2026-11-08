import React, { useState } from 'react';
import { X, Star, Shield } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetNeighbor: {
    nombre: string;
    iniciales: string;
    rubro: string;
    fechaAtencion?: string;
  };
  onSubmitSuccess: (review: {
    rating: number;
    recomienda: boolean;
    tags: string[];
    comentario: string;
  }) => void;
}

const TAGS_DESTACADOS = [
  'Puntual',
  'Precio justo',
  'Trabajo limpio',
  'Honesta',
  'Explica bien',
  'Volvería a llamarla',
];

export const EscribirResenaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetNeighbor,
  onSubmitSuccess,
}) => {
  if (!isOpen) return null;

  const [rating, setRating] = useState<number>(0);
  const [recomienda, setRecomienda] = useState<boolean>(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comentario, setComentario] = useState<string>('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const isValid = rating > 0;

  const handlePublicar = () => {
    if (!isValid) return;
    onSubmitSuccess({
      rating,
      recomienda,
      tags: selectedTags,
      comentario: comentario.trim(),
    });
    onClose();
  };

  const nombrePrimer = targetNeighbor?.nombre?.split(' ')[0] || 'Rosa';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fadeIn">
      <div className="bg-[#f7f8f4] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-gray-200/80">
        
        {/* Barra de arrastre / Cabecera */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="w-8" />
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white shadow-2xs flex items-center justify-center text-gray-500 hover:text-gray-900 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido con scroll (Figma: Escribir reseña) */}
        <div className="px-6 py-3 overflow-y-auto flex flex-col gap-5">
          
          {/* Sección 1: ¿Cómo fue el servicio? */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[16px] font-bold text-gray-900">
              ¿Cómo fue el servicio?
            </h3>
            
            {/* 5 Estrellas */}
            <div className="flex items-center gap-2.5 py-1">
              {[1, 2, 3, 4, 5].map((s) => {
                const filled = s <= rating;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                  >
                    <Star 
                      className={`w-9 h-9 transition-colors ${
                        filled 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'fill-transparent text-gray-400 hover:text-gray-600'
                      }`} 
                      strokeWidth={1.5}
                    />
                  </button>
                );
              })}
            </div>
            
            <p className="text-[12px] text-gray-500 font-medium">
              {rating === 0 ? 'Toca una estrella para calificar' : `${rating} de 5 estrellas`}
            </p>
          </div>

          {/* Sección 2: ¿Le das tu Visto Bueno Vecinal? */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[15px] font-bold text-gray-900">
              ¿Le das tu Visto Bueno Vecinal?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setRecomienda(true)}
                className={`py-3 px-3 rounded-2xl text-[13px] font-bold transition cursor-pointer text-center ${
                  recomienda 
                    ? 'bg-white border-2 border-[#144e40] text-[#144e40] shadow-xs' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sí, la recomiendo
              </button>

              <button 
                type="button"
                onClick={() => setRecomienda(false)}
                className={`py-3 px-3 rounded-2xl text-[13px] font-bold transition cursor-pointer text-center ${
                  !recomienda 
                    ? 'bg-white border-2 border-amber-600 text-amber-800 shadow-xs' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Todavía no
              </button>
            </div>
          </div>

          {/* Sección 3: ¿Qué destacas? (opcional) */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[15px] font-bold text-gray-900">
              ¿Qué destacas? <span className="font-normal text-gray-500 text-[13px]">(opcional)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {TAGS_DESTACADOS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-[12px] font-semibold transition cursor-pointer border ${
                      isSelected 
                        ? 'bg-[#144e40] text-white border-[#144e40] shadow-xs' 
                        : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sección 4: Cuéntales a tus vecinos */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[15px] font-bold text-gray-900">
              Cuéntales a tus vecinos
            </h3>
            <div className="bg-white rounded-2xl border border-gray-200 p-3.5 focus-within:border-[#144e40] transition shadow-2xs">
              <textarea
                placeholder="¿Qué hizo? ¿Llegó a tiempo? ¿Cobró lo acordado?"
                maxLength={280}
                rows={3}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="w-full text-[13px] text-gray-900 placeholder:text-gray-400 outline-none resize-none bg-transparent leading-relaxed"
              />
            </div>
            <div className="text-right">
              <span className="text-[11px] text-gray-400 font-medium">
                Máximo 280 caracteres
              </span>
            </div>
          </div>

          {/* Banner de Garantía y Transparencia Vecinal */}
          <div className="flex items-start gap-3 bg-[#e8f5ec] p-3.5 rounded-2xl border border-[#c3e6cf]">
            <Shield className="w-4 h-4 text-[#144e40] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#144e40] font-medium leading-snug">
              Puedes reseñar porque contactaste a {nombrePrimer} por la app. Tu reseña se publica con tu nombre y tu manzana.
            </p>
          </div>

          {/* Botón Publicar reseña */}
          <div className="pt-1 pb-3">
            <button 
              type="button"
              onClick={handlePublicar}
              disabled={!isValid}
              className={`w-full py-3.5 rounded-2xl font-bold text-[15px] transition cursor-pointer ${
                isValid
                  ? 'bg-[#144e40] hover:bg-[#0f3d32] text-white shadow-xs active:scale-[0.99]'
                  : 'bg-[#ded8cc] text-[#787165] cursor-not-allowed opacity-80'
              }`}
            >
              Publicar reseña
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
