import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  Flame,
  PlusSquare,
  AlertTriangle,
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
  LifeBuoy,
  Heart,
  ShieldCheck,
  Siren,
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
  icon: CategoriaPublicarOption['icon'];
  reunido: number;
  meta: number;
  unidad: string;
  aportado: boolean;
  colorBarra: string;
}

export const DirectorioEmergenciaView: React.FC<DirectorioEmergenciaViewProps> = ({
  quadrantName = 'Urb. Los Pinos, Surco',
  userAddress = 'Calle 4, Los Pinos',
  onStepModeChange,
  onEmergencyActiveChange,
}) => {
  const [pantalla, setPantalla] = useState<PantallaEmergenciaId>('1_inactiva');
  const [sinSenal, setSinSenal] = useState(false);
  const [verTodosCercanos, setVerTodosCercanos] = useState(false);

  // Paso 2 (Avisar)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoEmergenciaOption>(TIPOS_EMERGENCIA[0]);
  const [mostrarInputDetalle, setMostrarInputDetalle] = useState(false);
  const [detalleTexto, setDetalleTexto] = useState('');

  // Paso 3 (Contador 1 -> 5)
  const [confirmacionesCount, setConfirmacionesCount] = useState(5);

  // Paso 7 (Tablero)
  const [estoyASalvo, setEstoyASalvo] = useState(false);
  const [salvoCount, setSalvoCount] = useState(126);
  const [tabTablero, setTabTablero] = useState<'necesita' | 'ofrece'>('necesita');
  const [verTodoTablero, setVerTodoTablero] = useState(false);

  const [itemsNecesidad, setItemsNecesidad] = useState<ItemTablero[]>([
    { id: '1', nombre: 'Agua', icon: 'agua', reunido: 120, meta: 300, unidad: 'L', aportado: false, colorBarra: '#b43b1d' },
    { id: '2', nombre: 'Botiquín', icon: 'botiquin', reunido: 6, meta: 20, unidad: '', aportado: false, colorBarra: '#b43b1d' },
    { id: '3', nombre: 'Frazadas', icon: 'abrigo', reunido: 45, meta: 80, unidad: '', aportado: false, colorBarra: '#1d4f3c' },
  ]);

  const [itemsOfrece, setItemsOfrece] = useState<ItemTablero[]>([
    { id: '101', nombre: 'Agua', icon: 'agua', reunido: 40, meta: 100, unidad: 'L', aportado: false, colorBarra: '#1d4f3c' },
    { id: '102', nombre: 'Comida', icon: 'comida', reunido: 15, meta: 30, unidad: 'raciones', aportado: false, colorBarra: '#1d4f3c' },
    { id: '103', nombre: 'Un lugar', icon: 'lugar', reunido: 3, meta: 10, unidad: 'personas', aportado: false, colorBarra: '#1d4f3c' },
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

  const handleAportar = (id: string, esNecesidad: boolean) => {
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
      icon: categoriaPublicar.icon,
      reunido: modoPublicar === 'necesito' ? 0 : cantidadPublicar,
      meta: modoPublicar === 'necesito' ? Math.max(cantidadPublicar, 20) : Math.max(cantidadPublicar * 2, 20),
      unidad: categoriaPublicar.shortUnit === 'L' ? 'L' : '',
      aportado: false,
      colorBarra: modoPublicar === 'necesito' ? '#b43b1d' : '#1d4f3c',
    };

    if (modoPublicar === 'necesito') {
      setItemsNecesidad(prev => {
        const existe = prev.find(i => i.nombre.toLowerCase() === nuevoItem.nombre.toLowerCase());
        if (existe) {
          return prev.map(i =>
            i.id === existe.id ? { ...i, meta: i.meta + cantidadPublicar } : i
          );
        }
        return [nuevoItem, ...prev];
      });
      setTabTablero('necesita');
    } else {
      setItemsOfrece(prev => [nuevoItem, ...prev]);
      setTabTablero('ofrece');
    }

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
            className="w-10 h-10 rounded-full bg-white border border-[#ebe6dc] flex items-center justify-center text-[#1c1917] mb-4 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

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
            onClick={() => setPantalla('3_aviso_enviado')}
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
  // PANTALLAS 7 y 8 · TABLERO DE AYUDA + BOTTOM SHEET ELEGIR PUBLICAR
  // ============================================================================
  if (pantalla === '7_tablero' || pantalla === '8_elegir_publicar') {
    const listaActual = tabTablero === 'necesita' ? itemsNecesidad : itemsOfrece;
    const listaMostrada = verTodoTablero ? listaActual : listaActual.slice(0, 3);

    return (
      <div className="flex flex-col h-full bg-[#f3efe6] relative select-none overflow-hidden">
        {/* Cabecera Roja Modo Emergencia */}
        <div className="bg-[#b43b1d] px-5 pt-4 pb-4 rounded-b-3xl shrink-0">
          <div className="flex items-center gap-2.5 mb-2.5">
            <button
              onClick={() => setPantalla('6_activa')}
              className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#b43b1d]" />
              <span className="text-[10px] font-extrabold text-[#b43b1d] tracking-wide">
                MODO EMERGENCIA
              </span>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-white mb-3">
            {tipoSeleccionado.tituloLargo} · {barrioCorto}
          </h2>

          <button
            onClick={() => {
              setEstoyASalvo(prev => {
                const next = !prev;
                setSalvoCount(c => (next ? c + 1 : c - 1));
                return next;
              });
            }}
            className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer mb-2.5 ${
              estoyASalvo
                ? 'bg-[#e7f3ee] text-[#1d4f3c]'
                : 'bg-white text-[#1c1917]'
            }`}
          >
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>{estoyASalvo ? 'Estoy a salvo ✓' : 'Estoy a salvo'}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-white/90 text-xs">
            <Users className="w-3.5 h-3.5" />
            <span className="text-base font-black text-white">{salvoCount}</span>
            <span>vecinos a salvo</span>
          </div>
        </div>

        {/* Contenido del Tablero */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-28">
          <div className="grid grid-cols-2 bg-[#e6e1d6] p-1 rounded-2xl mb-3.5">
            <button
              onClick={() => setTabTablero('necesita')}
              className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                tabTablero === 'necesita'
                  ? 'bg-white text-[#1c1917] shadow-2xs'
                  : 'text-[#6b665e]'
              }`}
            >
              Se necesita
            </button>
            <button
              onClick={() => setTabTablero('ofrece')}
              className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                tabTablero === 'ofrece'
                  ? 'bg-white text-[#1c1917] shadow-2xs'
                  : 'text-[#6b665e]'
              }`}
            >
              Se ofrece
            </button>
          </div>

          <div className="space-y-2.5">
            {listaMostrada.map(item => {
              const pct = Math.min(100, Math.round((item.reunido / item.meta) * 100));
              const unidadSufijo = item.unidad ? ` ${item.unidad}` : '';
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-[#ebe6dc] flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 ${
                      tabTablero === 'necesita' ? 'bg-[#b43b1d]' : 'bg-[#1d4f3c]'
                    }`}
                  >
                    {renderCategoryIcon(item.icon, 'w-5 h-5')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#1c1917] mb-1.5">{item.nombre}</h4>
                    <div className="h-1.5 bg-[#ebe6dc] rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: item.colorBarra }}
                      />
                    </div>
                    <span className="text-[11px] text-[#78716c] font-medium">
                      {item.reunido} / {item.meta}
                      {unidadSufijo}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAportar(item.id, tabTablero === 'necesita')}
                    className={`px-3.5 py-2 rounded-xl text-white text-xs font-bold transition cursor-pointer shrink-0 ${
                      item.aportado ? 'bg-[#1d4f3c]' : 'bg-[#1c1917]'
                    }`}
                  >
                    {item.aportado
                      ? 'Listo ✓'
                      : tabTablero === 'necesita'
                      ? 'Aporto'
                      : 'Recibir'}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setVerTodoTablero(prev => !prev)}
            className="mt-3 text-xs font-bold text-[#1d4f3c] underline cursor-pointer"
          >
            {verTodoTablero ? 'Ver menos' : 'Ver todo'}
          </button>
        </div>

        {/* Botón Flotante + Verde */}
        <button
          onClick={() => setPantalla('8_elegir_publicar')}
          className="absolute bottom-22 right-5 w-12 h-12 rounded-full bg-[#1d4f3c] text-white flex items-center justify-center shadow-lg hover:scale-105 transition cursor-pointer z-20"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* PANTALLA 8 · OVERLAY ELEGIR "¿Qué quieres publicar?" */}
        {pantalla === '8_elegir_publicar' && (
          <div className="absolute inset-0 bg-[#1c1917]/55 flex flex-col justify-end z-40">
            <div className="flex-1" onClick={() => setPantalla('7_tablero')} />
            <div className="bg-[#f3efe6] rounded-t-3xl px-5 pt-3 pb-7">
              <div className="w-10 h-1 rounded-full bg-[#d4cdc0] mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-extrabold text-[#1c1917]">
                  ¿Qué quieres publicar?
                </h3>
                <button
                  onClick={() => setPantalla('7_tablero')}
                  className="w-9 h-9 rounded-full bg-white border border-[#ebe6dc] flex items-center justify-center text-[#1c1917] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setModoPublicar('necesito');
                    setPantalla('9_que_publicar');
                  }}
                  className="bg-white rounded-2xl py-6 flex flex-col items-center border border-[#ebe6dc] hover:border-[#b43b1d] transition cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#b43b1d] text-white flex items-center justify-center mb-2.5">
                    <LifeBuoy className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-[#1c1917]">Necesito</span>
                </button>

                <button
                  onClick={() => {
                    setModoPublicar('ayudar');
                    setPantalla('9_que_publicar');
                  }}
                  className="bg-white rounded-2xl py-6 flex flex-col items-center border border-[#ebe6dc] hover:border-[#1d4f3c] transition cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1d4f3c] text-white flex items-center justify-center mb-2.5">
                    <Heart className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-[#1c1917]">Puedo ayudar</span>
                </button>
              </div>
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
        {/* Cabecera */}
        <div>
          <h2 className="text-2xl font-extrabold text-[#1c1917] tracking-tight">Emergencia</h2>
          <p className="text-xs text-[#78716c]">{quadrantName}</p>
        </div>

        {/* Estado Sin Señal */}
        {sinSenal && (
          <div className="bg-[#1c1917] rounded-2xl p-3.5 flex items-center gap-3 text-white">
            <WifiOff className="w-5 h-5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold leading-snug">
                Sin señal: tus avisos se enviarán cuando vuelva
              </h4>
              <p className="text-[11px] text-stone-300">Las llamadas siguen funcionando</p>
            </div>
          </div>
        )}

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

        {/* Cuadrícula 2x2 Números de Emergencia en Verde Oscuro */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleLlamar('105', 'Policía')}
            className="p-4 rounded-2xl bg-[#1d4f3c] text-white text-left flex flex-col justify-between min-h-[112px] hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <Shield className="w-5 h-5" />
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <span className="text-3xl font-black block leading-none">105</span>
              <span className="text-xs font-semibold text-emerald-100 mt-1 block">Policía</span>
            </div>
          </button>

          <button
            onClick={() => handleLlamar('116', 'Bomberos')}
            className="p-4 rounded-2xl bg-[#1d4f3c] text-white text-left flex flex-col justify-between min-h-[112px] hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <Flame className="w-5 h-5" />
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <span className="text-3xl font-black block leading-none">116</span>
              <span className="text-xs font-semibold text-emerald-100 mt-1 block">Bomberos</span>
            </div>
          </button>

          <button
            onClick={() => handleLlamar('106', 'SAMU')}
            className="p-4 rounded-2xl bg-[#1d4f3c] text-white text-left flex flex-col justify-between min-h-[112px] hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <PlusSquare className="w-5 h-5" />
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <span className="text-3xl font-black block leading-none">106</span>
              <span className="text-xs font-semibold text-emerald-100 mt-1 block">SAMU</span>
            </div>
          </button>

          <button
            onClick={() => handleLlamar('115', 'Defensa Civil')}
            className="p-4 rounded-2xl bg-[#1d4f3c] text-white text-left flex flex-col justify-between min-h-[112px] hover:opacity-95 transition cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <AlertTriangle className="w-5 h-5" />
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <span className="text-3xl font-black block leading-none">115</span>
              <span className="text-xs font-semibold text-emerald-100 mt-1 block">
                Defensa Civil
              </span>
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
