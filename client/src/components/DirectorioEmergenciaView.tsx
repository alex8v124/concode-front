import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Shield, 
  Flame, 
  Cross, 
  Activity, 
  Phone, 
  Megaphone, 
  Check 
} from 'lucide-react';

interface DirectorioEmergenciaViewProps {
  onBack: () => void;
  quadrantName?: string;
}

const TIPOS_EMERGENCIA = [
  'Lluvias o huaico',
  'Sismo',
  'Incendio',
  'Sin agua o luz',
  'Otro'
];

export const DirectorioEmergenciaView: React.FC<DirectorioEmergenciaViewProps> = ({
  onBack,
  quadrantName = 'Urb. Los Pinos, Surco'
}) => {
  const [vista, setVista] = useState<'directorio' | 'activar_tablero' | 'confirmado'>('directorio');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('Lluvias o huaico');
  const [descripcion, setDescripcion] = useState('');

  const handleLlamar = (numero: string, nombre: string) => {
    alert(`Marcando al ${numero} (${nombre})`);
  };

  const handleSolicitarActivacion = () => {
    setVista('confirmado');
  };

  // ---------------- VISTA: CONFIRMACIÓN DE ACTIVACIÓN ----------------
  if (vista === 'confirmado') {
    return (
      <div className="flex flex-col h-full bg-[#f6f7f3] p-5">
        <div className="bg-white rounded-3xl p-6 text-center space-y-4 my-auto shadow-sm border border-gray-150">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#144e40] flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <h3 className="text-xl font-black text-gray-900">¡Solicitud de Activación Enviada!</h3>
          <p className="text-xs text-gray-600 leading-relaxed max-w-xs mx-auto">
            Se ha notificado a los vecinos de <span className="font-bold">{quadrantName}</span>. Se requieren 5 confirmaciones en los próximos 30 minutos para abrir el tablero a todo el sector.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setVista('directorio')}
              className="w-full py-3 bg-[#111827] text-white rounded-2xl font-bold text-sm hover:bg-black transition cursor-pointer"
            >
              Volver al directorio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- VISTA: ACTIVAR TABLERO DE AYUDA (FIGMA SCREEN) ----------------
  if (vista === 'activar_tablero') {
    return (
      <div className="flex flex-col h-full bg-[#f6f7f3] overflow-y-auto">
        {/* Cabecera */}
        <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-white border-b border-gray-150 sticky top-0 z-10">
          <button 
            onClick={() => setVista('directorio')}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Activar tablero de ayuda</h2>
            <p className="text-xs text-gray-500">{quadrantName}</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Tarjeta explicativa "¿Cómo se activa?" */}
          <div className="bg-white rounded-2xl p-5 border border-gray-150 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900">¿Cómo se activa?</h3>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Un vecino lo solicita</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Cualquier vecino verificado de la zona puede reportar una emergencia.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">5 vecinos lo confirman en 30 minutos</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Avisamos a los vecinos cercanos. Al llegar a 5 confirmaciones, el tablero se abre para todo el barrio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Si no se confirma, expira</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Si en 30 minutos no hay 5 confirmaciones, la solicitud se cancela sola.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tipo de emergencia */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900">Tipo de emergencia</h4>
            <div className="flex flex-wrap gap-2">
              {TIPOS_EMERGENCIA.map(tipo => (
                <button
                  key={tipo}
                  onClick={() => setTipoSeleccionado(tipo)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                    tipoSeleccionado === tipo
                      ? 'bg-[#b93815] text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* ¿Qué está pasando? */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-900">¿Qué está pasando?</h4>
            <textarea
              rows={3}
              placeholder="Ej.: Se inundó la calle 4 y hay casas sin luz"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className="w-full bg-white rounded-2xl p-4 text-xs border border-gray-200 outline-none focus:border-[#b93815] shadow-2xs resize-none"
            />
          </div>

          {/* Botón Solicitar Activación */}
          <button
            onClick={handleSolicitarActivacion}
            className="w-full py-4 rounded-2xl bg-[#b93815] hover:bg-[#a02f12] text-white font-bold text-sm shadow-md transition cursor-pointer"
          >
            Solicitar activación
          </button>
        </div>
      </div>
    );
  }

  // ---------------- VISTA: DIRECTORIO PRINCIPAL DE EMERGENCIAS (FIGMA SCREEN) ----------------
  return (
    <div className="flex flex-col h-full bg-[#f6f7f3] overflow-y-auto">
      {/* Cabecera */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3 bg-white border-b border-gray-150 sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 leading-tight">Emergencias</h2>
          <p className="text-xs text-gray-500">{quadrantName}</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Banner para activar Tablero Comunitario de Ayuda */}
        <button
          onClick={() => setVista('activar_tablero')}
          className="w-full bg-white rounded-2xl p-4 border border-rose-200 shadow-2xs flex items-center gap-3 text-left hover:border-rose-300 transition cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#b93815] text-white flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-gray-900">Activar tablero de ayuda</h4>
            <p className="text-xs text-gray-500 truncate">Requiere 5 confirmaciones de vecinos</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-gray-400 rotate-180" />
        </button>

        {/* Cuadrícula de 4 Números Oficiales */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* 105 Policía Nacional */}
          <button
            onClick={() => handleLlamar('105', 'Policía Nacional')}
            className="p-4 rounded-2xl bg-[#b93815] text-white text-left shadow-xs hover:opacity-95 transition cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <Shield className="w-5 h-5 opacity-90" />
            <div>
              <span className="text-2xl font-black block leading-none">105</span>
              <span className="text-xs font-semibold mt-1 block opacity-95">Policía Nacional</span>
            </div>
          </button>

          {/* 116 Bomberos */}
          <button
            onClick={() => handleLlamar('116', 'Bomberos Voluntarios')}
            className="p-4 rounded-2xl bg-[#18181b] text-white text-left shadow-xs hover:opacity-95 transition cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <Flame className="w-5 h-5 opacity-90" />
            <div>
              <span className="text-2xl font-black block leading-none">116</span>
              <span className="text-xs font-semibold mt-1 block opacity-95">Bomberos</span>
            </div>
          </button>

          {/* 106 SAMU Ambulancia */}
          <button
            onClick={() => handleLlamar('106', 'SAMU Ambulancia')}
            className="p-4 rounded-2xl bg-white text-gray-900 border border-gray-200 text-left shadow-2xs hover:border-gray-300 transition cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <Cross className="w-5 h-5 text-[#b93815]" />
            <div>
              <span className="text-2xl font-black block leading-none text-gray-900">106</span>
              <span className="text-xs font-semibold mt-1 block text-gray-600">SAMU · Ambulancia</span>
            </div>
          </button>

          {/* 115 Defensa Civil */}
          <button
            onClick={() => handleLlamar('115', 'Defensa Civil')}
            className="p-4 rounded-2xl bg-white text-gray-900 border border-gray-200 text-left shadow-2xs hover:border-gray-300 transition cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <Activity className="w-5 h-5 text-[#b93815]" />
            <div>
              <span className="text-2xl font-black block leading-none text-gray-900">115</span>
              <span className="text-xs font-semibold mt-1 block text-gray-600">Defensa Civil</span>
            </div>
          </button>
        </div>

        {/* Sección "En tu barrio" */}
        <div className="space-y-3">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">En tu barrio</h3>
            <p className="text-xs text-gray-500">Los más cercanos a tu ubicación</p>
          </div>

          <div className="space-y-2.5">
            
            {/* Serenazgo */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                  SZ
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Serenazgo de Surco</h4>
                  <p className="text-[11px] text-gray-500">[Nº SERENAZGO] · 24 h</p>
                </div>
              </div>
              <button 
                onClick={() => handleLlamar('014115555', 'Serenazgo de Surco')}
                className="w-9 h-9 rounded-full bg-[#b93815] text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

            {/* Comisaría */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                  CM
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Comisaría del sector</h4>
                  <p className="text-[11px] text-gray-500">1.2 km · [Nº COMISARÍA]</p>
                </div>
              </div>
              <button 
                onClick={() => handleLlamar('012711000', 'Comisaría')}
                className="w-9 h-9 rounded-full bg-[#b93815] text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

            {/* Posta de salud */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-900 font-bold text-xs flex items-center justify-center">
                  PS
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Posta de salud</h4>
                  <p className="text-[11px] text-gray-500">800 m · Abierta hasta 20:00</p>
                </div>
              </div>
              <button 
                onClick={() => handleLlamar('014490000', 'Posta de salud')}
                className="w-9 h-9 rounded-full bg-[#b93815] text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

            {/* Farmacia de turno */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">
                  FT
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Farmacia de turno</h4>
                  <p className="text-[11px] text-gray-500">350 m · Abierta ahora</p>
                </div>
              </div>
              <button 
                onClick={() => handleLlamar('013142020', 'Farmacia')}
                className="w-9 h-9 rounded-full bg-[#b93815] text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

            {/* Cerrajería */}
            <div className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                  CJ
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Cerrajería 24 h · Ana Paredes</h4>
                  <p className="text-[11px] text-gray-500">Servicio verificado</p>
                </div>
              </div>
              <button 
                onClick={() => handleLlamar('987654321', 'Cerrajería 24h')}
                className="w-9 h-9 rounded-full bg-[#b93815] text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
