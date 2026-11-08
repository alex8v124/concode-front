import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  TextInput,
  Linking,
  Modal,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { mobileApiService } from '../services/api';

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

interface Props {
  onBack?: () => void;
  userQuadrant?: string;
  userAddress?: string;
  userName?: string;
  initialScreen?: PantallaEmergenciaId;
  onStepModeChange?: (isStepScreen: boolean) => void;
  onEmergencyActiveChange?: (isActive: boolean) => void;
}

interface TipoEmergenciaOption {
  id: string;
  label: string;
  tituloLargo: string;
  iconName: 'weather-pouring' | 'pulse' | 'fire' | 'water-off-outline' | 'alert-circle-outline';
}

const TIPOS_EMERGENCIA: TipoEmergenciaOption[] = [
  { id: 'lluvia', label: 'Lluvia', tituloLargo: 'Lluvias intensas', iconName: 'weather-pouring' },
  { id: 'sismo', label: 'Sismo', tituloLargo: 'Sismo fuerte', iconName: 'pulse' },
  { id: 'incendio', label: 'Incendio', tituloLargo: 'Incendio reportado', iconName: 'fire' },
  { id: 'corte', label: 'Sin agua/luz', tituloLargo: 'Corte de agua/luz', iconName: 'water-off-outline' },
];

const TIPO_OTROS: TipoEmergenciaOption = {
  id: 'otros',
  label: 'Otros',
  tituloLargo: 'Emergencia vecinal',
  iconName: 'alert-circle-outline',
};

interface CategoriaPublicarOption {
  id: string;
  nombre: string;
  iconName: 'water-outline' | 'silverware-fork-knife' | 'tshirt-crew-outline' | 'medical-bag' | 'truck-outline' | 'map-marker-outline';
  defaultQty: number;
  step: number;
  unitLabel: string;
  shortUnit: string;
}

const CATEGORIAS_PUBLICAR: CategoriaPublicarOption[] = [
  { id: 'agua', nombre: 'Agua', iconName: 'water-outline', defaultQty: 20, step: 5, unitLabel: 'litros', shortUnit: 'L' },
  { id: 'comida', nombre: 'Comida', iconName: 'silverware-fork-knife', defaultQty: 10, step: 2, unitLabel: 'raciones', shortUnit: 'raciones' },
  { id: 'abrigo', nombre: 'Abrigo', iconName: 'tshirt-crew-outline', defaultQty: 5, step: 1, unitLabel: 'unidades', shortUnit: 'uds' },
  { id: 'botiquin', nombre: 'Botiquín', iconName: 'medical-bag', defaultQty: 2, step: 1, unitLabel: 'unidades', shortUnit: 'uds' },
  { id: 'transporte', nombre: 'Transporte', iconName: 'truck-outline', defaultQty: 2, step: 1, unitLabel: 'viajes', shortUnit: 'viajes' },
  { id: 'lugar', nombre: 'Un lugar', iconName: 'map-marker-outline', defaultQty: 4, step: 1, unitLabel: 'personas', shortUnit: 'personas' },
];

interface ItemTablero {
  id: string;
  nombre: string;
  prioridad?: 'alta' | 'media' | 'baja';
  iconName: CategoriaPublicarOption['iconName'];
  reunido: number;
  meta: number;
  unidad: string;
  aportado: boolean;
  colorBarra: string;
}

export const DirectorioEmergenciaScreen: React.FC<Props> = ({
  onBack,
  userQuadrant = 'Urb. Los Pinos, Surco',
  userAddress = 'Calle 4, Los Pinos',
  userName = 'Carlos M.',
  initialScreen = '1_inactiva',
  onStepModeChange,
  onEmergencyActiveChange,
}) => {
  const [pantalla, setPantalla] = useState<PantallaEmergenciaId>(initialScreen);
  const [sinSenal, setSinSenal] = useState(false);
  const [avisosEnCola, setAvisosEnCola] = useState<number>(0);
  const [verTodosCercanos, setVerTodosCercanos] = useState(false);

  // Paso 2 (Avisar)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoEmergenciaOption>(TIPOS_EMERGENCIA[0]);
  const [mostrarInputDetalle, setMostrarInputDetalle] = useState(false);
  const [detalleTexto, setDetalleTexto] = useState('');

  // Paso 3 (Contador 1 -> 5 confirmaciones)
  const [confirmacionesCount, setConfirmacionesCount] = useState(5);

  // Paso 7 (Tablero de ayuda)
  const [estoyASalvo, setEstoyASalvo] = useState(false);
  const [salvoCount, setSalvoCount] = useState(126);
  const [tabTablero, setTabTablero] = useState<'necesita' | 'ofrece'>('necesita');
  const [verTodoTablero, setVerTodoTablero] = useState(false);

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

  // Items de Necesidad (Figma E7: Tablero de ayuda)
  const [itemsNecesidad, setItemsNecesidad] = useState<ItemTablero[]>([
    { id: 'n1', nombre: 'Agua', prioridad: 'alta', iconName: 'water-outline', reunido: 120, meta: 300, unidad: 'L', aportado: false, colorBarra: '#b43b1d' },
    { id: 'n3', nombre: 'Botiquín', prioridad: 'alta', iconName: 'medical-bag', reunido: 6, meta: 20, unidad: '', aportado: false, colorBarra: '#b43b1d' },
    { id: 'n2', nombre: 'Frazadas', prioridad: 'media', iconName: 'tshirt-crew-outline', reunido: 45, meta: 80, unidad: '', aportado: false, colorBarra: '#1d4f3c' },
    { id: 'n4', nombre: 'Voluntarios para limpieza', prioridad: 'media', iconName: 'map-marker-outline', reunido: 9, meta: 15, unidad: '', aportado: false, colorBarra: '#1d4f3c' },
    { id: 'n5', nombre: 'Sacos de arena', prioridad: 'media', iconName: 'truck-outline', reunido: 140, meta: 200, unidad: '', aportado: false, colorBarra: '#1d4f3c' },
  ]);

  // Puntos de Acopio (Figma)
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

  const [itemsOfrece, setItemsOfrece] = useState<ItemTablero[]>([
    { id: '101', nombre: 'Agua', prioridad: 'alta', iconName: 'water-outline', reunido: 40, meta: 100, unidad: 'L', aportado: false, colorBarra: '#1f6f4a' },
    { id: '102', nombre: 'Comida', prioridad: 'media', iconName: 'silverware-fork-knife', reunido: 15, meta: 30, unidad: 'raciones', aportado: false, colorBarra: '#1f6f4a' },
    { id: '103', nombre: 'Un lugar', prioridad: 'media', iconName: 'map-marker-outline', reunido: 3, meta: 10, unidad: 'personas', aportado: false, colorBarra: '#1f6f4a' },
  ]);

  // Pasos 8, 9, 10, 11 (Publicar)
  const [modoPublicar, setModoPublicar] = useState<'necesito' | 'ayudar'>('necesito');
  const [categoriaPublicar, setCategoriaPublicar] = useState<CategoriaPublicarOption>(CATEGORIAS_PUBLICAR[0]);
  const [cantidadPublicar, setCantidadPublicar] = useState<number>(20);

  // Nombre corto del barrio (ej. "Los Pinos")
  const barrioCorto = userQuadrant.split(',')[0]?.replace('Urb. ', '').split('·')[0]?.trim() || 'Los Pinos';
  const direccionCorta = userAddress.includes(',') ? userAddress : `Calle 4, ${barrioCorto}`;

  // Notificar al contenedor padre si debe ocultar la barra inferior (pantallas de pasos)
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

  // Animación del contador de 1 a 5 en la pantalla 3
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

  // Detectar reconexión y enviar avisos pendientes en cola
  useEffect(() => {
    if (!sinSenal && avisosEnCola > 0) {
      mobileApiService.emitirPanico(-12.0905, -76.9902).catch(() => {});
      setAvisosEnCola(0);
    }
  }, [sinSenal, avisosEnCola]);

  // Cargar necesidades y estado del tablero desde Supabase
  useEffect(() => {
    mobileApiService.listarNecesidadesTablero('tablero-1').then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const nec: ItemTablero[] = data
          .filter((d: any) => d.tipo !== 'ofrece')
          .map((d: any) => {
            const rawName = String(d.nombre || d.recurso || 'Agua');
            const lower = rawName.toLowerCase();
            const nombreCorto = lower.includes('agua')
              ? 'Agua'
              : lower.includes('botiqu')
              ? 'Botiquín'
              : lower.includes('frazada')
              ? 'Frazadas'
              : rawName;
            const iconName: CategoriaPublicarOption['iconName'] = lower.includes('agua')
              ? 'water-outline'
              : lower.includes('botiqu')
              ? 'medical-bag'
              : lower.includes('frazada') || lower.includes('abrigo')
              ? 'tshirt-crew-outline'
              : lower.includes('comida') || lower.includes('alimento')
              ? 'silverware-fork-knife'
              : lower.includes('voluntario') || lower.includes('lugar')
              ? 'map-marker-outline'
              : 'truck-outline';
            const esRojo = lower.includes('agua') || lower.includes('botiqu');
            return {
              id: String(d.id),
              nombre: nombreCorto,
              prioridad: esRojo ? 'alta' : 'media',
              iconName,
              reunido: Number(d.reunido ?? d.actual ?? 0),
              meta: Number(d.meta ?? 20),
              unidad: lower.includes('agua') ? 'L' : (d.unidad === 'personas' ? '' : (d.unidad || '')),
              aportado: Boolean(d.cubierto),
              colorBarra: esRojo ? '#b43b1d' : '#1d4f3c',
            };
          });
        // Ordenar Agua, Botiquín, Frazadas primero como en el diseño E7
        const ordenPrioridad = (n: string) =>
          n === 'Agua' ? 1 : n === 'Botiquín' ? 2 : n === 'Frazadas' ? 3 : 4;
        nec.sort((a, b) => ordenPrioridad(a.nombre) - ordenPrioridad(b.nombre));
        if (nec.length > 0) setItemsNecesidad(nec);
      }
    }).catch(() => {});

    mobileApiService.getEstadoTablero(userQuadrant).then((est) => {
      const count = est?.personasASalvoCount ?? est?.vecinosASalvo;
      if (typeof count === 'number') {
        setSalvoCount(count);
      }
    }).catch(() => {});
  }, [userQuadrant]);

  const renderBannerSinSenal = (compact = false) => {
    if (!sinSenal) return null;
    return (
      <View style={[styles.darkStatusBanner, compact && { marginHorizontal: 20, marginTop: 8, marginBottom: 4 }]}>
        <Feather name="wifi-off" size={20} color="#ffffff" style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.darkStatusBannerTitle}>
            Sin señal: tus avisos se enviarán cuando vuelva
          </Text>
          <Text style={styles.darkStatusBannerSub}>
            Las llamadas siguen funcionando
            {avisosEnCola > 0 ? ` · ${avisosEnCola} en cola` : ''}
          </Text>
        </View>
      </View>
    );
  };

  const handleLlamar = (numero: string, nombre: string) => {
    Linking.openURL(`tel:${numero}`).catch(() => {
      Alert.alert(`Llamar a ${nombre}`, `Marcando al ${numero}...`);
    });
  };

  const handleAportar = (id: string, esNecesidad: boolean) => {
    const updater = (prev: ItemTablero[]) =>
      prev.map(item => {
        if (item.id !== id) return item;
        const nuevoEstado = !item.aportado;
        const delta = item.unidad === 'L' ? 10 : 1;
        if (nuevoEstado) {
          mobileApiService.registrarAporteTablero('tablero-1', {
            necesidadId: id,
            descripcion: item.nombre,
            cantidad: delta,
          }).catch(() => {});
        }
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
    const nombreRecurso = categoriaPublicar.nombre === 'Abrigo' ? 'Frazadas' : categoriaPublicar.nombre;
    const nuevoItem: ItemTablero = {
      id: Date.now().toString(),
      nombre: nombreRecurso,
      iconName: categoriaPublicar.iconName,
      reunido: modoPublicar === 'necesito' ? 0 : cantidadPublicar,
      meta: modoPublicar === 'necesito' ? Math.max(cantidadPublicar, 20) : Math.max(cantidadPublicar * 2, 20),
      unidad: categoriaPublicar.shortUnit === 'L' ? 'L' : '',
      aportado: false,
      colorBarra: modoPublicar === 'necesito' ? '#b43b1d' : '#1d4f3c',
    };

    mobileApiService.registrarAporteTablero('tablero-1', {
      descripcion: `${modoPublicar === 'necesito' ? 'Necesito' : 'Ofrezco'} ${nombreRecurso}`,
      cantidad: cantidadPublicar,
    }).catch(() => {});

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stepScreenContainer}>
          <View style={styles.stepTopBar}>
            <TouchableOpacity
              style={styles.circleIconBtn}
              onPress={() => setPantalla('1_inactiva')}
              activeOpacity={0.75}
            >
              <Feather name="chevron-left" size={22} color="#1c1917" />
            </TouchableOpacity>
          </View>

          {renderBannerSinSenal(true)}

          <ScrollView
            contentContainerStyle={styles.stepScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.stepMainTitle}>¿Qué está pasando?</Text>

            <View style={styles.emergencyTypesGrid}>
              {TIPOS_EMERGENCIA.map(tipo => {
                const selected = tipoSeleccionado.id === tipo.id;
                return (
                  <TouchableOpacity
                    key={tipo.id}
                    style={[
                      styles.emergencyTypeCard,
                      selected && styles.emergencyTypeCardSelected,
                    ]}
                    onPress={() => setTipoSeleccionado(tipo)}
                    activeOpacity={0.8}
                  >
                    {selected && (
                      <View style={styles.selectedCornerCheck}>
                        <Feather name="check" size={12} color="#ffffff" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.emergencyTypeIconCircle,
                        selected && styles.emergencyTypeIconCircleSelected,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={tipo.iconName}
                        size={26}
                        color={selected ? '#ffffff' : '#1c1917'}
                      />
                    </View>
                    <Text style={styles.emergencyTypeLabel}>{tipo.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Botón horizontal "Otros" con pequeño ícono */}
            <TouchableOpacity
              style={[
                styles.otrosHorizontalBtn,
                tipoSeleccionado.id === TIPO_OTROS.id && styles.emergencyTypeCardSelected,
              ]}
              onPress={() => setTipoSeleccionado(TIPO_OTROS)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.otrosSmallIconCircle,
                  tipoSeleccionado.id === TIPO_OTROS.id && styles.emergencyTypeIconCircleSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name={TIPO_OTROS.iconName}
                  size={20}
                  color={tipoSeleccionado.id === TIPO_OTROS.id ? '#ffffff' : '#1c1917'}
                />
              </View>
              <Text style={styles.emergencyTypeLabel}>Otros</Text>
              {tipoSeleccionado.id === TIPO_OTROS.id && (
                <View style={styles.otrosCheckRight}>
                  <Feather name="check" size={12} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            {!mostrarInputDetalle ? (
              <TouchableOpacity
                style={styles.dashedDetailBtn}
                onPress={() => setMostrarInputDetalle(true)}
                activeOpacity={0.75}
              >
                <Feather name="plus" size={16} color="#1c1917" />
                <Text style={styles.dashedDetailBtnText}>Agregar detalle</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.detailInputWrapper}>
                <TextInput
                  style={styles.detailTextInput}
                  placeholder="Ej.: Se inundó la calle 4 y hay casas sin luz"
                  placeholderTextColor="#8c857b"
                  value={detalleTexto}
                  onChangeText={setDetalleTexto}
                  multiline
                  autoFocus
                />
              </View>
            )}
          </ScrollView>

          <View style={styles.stepBottomFooter}>
            <View style={styles.confirmRuleRow}>
              <Feather name="users" size={14} color="#6b665e" />
              <Text style={styles.confirmRuleText}>
                Se activa cuando 5 vecinos lo confirman
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    '¿Cómo se activa el tablero?',
                    'Avisamos a los vecinos cercanos. Cuando 5 vecinos confirman en menos de 30 minutos, el tablero de ayuda se abre para todo el barrio.'
                  )
                }
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="help-circle" size={16} color="#6b665e" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryRedBtn}
              onPress={() => {
                if (sinSenal) {
                  setAvisosEnCola(c => c + 1);
                } else {
                  mobileApiService.emitirPanico(-12.0905, -76.9902).catch(() => {});
                }
                setPantalla('3_aviso_enviado');
              }}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="bullhorn-outline" size={20} color="#ffffff" />
              <Text style={styles.primaryRedBtnText}>Avisar a mis vecinos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // PANTALLA 3 · AVISO ENVIADO -> 5 CONFIRMACIONES ("Tablero activado")
  // ============================================================================
  if (pantalla === '3_aviso_enviado') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stepScreenContainer}>
          {renderBannerSinSenal(true)}
          <View style={styles.centeredStepBody}>
            <View style={styles.bigRedCircleIcon}>
              <MaterialCommunityIcons name="alarm-light-outline" size={40} color="#ffffff" />
            </View>

            <Text style={styles.centeredStepTitle}>Tablero activado</Text>

            <View style={styles.softRedPill}>
              <MaterialCommunityIcons
                name={tipoSeleccionado.iconName}
                size={15}
                color="#b43b1d"
              />
              <Text style={styles.softRedPillText}>
                {tipoSeleccionado.label} · {barrioCorto}
              </Text>
            </View>

            <View style={styles.confirmationsBoxCard}>
              <Text style={styles.confirmationsBoxTitle}>
                <Text style={styles.confirmationsBoxNumber}>{confirmacionesCount}</Text> de 5 vecinos confirmaron
              </Text>

              <View style={styles.fiveChecksRow}>
                {[1, 2, 3, 4, 5].map(num => {
                  const confirmed = num <= confirmacionesCount;
                  return (
                    <View
                      key={num}
                      style={[
                        styles.checkCircleBadge,
                        !confirmed && styles.checkCircleBadgePending,
                      ]}
                    >
                      <Feather
                        name="check"
                        size={18}
                        color={confirmed ? '#ffffff' : '#a8a29e'}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.stepBottomFooter}>
            <TouchableOpacity
              style={styles.primaryRedBtn}
              onPress={() => setPantalla('7_tablero')}
              activeOpacity={0.85}
            >
              <Feather name="users" size={18} color="#ffffff" />
              <Text style={styles.primaryRedBtnText}>Abrir tablero</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // PANTALLA 5 · CONFIRMA EL AVISO ("Un vecino avisó / ¿Lo confirmas?")
  // ============================================================================
  if (pantalla === '5_confirmar') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stepScreenContainer}>
          {renderBannerSinSenal(true)}
          <View style={styles.centeredStepBody}>
            <View style={styles.bigRedCircleHalo}>
              <View style={styles.bigRedCircleIcon}>
                <MaterialCommunityIcons
                  name={tipoSeleccionado.iconName}
                  size={40}
                  color="#ffffff"
                />
              </View>
            </View>

            <Text style={styles.smallMutedOverline}>Un vecino avisó</Text>

            <Text style={styles.confirmAlertMainTitle}>
              {tipoSeleccionado.label === 'Lluvia' ? 'Lluvia fuerte' : tipoSeleccionado.tituloLargo}{'\n'}en {barrioCorto}
            </Text>

            <View style={styles.whiteCounterPill}>
              <Feather name="users" size={14} color="#1c1917" />
              <Text style={styles.whiteCounterPillText}>4 de 5 confirmaron</Text>
            </View>

            <Text style={styles.doYouConfirmText}>¿Lo confirmas?</Text>
          </View>

          <View style={styles.stepBottomFooter}>
            <TouchableOpacity
              style={styles.primaryRedBtn}
              onPress={() => setPantalla('6_activa')}
              activeOpacity={0.85}
            >
              <Feather name="check" size={18} color="#ffffff" />
              <Text style={styles.primaryRedBtnText}>Sí, está pasando</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryOutlineBtn}
              onPress={() => setPantalla('1_inactiva')}
              activeOpacity={0.75}
            >
              <Text style={styles.secondaryOutlineBtnText}>No lo veo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // PANTALLAS 7 y 8 · E7 TABLERO DE AYUDA + PUNTOS DE ACOPIO (Figma)
  // ============================================================================
  if (pantalla === '7_tablero' || pantalla === '8_elegir_publicar') {
    const listaBase = tabTablero === 'necesita' ? itemsNecesidad : itemsOfrece;
    const listaMostrada = verTodoTablero ? listaBase : listaBase.slice(0, 3);

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          {/* Cabecera Roja E7 · MODO EMERGENCIA */}
          <View style={styles.tableroRedHeader}>
            <View style={styles.tableroHeaderTopRow}>
              <TouchableOpacity
                style={styles.translucentBackBtn}
                onPress={() => setPantalla('6_activa')}
                activeOpacity={0.75}
              >
                <Feather name="chevron-left" size={22} color="#ffffff" />
              </TouchableOpacity>

              <View style={styles.modoEmergenciaPill}>
                <View style={styles.redDotIndicator} />
                <Text style={styles.modoEmergenciaPillText}>MODO EMERGENCIA</Text>
              </View>
            </View>

            <Text style={styles.tableroHeaderTitle}>
              {tipoSeleccionado.tituloLargo} - {barrioCorto}
            </Text>

            <TouchableOpacity
              style={[
                styles.estoyASalvoWhiteBtn,
                estoyASalvo && styles.estoyASalvoWhiteBtnActive,
              ]}
              onPress={() => {
                setEstoyASalvo(prev => {
                  const next = !prev;
                  setSalvoCount(c => (next ? c + 1 : c - 1));
                  if (next) {
                    mobileApiService.marcarEstoyASalvo('tablero-1').catch(() => {});
                  }
                  return next;
                });
              }}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={20}
                color={estoyASalvo ? '#1d4f3c' : '#1c1917'}
              />
              <Text
                style={[
                  styles.estoyASalvoBtnLabel,
                  estoyASalvo && { color: '#1d4f3c' },
                ]}
              >
                {estoyASalvo ? 'Estoy a salvo ✓' : 'Estoy a salvo'}
              </Text>
            </TouchableOpacity>

            <View style={styles.salvoCounterRow}>
              <Feather name="users" size={15} color="#fde8e2" />
              <Text style={styles.salvoCounterNumber}>{salvoCount}</Text>
              <Text style={styles.salvoCounterLabel}>vecinos a salvo</Text>
            </View>
          </View>

          {renderBannerSinSenal(true)}

          {/* Contenido Scrollable del Tablero */}
          <ScrollView
            contentContainerStyle={styles.tableroBodyScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Selector Se necesita / Se ofrece */}
            <View style={styles.segmentedControlWrap}>
              <TouchableOpacity
                style={[
                  styles.segmentedTabBtn,
                  tabTablero === 'necesita' && styles.segmentedTabBtnActive,
                ]}
                onPress={() => setTabTablero('necesita')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentedTabText,
                    tabTablero === 'necesita' && styles.segmentedTabTextActive,
                  ]}
                >
                  Se necesita
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentedTabBtn,
                  tabTablero === 'ofrece' && styles.segmentedTabBtnActive,
                ]}
                onPress={() => setTabTablero('ofrece')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentedTabText,
                    tabTablero === 'ofrece' && styles.segmentedTabTextActive,
                  ]}
                >
                  Se ofrece
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tarjetas de Recursos (E7: Icono a la izquierda + Progreso + Botón Aporto) */}
            <View style={styles.tableroCardsList}>
              {listaMostrada.map(item => {
                const pct = Math.min(100, Math.round((item.reunido / item.meta) * 100));
                const unidadSufijo = item.unidad ? ` ${item.unidad}` : '';
                const esBeigeIcon =
                  tabTablero === 'necesita' &&
                  (item.nombre.toLowerCase().includes('frazada') || item.prioridad === 'media');
                const bgIconBox =
                  tabTablero === 'ofrece'
                    ? '#1d4f3c'
                    : esBeigeIcon
                    ? '#ece7dc'
                    : '#b43b1d';
                const colorIcon = esBeigeIcon ? '#1c1917' : '#ffffff';

                return (
                  <View key={item.id} style={styles.resourceItemCard}>
                    <View
                      style={[
                        styles.resourceIconBox,
                        { backgroundColor: bgIconBox },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.iconName}
                        size={22}
                        color={colorIcon}
                      />
                    </View>

                    <View style={styles.resourceMiddleCol}>
                      <Text style={styles.resourceNameText}>{item.nombre}</Text>
                      <View style={styles.resourceProgressTrack}>
                        <View
                          style={[
                            styles.resourceProgressFill,
                            { width: `${pct}%`, backgroundColor: item.colorBarra },
                          ]}
                        />
                      </View>
                      <Text style={styles.resourceCountSub}>
                        {item.reunido} / {item.meta}{unidadSufijo}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.aportoDarkBtn,
                        item.aportado && styles.aportoDarkBtnActive,
                      ]}
                      onPress={() => handleAportar(item.id, tabTablero === 'necesita')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.aportoDarkBtnText}>
                        {item.aportado
                          ? 'Listo ✓'
                          : tabTablero === 'necesita'
                          ? 'Aporto'
                          : 'Recibir'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.verTodoLinkBtn}
              onPress={() => setVerTodoTablero(prev => !prev)}
              activeOpacity={0.7}
            >
              <Text style={styles.verTodoLinkText}>
                {verTodoTablero ? 'Ver menos' : 'Ver todo'}
              </Text>
            </TouchableOpacity>

            {/* Sección Conservada: Puntos de Acopio */}
            <View style={[styles.acopioSection, { marginTop: 22 }]}>
              <View style={styles.acopioHeaderRow}>
                <Text style={styles.acopioSectionTitle}>Puntos de acopio</Text>
                <TouchableOpacity
                  style={styles.proponerPuntoBtn}
                  onPress={() => {
                  setPasoAcopio(1);
                  setConfirmacionesAcopio(1);
                  setEstadoAcopio('Abierto');
                  setModalAyuda('proponer_acopio');
                }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.proponerPuntoText}>+ Proponer punto</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.acopioCardsList}>
                {puntosAcopio.map(pto => (
                  <View key={pto.id} style={styles.acopioCard}>
                    <View style={styles.acopioPinCircle}>
                      <Feather name="map-pin" size={16} color="#b43b1d" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.acopioCardName}>{pto.nombre}</Text>
                      <Text style={styles.acopioCardDetail}>
                        {pto.distancia} · {pto.detalle}
                      </Text>
                      <Text style={styles.acopioCardVerified}>{pto.verificado}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Botón Flotante + Verde (E7) */}
          <TouchableOpacity
            style={styles.floatingGreenPlusBtn}
            onPress={() => setPantalla('8_elegir_publicar')}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={26} color="#ffffff" />
          </TouchableOpacity>

          {/* PANTALLA 8 · OVERLAY ELEGIR "¿Qué quieres publicar?" */}
          {pantalla === '8_elegir_publicar' && (
            <View style={styles.bottomSheetBackdrop}>
              <TouchableOpacity
                style={{ flex: 1 }}
                activeOpacity={1}
                onPress={() => setPantalla('7_tablero')}
              />
              <View style={styles.bottomSheetCard}>
                <View style={styles.sheetHandleBar} />

                <View style={styles.sheetHeaderRow}>
                  <Text style={styles.sheetTitleText}>¿Qué quieres publicar?</Text>
                  <TouchableOpacity
                    style={styles.circleIconBtn}
                    onPress={() => setPantalla('7_tablero')}
                    activeOpacity={0.75}
                  >
                    <Feather name="x" size={18} color="#1c1917" />
                  </TouchableOpacity>
                </View>

                <View style={styles.sheetTwoChoicesRow}>
                  <TouchableOpacity
                    style={styles.sheetChoiceBox}
                    onPress={() => {
                      setModoPublicar('necesito');
                      setPantalla('9_que_publicar');
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.sheetChoiceIconCircle, { backgroundColor: '#b43b1d' }]}>
                      <MaterialCommunityIcons name="lifebuoy" size={26} color="#ffffff" />
                    </View>
                    <Text style={styles.sheetChoiceLabel}>Necesito</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sheetChoiceBox}
                    onPress={() => {
                      setModoPublicar('ayudar');
                      setPantalla('9_que_publicar');
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.sheetChoiceIconCircle, { backgroundColor: '#1d4f3c' }]}>
                      <Feather name="heart" size={24} color="#ffffff" />
                    </View>
                    <Text style={styles.sheetChoiceLabel}>Puedo ayudar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* ==================================================================== */}
          {/* MODAL 1: REPORTAR NECESIDAD (Paso 1 de 3) */}
          {/* ==================================================================== */}
          <Modal
            visible={modalAyuda === 'reportar'}
            animationType="slide"
            transparent
            onRequestClose={() => setModalAyuda('ninguno')}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalSheetContainer}>
                <View style={styles.modalHeaderRow}>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setModalAyuda('ninguno')}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={18} color="#4b5563" />
                  </TouchableOpacity>
                  <Text style={styles.modalStepText}>Paso 1 de 3</Text>
                </View>

                {/* Barra de progreso 3 segmentos */}
                <View style={styles.modalProgressBarRow}>
                  <View style={[styles.modalProgressSegment, { backgroundColor: '#b43b1d' }]} />
                  <View style={styles.modalProgressSegment} />
                  <View style={styles.modalProgressSegment} />
                </View>

                {/* Badge e Identidad */}
                <View style={styles.modalBadgeWrap}>
                  <View style={[styles.modalPillBadge, { backgroundColor: '#b43b1d' }]}>
                    <Text style={styles.modalPillBadgeText}>REPORTAR NECESIDAD</Text>
                  </View>
                  <Text style={styles.modalMainTitle}>¿Qué se necesita?</Text>
                </View>

                {/* Grilla 2 columnas con 8 opciones */}
                <View style={styles.modalGrid2Cols}>
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
                      <TouchableOpacity
                        key={op.id}
                        style={[styles.modalOptionCard, sel && styles.modalOptionCardSelectedRed]}
                        onPress={() => setSeleccionReportar(op.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.modalOptionTitle}>{op.id}</Text>
                        <Text style={styles.modalOptionDesc}>{op.desc}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#b43b1d' }]}
                  onPress={() => {
                    Alert.alert('Solicitud enviada', `Se reportó necesidad de ${seleccionReportar}.`);
                    setModalAyuda('ninguno');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalSubmitBtnText}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ==================================================================== */}
          {/* MODAL 2: OFRECER AYUDA (Paso 1 de 3) */}
          {/* ==================================================================== */}
          <Modal
            visible={modalAyuda === 'ofrecer'}
            animationType="slide"
            transparent
            onRequestClose={() => setModalAyuda('ninguno')}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalSheetContainer}>
                <View style={styles.modalHeaderRow}>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setModalAyuda('ninguno')}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={18} color="#4b5563" />
                  </TouchableOpacity>
                  <Text style={styles.modalStepText}>Paso 1 de 3</Text>
                </View>

                {/* Barra de progreso 3 segmentos */}
                <View style={styles.modalProgressBarRow}>
                  <View style={[styles.modalProgressSegment, { backgroundColor: '#144e40' }]} />
                  <View style={styles.modalProgressSegment} />
                  <View style={styles.modalProgressSegment} />
                </View>

                {/* Badge e Identidad */}
                <View style={styles.modalBadgeWrap}>
                  <View style={[styles.modalPillBadge, { backgroundColor: '#144e40' }]}>
                    <Text style={styles.modalPillBadgeText}>OFRECER AYUDA</Text>
                  </View>
                  <Text style={styles.modalMainTitle}>¿Qué puedes aportar?</Text>
                </View>

                {/* Grilla 2 columnas con 8 opciones y tags */}
                <View style={styles.modalGrid2Cols}>
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
                      <TouchableOpacity
                        key={op.id}
                        style={[styles.modalOptionCard, sel && styles.modalOptionCardSelectedRed]}
                        onPress={() => setSeleccionOfrecer(op.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.modalOptionTitle}>{op.id}</Text>
                        <Text
                          style={[
                            styles.modalOptionDesc,
                            { color: op.urgente ? '#b43b1d' : '#9ca3af' },
                          ]}
                        >
                          {op.desc}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#144e40' }]}
                  onPress={() => {
                    Alert.alert('¡Aporte registrado!', `Gracias por ofrecer ${seleccionOfrecer}.`);
                    setModalAyuda('ninguno');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalSubmitBtnText}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ==================================================================== */}
          {/* MODAL 3: PROPONER PUNTO DE ACOPIO (Flujo completo 5 pasos Figma) */}
          {/* ==================================================================== */}
          <Modal
            visible={modalAyuda === 'proponer_acopio'}
            animationType="slide"
            transparent
            onRequestClose={() => {
              setModalAyuda('ninguno');
              setPasoAcopio(1);
            }}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.modalSheetContainer}>
                {/* 1. Header Row (X, Paso / Título, Atrás) */}
                <View style={styles.modalHeaderRow}>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => {
                      setModalAyuda('ninguno');
                      setPasoAcopio(1);
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={18} color="#4b5563" />
                  </TouchableOpacity>

                  <Text style={styles.modalStepText}>
                    {pasoAcopio === 1 && 'Paso 1 de 3'}
                    {pasoAcopio === 2 && 'Paso 2 de 3'}
                    {pasoAcopio === 3 && 'Paso 3 de 3'}
                    {pasoAcopio === 4 && 'Verificación'}
                    {pasoAcopio === 5 && 'Listo'}
                  </Text>

                  {pasoAcopio === 2 ? (
                    <TouchableOpacity onPress={() => setPasoAcopio(1)} activeOpacity={0.7}>
                      <Text style={styles.modalAtrasRedText}>Atrás</Text>
                    </TouchableOpacity>
                  ) : pasoAcopio === 3 ? (
                    <TouchableOpacity onPress={() => setPasoAcopio(2)} activeOpacity={0.7}>
                      <Text style={styles.modalAtrasRedText}>Atrás</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ width: 32 }} />
                  )}
                </View>

                {/* 2. Barra de progreso de 3 segmentos */}
                <View style={styles.modalProgressBarRow}>
                  <View style={[styles.modalProgressSegment, { backgroundColor: '#b43b1d' }]} />
                  <View
                    style={[
                      styles.modalProgressSegment,
                      { backgroundColor: pasoAcopio >= 2 ? '#b43b1d' : '#e5e0d4' },
                    ]}
                  />
                  <View
                    style={[
                      styles.modalProgressSegment,
                      { backgroundColor: pasoAcopio >= 3 ? '#b43b1d' : '#e5e0d4' },
                    ]}
                  />
                </View>

                {/* 3. Contenido según el paso */}

                {/* --- PASO 1: ¿Qué tipo de lugar es? --- */}
                {pasoAcopio === 1 && (
                  <View style={{ gap: 14 }}>
                    <View style={styles.modalBadgeWrap}>
                      <View style={[styles.modalPillBadge, { backgroundColor: '#b43b1d' }]}>
                        <Text style={styles.modalPillBadgeText}>PROPONER PUNTO DE ACOPIO</Text>
                      </View>
                      <Text style={styles.modalMainTitle}>¿Qué tipo de lugar es?</Text>
                    </View>

                    <View style={styles.modalGrid2Cols}>
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
                          <TouchableOpacity
                            key={op.id}
                            style={[styles.modalOptionCard, sel && styles.modalOptionCardSelectedRed]}
                            onPress={() => setSeleccionAcopio(op.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.modalOptionTitle}>{op.id}</Text>
                            <Text style={styles.modalOptionDesc}>{op.desc}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={styles.modalInfoNoticeBox}>
                      <Feather name="info" size={16} color="#6b7280" style={{ marginTop: 2 }} />
                      <Text style={styles.modalInfoNoticeText}>
                        Quien propone el punto queda como responsable. Debe ser un lugar al que los vecinos puedan llegar a pie.
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.modalSubmitBtn, { backgroundColor: '#b43b1d' }]}
                      onPress={() => setPasoAcopio(2)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.modalSubmitBtnText}>Continuar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* --- PASO 2: Datos del punto --- */}
                {pasoAcopio === 2 && (
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                    <View style={styles.modalBadgeWrap}>
                      <View style={styles.modalPillSoftPeach}>
                        <Text style={styles.modalPillSoftPeachText}>{seleccionAcopio}</Text>
                      </View>
                      <Text style={styles.modalMainTitle}>Datos del punto</Text>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabelText}>Nombre del lugar</Text>
                      <TextInput
                        style={styles.modalTextInputBox}
                        placeholder="Ej.: Bodega Don Lucho"
                        placeholderTextColor="#9ca3af"
                        value={nombreLugarAcopio}
                        onChangeText={setNombreLugarAcopio}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabelText}>Ubicación</Text>
                      <View style={styles.locationSelectorCard}>
                        <Feather name="map-pin" size={18} color="#b43b1d" style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.locationTitleText}>Usar mi ubicación actual</Text>
                          <Text style={styles.locationSubText}>Debes estar en el lugar al registrarlo</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.formLabelText}>¿Qué recibe?</Text>
                      <View style={styles.chipsWrapRow}>
                        {['Agua', 'Alimentos', 'Abrigo', 'Botiquín', 'Higiene', 'Herramientas'].map(item => {
                          const isSelected = recibeAcopio.includes(item);
                          return (
                            <TouchableOpacity
                              key={item}
                              style={[styles.chipPill, isSelected && styles.chipPillSelected]}
                              onPress={() => {
                                if (isSelected) {
                                  if (recibeAcopio.length > 1) {
                                    setRecibeAcopio(recibeAcopio.filter(x => x !== item));
                                  }
                                } else {
                                  setRecibeAcopio([...recibeAcopio, item]);
                                }
                              }}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.chipPillText, isSelected && styles.chipPillTextSelected]}>
                                {item}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.timeInputRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.formLabelText}>Abre</Text>
                        <View style={styles.timeBox}>
                          <TextInput
                            style={styles.timeInputText}
                            value={horaAbreAcopio}
                            onChangeText={setHoraAbreAcopio}
                            placeholder="08:00"
                            placeholderTextColor="#9ca3af"
                          />
                          <Feather name="clock" size={16} color="#6b7280" />
                        </View>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.formLabelText}>Cierra</Text>
                        <View style={styles.timeBox}>
                          <TextInput
                            style={styles.timeInputText}
                            value={horaCierraAcopio}
                            onChangeText={setHoraCierraAcopio}
                            placeholder="20:00"
                            placeholderTextColor="#9ca3af"
                          />
                          <Feather name="clock" size={16} color="#6b7280" />
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.modalSubmitBtn, { backgroundColor: '#111827', marginTop: 8 }]}
                      onPress={() => setPasoAcopio(3)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.modalSubmitBtnText}>Siguiente</Text>
                    </TouchableOpacity>
                  </ScrollView>
                )}

                {/* --- PASO 3: ¿Quién lo atiende? --- */}
                {pasoAcopio === 3 && (
                  <View style={{ gap: 14 }}>
                    <Text style={styles.modalMainTitle}>¿Quién lo atiende?</Text>

                    {/* Tarjeta Responsable Principal con borde verde */}
                    <View style={styles.responsibleCardContainer}>
                      <View style={styles.responsibleAvatarCircle}>
                        <Text style={styles.responsibleAvatarInitials}>
                          {userName
                            .split(' ')
                            .filter(Boolean)
                            .map(n => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase() || 'CM'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.responsibleNameText}>{userName || 'Carlos M.'} (tú)</Text>
                        <Text style={styles.responsibleRoleSubtext}>
                          Responsable principal · te escriben por el chat
                        </Text>
                      </View>
                    </View>

                    {/* Botón invitar co-responsable punteado */}
                    <TouchableOpacity
                      style={styles.dashedInviteBtn}
                      activeOpacity={0.8}
                      onPress={() => Alert.alert('Invitar', 'Se enviará una invitación a tus contactos del barrio.')}
                    >
                      <Text style={styles.dashedInviteBtnText}>+ Invitar a un co-responsable</Text>
                    </TouchableOpacity>

                    {/* Caja de compromisos */}
                    <View style={styles.commitmentsBox}>
                      <Text style={styles.commitmentsTitle}>Como responsable te comprometes a:</Text>
                      <Text style={styles.commitmentsBullet}>· Recibir y guardar lo que traigan los vecinos</Text>
                      <Text style={styles.commitmentsBullet}>
                        · Marcar el punto como "Lleno" o "Cerrado" cuando corresponda
                      </Text>
                      <Text style={styles.commitmentsBullet}>· Actualizar lo que se entregó en el tablero</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.modalSubmitBtn, { backgroundColor: '#b43b1d', marginTop: 4 }]}
                      onPress={() => {
                        setConfirmacionesAcopio(1);
                        setPasoAcopio(4);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.modalSubmitBtnText}>Enviar para verificar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* --- PASO 4: Verificación --- */}
                {pasoAcopio === 4 && (
                  <View style={{ gap: 16 }}>
                    <View style={styles.verificationCardBox}>
                      <Text style={styles.verificationStatusTag}>EN VERIFICACIÓN</Text>
                      <Text style={styles.verificationCardTitle}>
                        3 vecinos deben confirmar que el lugar existe
                      </Text>

                      {/* Barra de progreso de confirmaciones */}
                      <View style={styles.verificationTrack}>
                        <View
                          style={[
                            styles.verificationFill,
                            { width: `${Math.round((confirmacionesAcopio / 3) * 100)}%` as any },
                          ]}
                        />
                      </View>

                      <Text style={styles.verificationCountText}>
                        {confirmacionesAcopio} de 3 confirmaciones
                      </Text>

                      <Text style={styles.verificationDescText}>
                        Avisamos a los vecinos que viven más cerca del punto. Mientras tanto aparece en el tablero como "Por verificar".
                      </Text>

                      <TouchableOpacity
                        style={styles.simulateVerificationBtn}
                        onPress={() => {
                          if (confirmacionesAcopio < 2) {
                            setConfirmacionesAcopio(2);
                          } else {
                            setConfirmacionesAcopio(3);
                            setTimeout(() => {
                              setPasoAcopio(5);
                            }, 350);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.simulateVerificationBtnText}>
                          Simular confirmación de un vecino
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* --- PASO 5: Listo --- */}
                {pasoAcopio === 5 && (
                  <View style={{ gap: 16 }}>
                    <View style={styles.successBigCircle}>
                      <Feather name="check" size={32} color="#1d4f3c" />
                    </View>

                    <Text style={[styles.modalMainTitle, { textAlign: 'center' }]}>
                      Punto de acopio verificado
                    </Text>

                    {/* Resumen del punto de acopio creado */}
                    <View style={styles.verifiedSummaryCard}>
                      <Feather name="map-pin" size={22} color="#b43b1d" style={{ marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.verifiedPlaceTitle}>
                          {nombreLugarAcopio.trim() || seleccionAcopio} · Mz. D
                        </Text>
                        <Text style={styles.verifiedPlaceDetails}>
                          {recibeAcopio.join(', ')} · {horaAbreAcopio} a {horaCierraAcopio}
                        </Text>
                        <Text style={styles.verifiedPlaceConfirmed}>
                          Verificado por 3 vecinos · Resp. {userName || 'Carlos M.'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.verifiedNoticeFootText}>
                      Ya aparece en el tablero y en el mapa. Puedes cambiar su estado cuando quieras.
                    </Text>

                    {/* Botones de estado: [ Abierto | Lleno | Cerrado ] */}
                    <View style={styles.statusButtonsRow}>
                      {(['Abierto', 'Lleno', 'Cerrado'] as const).map(st => {
                        const isSelected = estadoAcopio === st;
                        return (
                          <TouchableOpacity
                            key={st}
                            style={[
                              styles.statusToggleBtn,
                              isSelected && st === 'Abierto' && styles.statusBtnAbiertoActive,
                              isSelected && st === 'Lleno' && styles.statusBtnLlenoActive,
                              isSelected && st === 'Cerrado' && styles.statusBtnCerradoActive,
                            ]}
                            onPress={() => setEstadoAcopio(st)}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.statusToggleBtnText,
                                isSelected && styles.statusToggleBtnTextActive,
                              ]}
                            >
                              {st}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <TouchableOpacity
                      style={[styles.modalSubmitBtn, { backgroundColor: '#111827', marginTop: 4 }]}
                      onPress={() => {
                        const nuevoNombre = nombreLugarAcopio.trim() || seleccionAcopio;
                        setPuntosAcopio(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            nombre: nuevoNombre,
                            distancia: '450 m',
                            detalle: `${recibeAcopio.slice(0, 2).join(' y ')} · ${horaAbreAcopio} - ${horaCierraAcopio} · Resp. ${userName || 'Tú'}${
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
                      activeOpacity={0.85}
                    >
                      <Text style={styles.modalSubmitBtnText}>Volver al tablero</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </Modal>

        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // PANTALLA 9 · PUBLICAR: ¿QUÉ? ("¿Qué necesitas?")
  // ============================================================================
  if (pantalla === '9_que_publicar') {
    const esNecesito = modoPublicar === 'necesito';
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stepScreenContainer}>
          <View style={styles.wizardTopRow}>
            <TouchableOpacity
              style={styles.circleIconBtn}
              onPress={() => setPantalla('7_tablero')}
              activeOpacity={0.75}
            >
              <Feather name="x" size={20} color="#1c1917" />
            </TouchableOpacity>

            <View style={styles.wizardProgressRow}>
              <View style={[styles.wizardProgressBar, styles.wizardProgressBarActive]} />
              <View style={styles.wizardProgressBar} />
            </View>
          </View>

          {renderBannerSinSenal(true)}

          <ScrollView
            contentContainerStyle={styles.stepScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.softModeTag,
                { backgroundColor: esNecesito ? '#f9ebe6' : '#dcece5' },
              ]}
            >
              <Text
                style={[
                  styles.softModeTagText,
                  { color: esNecesito ? '#b43b1d' : '#1d4f3c' },
                ]}
              >
                {esNecesito ? 'Necesito' : 'Puedo ayudar'}
              </Text>
            </View>

            <Text style={styles.stepMainTitle}>
              {esNecesito ? '¿Qué necesitas?' : '¿Con qué puedes ayudar?'}
            </Text>

            <View style={styles.sixCategoriesGrid}>
              {CATEGORIAS_PUBLICAR.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categorySelectCard}
                  onPress={() => {
                    setCategoriaPublicar(cat);
                    setCantidadPublicar(cat.defaultQty);
                    setPantalla('10_cuanto_publicar');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.categorySelectIconCircle}>
                    <MaterialCommunityIcons
                      name={cat.iconName}
                      size={26}
                      color="#1c1917"
                    />
                  </View>
                  <Text style={styles.categorySelectLabel}>{cat.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // PANTALLA 10 · PUBLICAR: ¿CUÁNTO? ("¿Cuánto? Opcional")
  // ============================================================================
  if (pantalla === '10_cuanto_publicar') {
    const esNecesito = modoPublicar === 'necesito';
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stepScreenContainer}>
          <View style={styles.wizardTopRow}>
            <TouchableOpacity
              style={styles.circleIconBtn}
              onPress={() => setPantalla('9_que_publicar')}
              activeOpacity={0.75}
            >
              <Feather name="chevron-left" size={22} color="#1c1917" />
            </TouchableOpacity>

            <View style={styles.wizardProgressRow}>
              <View style={[styles.wizardProgressBar, styles.wizardProgressBarActive]} />
              <View style={[styles.wizardProgressBar, styles.wizardProgressBarActive]} />
            </View>
          </View>

          {renderBannerSinSenal(true)}

          <ScrollView
            contentContainerStyle={styles.stepScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.softModeTag,
                { backgroundColor: esNecesito ? '#f9ebe6' : '#dcece5' },
              ]}
            >
              <MaterialCommunityIcons
                name={categoriaPublicar.iconName}
                size={14}
                color={esNecesito ? '#b43b1d' : '#1d4f3c'}
              />
              <Text
                style={[
                  styles.softModeTagText,
                  { color: esNecesito ? '#b43b1d' : '#1d4f3c' },
                ]}
              >
                {esNecesito ? 'Necesito' : 'Puedo ayudar'} · {categoriaPublicar.nombre}
              </Text>
            </View>

            <View style={styles.cuantoTitleRow}>
              <Text style={styles.stepMainTitleNoMargin}>¿Cuánto?</Text>
              <Text style={styles.opcionalSubText}>Opcional</Text>
            </View>

            {/* Contador - 20 litros + */}
            <View style={styles.counterWhiteCard}>
              <TouchableOpacity
                style={styles.counterMinusCircle}
                onPress={() =>
                  setCantidadPublicar(prev =>
                    Math.max(categoriaPublicar.step, prev - categoriaPublicar.step)
                  )
                }
                activeOpacity={0.75}
              >
                <Feather name="minus" size={22} color="#1c1917" />
              </TouchableOpacity>

              <View style={styles.counterCenterCol}>
                <Text style={styles.counterBigNumber}>{cantidadPublicar}</Text>
                <Text style={styles.counterUnitText}>{categoriaPublicar.unitLabel}</Text>
              </View>

              <TouchableOpacity
                style={styles.counterPlusCircle}
                onPress={() => setCantidadPublicar(prev => prev + categoriaPublicar.step)}
                activeOpacity={0.75}
              >
                <Feather name="plus" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Tarjeta de Ubicación Automática */}
            <View style={styles.autoLocationCard}>
              <View style={styles.autoLocationIconCircle}>
                <Feather name="map-pin" size={18} color="#1d4f3c" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.autoLocationTitle}>{direccionCorta}</Text>
                <Text style={styles.autoLocationSub}>Ubicación automática</Text>
              </View>
            </View>

            {categoriaPublicar.id === 'lugar' && (
              <Text style={styles.acopioResponsibilityNote}>
                Al confirmar un punto de apoyo o acopio, tu ubicación referencial será visible en el tablero mientras dure la emergencia.
              </Text>
            )}
          </ScrollView>

          <View style={styles.stepBottomFooter}>
            <TouchableOpacity
              style={styles.primaryBlackBtn}
              onPress={handleConfirmarPublicacion}
              activeOpacity={0.85}
            >
              <Feather name="check" size={18} color="#ffffff" />
              <Text style={styles.primaryBlackBtnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // PANTALLA 11 · PUBLICADO ("Publicado / Tus vecinos ya lo ven")
  // ============================================================================
  if (pantalla === '11_publicado') {
    const esNecesito = modoPublicar === 'necesito';
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stepScreenContainer}>
          {renderBannerSinSenal(true)}
          <View style={styles.centeredStepBody}>
            <View style={styles.bigGreenCheckCircle}>
              <Feather name="check" size={40} color="#ffffff" />
            </View>

            <Text style={styles.centeredStepTitle}>Publicado</Text>

            <View style={styles.publishedSummaryCard}>
              <View
                style={[
                  styles.resourceIconBox,
                  { backgroundColor: esNecesito ? '#b43b1d' : '#1d4f3c' },
                ]}
              >
                <MaterialCommunityIcons
                  name={categoriaPublicar.iconName}
                  size={22}
                  color="#ffffff"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.publishedSummaryTitle}>
                  {categoriaPublicar.nombre} · {cantidadPublicar} {categoriaPublicar.shortUnit}
                </Text>
                <Text style={styles.publishedSummarySub}>{direccionCorta}</Text>
              </View>
            </View>

            <Text style={styles.neighborsSeeItText}>Tus vecinos ya lo ven</Text>
          </View>

          <View style={styles.stepBottomFooter}>
            <TouchableOpacity
              style={styles.primaryBlackBtn}
              onPress={() => setPantalla('7_tablero')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBlackBtnText}>Volver al tablero</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // PANTALLAS 1, 4 y 6 · DIRECTORIO DE EMERGENCIA (INACTIVA / AVISO VECINO / ACTIVA)
  // ============================================================================
  const esActiva = pantalla === '6_activa';
  const esVecinoAviso = pantalla === '4_vecino_aviso';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Franja Roja Superior en Pantalla 6 (Emergencia activa) */}
        {esActiva && (
          <TouchableOpacity
            style={styles.topActiveEmergencyStrip}
            onPress={() => setPantalla('7_tablero')}
            activeOpacity={0.85}
          >
            <View style={styles.yellowDotSmall} />
            <Text style={styles.topActiveEmergencyStripText}>
              Emergencia activa · {barrioCorto}
            </Text>
            <Feather name="chevron-right" size={16} color="#ffffff" />
          </TouchableOpacity>
        )}

        <ScrollView
          contentContainerStyle={styles.directoryScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabecera (E6 · Emergencia activa / E1 · Emergencia) */}
          <View style={styles.directoryHeader}>
            <Text style={styles.directoryMainTitle}>Emergencia</Text>
            <Text style={styles.directorySubZone}>{userQuadrant}</Text>
          </View>

          {/* Estado Aparte: Banner Sin Señal */}
          {renderBannerSinSenal(false)}

          {/* Pantalla 4: Banner "Un vecino avisó: Lluvia · Toca para confirmar" */}
          {esVecinoAviso && (
            <TouchableOpacity
              style={styles.darkStatusBanner}
              onPress={() => setPantalla('5_confirmar')}
              activeOpacity={0.85}
            >
              <View style={styles.neighborAlertIconCircle}>
                <MaterialCommunityIcons
                  name={tipoSeleccionado.iconName}
                  size={20}
                  color="#ffffff"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.darkStatusBannerTitle}>
                  Un vecino avisó: {tipoSeleccionado.label}
                </Text>
                <Text style={styles.darkStatusBannerSub}>Toca para confirmar</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}

          {/* Cuadrícula 2x2 de 4 Números de Emergencia en Verde Oscuro (E6 Figma) */}
          <View style={styles.fourNumbersGrid}>
            {/* 105 Policía */}
            <TouchableOpacity
              style={styles.greenNumberCard}
              onPress={() => handleLlamar('105', 'Policía')}
              activeOpacity={0.85}
            >
              <View style={styles.greenCardTopRow}>
                <Feather name="shield" size={22} color="#ffffff" />
                <View style={styles.greenCardPhoneBadge}>
                  <Feather name="phone" size={14} color="#ffffff" />
                </View>
              </View>
              <View>
                <Text style={styles.greenCardBigNumber}>105</Text>
                <Text style={styles.greenCardLabel}>Policía</Text>
              </View>
            </TouchableOpacity>

            {/* 116 Bomberos */}
            <TouchableOpacity
              style={styles.greenNumberCard}
              onPress={() => handleLlamar('116', 'Bomberos')}
              activeOpacity={0.85}
            >
              <View style={styles.greenCardTopRow}>
                <MaterialCommunityIcons name="fire" size={24} color="#ffffff" />
                <View style={styles.greenCardPhoneBadge}>
                  <Feather name="phone" size={14} color="#ffffff" />
                </View>
              </View>
              <View>
                <Text style={styles.greenCardBigNumber}>116</Text>
                <Text style={styles.greenCardLabel}>Bomberos</Text>
              </View>
            </TouchableOpacity>

            {/* 106 SAMU */}
            <TouchableOpacity
              style={styles.greenNumberCard}
              onPress={() => handleLlamar('106', 'SAMU')}
              activeOpacity={0.85}
            >
              <View style={styles.greenCardTopRow}>
                <Feather name="plus-square" size={22} color="#ffffff" />
                <View style={styles.greenCardPhoneBadge}>
                  <Feather name="phone" size={14} color="#ffffff" />
                </View>
              </View>
              <View>
                <Text style={styles.greenCardBigNumber}>106</Text>
                <Text style={styles.greenCardLabel}>SAMU</Text>
              </View>
            </TouchableOpacity>

            {/* 115 Defensa Civil */}
            <TouchableOpacity
              style={styles.greenNumberCard}
              onPress={() => handleLlamar('115', 'Defensa Civil')}
              activeOpacity={0.85}
            >
              <View style={styles.greenCardTopRow}>
                <Feather name="alert-triangle" size={22} color="#ffffff" />
                <View style={styles.greenCardPhoneBadge}>
                  <Feather name="phone" size={14} color="#ffffff" />
                </View>
              </View>
              <View>
                <Text style={styles.greenCardBigNumber}>115</Text>
                <Text style={styles.greenCardLabel}>Defensa Civil</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Botón Principal Rojo: "Avisar al barrio" (1 y 4) o "Ver tablero de ayuda" (6) */}
          <TouchableOpacity
            style={styles.mainActionRedBtn}
            onPress={() => {
              if (esActiva) {
                setPantalla('7_tablero');
              } else {
                setPantalla('2_avisar');
              }
            }}
            activeOpacity={0.85}
          >
            {esActiva ? (
              <>
                <Feather name="users" size={18} color="#ffffff" />
                <Text style={styles.mainActionRedBtnText}>Ver tablero de ayuda</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="bullhorn-outline" size={20} color="#ffffff" />
                <Text style={styles.mainActionRedBtnText}>Avisar al barrio</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Sección "Cerca de ti" + "Ver todos" */}
          <View style={styles.nearbyHeaderRow}>
            <Text style={styles.nearbyTitle}>Cerca de ti</Text>
            <TouchableOpacity
              onPress={() => setVerTodosCercanos(prev => !prev)}
              activeOpacity={0.7}
            >
              <Text style={styles.verTodosLink}>
                {verTodosCercanos ? 'Ver menos' : 'Ver todos'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nearbyListContainer}>
            <View style={styles.nearbyRowItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nearbyItemTitle}>Comisaría del sector</Text>
                <Text style={styles.nearbyItemSub}>1,2 km</Text>
              </View>
              <TouchableOpacity
                style={styles.darkPhoneCircleBtn}
                onPress={() => handleLlamar('012712233', 'Comisaría del sector')}
                activeOpacity={0.8}
              >
                <Feather name="phone" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.nearbyDivider} />

            <View style={styles.nearbyRowItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nearbyItemTitle}>Posta de salud</Text>
                <Text style={styles.nearbyItemSub}>800 m</Text>
              </View>
              <TouchableOpacity
                style={styles.darkPhoneCircleBtn}
                onPress={() => handleLlamar('014498877', 'Posta de salud')}
                activeOpacity={0.8}
              >
                <Feather name="phone" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {verTodosCercanos && (
              <>
                <View style={styles.nearbyDivider} />
                <View style={styles.nearbyRowItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nearbyItemTitle}>Serenazgo distrital</Text>
                    <Text style={styles.nearbyItemSub}>24 horas</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.darkPhoneCircleBtn}
                    onPress={() => handleLlamar('014115555', 'Serenazgo')}
                    activeOpacity={0.8}
                  >
                    <Feather name="phone" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Barra discreta de prueba de estados del flujo (Inactiva / Vecino avisó / Activa / Sin señal) */}
          <View style={styles.statePreviewBar}>
            <TouchableOpacity
              style={[
                styles.statePreviewChip,
                pantalla === '1_inactiva' && !sinSenal && styles.statePreviewChipActive,
              ]}
              onPress={() => {
                setSinSenal(false);
                setPantalla('1_inactiva');
              }}
            >
              <Text style={styles.statePreviewChipText}>1 · Inactiva</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statePreviewChip,
                pantalla === '4_vecino_aviso' && styles.statePreviewChipActive,
              ]}
              onPress={() => {
                setSinSenal(false);
                setPantalla('4_vecino_aviso');
              }}
            >
              <Text style={styles.statePreviewChipText}>4 · Aviso vecino</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statePreviewChip,
                pantalla === '6_activa' && styles.statePreviewChipActive,
              ]}
              onPress={() => {
                setSinSenal(false);
                setPantalla('6_activa');
              }}
            >
              <Text style={styles.statePreviewChipText}>6 · Activa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statePreviewChip, sinSenal && styles.statePreviewChipActive]}
              onPress={() => setSinSenal(prev => !prev)}
            >
              <Text style={styles.statePreviewChipText}>Sin señal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3efe6',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f3efe6',
  },
  directoryScrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 18 : 10,
    paddingBottom: 110,
  },
  directoryHeader: {
    marginBottom: 16,
  },
  directoryMainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1c1917',
    letterSpacing: -0.5,
  },
  directorySubZone: {
    fontSize: 13,
    color: '#78716c',
    marginTop: 2,
  },
  topActiveEmergencyStrip: {
    backgroundColor: '#b43b1d',
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  yellowDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
  },
  topActiveEmergencyStripText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  darkStatusBanner: {
    backgroundColor: '#1c1917',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  neighborAlertIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#b43b1d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  darkStatusBannerTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  darkStatusBannerSub: {
    color: '#d6d3d1',
    fontSize: 12,
    marginTop: 2,
  },
  fourNumbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 16,
  },
  greenNumberCard: {
    width: '48.2%',
    backgroundColor: '#1d4f3c',
    borderRadius: 20,
    padding: 16,
    height: 118,
    justifyContent: 'space-between',
  },
  greenCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greenCardPhoneBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenCardBigNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  greenCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e7f3ee',
    marginTop: 1,
  },
  mainActionRedBtn: {
    backgroundColor: '#b43b1d',
    borderRadius: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 22,
  },
  mainActionRedBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  nearbyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nearbyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1c1917',
  },
  verTodosLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4f3c',
    textDecorationLine: 'underline',
  },
  nearbyListContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ebe6dc',
  },
  nearbyRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  nearbyDivider: {
    height: 1,
    backgroundColor: '#f0ece3',
  },
  nearbyItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1917',
  },
  nearbyItemSub: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 2,
  },
  darkPhoneCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1c1917',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statePreviewBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 22,
    justifyContent: 'center',
  },
  statePreviewChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#e7e2d8',
  },
  statePreviewChipActive: {
    backgroundColor: '#d6cfc2',
  },
  statePreviewChipText: {
    fontSize: 11,
    color: '#57534e',
    fontWeight: '600',
  },

  // ================== PANTALLAS DE PASOS (2, 3, 5, 9, 10, 11) ==================
  stepScreenContainer: {
    flex: 1,
    backgroundColor: '#f3efe6',
    justifyContent: 'space-between',
  },
  stepTopBar: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 8,
  },
  circleIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ebe6dc',
  },
  stepScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  stepMainTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1c1917',
    marginBottom: 18,
    letterSpacing: -0.4,
  },
  stepMainTitleNoMargin: {
    fontSize: 25,
    fontWeight: '800',
    color: '#1c1917',
    letterSpacing: -0.4,
  },
  emergencyTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 16,
  },
  emergencyTypeCard: {
    width: '48.2%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ebe6dc',
    position: 'relative',
  },
  emergencyTypeCardSelected: {
    backgroundColor: '#f9ebe6',
    borderColor: '#b43b1d',
  },
  selectedCornerCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#b43b1d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTypeIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#efeadd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emergencyTypeIconCircleSelected: {
    backgroundColor: '#b43b1d',
  },
  emergencyTypeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
  },
  otrosHorizontalBtn: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#ebe6dc',
    marginBottom: 12,
    position: 'relative',
  },
  otrosSmallIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#efeadd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otrosCheckRight: {
    position: 'absolute',
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#b43b1d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedDetailBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#d4cdc0',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dashedDetailBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1917',
  },
  detailInputWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d4cdc0',
    padding: 12,
  },
  detailTextInput: {
    fontSize: 14,
    color: '#1c1917',
    minHeight: 64,
    textAlignVertical: 'top',
  },
  stepBottomFooter: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 24 : 16,
    paddingTop: 8,
    gap: 10,
  },
  confirmRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  confirmRuleText: {
    fontSize: 12,
    color: '#6b665e',
  },
  primaryRedBtn: {
    backgroundColor: '#b43b1d',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryRedBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryOutlineBtn: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#dfd9cc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryOutlineBtnText: {
    color: '#1c1917',
    fontSize: 14,
    fontWeight: '700',
  },

  // ================== PANTALLA 3 y 5 CENTRADAS ==================
  centeredStepBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bigRedCircleHalo: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#f5dad2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  bigRedCircleIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#b43b1d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredStepTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1c1917',
    marginTop: 18,
    marginBottom: 10,
  },
  softRedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f9ebe6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  softRedPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b43b1d',
  },
  confirmationsBoxCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 22,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebe6dc',
  },
  confirmationsBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 14,
  },
  confirmationsBoxNumber: {
    fontSize: 20,
    fontWeight: '900',
  },
  fiveChecksRow: {
    flexDirection: 'row',
    gap: 10,
  },
  checkCircleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d4f3c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleBadgePending: {
    backgroundColor: '#e7e2d8',
  },
  smallMutedOverline: {
    fontSize: 13,
    color: '#78716c',
    marginBottom: 6,
  },
  confirmAlertMainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1c1917',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 14,
  },
  whiteCounterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ebe6dc',
    marginBottom: 22,
  },
  whiteCounterPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1c1917',
  },
  doYouConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
  },

  // ================== PANTALLA 7 · TABLERO DE AYUDA ==================
  tableroRedHeader: {
    backgroundColor: '#b43b1d',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    paddingBottom: 18,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  tableroHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  translucentBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modoEmergenciaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  redDotIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#b43b1d',
  },
  modoEmergenciaPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b43b1d',
    letterSpacing: 0.4,
  },
  tableroHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 14,
  },
  estoyASalvoWhiteBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  estoyASalvoWhiteBtnActive: {
    backgroundColor: '#e7f3ee',
  },
  estoyASalvoBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
  },
  salvoCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  salvoCounterNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  salvoCounterLabel: {
    fontSize: 13,
    color: '#fde8e2',
    fontWeight: '600',
  },
  tableroBodyScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
  },
  segmentedControlWrap: {
    flexDirection: 'row',
    backgroundColor: '#e6e1d6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
  },
  segmentedTabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentedTabBtnActive: {
    backgroundColor: '#ffffff',
  },
  segmentedTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b665e',
  },
  segmentedTabTextActive: {
    color: '#1c1917',
    fontWeight: '700',
  },
  tableroCardsList: {
    gap: 10,
  },
  resourceItemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ebe6dc',
  },
  resourceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceMiddleCol: {
    flex: 1,
  },
  resourceNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 6,
  },
  resourceProgressTrack: {
    height: 6,
    backgroundColor: '#ebe6dc',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  resourceProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  resourceCountSub: {
    fontSize: 12,
    color: '#78716c',
    fontWeight: '500',
  },
  aportoDarkBtn: {
    backgroundColor: '#1c1917',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  aportoDarkBtnActive: {
    backgroundColor: '#1d4f3c',
  },
  aportoDarkBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  verTodoLinkBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  verTodoLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4f3c',
    textDecorationLine: 'underline',
  },
  floatingGreenPlusBtn: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1d4f3c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },

  // ================== PANTALLA 8 · BOTTOM SHEET ELEGIR ==================
  bottomSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 25, 23, 0.55)',
    justifyContent: 'flex-end',
    zIndex: 40,
  },
  bottomSheetCard: {
    backgroundColor: '#f3efe6',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d4cdc0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sheetTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1c1917',
  },
  sheetTwoChoicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetChoiceBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebe6dc',
  },
  sheetChoiceIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sheetChoiceLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
  },

  // ================== PANTALLAS 9, 10, 11 · WIZARD PUBLICAR ==================
  wizardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 10,
    gap: 14,
  },
  wizardProgressRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  wizardProgressBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ded9ce',
  },
  wizardProgressBarActive: {
    backgroundColor: '#1d4f3c',
  },
  softModeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 10,
  },
  softModeTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sixCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  categorySelectCard: {
    width: '48.2%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebe6dc',
  },
  categorySelectIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#efeadd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categorySelectLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
  },
  cuantoTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 18,
  },
  opcionalSubText: {
    fontSize: 14,
    color: '#78716c',
    fontWeight: '500',
  },
  counterWhiteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ebe6dc',
    marginBottom: 14,
  },
  counterMinusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#d4cdc0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterCenterCol: {
    alignItems: 'center',
  },
  counterBigNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: '#1c1917',
    lineHeight: 48,
  },
  counterUnitText: {
    fontSize: 14,
    color: '#78716c',
    marginTop: 2,
  },
  counterPlusCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1c1917',
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoLocationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ebe6dc',
  },
  autoLocationIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#dcece5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoLocationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1917',
  },
  autoLocationSub: {
    fontSize: 12,
    color: '#1d4f3c',
    fontWeight: '600',
    marginTop: 2,
  },
  acopioResponsibilityNote: {
    fontSize: 12,
    color: '#6b665e',
    marginTop: 12,
    lineHeight: 17,
  },
  primaryBlackBtn: {
    backgroundColor: '#1c1917',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBlackBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  bigGreenCheckCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#1d4f3c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishedSummaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ebe6dc',
    marginTop: 12,
    marginBottom: 16,
  },
  publishedSummaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
  },
  publishedSummarySub: {
    fontSize: 12,
    color: '#78716c',
    marginTop: 2,
  },
  neighborsSeeItText: {
    fontSize: 13,
    color: '#78716c',
  },
  // Nuevos estilos Tablero de Ayuda Humanitaria (Figma)
  tableroCleanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eae5db',
  },
  tableroBackCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableroCleanTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#111827',
  },
  tableroZoneBadge: {
    backgroundColor: '#fce8e0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tableroZoneBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b43b1d',
  },
  tableroBodyScrollNew: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
    gap: 20,
  },
  tableroCardsListNew: {
    gap: 12,
  },
  needCardNew: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eae5db',
    gap: 10,
  },
  needCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  needCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  needCardPriority: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  aportoPillBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aportoPillBtnActive: {
    backgroundColor: '#1f6f4a',
  },
  aportoPillBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  needProgressTrack: {
    height: 8,
    backgroundColor: '#eae5db',
    borderRadius: 4,
    overflow: 'hidden',
  },
  needProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  needProgressCount: {
    fontSize: 11.5,
    color: '#6b7280',
    fontWeight: '500',
  },
  acopioSection: {
    gap: 12,
  },
  acopioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  acopioSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  proponerPuntoBtn: {
    backgroundColor: '#fce8e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  proponerPuntoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b43b1d',
  },
  acopioCardsList: {
    gap: 10,
  },
  acopioCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eae5db',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  acopioPinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fce8e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  acopioCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  acopioCardDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 16,
  },
  acopioCardVerified: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f6f4a',
    marginTop: 4,
  },
  bottomActionsBarNew: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f7f5ef',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#eae5db',
    flexDirection: 'row',
    gap: 12,
  },
  btnReportarNecesidad: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#b43b1d',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnReportarNecesidadText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#b43b1d',
  },
  btnOfrecerAyuda: {
    flex: 1,
    backgroundColor: '#144e40',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOfrecerAyudaText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Estilos Modales
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheetContainer: {
    backgroundColor: '#f7f5ef',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '92%',
    gap: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  modalProgressBarRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalProgressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e0d4',
  },
  modalBadgeWrap: {
    gap: 6,
  },
  modalPillBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalPillBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalMainTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  modalGrid2Cols: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalOptionCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalOptionCardSelectedRed: {
    borderColor: '#b43b1d',
    borderWidth: 2,
  },
  modalOptionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  modalOptionDesc: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  modalInfoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalInfoNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#4b5563',
    lineHeight: 16,
  },
  modalSubmitBtn: {
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  modalSubmitBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Estilos Cuadros de Emergencia y Puntos de Acopio Unificados (Figma)
  directoryHeaderWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  circularBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eae5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPoliciaRed: {
    flex: 1,
    backgroundColor: '#b43b1d',
    borderRadius: 24,
    padding: 16,
    height: 130,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBomberosBlack: {
    flex: 1,
    backgroundColor: '#1c1917',
    borderRadius: 24,
    padding: 16,
    height: 130,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSamuWhite: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    height: 130,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#eae5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardDefensaWhite: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    height: 130,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#eae5db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  whiteCardBigNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  whiteCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
  },
  darkCardBigNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1c1917',
    letterSpacing: -0.5,
  },
  darkCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 2,
    lineHeight: 16,
  },
  acopioUnifiedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eae5db',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  acopioCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  acopioDividerTop: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  modalAtrasRedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b43b1d',
  },
  modalPillSoftPeach: {
    alignSelf: 'flex-start',
    backgroundColor: '#fdeee9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalPillSoftPeachText: {
    color: '#b43b1d',
    fontSize: 11,
    fontWeight: '700',
  },
  formGroup: {
    gap: 6,
  },
  formLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  modalTextInputBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  locationSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  locationTitleText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  locationSubText: {
    fontSize: 11.5,
    color: '#6b7280',
    marginTop: 1,
  },
  chipsWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipPillSelected: {
    backgroundColor: '#b43b1d',
    borderColor: '#b43b1d',
  },
  chipPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  chipPillTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  timeInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  timeInputText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  responsibleCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#1d4f3c',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  responsibleAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  responsibleAvatarInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e40af',
  },
  responsibleNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  responsibleRoleSubtext: {
    fontSize: 11.5,
    color: '#6b7280',
    marginTop: 1,
  },
  dashedInviteBtn: {
    borderWidth: 1.5,
    borderColor: '#9ca3af',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  dashedInviteBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  commitmentsBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  commitmentsTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  commitmentsBullet: {
    fontSize: 11.5,
    color: '#4b5563',
    lineHeight: 16,
  },
  verificationCardBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#b43b1d',
    borderRadius: 22,
    padding: 18,
    gap: 12,
  },
  verificationStatusTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#b43b1d',
    letterSpacing: 0.5,
  },
  verificationCardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 20,
  },
  verificationTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  verificationFill: {
    height: '100%',
    backgroundColor: '#b43b1d',
    borderRadius: 4,
  },
  verificationCountText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
  },
  verificationDescText: {
    fontSize: 11.5,
    color: '#6b7280',
    lineHeight: 16,
  },
  simulateVerificationBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulateVerificationBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  successBigCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e6f4ea',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 4,
  },
  verifiedSummaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  verifiedPlaceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedPlaceDetails: {
    fontSize: 11.5,
    color: '#6b7280',
    marginTop: 1,
  },
  verifiedPlaceConfirmed: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0e6251',
    marginTop: 3,
  },
  verifiedNoticeFootText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusToggleBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusToggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  statusToggleBtnTextActive: {
    color: '#ffffff',
  },
  statusBtnAbiertoActive: {
    backgroundColor: '#1d4f3c',
    borderColor: '#1d4f3c',
  },
  statusBtnLlenoActive: {
    backgroundColor: '#d97706',
    borderColor: '#d97706',
  },
  statusBtnCerradoActive: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
});
