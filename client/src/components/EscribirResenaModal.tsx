import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

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
  const [recomienda, setRecomienda] = useState<boolean | null>(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Puntual', 'Trabajo limpio']);
  const [comentario, setComentario] = useState<string>('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handlePublicar = () => {
    if (rating === 0) {
      alert('Por favor selecciona una calificación en estrellas.');
      return;
    }
    onSubmitSuccess({
      rating,
      recomienda: recomienda ?? true,
      tags: selectedTags,
      comentario: comentario.trim(),
    });
    alert(`¡Gracias! Se publicó tu reseña y Visto Bueno para ${targetNeighbor.nombre}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 select-none">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-extrabold text-gray-900 text-sm">Escribir reseña</h3>
          <div className="w-8" />
        </div>

        {/* Formulario */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          
          {/* Tarjeta del vecino */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="w-10 h-10 rounded-full bg-[#d6eee2] text-[#144e40] flex items-center justify-center font-black text-sm shrink-0">
              {targetNeighbor.iniciales}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-gray-900 text-xs truncate">{targetNeighbor.nombre}</h4>
              <p className="text-[11px] text-gray-500 truncate">
                {targetNeighbor.rubro} · {targetNeighbor.fechaAtencion || 'te atendió el 7 de noviembre'}
              </p>
            </div>
          </div>

          {/* ¿Cómo fue el servicio? */}
          <div className="flex flex-col gap-1.5 text-center">
            <label className="text-xs font-bold text-gray-900">¿Cómo fue el servicio?</label>
            <div className="flex justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition cursor-pointer"
                >
                  <Star className={`w-8 h-8 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <span className="text-[11px] text-gray-400">
              {rating === 0 ? 'Toca una estrella para calificar' : `${rating} de 5 estrellas`}
            </span>
          </div>

          {/* ¿Le das tu Visto Bueno Vecinal? */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-900">¿Le das tu Visto Bueno Vecinal?</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setRecomienda(true)}
                className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  recomienda === true 
                    ? 'border-[#144e40] bg-[#d6eee2] text-[#144e40]' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Sí, la recomiendo
              </button>

              <button 
                onClick={() => setRecomienda(false)}
                className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  recomienda === false 
                    ? 'border-[#144e40] bg-[#d6eee2] text-[#144e40]' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Todavía no
              </button>
            </div>
          </div>

          {/* ¿Qué destacas? (opcional) */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-900">¿Qué destacas? (opcional)</label>
            <div className="flex flex-wrap gap-1.5">
              {TAGS_DESTACADOS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                      isSelected 
                        ? 'bg-[#144e40] text-white shadow-2xs' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cuéntales a tus vecinos */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-900">Cuéntales a tus vecinos</label>
            <textarea
              placeholder="¿Qué hizo? ¿Llegó a tiempo? ¿Cobró lo acordado?"
              maxLength={280}
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full p-3 rounded-2xl border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#144e40] resize-none"
            />
            <span className="text-[10px] text-gray-400 text-right">{comentario.length} / 280 caracteres</span>
          </div>

          {/* Botón Publicar */}
          <button 
            onClick={handlePublicar}
            className="w-full py-3 rounded-2xl bg-[#144e40] hover:bg-[#114034] text-white font-bold text-xs shadow-md transition cursor-pointer mt-1"
          >
            Publicar reseña
          </button>

        </div>

      </div>
    </div>
  );
};
