import React, { useState } from 'react';
import { X, Wrench, Check } from 'lucide-react';

export type PublicarTipo = 'servicio' | 'dono' | 'presto' | 'ofrezco' | 'necesito';

export interface PublicacionData {
  tipo: PublicarTipo;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  metodoContacto: 'chat' | 'whatsapp';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: PublicacionData) => void;
  userQuadrant?: string;
}

export const PublicarFlowModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  userQuadrant = 'Mz. D, Los Pinos'
}) => {
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1);
  const [tipo, setTipo] = useState<PublicarTipo>('necesito');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState(userQuadrant);
  const [metodoContacto, setMetodoContacto] = useState<'chat' | 'whatsapp'>('chat');

  if (!isOpen) return null;

  const infoTipo = {
    servicio: { label: 'Servicio', letra: 'S', bg: 'bg-[#d6eee2]', text: 'text-[#144e40]' },
    dono: { label: 'Dono', letra: 'D', bg: 'bg-[#d6eee2]', text: 'text-[#144e40]' },
    presto: { label: 'Presto', letra: 'P', bg: 'bg-[#e0e7fb]', text: 'text-[#2b4290]' },
    ofrezco: { label: 'Ofrezco', letra: 'O', bg: 'bg-[#ede9fe]', text: 'text-[#5b21b6]' },
    necesito: { label: 'Necesito', letra: 'N', bg: 'bg-[#ffedd5]', text: 'text-[#9a3412]' },
  }[tipo];

  const handleSelectTipo = (t: PublicarTipo) => {
    setTipo(t);
    setPaso(2);
  };

  const handleSiguientePaso2 = () => {
    if (!titulo.trim()) {
      alert('Por favor ingresa un título');
      return;
    }
    setPaso(3);
  };

  const handlePublicar = () => {
    onSuccess({
      tipo,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      ubicacion,
      metodoContacto,
    });
    setPaso(4);
  };

  const handleReset = () => {
    setTitulo('');
    setDescripcion('');
    setPaso(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#f7f8f4] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Superior */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 bg-[#f7f8f4]">
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-semibold text-gray-700">
            {paso === 4 ? 'Listo' : `Paso ${paso} de 3`}
          </span>

          {paso === 2 || paso === 3 ? (
            <button 
              onClick={() => setPaso((p) => (p - 1) as 1 | 2)} 
              className="text-sm font-bold text-[#144e40] hover:underline cursor-pointer"
            >
              Atrás
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        {/* Barra de Progreso */}
        <div className="flex px-6 gap-2 mb-4">
          <div className={`h-1 flex-1 rounded-full ${paso >= 1 ? 'bg-[#144e40]' : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${paso >= 2 ? 'bg-[#144e40]' : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 rounded-full ${paso >= 3 ? 'bg-[#144e40]' : 'bg-gray-200'}`} />
        </div>

        <div className="overflow-y-auto px-6 pb-6 flex-1">
          
          {/* PASO 1: ¿Qué quieres publicar? */}
          {paso === 1 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
                ¿Qué quieres publicar?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Un servicio o un favor para tus vecinos.
              </p>

              <div className="text-[11px] font-bold tracking-wider text-gray-500 mb-3">
                SERVICIOS
              </div>

              <div 
                onClick={() => handleSelectTipo('servicio')}
                className="flex items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-xs hover:border-[#144e40] transition cursor-pointer mb-6"
              >
                <div className="w-11 h-11 rounded-xl bg-[#144e40] flex items-center justify-center text-white mr-3.5 shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Ofrecer mi servicio</h3>
                  <p className="text-xs text-gray-500">Tu oficio o profesión en el directorio</p>
                </div>
              </div>

              <div className="text-[11px] font-bold tracking-wider text-gray-500 mb-3">
                FAVORES · SIN DINERO
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div 
                  onClick={() => handleSelectTipo('dono')}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs hover:border-[#144e40] transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#d6eee2] text-[#144e40] font-black flex items-center justify-center text-sm mb-3">
                    D
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-1">Dono</h4>
                  <p className="text-xs text-gray-500 leading-tight">Ropa, víveres, muebles...</p>
                </div>

                <div 
                  onClick={() => handleSelectTipo('presto')}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs hover:border-[#144e40] transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#e0e7fb] text-[#2b4290] font-black flex items-center justify-center text-sm mb-3">
                    P
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-1">Presto</h4>
                  <p className="text-xs text-gray-500 leading-tight">Herramientas, escaleras, sillas...</p>
                </div>

                <div 
                  onClick={() => handleSelectTipo('ofrezco')}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs hover:border-[#144e40] transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#ede9fe] text-[#5b21b6] font-black flex items-center justify-center text-sm mb-3">
                    O
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-1">Ofrezco</h4>
                  <p className="text-xs text-gray-500 leading-tight">Clases, ayuda, tu tiempo...</p>
                </div>

                <div 
                  onClick={() => handleSelectTipo('necesito')}
                  className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs hover:border-[#144e40] transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#ffedd5] text-[#9a3412] font-black flex items-center justify-center text-sm mb-3">
                    N
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-1">Necesito</h4>
                  <p className="text-xs text-gray-500 leading-tight">Pide un favor a tus vecinos</p>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Cuéntalo en corto */}
          {paso === 2 && (
            <div>
              <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold mb-3 ${infoTipo.bg} ${infoTipo.text}`}>
                {infoTipo.label}
              </div>

              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-5">
                Cuéntalo en corto
              </h2>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-900 mb-2">Título</label>
                <input 
                  type="text"
                  placeholder="Ej.: Necesito un taladro"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  maxLength={60}
                  className="w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#144e40]"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">Descripción corta</label>
                <textarea 
                  rows={4}
                  placeholder="¿Para qué y hasta cuándo?"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  maxLength={140}
                  className="w-full bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-900 outline-none focus:border-[#144e40] resize-none"
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  Máximo 140 caracteres
                </div>
              </div>

              <button 
                onClick={handleSiguientePaso2}
                className="w-full py-3.5 bg-black text-white font-bold rounded-xl text-base hover:bg-gray-800 transition cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          )}

          {/* PASO 3: ¿Dónde y cómo te contactan? */}
          {paso === 3 && (
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">
                ¿Dónde y cómo te contactan?
              </h2>

              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-900 mb-2">Ubicación</label>
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{ubicacion}</h4>
                      <p className="text-xs text-gray-500">Se muestra solo la manzana, no tu dirección</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const nuevo = prompt('Cambiar sector o manzana:', ubicacion);
                      if (nuevo) setUbicacion(nuevo);
                    }}
                    className="text-xs font-bold text-[#144e40] hover:underline cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>
              </div>

              <div className="mb-7">
                <label className="block text-sm font-bold text-gray-900 mb-2">Contacto</label>
                
                <div 
                  onClick={() => setMetodoContacto('chat')}
                  className={`flex items-center p-4 rounded-2xl border transition cursor-pointer mb-2.5 ${
                    metodoContacto === 'chat' 
                      ? 'border-[#144e40] bg-[#f0f8f5]' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                    metodoContacto === 'chat' ? 'border-[#144e40]' : 'border-gray-300'
                  }`}>
                    {metodoContacto === 'chat' && <div className="w-2.5 h-2.5 rounded-full bg-[#144e40]" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Chat dentro de la app</h4>
                    <p className="text-xs text-gray-500">Tu número queda privado</p>
                  </div>
                </div>

                <div 
                  onClick={() => setMetodoContacto('whatsapp')}
                  className={`flex items-center p-4 rounded-2xl border transition cursor-pointer ${
                    metodoContacto === 'whatsapp' 
                      ? 'border-[#144e40] bg-[#f0f8f5]' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                    metodoContacto === 'whatsapp' ? 'border-[#144e40]' : 'border-gray-300'
                  }`}>
                    {metodoContacto === 'whatsapp' && <div className="w-2.5 h-2.5 rounded-full bg-[#144e40]" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">WhatsApp</h4>
                    <p className="text-xs text-gray-500">Los vecinos verán tu número</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePublicar}
                className="w-full py-3.5 bg-[#144e40] text-white font-bold rounded-xl text-base hover:bg-[#103e33] transition cursor-pointer"
              >
                Publicar
              </button>
            </div>
          )}

          {/* PASO 4: ¡Publicado! */}
          {paso === 4 && (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#d6eee2] flex items-center justify-center text-[#144e40] mb-5">
                <Check className="w-10 h-10" strokeWidth={3} />
              </div>

              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                ¡Publicado!
              </h2>

              <p className="text-sm text-gray-600 max-w-xs leading-relaxed mb-8">
                Tu {tipo === 'servicio' ? 'servicio' : 'favor'} ya aparece en {tipo === 'servicio' ? 'Servicios' : 'Favores'} para los vecinos de Los Pinos. Te avisaremos cuando alguien responda.
              </p>

              <button 
                onClick={onClose}
                className="w-full py-3.5 bg-black text-white font-bold rounded-xl text-base hover:bg-gray-800 transition cursor-pointer mb-3"
              >
                Volver al inicio
              </button>

              <button 
                onClick={handleReset}
                className="text-sm font-bold text-[#144e40] hover:underline py-2 cursor-pointer"
              >
                Publicar otra cosa
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
