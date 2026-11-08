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
  onStepModeChange?: (isStepScreen: boolean) => void;
  onEmergencyActiveChange?: (isActive: boolean) => void;
}

interface TipoEmergenciaOption {
  id: string;
  label: string;
  tituloLargo: string;
  iconName: 'weather-pouring' | 'pulse' | 'fire' | 'water-off-outline';
}

const TIPOS_EMERGENCIA: TipoEmergenciaOption[] = [
  { id: 'lluvia', label: 'Lluvia', tituloLargo: 'Lluvias intensas', iconName: 'weather-pouring' },
  { id: 'sismo', label: 'Sismo', tituloLargo: 'Sismo fuerte', iconName: 'pulse' },
  { id: 'incendio', label: 'Incendio', tituloLargo: 'Incendio reportado', iconName: 'fire' },
  { id: 'corte', label: 'Sin agua/luz', tituloLargo: 'Corte de agua/luz', iconName: 'water-off-outline' },
];

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
  onStepModeChange,
  onEmergencyActiveChange,
}) => {
  const [pantalla, setPantalla] = useState<PantallaEmergenciaId>('1_inactiva');
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

  // Items de Necesidad (Figma: Tablero de ayuda humanitaria)
  const [itemsNecesidad, setItemsNecesidad] = useState<ItemTablero[]>([
    { id: '1', nombre: 'Frazadas', prioridad: 'alta', iconName: 'tshirt-crew-outline', reunido: 45, meta: 80, unidad: '', aportado: false, colorBarra: '#b43b1d' },
    { id: '2', nombre: 'Botiquín básico', prioridad: 'alta', iconName: 'medical-bag', reunido: 6, meta: 20, unidad: '', aportado: false, colorBarra: '#b43b1d' },
    { id: '3', nombre: 'Voluntarios para limpieza', prioridad: 'media', iconName: 'map-marker-outline', reunido: 9, meta: 15, unidad: '', aportado: false, colorBarra: '#1f6f4a' },
    { id: '4', nombre: 'Sacos de arena', prioridad: 'media', iconName: 'truck-outline', reunido: 140, meta: 200, unidad: '', aportado: false, colorBarra: '#1f6f4a' },
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
    mobileApiService.listarNecesidadesTablero(userQuadrant).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const nec = data
          .filter((d: any) => d.tipo !== 'ofrece')
          .map((d: any) => ({
            id: String(d.id),
            nombre: d.nombre || 'Recurso',
            prioridad: (d.prioridad === 'alta' ? 'alta' : 'media') as 'alta' | 'media',
            iconName: (d.iconName || 'medical-bag') as CategoriaPublicarOption['iconName'],
            reunido: Number(d.reunido ?? 0),
            meta: Number(d.meta ?? 20),
            unidad: d.unidad || '',
            aportado: false,
            colorBarra: d.prioridad === 'alta' ? '#b43b1d' : '#1f6f4a',
          }));
        if (nec.length > 0) setItemsNecesidad(nec);
      }
    }).catch(() => {});

    mobileApiService.getEstadoTablero(userQuadrant).then((est) => {
      if (est && typeof est.vecinosASalvo === 'number') {
        setSalvoCount(est.vecinosASalvo);
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
  // PANTALLAS 7 y 8 · TABLERO DE AYUDA HUMANITARIA (Figma)
  // ============================================================================
  if (pantalla === '7_tablero' || pantalla === '8_elegir_publicar') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContainer}>
          {/* Cabecera Limpia */}
          <View style={styles.tableroCleanHeader}>
            <TouchableOpacity
              style={styles.tableroBackCircle}
              onPress={() => setPantalla('6_activa')}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.tableroCleanTitle}>Tablero de ayuda humanitaria</Text>
            <View style={styles.tableroZoneBadge}>
              <Text style={styles.tableroZoneBadgeText}>{barrioCorto}</Text>
            </View>
          </View>

          {/* Contenido Scrollable */}
          <ScrollView
            contentContainerStyle={styles.tableroBodyScrollNew}
            showsVerticalScrollIndicator={false}
          >
            {/* Tarjetas de Necesidad */}
            <View style={styles.tableroCardsListNew}>
              {itemsNecesidad.map(item => {
                const pct = Math.min(100, Math.round((item.reunido / item.meta) * 100));
                const esAlta = item.prioridad === 'alta';
                return (
                  <View key={item.id} style={styles.needCardNew}>
                    <View style={styles.needCardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.needCardTitle}>{item.nombre}</Text>
                        <Text
                          style={[
                            styles.needCardPriority,
                            { color: esAlta ? '#b43b1d' : '#1f6f4a' },
                          ]}
                        >
                          {esAlta ? 'Prioridad alta' : 'Prioridad media'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.aportoPillBtn,
                          item.aportado && styles.aportoPillBtnActive,
                        ]}
                        onPress={() => handleAportar(item.id, true)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.aportoPillBtnText}>
                          {item.aportado ? 'Listo ✓' : 'Aporto'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Barra de progreso */}
                    <View style={styles.needProgressTrack}>
                      <View
                        style={[
                          styles.needProgressFill,
                          {
                            width: `${pct}%`,
                            backgroundColor: esAlta ? '#b43b1d' : '#1f6f4a',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.needProgressCount}>
                      {item.reunido} de {item.meta} reunidos
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Puntos de Acopio */}
            <View style={styles.acopioSection}>
              <View style={styles.acopioHeaderRow}>
                <Text style={styles.acopioSectionTitle}>Puntos de acopio</Text>
                <TouchableOpacity
                  style={styles.proponerPuntoBtn}
                  onPress={() => setModalAyuda('proponer_acopio')}
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

          {/* Barra Fija Inferior con los 2 Botones */}
          <View style={styles.bottomActionsBarNew}>
            <TouchableOpacity
              style={styles.btnReportarNecesidad}
              onPress={() => setModalAyuda('reportar')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnReportarNecesidadText}>Reportar necesidad</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnOfrecerAyuda}
              onPress={() => setModalAyuda('ofrecer')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnOfrecerAyudaText}>Ofrecer ayuda</Text>
            </TouchableOpacity>
          </View>

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
          {/* MODAL 3: PROPONER PUNTO DE ACOPIO (Paso 1 de 3) */}
          {/* ==================================================================== */}
          <Modal
            visible={modalAyuda === 'proponer_acopio'}
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
                    <Text style={styles.modalPillBadgeText}>PROPONER PUNTO DE ACOPIO</Text>
                  </View>
                  <Text style={styles.modalMainTitle}>¿Qué tipo de lugar es?</Text>
                </View>

                {/* Grilla 2 columnas con 6 lugares */}
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

                {/* Nota de Responsabilidad */}
                <View style={styles.modalInfoNoticeBox}>
                  <Feather name="info" size={16} color="#6b7280" style={{ marginTop: 2 }} />
                  <Text style={styles.modalInfoNoticeText}>
                    Quien propone el punto queda como responsable. Debe ser un lugar al que los vecinos puedan llegar a pie.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#b43b1d' }]}
                  onPress={() => {
                    setPuntosAcopio(prev => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        nombre: `${seleccionAcopio} - Nuevo`,
                        distancia: '450 m',
                        detalle: 'Abierto para emergencias · Resp. Tú',
                        verificado: 'Verificado por 1 vecino',
                      },
                    ]);
                    setModalAyuda('ninguno');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalSubmitBtnText}>Continuar</Text>
                </TouchableOpacity>
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
          {/* Cabecera (Figma: Emergencias con botón circular de retroceso) */}
          <View style={styles.directoryHeaderWithBack}>
            <TouchableOpacity
              style={styles.circularBackBtn}
              onPress={() => {
                if (onBack) onBack();
              }}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={20} color="#111827" />
            </TouchableOpacity>
            <View>
              <Text style={styles.directoryMainTitle}>Emergencias</Text>
              <Text style={styles.directorySubZone}>{userQuadrant}</Text>
            </View>
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

          {/* Cuadrícula 2x2 de 4 Números de Emergencia (Figma: Rojo Terracota, Negro Carbón, Blanco SAMU, Blanco Defensa Civil) */}
          <View style={styles.fourNumbersGrid}>
            {/* 105 Policía Nacional - Rojo Terracota */}
            <TouchableOpacity
              style={styles.cardPoliciaRed}
              onPress={() => handleLlamar('105', 'Policía Nacional')}
              activeOpacity={0.85}
            >
              <Feather name="shield" size={24} color="#ffffff" />
              <View>
                <Text style={styles.whiteCardBigNumber}>105</Text>
                <Text style={styles.whiteCardLabel}>Policía Nacional</Text>
              </View>
            </TouchableOpacity>

            {/* 116 Bomberos - Negro Carbón */}
            <TouchableOpacity
              style={styles.cardBomberosBlack}
              onPress={() => handleLlamar('116', 'Bomberos')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="fire" size={26} color="#ffffff" />
              <View>
                <Text style={styles.whiteCardBigNumber}>116</Text>
                <Text style={styles.whiteCardLabel}>Bomberos</Text>
              </View>
            </TouchableOpacity>

            {/* 106 SAMU - Blanco con Cruz Roja */}
            <TouchableOpacity
              style={styles.cardSamuWhite}
              onPress={() => handleLlamar('106', 'SAMU Ambulancia')}
              activeOpacity={0.85}
            >
              <Feather name="plus" size={24} color="#b43b1d" />
              <View>
                <Text style={styles.darkCardBigNumber}>106</Text>
                <Text style={styles.darkCardLabel}>SAMU ·{'\n'}Ambulancia</Text>
              </View>
            </TouchableOpacity>

            {/* 115 Defensa Civil - Blanco con Pulso Rojo */}
            <TouchableOpacity
              style={styles.cardDefensaWhite}
              onPress={() => handleLlamar('115', 'Defensa Civil')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="pulse" size={24} color="#b43b1d" />
              <View>
                <Text style={styles.darkCardBigNumber}>115</Text>
                <Text style={styles.darkCardLabel}>Defensa Civil</Text>
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

          {/* Sección: Puntos de acopio (Figma: Tarjeta unificada) */}
          <View style={styles.acopioSection}>
            <View style={styles.acopioHeaderRow}>
              <Text style={styles.acopioSectionTitle}>Puntos de acopio</Text>
              <TouchableOpacity
                style={styles.proponerPuntoBtn}
                onPress={() => {
                  setPantalla('7_tablero');
                  setModalAyuda('proponer_acopio');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.proponerPuntoText}>+ Proponer punto</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.acopioUnifiedCard}>
              {puntosAcopio.map((pto, index) => (
                <View
                  key={pto.id}
                  style={[
                    styles.acopioCardRow,
                    index > 0 && styles.acopioDividerTop,
                  ]}
                >
                  <View style={styles.acopioPinCircle}>
                    <Feather name="map-pin" size={15} color="#b43b1d" />
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
});
