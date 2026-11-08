import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Flame,
  PlusSquare,
  Phone,
  Megaphone,
  Check,
  Users,
  HelpCircle,
  Plus,
  Minus,
  X,
  WifiOff,
  CloudRain,
  Activity,
  Droplet,
  Utensils,
  Shirt,
  BriefcaseMedical,
  Truck,
  MapPin,
  Siren,
  Info,
} from 'lucide-react';

export type PantallaEmergenciaId =
  | '1_inactiva'
  | '2_avisar'
  | '3_aviso_enviado'
  | '4_vecino_aviso'
  | '5_confirmar'
  | '6_activa'
  | '7_tablero'
  | '8_elegir_publicar'
  | '9_que_publicar'
  | '10_cuanto_publicar'
  | '11_publicado';

interface DirectorioEmergenciaViewProps {
  onBack?: () => void;
  quadrantName?: string;
  userAddress?: string;
  onStepModeChange?: (isStepScreen: boolean) => void;
  onEmergencyActiveChange?: (isActive: boolean) => void;
}

interface TipoEmergenciaOption {
  id: string;
  label: string;
  tituloLargo: string;
  icon: 'rain' | 'sismo' | 'fire' | 'cut';
}

const TIPOS_EMERGENCIA: TipoEmergenciaOption[] = [
  { id: 'lluvia', label: 'Lluvia', tituloLargo: 'Lluvias intensas', icon: 'rain' },
  { id: 'sismo', label: 'Sismo', tituloLargo: 'Sismo fuerte', icon: 'sismo' },
  { id: 'incendio', label: 'Incendio', tituloLargo: 'Incendio reportado', icon: 'fire' },
  { id: 'corte', label: 'Sin agua/luz', tituloLargo: 'Corte de agua/luz', icon: 'cut' },
];

interface CategoriaPublicarOption {
  id: string;
  nombre: string;
  icon: 'agua' | 'comida' | 'abrigo' | 'botiquin' | 'transporte' | 'lugar';
  defaultQty: number;
  step: number;
  unitLabel: string;
  shortUnit: string;
}

const CATEGORIAS_PUBLICAR: CategoriaPublicarOption[] = [
  { id: 'agua', nombre: 'Agua', icon: 'agua', defaultQty: 20, step: 5, unitLabel: 'litros', shortUnit: 'L' },
  { id: 'comida', nombre: 'Comida', icon: 'comida', defaultQty: 10, step: 2, unitLabel: 'raciones', shortUnit: 'raciones' },
  { id: 'abrigo', nombre: 'Abrigo', icon: 'abrigo', defaultQty: 5, step: 1, unitLabel: 'unidades', shortUnit: 'uds' },
  { id: 'botiquin', nombre: 'Botiquín', icon: 'botiquin', defaultQty: 2, step: 1, unitLabel: 'unidades', shortUnit: 'uds' },
  { id: 'transporte', nombre: 'Transporte', icon: 'transporte', defaultQty: 2, step: 1, unitLabel: 'viajes', shortUnit: 'viajes' },
  { id: 'lugar', nombre: 'Un lugar', icon: 'lugar', defaultQty: 4, step: 1, unitLabel: 'personas', shortUnit: 'personas' },
];

interface ItemTablero {
  id: string;
  nombre: string;
  prioridad?: 'alta' | 'media' | 'baja';
  icon: CategoriaPublicarOption['icon'];
  reunido: number;
  meta: number;
  unidad: string;
  aportado: boolean;
  colorBarra: string;
}

export const DirectorioEmergenciaView: React.FC<DirectorioEmergenciaViewProps> = ({
  onBack,
  quadrantName = 'Urb. Los Pinos, Surco',
  userAddress = 'Calle 4, Los Pinos',
  onStepModeChange,
  onEmergencyActiveChange,
}) => {
  const [pantalla, setPantalla] = useState<PantallaEmergenciaId>('1_inactiva');
  const [sinSenal, setSinSenal] = useState<boolean>(() => typeof navigator !== 'undefined' && !navigator.onLine);
  const [avisosEnCola, setAvisosEnCola] = useState<number>(0);
  const [verTodosCercanos, setVerTodosCercanos] = useState(false);

  // Paso 2 (Avisar)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoEmergenciaOption>(TIPOS_EMERGENCIA[0]);
  const [mostrarInputDetalle, setMostrarInputDetalle] = useState(false);
  const [detalleTexto, setDetalleTexto] = useState('');

  // Paso 3 (Contador 1 -> 5)
  const [confirmacionesCount, setConfirmacionesCount] = useState(5);

  // Modales interactivos (Figma: Reportar necesidad, Ofrecer ayuda, Proponer punto de acopio)
  const [modalAyuda, setModalAyuda] = useState<'ninguno' | 'reportar' | 'ofrecer' | 'proponer_acopio'>('ninguno');
  const [seleccionReportar, setSeleccionReportar] = useState<string>('Agua');
  const [seleccionOfrecer, setSeleccionOfrecer] = useState<string>('Botiquín');
  const [seleccionAcopio, setSeleccionAcopio] = useState<string>('Local comunal');

  // Items de Necesidad (Figma: Tablero de ayuda humanitaria)
  const [itemsNecesidad, setItemsNecesidad] = useState<ItemTablero[]>([
    { id: '1', nombre: 'Frazadas', prioridad: 'alta', icon: 'abrigo', reunido: 45, meta: 80, unidad: '', aportado: false, colorBarra: '#b43b1d' },
    { id: '2', nombre: 'Botiquín básico', prioridad: 'alta', icon: 'botiquin', reunido: 6, meta: 20, unidad: '', aportado: false, colorBarra: '#b43b1d' },
    { id: '3', nombre: 'Voluntarios para limpieza', prioridad: 'media', icon: 'lugar', reunido: 9, meta: 15, unidad: '', aportado: false, colorBarra: '#1f6f4a' },
    { id: '4', nombre: 'Sacos de arena', prioridad: 'media', icon: 'transporte', reunido: 140, meta: 200, unidad: '', aportado: false, colorBarra: '#1f6f4a' },
  ]);

  // Puntos de Acopio (Figma: Puntos de acopio)
  const [puntosAcopio, setPuntosAcopio] = useState([
    {
      id: '1',
      nombre: 'Local comunal Los Pinos',
      distancia: '300 m',
      detalle: 'Abierto hasta 21:00 · Resp. Gladys S.',
      verificado: 'Verificado por 3 vecinos',
    },
    {
      id: '2',
      nombre: 'Parroquia del sector',
      distancia: '750 m',
      detalle: 'Solo víveres y frazadas · Resp. Pedro R.',
      verificado: 'Verificado por 4 vecinos',
    },
  ]);

  // Pasos 8-11 (Publicar)
  const [modoPublicar, setModoPublicar] = useState<'necesito' | 'ayudar'>('necesito');
  const [categoriaPublicar, setCategoriaPublicar] = useState<CategoriaPublicarOption>(CATEGORIAS_PUBLICAR[0]);
  const [cantidadPublicar, setCantidadPublicar] = useState<number>(20);

  const barrioCorto = quadrantName.split(',')[0]?.replace('Urb. ', '').split('·')[0]?.trim() || 'Los Pinos';
  const direccionCorta = userAddress.includes(',') ? userAddress : `Calle 4, ${barrioCorto}`;

  useEffect(() => {
    const esPantallaDePaso = [
      '2_avisar',
      '3_aviso_enviado',
      '5_confirmar',
      '8_elegir_publicar',
      '9_que_publicar',
      '10_cuanto_publicar',
      '11_publicado',
    ].includes(pantalla);
    onStepModeChange?.(esPantallaDePaso);

    const esEmergenciaActiva = [
      '6_activa',
      '7_tablero',
      '8_elegir_publicar',
      '9_que_publicar',
      '10_cuanto_publicar',
      '11_publicado',
    ].includes(pantalla);
    onEmergencyActiveChange?.(esEmergenciaActiva);
  }, [pantalla, onStepModeChange, onEmergencyActiveChange]);

  useEffect(() => {
    if (pantalla !== '3_aviso_enviado') return;
    setConfirmacionesCount(1);
    const interval = setInterval(() => {
      setConfirmacionesCount(prev => {
        if (prev >= 5) {
          clearInterval(interval);
          return 5;
        }
        return prev + 1;
      });
    }, 350);
    return () => clearInterval(interval);
  }, [pantalla]);

  useEffect(() => {
    const onOffline = () => setSinSenal(true);
    const onOnline = () => setSinSenal(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  useEffect(() => {
    if (!sinSenal && avisosEnCola > 0) {
      setAvisosEnCola(0);
    }
  }, [sinSenal, avisosEnCola]);

  const renderBannerSinSenal = (className = '') => {
    if (!sinSenal) return null;
    return (
      <div className={`bg-[#1c1917] rounded-2xl p-3.5 flex items-center gap-3 text-white ${className}`}>
        <WifiOff className="w-5 h-5 shrink-0" />
        <div>
          <h4 className="text-xs font-bold leading-snug">
            Sin señal: tus avisos se enviarán cuando vuelva
          </h4>
          <p className="text-[11px] text-stone-300">
            Las llamadas siguen funcionando
            {avisosEnCola > 0 ? ` · ${avisosEnCola} en cola` : ''}
          </p>
        </div>
      </div>
    );
  };

  const handleLlamar = (numero: string, nombre: string) => {
    window.location.href = `tel:${numero}`;
    console.info(`Marcando al ${numero} (${nombre})`);
  };

  const renderEmergencyTypeIcon = (icon: TipoEmergenciaOption['icon'], className = 'w-6 h-6') => {
    switch (icon) {
      case 'rain':
        return <CloudRain className={className} />;
      case 'sismo':
        return <Activity className={className} />;
      case 'fire':
        return <Flame className={className} />;
      case 'cut':
        return <Droplet className={className} />;
    }
  };

  const renderCategoryIcon = (icon: CategoriaPublicarOption['icon'], className = 'w-5 h-5') => {
    switch (icon) {
      case 'agua':
        return <Droplet className={className} />;
      case 'comida':
        return <Utensils className={className} />;
      case 'abrigo':
        return <Shirt className={className} />;
      case 'botiquin':
        return <BriefcaseMedical className={className} />;
      case 'transporte':
        return <Truck className={className} />;
      case 'lugar':
        return <MapPin className={className} />;
    }
  };

  const handleAportar = (id: string) => {
    setItemsNecesidad(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const nuevoEstado = !item.aportado;
        const delta = 1;
        return {
          ...item,
          aportado: nuevoEstado,
          reunido: nuevoEstado ? Math.min(item.meta, item.reunido + delta) : Math.max(0, item.reunido - delta),
        };
      })
    );
  };

  const handleConfirmarPublicacion = () => {
    const nuevoItem: ItemTablero = {
      id: Date.now().toString(),
      nombre: categoriaPublicar.nombre === 'Abrigo' ? 'Frazadas' : categoriaPublicar.nombre,
      prioridad: modoPublicar === 'necesito' ? 'alta' : 'media',
      icon: categoriaPublicar.icon,
      reunido: modoPublicar === 'necesito' ? 0 : cantidadPublicar,
      meta: modoPublicar === 'necesito' ? Math.max(cantidadPublicar, 20) : Math.max(cantidadPublicar * 2, 20),
      unidad: categoriaPublicar.shortUnit === 'L' ? 'L' : '',
      aportado: false,
      colorBarra: modoPublicar === 'necesito' ? '#b43b1d' : '#1f6f4a',
    };

    setItemsNecesidad(prev => {
      const existe = prev.find(i => i.nombre.toLowerCase() === nuevoItem.nombre.toLowerCase());
      if (existe) {
        return prev.map(i =>
          i.id === existe.id ? { ...i, meta: i.meta + cantidadPublicar } : i
        );
      }
      return [nuevoItem, ...prev];
    });

    setPantalla('11_publicado');
  };

  // ============================================================================
  // PANTALLA 2 · AVISAR ("¿Qué está pasando?")
  // ============================================================================
  if (pantalla === '2_avisar') {
    return (
      <div className="flex flex-col justify-between h-full bg-[#f3efe6] p-5 select-none">
        <div>
          <button
            onClick={() => setPantalla('1_inactiva')}
            className="w-10 h-10 rounded-full bg-white border border-[#ebe6dc] flex items-center justify-center text-[#1c1917] mb-3 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {renderBannerSinSenal('mb-3')}

          <h2 className="text-2xl font-extrabold text-[#1c1917] mb-4">¿Qué está pasando?</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {TIPOS_EMERGENCIA.map(tipo => {
              const selected = tipoSeleccionado.id === tipo.id;
              return (
                <button
                  key={tipo.id}
                  onClick={() => setTipoSeleccionado(tipo)}
                  className={`relative rounded-2xl py-5 px-3 flex flex-col items-center justify-center border transition cursor-pointer ${
                    selected
                      ? 'bg-[#f9ebe6] border-[#b43b1d] border-2'
                      : 'bg-white border-[#ebe6dc]'
                  }`}
                >
                  {selected && (
                    <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#b43b1d] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 ${
                      selected ? 'bg-[#b43b1d] text-white' : 'bg-[#efeadd] text-[#1c1917]'
                    }`}
                  >
                    {renderEmergencyTypeIcon(tipo.icon)}
                  </div>
                  <span className="text-sm font-bold text-[#1c1917]">{tipo.label}</span>
                </button>
              );
            })}
          </div>

          {!mostrarInputDetalle ? (
            <button
              onClick={() => setMostrarInputDetalle(true)}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#d4cdc0] text-[#1c1917] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/50 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar detalle</span>
            </button>
          ) : (
            <textarea
              rows={2}
              placeholder="Ej.: Se inundó la calle 4 y hay casas sin luz"
              value={detalleTexto}
              onChange={e => setDetalleTexto(e.target.value)}
              className="w-full bg-white rounded-2xl p-3.5 text-xs border border-[#d4cdc0] outline-none focus:border-[#b43b1d] resize-none"
            />
          )}
        </div>

        <div className="space-y-3 pt-3">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6b665e]">
            <Users className="w-3.5 h-3.5" />
            <span>Se activa cuando 5 vecinos lo confirman</span>
            <button
              onClick={() =>
                alert(
                  'Avisamos a los vecinos cercanos. Cuando 5 vecinos confirman en menos de 30 minutos, el tablero de ayuda se abre para todo el barrio.'
                )
              }
              className="text-[#6b665e] hover:text-[#1c1917] cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              if (sinSenal) setAvisosEnCola(c => c + 1);
              setPantalla('3_aviso_enviado');
            }}
            className="w-full py-4 rounded-2xl bg-[#b43b1d] hover:bg-[#9e3218] text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Megaphone className="w-4.5 h-4.5" />
            <span>Avisar a mis vecinos</span>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // PANTALLA 3 · AVISO ENVIADO -> 5 CONFIRMACIONES ("Tablero activado")
  // ============================================================================
  if (pantalla === '3_aviso_enviado') {
    return (
      <div className="flex flex-col justify-between h-full bg-[#f3efe6] p-5 select-none">
        {renderBannerSinSenal('mb-2')}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          <div className="w-20 h-20 rounded-full bg-[#b43b1d] text-white flex items-center justify-center mb-4">
            <Siren className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#1c1917] mb-2.5">Tablero activado</h2>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f9ebe6] text-[#b43b1d] text-xs font-bold mb-6">
            {renderEmergencyTypeIcon(tipoSeleccionado.icon, 'w-3.5 h-3.5')}
            <span>
              {tipoSeleccionado.label} · {barrioCorto}
            </span>
          </div>

          <div className="w-full bg-white rounded-2xl p-5 border border-[#ebe6dc]">
            <p className="text-xs font-bold text-[#1c1917] mb-3.5">
              <span className="text-lg font-black">{confirmacionesCount}</span> de 5 vecinos confirmaron
            </p>
            <div className="flex items-center justify-center gap-2.5">
              {[1, 2, 3, 4, 5].map(num => {
                const confirmed = num <= confirmacionesCount;
                return (
                  <div
                    key={num}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                      confirmed ? 'bg-[#1d4f3c] text-white' : 'bg-[#e7e2d8] text-stone-400'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={() => setPantalla('7_tablero')}
          className="w-full py-4 rounded-2xl bg-[#b43b1d] hover:bg-[#9e3218] text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Users className="w-4.5 h-4.5" />
          <span>Abrir tablero</span>
        </button>
      </div>
    );
  }

  // ============================================================================
  // PANTALLA 5 · CONFIRMA EL AVISO ("Un vecino avisó / ¿Lo confirmas?")
  // ============================================================================
  if (pantalla === '5_confirmar') {
    return (
      <div className="flex flex-col justify-between h-full bg-[#f3efe6] p-5 select-none">
        {renderBannerSinSenal('mb-2')}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-3">
          <div className="w-26 h-26 rounded-full bg-[#f5dad2] flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-[#b43b1d] text-white flex items-center justify-center">
              {renderEmergencyTypeIcon(tipoSeleccionado.icon, 'w-10 h-10')}
            </div>
          </div>

          <span className="text-xs text-[#78716c] mb-1">Un vecino avisó</span>

          <h2 className="text-2xl font-extrabold text-[#1c1917] leading-tight mb-3.5">
            {tipoSeleccionado.label === 'Lluvia' ? 'Lluvia fuerte' : tipoSeleccionado.tituloLargo}
            <br />
            en {barrioCorto}
          </h2>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#ebe6dc] text-[#1c1917] text-xs font-bold mb-5">
            <Users className="w-3.5 h-3.5" />
            <span>4 de 5 confirmaron</span>
          </div>

          <p className="text-sm font-bold text-[#1c1917]">¿Lo confirmas?</p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => setPantalla('6_activa')}
            className="w-full py-4 rounded-2xl bg-[#b43b1d] hover:bg-[#9e3218] text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Check className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>Sí, está pasando</span>
          </button>

          <button
            onClick={() => setPantalla('1_inactiva')}
            className="w-full py-3.5 rounded-2xl border border-[#dfd9cc] text-[#1c1917] font-bold text-xs hover:bg-white/60 transition cursor-pointer"
          >
            No lo veo
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // PANTALLAS 7 y 8 · TABLERO DE AYUDA HUMANITARIA (Figma)
  // ============================================================================
  if (pantalla === '7_tablero' || pantalla === '8_elegir_publicar') {
    return (
      <div className="flex flex-col h-full bg-[#f7f5ef] relative select-none overflow-hidden">
        {/* Cabecera Limpia */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#eae5db] bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setPantalla('6_activa')}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-[17px] font-extrabold text-[#1c1917] tracking-tight">
              Tablero de ayuda humanitaria
            </h2>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fce8e0] text-[#b43b1d]">
            {barrioCorto}
          </span>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28 space-y-5">
          
          {/* Lista de Necesidades con Barra de Progreso y Botón "Aporto" */}
          <div className="space-y-3">
            {itemsNecesidad.map(item => {
              const pct = Math.min(100, Math.round((item.reunido / item.meta) * 100));
              const esAlta = item.prioridad === 'alta';
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 border border-[#eae5db] shadow-2xs flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[15px] font-bold text-[#1c1917] leading-snug">
                        {item.nombre}
                      </h4>
                      <p
                        className={`text-xs font-semibold mt-0.5 ${
                          esAlta ? 'text-[#b43b1d]' : 'text-[#1f6f4a]'
                        }`}
                      >
                        {esAlta ? 'Prioridad alta' : 'Prioridad media'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAportar(item.id)}
                      className={`px-5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                        item.aportado
                          ? 'bg-[#1f6f4a] text-white shadow-2xs'
                          : 'bg-[#1c1917] text-white hover:bg-black'
                      }`}
                    >
                      {item.aportado ? 'Listo ✓' : 'Aporto'}
                    </button>
                  </div>

                  {/* Barra de progreso */}
                  <div>
                    <div className="h-2 bg-[#eae5db] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: esAlta ? '#b43b1d' : '#1f6f4a',
                        }}
                      />
                    </div>
                    <span className="block text-[11px] text-[#78716c] font-medium mt-1.5">
                      {item.reunido} de {item.meta} reunidos
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sección: Puntos de Acopio */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1c1917]">
                Puntos de acopio
              </h3>
              <button
                onClick={() => setModalAyuda('proponer_acopio')}
                className="px-3.5 py-1.5 rounded-full bg-[#fce8e0] text-[#b43b1d] hover:bg-[#fad8cd] text-xs font-bold transition cursor-pointer"
              >
                + Proponer punto
              </button>
            </div>

            {/* Tarjeta Unificada de Puntos de Acopio (Figma) */}
            <div className="bg-white rounded-3xl border border-[#eae5db] shadow-2xs divide-y divide-gray-100 overflow-hidden">
              {puntosAcopio.map(pto => (
                <div
                  key={pto.id}
                  className="p-4 flex items-start gap-3 hover:bg-gray-50/60 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-[#fce8e0] text-[#b43b1d] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#b43b1d]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="text-[14px] font-bold text-[#1c1917] leading-snug">
                      {pto.nombre}
                    </h5>
                    <p className="text-xs text-[#78716c] mt-0.5 leading-snug">
                      {pto.distancia} · {pto.detalle}
                    </p>
                    <p className="text-xs font-bold text-[#1f6f4a] mt-1">
                      {pto.verificado}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Barra Fija Inferior con los 2 Botones de Acción */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#f7f5ef]/95 backdrop-blur-xs p-4 border-t border-[#eae5db] flex items-center gap-3 z-30">
          <button
            onClick={() => {
              setModoPublicar('necesito');
              setModalAyuda('reportar');
            }}
            className="flex-1 py-3.5 rounded-2xl bg-white border-2 border-[#b43b1d] text-[#b43b1d] hover:bg-orange-50 font-bold text-sm text-center transition cursor-pointer shadow-2xs"
          >
            Reportar necesidad
          </button>
          <button
            onClick={() => {
              setModoPublicar('ayudar');
              setModalAyuda('ofrecer');
            }}
            className="flex-1 py-3.5 rounded-2xl bg-[#144e40] hover:bg-[#0f3d32] text-white font-bold text-sm text-center transition cursor-pointer shadow-2xs"
          >
            Ofrecer ayuda
          </button>
        </div>

        {/* ==================================================================== */}
        {/* MODAL 1: REPORTAR NECESIDAD (Paso 1 de 3) */}
        {/* ==================================================================== */}
        {modalAyuda === 'reportar' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="bg-[#f7f5ef] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] p-5 pb-7 flex flex-col gap-4 border border-gray-200 shadow-2xl max-h-[92vh] overflow-y-auto">
              
              {/* Barra superior: cerrar y paso */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setModalAyuda('ninguno')}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-black cursor-pointer shadow-2xs"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-gray-600">Paso 1 de 3</span>
              </div>

              {/* Barra de progreso de 3 segmentos */}
              <div className="grid grid-cols-3 gap-2">
                <div className="h-1 rounded-full bg-[#b43b1d]" />
                <div className="h-1 rounded-full bg-[#e5e0d4]" />
                <div className="h-1 rounded-full bg-[#e5e0d4]" />
              </div>

              {/* Insignia / Badge */}
              <div>
                <span className="inline-block bg-[#b43b1d] text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider uppercase">
                  Reportar necesidad
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-2">
                  ¿Qué se necesita?
                </h3>
              </div>

              {/* Grilla 2 columnas con 8 categorías */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'Agua', desc: 'Embotellada o bidones' },
                  { id: 'Alimentos', desc: 'Víveres o comida lista' },
                  { id: 'Abrigo', desc: 'Frazadas, ropa' },
                  { id: 'Botiquín', desc: 'Primeros auxilios' },
                  { id: 'Voluntarios', desc: 'Manos para ayudar' },
                  { id: 'Transporte', desc: 'Llevar personas o cosas' },
                  { id: 'Alojamiento', desc: 'Un lugar para dormir' },
                  { id: 'Otro', desc: 'Algo distinto' },
                ].map(op => {
                  const sel = seleccionReportar === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setSeleccionReportar(op.id)}
                      className={`p-3 rounded-2xl text-left transition cursor-pointer border ${
                        sel
                          ? 'bg-white border-2 border-[#b43b1d] shadow-xs'
                          : 'bg-white border-gray-200/90 hover:border-gray-300'
                      }`}
                    >
                      <h5 className="font-bold text-sm text-gray-900">{op.id}</h5>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{op.desc}</p>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  alert(`Se reportó solicitud para: ${seleccionReportar}`);
                  setModalAyuda('ninguno');
                }}
                className="w-full mt-2 py-3.5 rounded-2xl bg-[#b43b1d] text-white font-bold text-sm hover:bg-[#9e3218] transition cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL 2: OFRECER AYUDA (Paso 1 de 3) */}
        {/* ==================================================================== */}
        {modalAyuda === 'ofrecer' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="bg-[#f7f5ef] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] p-5 pb-7 flex flex-col gap-4 border border-gray-200 shadow-2xl max-h-[92vh] overflow-y-auto">
              
              {/* Barra superior: cerrar y paso */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setModalAyuda('ninguno')}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-black cursor-pointer shadow-2xs"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-gray-600">Paso 1 de 3</span>
              </div>

              {/* Barra de progreso de 3 segmentos */}
              <div className="grid grid-cols-3 gap-2">
                <div className="h-1 rounded-full bg-[#144e40]" />
                <div className="h-1 rounded-full bg-[#e5e0d4]" />
                <div className="h-1 rounded-full bg-[#e5e0d4]" />
              </div>

              {/* Insignia / Badge */}
              <div>
                <span className="inline-block bg-[#144e40] text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider uppercase">
                  Ofrecer ayuda
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-2">
                  ¿Qué puedes aportar?
                </h3>
              </div>

              {/* Grilla 2 columnas con 8 categorías con estado */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'Agua', desc: 'Se necesita ahora', urgente: true },
                  { id: 'Alimentos', desc: 'Sin pedidos activos', urgente: false },
                  { id: 'Abrigo', desc: 'Se necesita ahora', urgente: true },
                  { id: 'Botiquín', desc: 'Se necesita ahora', urgente: true },
                  { id: 'Mi tiempo', desc: 'Se necesita ahora', urgente: true },
                  { id: 'Transporte', desc: 'Sin pedidos activos', urgente: false },
                  { id: 'Alojamiento', desc: 'Sin pedidos activos', urgente: false },
                  { id: 'Otro', desc: 'Sin pedidos activos', urgente: false },
                ].map(op => {
                  const sel = seleccionOfrecer === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setSeleccionOfrecer(op.id)}
                      className={`p-3 rounded-2xl text-left transition cursor-pointer border ${
                        sel
                          ? 'bg-white border-2 border-[#b43b1d] shadow-xs'
                          : 'bg-white border-gray-200/90 hover:border-gray-300'
                      }`}
                    >
                      <h5 className="font-bold text-sm text-gray-900">{op.id}</h5>
                      <p
                        className={`text-[11px] mt-0.5 leading-snug font-medium ${
                          op.urgente ? 'text-[#b43b1d]' : 'text-gray-400'
                        }`}
                      >
                        {op.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  alert(`Aporte registrado para: ${seleccionOfrecer}`);
                  setModalAyuda('ninguno');
                }}
                className="w-full mt-2 py-3.5 rounded-2xl bg-[#144e40] text-white font-bold text-sm hover:bg-[#0f3d32] transition cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* MODAL 3: PROPONER PUNTO DE ACOPIO (Paso 1 de 3) */}
        {/* ==================================================================== */}
        {modalAyuda === 'proponer_acopio' && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
            <div className="bg-[#f7f5ef] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] p-5 pb-7 flex flex-col gap-4 border border-gray-200 shadow-2xl max-h-[92vh] overflow-y-auto">
              
              {/* Barra superior: cerrar y paso */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setModalAyuda('ninguno')}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-black cursor-pointer shadow-2xs"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-gray-600">Paso 1 de 3</span>
              </div>

              {/* Barra de progreso de 3 segmentos */}
              <div className="grid grid-cols-3 gap-2">
                <div className="h-1 rounded-full bg-[#b43b1d]" />
                <div className="h-1 rounded-full bg-[#e5e0d4]" />
                <div className="h-1 rounded-full bg-[#e5e0d4]" />
              </div>

              {/* Insignia / Badge */}
              <div>
                <span className="inline-block bg-[#b43b1d] text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider uppercase">
                  Proponer punto de acopio
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-2">
                  ¿Qué tipo de lugar es?
                </h3>
              </div>

              {/* Grilla 2 columnas con 6 tipos de lugar */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'Local comunal', desc: 'Espacio del barrio' },
                  { id: 'Parroquia o iglesia', desc: 'Con permiso del encargado' },
                  { id: 'Colegio', desc: 'Con permiso de la dirección' },
                  { id: 'Mi casa', desc: 'Si tienes espacio' },
                  { id: 'Bodega o negocio', desc: 'Con permiso del dueño' },
                  { id: 'Otro lugar', desc: 'Parque, cochera...' },
                ].map(op => {
                  const sel = seleccionAcopio === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setSeleccionAcopio(op.id)}
                      className={`p-3 rounded-2xl text-left transition cursor-pointer border ${
                        sel
                          ? 'bg-white border-2 border-[#b43b1d] shadow-xs'
                          : 'bg-white border-gray-200/90 hover:border-gray-300'
                      }`}
                    >
                      <h5 className="font-bold text-sm text-gray-900">{op.id}</h5>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{op.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Nota de Responsabilidad */}
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-gray-200 text-xs text-gray-600 leading-snug">
                <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <span>
                  Quien propone el punto queda como responsable. Debe ser un lugar al que los vecinos puedan llegar a pie.
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPuntosAcopio(prev => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      nombre: `${seleccionAcopio} - Nuevo`,
                      distancia: '500 m',
                      detalle: 'Abierto para emergencias · Resp. Tú',
                      verificado: 'Verificado por 1 vecino',
                    },
                  ]);
                  setModalAyuda('ninguno');
                }}
                className="w-full mt-1 py-3.5 rounded-2xl bg-[#b43b1d] text-white font-bold text-sm hover:bg-[#9e3218] transition cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ============================================================================
  // PANTALLA 9 · PUBLICAR: ¿QUÉ? ("¿Qué necesitas?")
  // ============================================================================
  if (pantalla === '9_que_publicar') {
    const esNecesito = modoPublicar === 'necesito';
    return (
      <div className="flex flex-col h-full bg-[#f3efe6] p-5 select-none">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setPantalla('7_tablero')}
            className="w-9 h-9 rounded-full bg-white border border-[#ebe6dc] flex items-center justify-center text-[#1c1917] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="h-1.5 rounded-full bg-[#1d4f3c]" />
            <div className="h-1.5 rounded-full bg-[#ded9ce]" />
          </div>
        </div>

        <span
          className={`inline-flex self-start px-3 py-1 rounded-full text-xs font-bold mb-2 ${
            esNecesito
              ? 'bg-[#f9ebe6] text-[#b43b1d]'
              : 'bg-[#dcece5] text-[#1d4f3c]'
          }`}
        >
          {esNecesito ? 'Necesito' : 'Puedo ayudar'}
        </span>

        <h2 className="text-2xl font-extrabold text-[#1c1917] mb-4">
          {esNecesito ? '¿Qué necesitas?' : '¿Con qué puedes ayudar?'}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIAS_PUBLICAR.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoriaPublicar(cat);
                setCantidadPublicar(cat.defaultQty);
                setPantalla('10_cuanto_publicar');
              }}
              className="bg-white rounded-2xl py-5 flex flex-col items-center border border-[#ebe6dc] hover:border-stone-400 transition cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#efeadd] text-[#1c1917] flex items-center justify-center mb-2.5">
                {renderCategoryIcon(cat.icon, 'w-5.5 h-5.5')}
              </div>
              <span className="text-sm font-bold text-[#1c1917]">{cat.nombre}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // PANTALLA 10 · PUBLICAR: ¿CUÁNTO? ("¿Cuánto? Opcional")
  // ============================================================================
  if (pantalla === '10_cuanto_publicar') {
    const esNecesito = modoPublicar === 'necesito';
    return (
      <div className="flex flex-col justify-between h-full bg-[#f3efe6] p-5 select-none">
        <div>
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setPantalla('9_que_publicar')}
              className="w-9 h-9 rounded-full bg-white border border-[#ebe6dc] flex items-center justify-center text-[#1c1917] cursor-pointer"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="h-1.5 rounded-full bg-[#1d4f3c]" />
              <div className="h-1.5 rounded-full bg-[#1d4f3c]" />
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-2 ${
              esNecesito
                ? 'bg-[#f9ebe6] text-[#b43b1d]'
                : 'bg-[#dcece5] text-[#1d4f3c]'
            }`}
          >
            {renderCategoryIcon(categoriaPublicar.icon, 'w-3.5 h-3.5')}
            <span>
              {esNecesito ? 'Necesito' : 'Puedo ayudar'} · {categoriaPublicar.nombre}
            </span>
          </div>

          <div className="flex items-baseline gap-2.5 mb-4">
            <h2 className="text-2xl font-extrabold text-[#1c1917]">¿Cuánto?</h2>
            <span className="text-xs text-[#78716c] font-medium">Opcional</span>
          </div>

          {/* Contador */}
          <div className="bg-white rounded-2xl py-6 px-6 border border-[#ebe6dc] flex items-center justify-between mb-3.5">
            <button
              onClick={() =>
                setCantidadPublicar(prev =>
                  Math.max(categoriaPublicar.step, prev - categoriaPublicar.step)
                )
              }
              className="w-11 h-11 rounded-full border border-[#d4cdc0] flex items-center justify-center text-[#1c1917] hover:bg-stone-100 transition cursor-pointer"
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-4xl font-black text-[#1c1917] block leading-none">
                {cantidadPublicar}
              </span>
              <span className="text-xs text-[#78716c] mt-1 block">
                {categoriaPublicar.unitLabel}
              </span>
            </div>

            <button
              onClick={() => setCantidadPublicar(prev => prev + categoriaPublicar.step)}
              className="w-11 h-11 rounded-full bg-[#1c1917] text-white flex items-center justify-center hover:opacity-90 transition cursor-pointer"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Ubicación automática */}
          <div className="bg-white rounded-2xl p-4 border border-[#ebe6dc] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#dcece5] text-[#1d4f3c] flex items-center justify-center shrink-0">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#1c1917]">{direccionCorta}</h4>
              <p className="text-[11px] font-semibold text-[#1d4f3c]">Ubicación automática</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirmarPublicacion}
          className="w-full py-4 rounded-2xl bg-[#1c1917] hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Check className="w-4.5 h-4.5" />
          <span>Confirmar</span>
        </button>
      </div>
    );
  }

  // ============================================================================
  // PANTALLA 11 · PUBLICADO ("Publicado / Tus vecinos ya lo ven")
  // ============================================================================
  if (pantalla === '11_publicado') {
    const esNecesito = modoPublicar === 'necesito';
    return (
      <div className="flex flex-col justify-between h-full bg-[#f3efe6] p-5 select-none">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#1d4f3c] text-white flex items-center justify-center mb-4">
            <Check className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#1c1917] mb-4">Publicado</h2>

          <div className="w-full bg-white rounded-2xl p-4 border border-[#ebe6dc] flex items-center gap-3 text-left mb-3">
            <div
              className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 ${
                esNecesito ? 'bg-[#b43b1d]' : 'bg-[#1d4f3c]'
              }`}
            >
              {renderCategoryIcon(categoriaPublicar.icon, 'w-5 h-5')}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#1c1917]">
                {categoriaPublicar.nombre} · {cantidadPublicar} {categoriaPublicar.shortUnit}
              </h4>
              <p className="text-xs text-[#78716c]">{direccionCorta}</p>
            </div>
          </div>

          <span className="text-xs text-[#78716c]">Tus vecinos ya lo ven</span>
        </div>

        <button
          onClick={() => setPantalla('7_tablero')}
          className="w-full py-4 rounded-2xl bg-[#1c1917] hover:bg-black text-white font-bold text-sm transition cursor-pointer"
        >
          Volver al tablero
        </button>
      </div>
    );
  }

  // ============================================================================
  // PANTALLAS 1, 4 y 6 · DIRECTORIO DE EMERGENCIA
  // ============================================================================
  const esActiva = pantalla === '6_activa';
  const esVecinoAviso = pantalla === '4_vecino_aviso';

  return (
    <div className="flex flex-col h-full bg-[#f3efe6] overflow-y-auto pb-24 select-none">
      {/* Franja Roja Superior en Pantalla 6 */}
      {esActiva && (
        <button
          onClick={() => setPantalla('7_tablero')}
          className="w-full bg-[#b43b1d] py-2.5 px-4 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Emergencia activa · {barrioCorto}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="p-5 space-y-4">
        {/* Cabecera (Figma: Emergencias con botón circular de retroceso) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBack) onBack();
            }}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-800 shadow-2xs hover:bg-gray-50 transition cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-[#1c1917] tracking-tight">Emergencias</h2>
            <p className="text-xs text-[#78716c] font-medium">{quadrantName}</p>
          </div>
        </div>

        {/* Estado Sin Señal */}
        {renderBannerSinSenal()}

        {/* Pantalla 4: Otro vecino avisó */}
        {esVecinoAviso && (
          <button
            onClick={() => setPantalla('5_confirmar')}
            className="w-full bg-[#1c1917] rounded-2xl p-3.5 flex items-center gap-3 text-left text-white cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#b43b1d] flex items-center justify-center shrink-0">
              {renderEmergencyTypeIcon(tipoSeleccionado.icon, 'w-5 h-5')}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold">Un vecino avisó: {tipoSeleccionado.label}</h4>
              <p className="text-[11px] text-stone-300">Toca para confirmar</p>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-stone-300 shrink-0" />
          </button>
        )}

        {/* Cuadrícula 2x2 Números de Emergencia (Figma: Rojo, Negro, Blanco SAMU, Blanco Defensa Civil) */}
        <div className="grid grid-cols-2 gap-3">
          {/* 105 Policía Nacional - Rojo Terracota */}
          <button
            onClick={() => handleLlamar('105', 'Policía Nacional')}
            className="p-4 rounded-3xl bg-[#b43b1d] text-white text-left flex flex-col justify-between min-h-[120px] shadow-xs hover:opacity-95 transition cursor-pointer"
          >
            <Shield className="w-5 h-5 text-white" strokeWidth={2} />
            <div>
              <span className="text-3xl font-black block leading-none text-white tracking-tight">105</span>
              <span className="text-xs font-bold text-white mt-1.5 block">Policía Nacional</span>
            </div>
          </button>

          {/* 116 Bomberos - Negro Carbón */}
          <button
            onClick={() => handleLlamar('116', 'Bomberos')}
            className="p-4 rounded-3xl bg-[#1c1917] text-white text-left flex flex-col justify-between min-h-[120px] shadow-xs hover:opacity-95 transition cursor-pointer"
          >
            <Flame className="w-5 h-5 text-white" strokeWidth={2} />
            <div>
              <span className="text-3xl font-black block leading-none text-white tracking-tight">116</span>
              <span className="text-xs font-bold text-white mt-1.5 block">Bomberos</span>
            </div>
          </button>

          {/* 106 SAMU - Blanco con Cruz Roja */}
          <button
            onClick={() => handleLlamar('106', 'SAMU Ambulancia')}
            className="p-4 rounded-3xl bg-white border border-[#eae5db] text-[#1c1917] text-left flex flex-col justify-between min-h-[120px] shadow-2xs hover:bg-gray-50 transition cursor-pointer"
          >
            <PlusSquare className="w-5 h-5 text-[#b43b1d]" strokeWidth={2.5} />
            <div>
              <span className="text-3xl font-black block leading-none text-[#1c1917] tracking-tight">106</span>
              <span className="text-xs font-bold text-[#374151] mt-1.5 block leading-tight">
                SAMU ·<br />Ambulancia
              </span>
            </div>
          </button>

          {/* 115 Defensa Civil - Blanco con Pulso Rojo */}
          <button
            onClick={() => handleLlamar('115', 'Defensa Civil')}
            className="p-4 rounded-3xl bg-white border border-[#eae5db] text-[#1c1917] text-left flex flex-col justify-between min-h-[120px] shadow-2xs hover:bg-gray-50 transition cursor-pointer"
          >
            <Activity className="w-5 h-5 text-[#b43b1d]" strokeWidth={2.5} />
            <div>
              <span className="text-3xl font-black block leading-none text-[#1c1917] tracking-tight">115</span>
              <span className="text-xs font-bold text-[#374151] mt-1.5 block">Defensa Civil</span>
            </div>
          </button>
        </div>

        {/* Botón Principal Rojo */}
        <button
          onClick={() => {
            if (esActiva) {
              setPantalla('7_tablero');
            } else {
              setPantalla('2_avisar');
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-[#b43b1d] hover:bg-[#9e3218] text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
        >
          {esActiva ? (
            <>
              <Users className="w-4.5 h-4.5" />
              <span>Ver tablero de ayuda</span>
            </>
          ) : (
            <>
              <Megaphone className="w-4.5 h-4.5" />
              <span>Avisar al barrio</span>
            </>
          )}
        </button>

        {/* Sección: Puntos de acopio (Figma) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#1c1917]">Puntos de acopio</h3>
            <button
              onClick={() => {
                setPantalla('7_tablero');
                setModalAyuda('proponer_acopio');
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#fce8e0] text-[#b43b1d] hover:bg-[#fad8cd] text-xs font-bold transition cursor-pointer"
            >
              + Proponer punto
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#eae5db] shadow-2xs divide-y divide-gray-100 overflow-hidden">
            {puntosAcopio.map(pto => (
              <div
                key={pto.id}
                className="p-4 flex items-start gap-3 hover:bg-gray-50/60 transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#fce8e0] text-[#b43b1d] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#b43b1d]" />
                </div>

                <div className="flex-1 min-w-0">
                  <h5 className="text-[14px] font-bold text-[#1c1917] leading-snug">
                    {pto.nombre}
                  </h5>
                  <p className="text-xs text-[#78716c] mt-0.5 leading-snug">
                    {pto.distancia} · {pto.detalle}
                  </p>
                  <p className="text-xs font-bold text-[#1f6f4a] mt-1">
                    {pto.verificado}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cerca de ti + Ver todos */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-extrabold text-[#1c1917]">Cerca de ti</h3>
            <button
              onClick={() => setVerTodosCercanos(prev => !prev)}
              className="text-xs font-semibold text-[#1d4f3c] underline cursor-pointer"
            >
              {verTodosCercanos ? 'Ver menos' : 'Ver todos'}
            </button>
          </div>

          <div className="bg-white rounded-2xl px-4 border border-[#ebe6dc] divide-y divide-[#f0ece3]">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1c1917]">Comisaría del sector</h4>
                <p className="text-[11px] text-[#78716c]">1,2 km</p>
              </div>
              <button
                onClick={() => handleLlamar('012711000', 'Comisaría del sector')}
                className="w-9 h-9 rounded-full bg-[#1c1917] text-white flex items-center justify-center cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1c1917]">Posta de salud</h4>
                <p className="text-[11px] text-[#78716c]">800 m</p>
              </div>
              <button
                onClick={() => handleLlamar('014490000', 'Posta de salud')}
                className="w-9 h-9 rounded-full bg-[#1c1917] text-white flex items-center justify-center cursor-pointer"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>

            {verTodosCercanos && (
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1c1917]">Serenazgo distrital</h4>
                  <p className="text-[11px] text-[#78716c]">24 horas</p>
                </div>
                <button
                  onClick={() => handleLlamar('014115555', 'Serenazgo')}
                  className="w-9 h-9 rounded-full bg-[#1c1917] text-white flex items-center justify-center cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Barra discreta para probar estados del flujo */}
        <div className="flex flex-wrap justify-center gap-1.5 pt-2">
          <button
            onClick={() => {
              setSinSenal(false);
              setPantalla('1_inactiva');
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
              pantalla === '1_inactiva' && !sinSenal
                ? 'bg-[#d6cfc2] text-[#1c1917]'
                : 'bg-[#e7e2d8] text-stone-600'
            }`}
          >
            1 · Inactiva
          </button>
          <button
            onClick={() => {
              setSinSenal(false);
              setPantalla('4_vecino_aviso');
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
              pantalla === '4_vecino_aviso'
                ? 'bg-[#d6cfc2] text-[#1c1917]'
                : 'bg-[#e7e2d8] text-stone-600'
            }`}
          >
            4 · Aviso vecino
          </button>
          <button
            onClick={() => {
              setSinSenal(false);
              setPantalla('6_activa');
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
              pantalla === '6_activa'
                ? 'bg-[#d6cfc2] text-[#1c1917]'
                : 'bg-[#e7e2d8] text-stone-600'
            }`}
          >
            6 · Activa
          </button>
          <button
            onClick={() => setSinSenal(prev => !prev)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
              sinSenal ? 'bg-[#d6cfc2] text-[#1c1917]' : 'bg-[#e7e2d8] text-stone-600'
            }`}
          >
            Sin señal
          </button>
        </div>
      </div>
    </div>
  );
};
