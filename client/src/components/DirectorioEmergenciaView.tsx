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
  AlertTriangle,
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
  initialScreen?: PantallaEmergenciaId;
  onStepModeChange?: (isStepScreen: boolean) => void;
  onEmergencyActiveChange?: (isActive: boolean) => void;
}

interface TipoEmergenciaOption {
  id: string;
  label: string;
  tituloLargo: string;
  icon: 'rain' | 'sismo' | 'fire' | 'cut' | 'otros';
}

const TIPOS_EMERGENCIA: TipoEmergenciaOption[] = [
  { id: 'lluvia', label: 'Lluvia', tituloLargo: 'Lluvias intensas', icon: 'rain' },
  { id: 'sismo', label: 'Sismo', tituloLargo: 'Sismo fuerte', icon: 'sismo' },
  { id: 'incendio', label: 'Incendio', tituloLargo: 'Incendio reportado', icon: 'fire' },
  { id: 'corte', label: 'Sin agua/luz', tituloLargo: 'Corte de agua/luz', icon: 'cut' },
];

const TIPO_OTROS: TipoEmergenciaOption = {
  id: 'otros',
  label: 'Otros',
  tituloLargo: 'Emergencia vecinal',
  icon: 'otros',
};

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
  initialScreen = '1_inactiva',
  onStepModeChange,
  onEmergencyActiveChange,
}) => {
  const [pantalla, setPantalla] = useState<PantallaEmergenciaId>(initialScreen);
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
  const [pasoAcopio, setPasoAcopio] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [nombreLugarAcopio, setNombreLugarAcopio] = useState<string>('');
  const [recibeAcopio, setRecibeAcopio] = useState<string[]>(['Agua', 'Alimentos']);
  const [horaAbreAcopio, setHoraAbreAcopio] = useState<string>('08:00');
  const [horaCierraAcopio, setHoraCierraAcopio] = useState<string>('20:00');
  const [confirmacionesAcopio, setConfirmacionesAcopio] = useState<number>(1);
  const [estadoAcopio, setEstadoAcopio] = useState<'Abierto' | 'Lleno' | 'Cerrado'>('Abierto');

  // Paso 7 (Tablero E7)
  const [estoyASalvo, setEstoyASalvo] = useState(false);
  const [salvoCount, setSalvoCount] = useState(126);
  const [tabTablero, setTabTablero] = useState<'necesita' | 'ofrece'>('necesita');
  const [verTodoTablero, setVerTodoTablero] = useState(false);

  // Items de Necesidad (Figma E7: Tablero de ayuda)
  const [itemsNecesidad, setItemsNecesidad] = useState<ItemTablero[]>([
    { id: 'n1', nombre: 'Agua', prioridad: 'alta', icon: 'agua', reunido: 120, meta: 300, unidad: 'L', aportado: false, colorBarra: '#b43b1d' },
    { id: 'n3', nombre: 'Botiquín', prioridad: 'alta', icon: 'botiquin', reunido: 6, meta: 20, unidad: '', aportado: false, colorBarra: '#b43b1d' },
    { id: 'n2', nombre: 'Frazadas', prioridad: 'media', icon: 'abrigo', reunido: 45, meta: 80, unidad: '', aportado: false, colorBarra: '#1d4f3c' },
    { id: 'n4', nombre: 'Voluntarios para limpieza', prioridad: 'media', icon: 'lugar', reunido: 9, meta: 15, unidad: '', aportado: false, colorBarra: '#1d4f3c' },
    { id: 'n5', nombre: 'Sacos de arena', prioridad: 'media', icon: 'transporte', reunido: 140, meta: 200, unidad: '', aportado: false, colorBarra: '#1d4f3c' },
  ]);

  const [itemsOfrece, setItemsOfrece] = useState<ItemTablero[]>([
    { id: '101', nombre: 'Agua', prioridad: 'alta', icon: 'agua', reunido: 40, meta: 100, unidad: 'L', aportado: false, colorBarra: '#1d4f3c' },
    { id: '102', nombre: 'Comida', prioridad: 'media', icon: 'comida', reunido: 15, meta: 30, unidad: 'raciones', aportado: false, colorBarra: '#1d4f3c' },
    { id: '103', nombre: 'Un lugar', prioridad: 'media', icon: 'lugar', reunido: 4, meta: 10, unidad: 'personas', aportado: false, colorBarra: '#1d4f3c' },
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
      case 'otros':
        return <AlertTriangle className={className} />;
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

  const handleAportar = (id: string, esNecesidad = true) => {
    const updater = (prev: ItemTablero[]) =>
      prev.map(item => {
        if (item.id !== id) return item;
        const nuevoEstado = !item.aportado;
        const delta = item.unidad === 'L' ? 10 : 1;
        return {
          ...item,
          aportado: nuevoEstado,
          reunido: nuevoEstado ? Math.min(item.meta, item.reunido + delta) : Math.max(0, item.reunido - delta),
        };
      });
    if (esNecesidad) {
      setItemsNecesidad(updater);
    } else {
      setItemsOfrece(updater);
    }
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

          {/* Botón horizontal "Otros" con pequeño ícono */}
          <button
            onClick={() => setTipoSeleccionado(TIPO_OTROS)}
            className={`relative w-full rounded-2xl py-3.5 px-4 mb-3 flex items-center justify-center gap-2.5 border transition cursor-pointer ${
              tipoSeleccionado.id === TIPO_OTROS.id
                ? 'bg-[#f9ebe6] border-[#b43b1d] border-2'
                : 'bg-white border-[#ebe6dc]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                tipoSeleccionado.id === TIPO_OTROS.id
                  ? 'bg-[#b43b1d] text-white'
                  : 'bg-[#efeadd] text-[#1c1917]'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-[#1c1917]">Otros</span>
            {tipoSeleccionado.id === TIPO_OTROS.id && (
              <span className="absolute right-3.5 w-5 h-5 rounded-full bg-[#b43b1d] text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </button>

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
  // PANTALLAS 7 y 8 · E7 TABLERO DE AYUDA + PUNTOS DE ACOPIO (Figma)
  // ============================================================================
  if (pantalla === '7_tablero' || pantalla === '8_elegir_publicar') {
    const listaBase = tabTablero === 'necesita' ? itemsNecesidad : itemsOfrece;
    const listaMostrada = verTodoTablero ? listaBase : listaBase.slice(0, 3);

    return (
      <div className="flex flex-col h-full bg-[#f3efe6] relative select-none overflow-hidden">
        {/* Cabecera Roja E7 · MODO EMERGENCIA */}
        <div className="bg-[#b43b1d] px-5 pt-4 pb-5 rounded-b-3xl shrink-0">
          <div className="flex items-center gap-3 mb-3.5">
            <button
              onClick={() => setPantalla('6_activa')}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="bg-white rounded-full px-3.5 py-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#b43b1d]" />
              <span className="text-[11px] font-extrabold text-[#b43b1d] tracking-wider">
                MODO EMERGENCIA
              </span>
            </div>
          </div>

          <h2 className="text-[22px] font-black text-white tracking-tight mb-3.5">
            {tipoSeleccionado.tituloLargo} - {barrioCorto}
          </h2>

          <button
            onClick={() => {
              setEstoyASalvo(prev => {
                const next = !prev;
                setSalvoCount(c => (next ? c + 1 : c - 1));
                return next;
              });
            }}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer mb-3 ${
              estoyASalvo
                ? 'bg-[#e7f3ee] text-[#1d4f3c]'
                : 'bg-white text-[#1c1917] hover:bg-stone-50'
            }`}
          >
            <Shield className="w-4.5 h-4.5" />
            <span>{estoyASalvo ? 'Estoy a salvo ✓' : 'Estoy a salvo'}</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-white">
            <Users className="w-4.5 h-4.5 opacity-95" />
            <p className="text-sm font-medium">
              <span className="text-xl font-black">{salvoCount}</span> vecinos a salvo
            </p>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28 space-y-4">
          {renderBannerSinSenal()}

          {/* Segmented Control: Se necesita | Se ofrece */}
          <div className="bg-[#e5e0d4] p-1 rounded-2xl flex items-center">
            <button
              onClick={() => setTabTablero('necesita')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                tabTablero === 'necesita'
                  ? 'bg-white text-[#1c1917] shadow-2xs'
                  : 'text-[#57534e]'
              }`}
            >
              Se necesita
            </button>
            <button
              onClick={() => setTabTablero('ofrece')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                tabTablero === 'ofrece'
                  ? 'bg-white text-[#1c1917] shadow-2xs'
                  : 'text-[#57534e]'
              }`}
            >
              Se ofrece
            </button>
          </div>

          {/* Lista de Tarjetas E7 (Agua, Botiquín, Frazadas) */}
          <div className="space-y-3">
            {listaMostrada.map(item => {
              const pct = Math.min(100, Math.round((item.reunido / item.meta) * 100));
              const esRojo = item.colorBarra === '#b43b1d';
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-3.5 border border-[#ebe6dc] flex items-center gap-3"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      esRojo
                        ? 'bg-[#b43b1d] text-white'
                        : 'bg-[#ebe6dc] text-[#1c1917]'
                    }`}
                  >
                    {renderCategoryIcon(item.icon, 'w-5.5 h-5.5')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-extrabold text-[#1c1917] mb-1.5">
                      {item.nombre}
                    </h4>
                    <div className="h-2 bg-[#ebe6dc] rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.colorBarra,
                        }}
                      />
                    </div>
                    <span className="block text-xs text-[#6b665e] font-medium">
                      {item.reunido} / {item.meta}
                      {item.unidad ? ` ${item.unidad}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAportar(item.id, tabTablero === 'necesita')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      item.aportado
                        ? 'bg-[#1d4f3c] text-white'
                        : 'bg-[#1c1917] text-white hover:bg-black'
                    }`}
                  >
                    {tabTablero === 'necesita'
                      ? item.aportado
                        ? 'Aportado'
                        : 'Aporto'
                      : item.aportado
                      ? 'Solicitado'
                      : 'Pedir'}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setVerTodoTablero(prev => !prev)}
            className="text-sm font-extrabold text-[#1d4f3c] underline cursor-pointer"
          >
            {verTodoTablero ? 'Ver menos' : 'Ver todo'}
          </button>

          {/* Sección Conservada: Puntos de Acopio */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#1c1917]">
                Puntos de acopio
              </h3>
              <button
                onClick={() => {
                  setPasoAcopio(1);
                  setConfirmacionesAcopio(1);
                  setEstadoAcopio('Abierto');
                  setModalAyuda('proponer_acopio');
                }}
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

        {/* Botón Flotante Verde "+" (E7) */}
        <button
          onClick={() => setPantalla('8_elegir_publicar')}
          className="absolute right-5 bottom-6 w-14 h-14 rounded-full bg-[#1d4f3c] hover:bg-[#163f30] text-white flex items-center justify-center shadow-lg transition cursor-pointer z-20"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Bottom Sheet 8_elegir_publicar: "¿Qué quieres publicar?" */}
        {pantalla === '8_elegir_publicar' && (
          <div className="absolute inset-0 bg-black/45 flex flex-col justify-end z-40">
            <div
              className="flex-1"
              onClick={() => setPantalla('7_tablero')}
            />
            <div className="bg-[#f3efe6] rounded-t-3xl p-5 pb-8 shadow-2xl">
              <div className="w-10 h-1 rounded-full bg-[#d6d0c4] mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-[#1c1917]">
                  ¿Qué quieres publicar?
                </h3>
                <button
                  onClick={() => setPantalla('7_tablero')}
                  className="w-9 h-9 rounded-full bg-white text-[#1c1917] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setModoPublicar('necesito');
                    setPantalla('9_que_publicar');
                  }}
                  className="bg-white rounded-2xl p-5 border border-[#e7e2d8] flex flex-col items-center gap-2.5 hover:border-[#b43b1d] transition cursor-pointer"
                >
                  <div className="w-13 h-13 rounded-full bg-[#b43b1d] text-white flex items-center justify-center">
                    <Siren className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-extrabold text-[#1c1917]">Necesito</span>
                </button>
                <button
                  onClick={() => {
                    setModoPublicar('ayudar');
                    setPantalla('9_que_publicar');
                  }}
                  className="bg-white rounded-2xl p-5 border border-[#e7e2d8] flex flex-col items-center gap-2.5 hover:border-[#1d4f3c] transition cursor-pointer"
                >
                  <div className="w-13 h-13 rounded-full bg-[#1d4f3c] text-white flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-extrabold text-[#1c1917]">Puedo ayudar</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
              
              {/* Barra superior: cerrar y paso / Atrás */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setModalAyuda('ninguno');
                    setPasoAcopio(1);
                  }}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-black cursor-pointer shadow-2xs"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-gray-600">
                  {pasoAcopio === 1 && 'Paso 1 de 3'}
                  {pasoAcopio === 2 && 'Paso 2 de 3'}
                  {pasoAcopio === 3 && 'Paso 3 de 3'}
                  {pasoAcopio === 4 && 'Verificación'}
                  {pasoAcopio === 5 && 'Listo'}
                </span>
                {pasoAcopio === 2 ? (
                  <button
                    type="button"
                    onClick={() => setPasoAcopio(1)}
                    className="text-xs font-bold text-[#b43b1d] hover:underline cursor-pointer"
                  >
                    Atrás
                  </button>
                ) : pasoAcopio === 3 ? (
                  <button
                    type="button"
                    onClick={() => setPasoAcopio(2)}
                    className="text-xs font-bold text-[#b43b1d] hover:underline cursor-pointer"
                  >
                    Atrás
                  </button>
                ) : (
                  <div className="w-8" />
                )}
              </div>

              {/* Barra de progreso de 3 segmentos */}
              <div className="grid grid-cols-3 gap-2">
                <div className="h-1 rounded-full bg-[#b43b1d]" />
                <div className={`h-1 rounded-full ${pasoAcopio >= 2 ? 'bg-[#b43b1d]' : 'bg-[#e5e0d4]'}`} />
                <div className={`h-1 rounded-full ${pasoAcopio >= 3 ? 'bg-[#b43b1d]' : 'bg-[#e5e0d4]'}`} />
              </div>

              {/* PASO 1: ¿Qué tipo de lugar es? */}
              {pasoAcopio === 1 && (
                <>
                  <div>
                    <span className="inline-block bg-[#b43b1d] text-white text-[10px] font-extrabold px-3 py-1 rounded-full tracking-wider uppercase">
                      Proponer punto de acopio
                    </span>
                    <h3 className="text-xl font-extrabold text-gray-900 mt-2">
                      ¿Qué tipo de lugar es?
                    </h3>
                  </div>

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

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-gray-200 text-xs text-gray-600 leading-snug">
                    <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span>
                      Quien propone el punto queda como responsable. Debe ser un lugar al que los vecinos puedan llegar a pie.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPasoAcopio(2)}
                    className="w-full mt-1 py-3.5 rounded-2xl bg-[#b43b1d] text-white font-bold text-sm hover:bg-[#9e3218] transition cursor-pointer"
                  >
                    Continuar
                  </button>
                </>
              )}

              {/* PASO 2: Datos del punto */}
              {pasoAcopio === 2 && (
                <div className="flex flex-col gap-3.5">
                  <div>
                    <span className="inline-block bg-[#fdeee9] text-[#b43b1d] text-xs font-bold px-3 py-1 rounded-full">
                      {seleccionAcopio}
                    </span>
                    <h3 className="text-xl font-extrabold text-gray-900 mt-1.5">
                      Datos del punto
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">Nombre del lugar</label>
                    <input
                      type="text"
                      placeholder="Ej.: Bodega Don Lucho"
                      value={nombreLugarAcopio}
                      onChange={(e) => setNombreLugarAcopio(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#b43b1d]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">Ubicación</label>
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-200">
                      <MapPin className="w-5 h-5 text-[#b43b1d] shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Usar mi ubicación actual</p>
                        <p className="text-xs text-gray-500">Debes estar en el lugar al registrarlo</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-800">¿Qué recibe?</label>
                    <div className="flex flex-wrap gap-2">
                      {['Agua', 'Alimentos', 'Abrigo', 'Botiquín', 'Higiene', 'Herramientas'].map(item => {
                        const sel = recibeAcopio.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              if (sel) {
                                if (recibeAcopio.length > 1) {
                                  setRecibeAcopio(recibeAcopio.filter(x => x !== item));
                                }
                              } else {
                                setRecibeAcopio([...recibeAcopio, item]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                              sel
                                ? 'bg-[#b43b1d] text-white border-[#b43b1d]'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-800">Abre</label>
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm">
                        <input
                          type="text"
                          value={horaAbreAcopio}
                          onChange={(e) => setHoraAbreAcopio(e.target.value)}
                          className="w-16 focus:outline-none font-semibold text-gray-800"
                        />
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-800">Cierra</label>
                      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm">
                        <input
                          type="text"
                          value={horaCierraAcopio}
                          onChange={(e) => setHoraCierraAcopio(e.target.value)}
                          className="w-16 focus:outline-none font-semibold text-gray-800"
                        />
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPasoAcopio(3)}
                    className="w-full mt-2 py-3.5 rounded-2xl bg-[#111827] text-white font-bold text-sm hover:bg-black transition cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              )}

              {/* PASO 3: ¿Quién lo atiende? */}
              {pasoAcopio === 3 && (
                <div className="flex flex-col gap-3.5">
                  <h3 className="text-xl font-extrabold text-gray-900">
                    ¿Quién lo atiende?
                  </h3>

                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border-2 border-[#1d4f3c]">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-800 text-sm">
                      {userName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'CM'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{userName} (tú)</p>
                      <p className="text-xs text-gray-500">Responsable principal · te escriben por el chat</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert('Se enviará una invitación a tus contactos del barrio.')}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 bg-white text-sm font-bold text-gray-900 hover:bg-gray-50 transition cursor-pointer"
                  >
                    + Invitar a un co-responsable
                  </button>

                  <div className="p-3.5 rounded-2xl bg-white border border-gray-200 text-xs text-gray-600 flex flex-col gap-1.5 leading-snug">
                    <p className="font-bold text-gray-900">Como responsable te comprometes a:</p>
                    <p>· Recibir y guardar lo que traigan los vecinos</p>
                    <p>· Marcar el punto como "Lleno" o "Cerrado" cuando corresponda</p>
                    <p>· Actualizar lo que se entregó en el tablero</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmacionesAcopio(1);
                      setPasoAcopio(4);
                    }}
                    className="w-full mt-1 py-3.5 rounded-2xl bg-[#b43b1d] text-white font-bold text-sm hover:bg-[#9e3218] transition cursor-pointer"
                  >
                    Enviar para verificar
                  </button>
                </div>
              )}

              {/* PASO 4: Verificación */}
              {pasoAcopio === 4 && (
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-2xl bg-white border-2 border-[#b43b1d] flex flex-col gap-3">
                    <span className="text-[10px] font-extrabold text-[#b43b1d] tracking-wider uppercase">
                      EN VERIFICACIÓN
                    </span>
                    <h4 className="text-base font-extrabold text-gray-900 leading-snug">
                      3 vecinos deben confirmar que el lugar existe
                    </h4>

                    {/* Barra de progreso */}
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-[#b43b1d] transition-all duration-300"
                        style={{ width: `${Math.round((confirmacionesAcopio / 3) * 100)}%` }}
                      />
                    </div>

                    <p className="text-xs font-bold text-gray-900">
                      {confirmacionesAcopio} de 3 confirmaciones
                    </p>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      Avisamos a los vecinos que viven más cerca del punto. Mientras tanto aparece en el tablero como "Por verificar".
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirmacionesAcopio < 2) {
                          setConfirmacionesAcopio(2);
                        } else {
                          setConfirmacionesAcopio(3);
                          setTimeout(() => {
                            setPasoAcopio(5);
                          }, 350);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-xs font-bold text-gray-900 hover:bg-gray-200 transition cursor-pointer"
                    >
                      Simular confirmación de un vecino
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 5: Listo */}
              {pasoAcopio === 5 && (
                <div className="flex flex-col items-center gap-3.5 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-[#1d4f3c]">
                    <Check className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-extrabold text-gray-900">
                    Punto de acopio verificado
                  </h3>

                  <div className="w-full flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-gray-200 text-left">
                    <MapPin className="w-5 h-5 text-[#b43b1d] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {nombreLugarAcopio.trim() || seleccionAcopio} · Mz. D
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {recibeAcopio.join(', ')} · {horaAbreAcopio} a {horaCierraAcopio}
                      </p>
                      <p className="text-xs font-bold text-emerald-800 mt-1">
                        Verificado por 3 vecinos · Resp. {userName}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 px-2 leading-relaxed">
                    Ya aparece en el tablero y en el mapa. Puedes cambiar su estado cuando quieras.
                  </p>

                  {/* Toggle [ Abierto | Lleno | Cerrado ] */}
                  <div className="w-full grid grid-cols-3 gap-2">
                    {(['Abierto', 'Lleno', 'Cerrado'] as const).map(st => {
                      const sel = estadoAcopio === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setEstadoAcopio(st)}
                          className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            sel && st === 'Abierto'
                              ? 'bg-[#1d4f3c] text-white border-[#1d4f3c]'
                              : sel && st === 'Lleno'
                              ? 'bg-amber-600 text-white border-amber-600'
                              : sel && st === 'Cerrado'
                              ? 'bg-gray-800 text-white border-gray-800'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const nuevoNombre = nombreLugarAcopio.trim() || seleccionAcopio;
                      setPuntosAcopio(prev => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          nombre: nuevoNombre,
                          distancia: '450 m',
                          detalle: `${recibeAcopio.slice(0, 2).join(' y ')} · ${horaAbreAcopio} - ${horaCierraAcopio} · Resp. ${userName}${
                            estadoAcopio !== 'Abierto' ? ' (' + estadoAcopio + ')' : ''
                          }`,
                          verificado: 'Verificado por 3 vecinos',
                        },
                      ]);
                      setModalAyuda('ninguno');
                      setPasoAcopio(1);
                      setConfirmacionesAcopio(1);
                      setNombreLugarAcopio('');
                    }}
                    className="w-full mt-1 py-3.5 rounded-2xl bg-[#111827] text-white font-bold text-sm hover:bg-black transition cursor-pointer"
                  >
                    Volver al tablero
                  </button>
                </div>
              )}
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
        {/* Cabecera (E6 · Emergencia activa / E1 · Emergencia) */}
        <div>
          <h2 className="text-2xl font-black text-[#1c1917] tracking-tight">Emergencia</h2>
          <p className="text-xs text-[#78716c] font-medium">{quadrantName}</p>
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

        {/* Cuadrícula 2x2 Números de Emergencia en Verde Oscuro (E6 Figma) */}
        <div className="grid grid-cols-2 gap-3">
          {/* 105 Policía */}
          <button
            onClick={() => handleLlamar('105', 'Policía')}
            className="p-4 rounded-3xl bg-[#1d4f3c] text-white text-left flex flex-col justify-between min-h-[118px] shadow-xs hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <Shield className="w-5 h-5 text-white" strokeWidth={2} />
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black block leading-none text-white tracking-tight">105</span>
              <span className="text-xs font-semibold text-[#e7f3ee] mt-1 block">Policía</span>
            </div>
          </button>

          {/* 116 Bomberos */}
          <button
            onClick={() => handleLlamar('116', 'Bomberos')}
            className="p-4 rounded-3xl bg-[#1d4f3c] text-white text-left flex flex-col justify-between min-h-[118px] shadow-xs hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <Flame className="w-5 h-5 text-white" strokeWidth={2} />
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black block leading-none text-white tracking-tight">116</span>
              <span className="text-xs font-semibold text-[#e7f3ee] mt-1 block">Bomberos</span>
            </div>
          </button>

          {/* 106 SAMU */}
          <button
            onClick={() => handleLlamar('106', 'SAMU')}
            className="p-4 rounded-3xl bg-[#1d4f3c] text-white text-left flex flex-col justify-between min-h-[118px] shadow-xs hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <PlusSquare className="w-5 h-5 text-white" strokeWidth={2} />
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black block leading-none text-white tracking-tight">106</span>
              <span className="text-xs font-semibold text-[#e7f3ee] mt-1 block">SAMU</span>
            </div>
          </button>

          {/* 115 Defensa Civil */}
          <button
            onClick={() => handleLlamar('115', 'Defensa Civil')}
            className="p-4 rounded-3xl bg-[#1d4f3c] text-white text-left flex flex-col justify-between min-h-[118px] shadow-xs hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2} />
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black block leading-none text-white tracking-tight">115</span>
              <span className="text-xs font-semibold text-[#e7f3ee] mt-1 block">Defensa Civil</span>
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
