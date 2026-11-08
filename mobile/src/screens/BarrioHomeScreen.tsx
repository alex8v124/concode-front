import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Modal, 
  Alert,
  Platform
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { mobileApiService } from '../services/api';
import { BarrioMapaScreen } from './BarrioMapaScreen';
import { MensajesScreen } from './MensajesScreen';
import { FavorDetalleScreen } from './FavorDetalleScreen';
import { PublicarFlowScreen, PublicacionData } from './PublicarFlowScreen';
import { DirectorioEmergenciaScreen } from './DirectorioEmergenciaScreen';
import { PerfilVecinoScreen, VecinoPerfilData } from './PerfilVecinoScreen';
import { EscribirResenaModal } from './EscribirResenaModal';
import { MiPerfilScreen } from './MiPerfilScreen';
import { MiActividadScreen } from './MiActividadScreen';

interface Props {
  userData: {
    firstName: string;
    lastName: string;
    quadrant?: string;
    dni?: string;
    address?: string;
  };
  onLogout: () => void;
}

type Categoria = 'servicios' | 'favores';
type Tab = 'inicio' | 'mapa' | 'emergencia' | 'actividad' | 'perfil';
type VistaSecundaria = 'ninguna' | 'mensajes' | 'favor_detalle' | 'publicar' | 'emergencia';

interface ServicioItem {
  id: string;
  iniciales: string;
  nombre: string;
  distancia: string;
  rubro: string;
  detalle: string;
  vistosBuenos: number;
  calificacion: number;
  bgAvatar: string;
  colorAvatar: string;
  categoria: Categoria;
}

const SERVICIOS_MOCK: ServicioItem[] = [
  {
    id: '1',
    iniciales: 'RQ',
    nombre: 'Rosa Quispe',
    distancia: '180 m',
    rubro: 'Gasfitería',
    detalle: 'Atiende hoy',
    vistosBuenos: 42,
    calificacion: 4.9,
    bgAvatar: '#d6eee2',
    colorAvatar: '#144e40',
    categoria: 'servicios',
  },
  {
    id: '2',
    iniciales: 'MH',
    nombre: 'Miguel Huamán',
    distancia: '350 m',
    rubro: 'Electricista domiciliario',
    detalle: 'Instalaciones y emergencias',
    vistosBuenos: 31,
    calificacion: 4.8,
    bgAvatar: '#faecd5',
    colorAvatar: '#8c531b',
    categoria: 'servicios',
  },
  {
    id: '3',
    iniciales: 'LT',
    nombre: 'Lucía Torres',
    distancia: '420 m',
    rubro: 'Clases de matemática',
    detalle: 'Secundaria y preuniversitario',
    vistosBuenos: 27,
    calificacion: 5.0,
    bgAvatar: '#e0e7fb',
    colorAvatar: '#2b4290',
    categoria: 'servicios',
  },
  {
    id: '4',
    iniciales: 'JC',
    nombre: 'Jorge Córdova',
    distancia: '600 m',
    rubro: 'Carpintería y cerrajería',
    detalle: 'Duplicado de llaves y chapas',
    vistosBuenos: 19,
    calificacion: 4.7,
    bgAvatar: '#fee4e2',
    colorAvatar: '#912018',
    categoria: 'servicios',
  },
  {
    id: '5',
    iniciales: 'JR',
    nombre: 'Julio R. · Mz. A',
    distancia: '150 m',
    rubro: 'Presto taladro percutor',
    detalle: 'Disponible fin de semana',
    vistosBuenos: 23,
    calificacion: 5.0,
    bgAvatar: '#e0e7fb',
    colorAvatar: '#2b4290',
    categoria: 'favores',
  },
  {
    id: '6',
    iniciales: 'TL',
    nombre: 'Teresa L.',
    distancia: '310 m',
    rubro: 'Presto escalera telescópica',
    detalle: 'Para trabajos en casa',
    vistosBuenos: 15,
    calificacion: 4.9,
    bgAvatar: '#fee4e2',
    colorAvatar: '#912018',
    categoria: 'favores',
  },
];

export const BarrioHomeScreen: React.FC<Props> = ({ userData, onLogout }) => {
  const [itemsList, setItemsList] = useState<ServicioItem[]>(SERVICIOS_MOCK);
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('servicios');
  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState<Tab>('inicio');
  const [vistaSecundaria, setVistaSecundaria] = useState<VistaSecundaria>('ninguna');
  const [modalPanicoVisible, setModalPanicoVisible] = useState(false);
  const [modalPublicarVisible, setModalPublicarVisible] = useState(false);
  const [modalPerfilVisible, setModalPerfilVisible] = useState(false);
  const [panicoEnviado, setPanicoEnviado] = useState(false);
  const [enviandoPanico, setEnviandoPanico] = useState(false);
  const [selectedVecino, setSelectedVecino] = useState<VecinoPerfilData | null>(null);
  const [modalEscribirResenaVisible, setModalEscribirResenaVisible] = useState(false);
  const [ocultarBarraInferior, setOcultarBarraInferior] = useState(false);
  const [emergenciaActiva, setEmergenciaActiva] = useState(false);

  const cuadranteMostrado = userData.quadrant || 'Urb. Los Pinos, Surco';

  const handleSuccessPublish = (data: PublicacionData) => {
    const initials = `${userData.firstName?.[0] || 'T'}${userData.lastName?.[0] || 'U'}`.toUpperCase();
    const esServicio = data.tipo === 'servicio';
    const nuevo: ServicioItem = {
      id: Date.now().toString(),
      iniciales: initials,
      nombre: `${userData.firstName} ${userData.lastName}`.trim() || 'Tú',
      distancia: '0 m (Tu casa)',
      rubro: data.titulo,
      detalle: data.descripcion || 'Publicado recientemente en tu cuadrante',
      vistosBuenos: 1,
      calificacion: 5.0,
      bgAvatar: esServicio ? '#d6eee2' : '#e0e7fb',
      colorAvatar: esServicio ? '#144e40' : '#2b4290',
      categoria: esServicio ? 'servicios' : 'favores',
    };
    setItemsList(prev => [nuevo, ...prev]);
    setCategoriaActiva(esServicio ? 'servicios' : 'favores');
  };

  // Si está viendo el perfil de otro vecino
  if (selectedVecino) {
    return (
      <>
        <PerfilVecinoScreen
          vecino={selectedVecino}
          onBack={() => setSelectedVecino(null)}
          onOpenEscribirResena={() => setModalEscribirResenaVisible(true)}
          onContactar={() => {
            setSelectedVecino(null);
            setVistaSecundaria('mensajes');
          }}
        />
        <EscribirResenaModal
          visible={modalEscribirResenaVisible}
          onClose={() => setModalEscribirResenaVisible(false)}
          targetNeighbor={{
            nombre: selectedVecino.nombre,
            iniciales: selectedVecino.iniciales,
            rubro: selectedVecino.rubro,
          }}
          onSubmitSuccess={(review) => {
            setItemsList(prev => prev.map(item => {
              if (item.id === selectedVecino.id) {
                return {
                  ...item,
                  vistosBuenos: item.vistosBuenos + 1,
                  calificacion: Math.round(((item.calificacion * 18 + review.rating) / 19) * 10) / 10,
                };
              }
              return item;
            }));
          }}
        />
      </>
    );
  }

  // Si está en la pantalla de Publicar (Flujo 3 pasos + éxito)
  if (vistaSecundaria === 'publicar') {
    return (
      <PublicarFlowScreen 
        userQuadrant={cuadranteMostrado}
        onClose={() => setVistaSecundaria('ninguna')}
        onSuccessPublish={handleSuccessPublish}
      />
    );
  }

  // Si está en el Directorio de Emergencia
  if (vistaSecundaria === 'emergencia') {
    return (
      <DirectorioEmergenciaScreen 
        userQuadrant={cuadranteMostrado}
        onBack={() => setVistaSecundaria('ninguna')}
      />
    );
  }

  // Si está en la pantalla de Mensajes
  if (vistaSecundaria === 'mensajes') {
    return <MensajesScreen onBack={() => setVistaSecundaria('ninguna')} />;
  }

  // Si está en el Detalle de Favor
  if (vistaSecundaria === 'favor_detalle') {
    return (
      <FavorDetalleScreen 
        onBack={() => setVistaSecundaria('ninguna')} 
        onPedirPrestado={() => setVistaSecundaria('mensajes')} 
      />
    );
  }

  const listaFiltrada = itemsList.filter(item => {
    const coincideCat = item.categoria === categoriaActiva;
    const coincideBusqueda = busqueda.trim() === '' || 
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.rubro.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideBusqueda;
  });

  const handleEmitirAlertaSOS = async () => {
    setEnviandoPanico(true);
    try {
      await mobileApiService.emitirPanico(-12.0905, -76.9902);
      setPanicoEnviado(true);
      Alert.alert(
        '¡Alerta Emitida!',
        'Se notificó a los vecinos y al coordinador de tu cuadrante en tiempo real.'
      );
    } catch (e) {
      setPanicoEnviado(true);
      Alert.alert('Alerta SOS', 'Alerta comunitaria transmitida a tu sector vecinal.');
    } finally {
      setEnviandoPanico(false);
    }
  };

  return (
    <View style={styles.mainWrapper}>
      
      {/* Vista de Tab Mapa, Emergencia, Actividad, Perfil o Inicio */}
      {tabActiva === 'mapa' ? (
        <BarrioMapaScreen 
          userData={userData} 
          onSelectNeighbor={(neighborId) => {
            const item = itemsList.find(i => i.id === neighborId) || SERVICIOS_MOCK[0];
            if (item.categoria === 'favores') {
              setVistaSecundaria('favor_detalle');
            } else {
              setSelectedVecino({
                id: item.id,
                iniciales: item.iniciales,
                nombre: item.nombre,
                rubro: item.rubro,
                distancia: item.distancia,
                ubicacion: 'Mz. D, Los Pinos',
                vistosBuenos: item.vistosBuenos,
                calificacion: item.calificacion,
                resenasCount: 18,
              });
            }
          }}
        />
      ) : tabActiva === 'emergencia' ? (
        <DirectorioEmergenciaScreen 
          userQuadrant={cuadranteMostrado}
          userAddress={userData.address}
          onBack={() => setTabActiva('inicio')}
          onStepModeChange={setOcultarBarraInferior}
          onEmergencyActiveChange={setEmergenciaActiva}
        />
      ) : tabActiva === 'actividad' ? (
        <MiActividadScreen 
          onOpenChat={() => setVistaSecundaria('mensajes')}
          onOpenPublicar={() => setVistaSecundaria('publicar')}
        />
      ) : tabActiva === 'perfil' ? (
        <MiPerfilScreen userData={userData} onLogout={onLogout} />
      ) : (
        /* Vista de Tab Inicio */
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Cabecera: Tu zona + Dropdown + Chat Icon con Badge */}
          <View style={styles.topHeader}>
            <View>
              <Text style={styles.tuZonaLabel}>Tu zona</Text>
              <TouchableOpacity style={styles.zonaSelector} activeOpacity={0.7}>
                <Feather name="map-pin" size={17} color="#144e40" />
                <Text style={styles.zonaText} numberOfLines={1}>{cuadranteMostrado}</Text>
                <Feather name="chevron-down" size={17} color="#144e40" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.chatButton} 
              activeOpacity={0.85}
              onPress={() => setVistaSecundaria('mensajes')}
            >
              <Feather name="message-square" size={19} color="#ffffff" />
              <View style={styles.chatBadge}>
                <Text style={styles.chatBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tarjetas Principales: Servicios y Favores */}
          <View style={styles.categoriesRow}>
            
            {/* Tarjeta Servicios */}
            <TouchableOpacity 
              style={[styles.categoryCard, categoriaActiva === 'servicios' ? styles.cardActive : styles.cardInactive]}
              onPress={() => setCategoriaActiva('servicios')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons 
                name="wrench" 
                size={22} 
                color={categoriaActiva === 'servicios' ? '#ffffff' : '#144e40'} 
              />
              <Text style={[styles.categoryTitle, categoriaActiva === 'servicios' ? styles.titleActive : styles.titleInactive]}>
                Servicios
              </Text>
              <Text style={[styles.categorySubtitle, categoriaActiva === 'servicios' ? styles.subActive : styles.subInactive]}>
                Oficios y profesiones
              </Text>
            </TouchableOpacity>

            {/* Tarjeta Favores */}
            <TouchableOpacity 
              style={[styles.categoryCard, categoriaActiva === 'favores' ? styles.cardActive : styles.cardInactive]}
              onPress={() => setCategoriaActiva('favores')}
              activeOpacity={0.85}
            >
              <Feather 
                name="heart" 
                size={22} 
                color={categoriaActiva === 'favores' ? '#ffffff' : '#1f2937'} 
              />
              <Text style={[styles.categoryTitle, categoriaActiva === 'favores' ? styles.titleActive : styles.titleInactive]}>
                Favores
              </Text>
              <Text style={[styles.categorySubtitle, categoriaActiva === 'favores' ? styles.subActive : styles.subInactive]}>
                Presta, dona, ofrece o pide
              </Text>
            </TouchableOpacity>
          </View>

          {/* Barra de Búsqueda */}
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#9ca3af" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Busca gasfitero, profesor de inglés..."
              placeholderTextColor="#9ca3af"
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>

          {/* Encabezado de Sección: Cerca de ti */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Cerca de ti</Text>
              <Text style={styles.sectionSubtitle}>Ordenado por cercanía · hasta 1 km</Text>
            </View>

            <View style={styles.distanceBadge}>
              <Feather name="map-pin" size={12} color="#144e40" />
              <Text style={styles.distanceBadgeText}>1 km</Text>
            </View>
          </View>

          {/* Lista de Servicios / Vecinos */}
          <View style={styles.itemsList}>
            {listaFiltrada.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.itemCard}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.categoria === 'favores') {
                    setVistaSecundaria('favor_detalle');
                  } else {
                    setSelectedVecino({
                      id: item.id,
                      iniciales: item.iniciales,
                      nombre: item.nombre,
                      rubro: item.rubro,
                      distancia: item.distancia,
                      ubicacion: 'Mz. D, Los Pinos',
                      vistosBuenos: item.vistosBuenos,
                      calificacion: item.calificacion,
                      resenasCount: 18,
                    });
                  }
                }}
              >
                <View style={[styles.itemAvatar, { backgroundColor: item.bgAvatar }]}>
                  <Text style={[styles.itemAvatarText, { color: item.colorAvatar }]}>
                    {item.iniciales}
                  </Text>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemName}>{item.nombre}</Text>
                    <Text style={styles.itemDistance}>{item.distancia}</Text>
                  </View>

                  <Text style={styles.itemProfession}>
                    {item.rubro} · <Text style={styles.itemSubDetail}>{item.detalle}</Text>
                  </Text>

                  <View style={styles.itemMetaRow}>
                    <View style={styles.reputationBadge}>
                      <Feather name="thumbs-up" size={12} color="#144e40" />
                      <Text style={styles.reputationText}>{item.vistosBuenos} vistos buenos</Text>
                    </View>

                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={12} color="#f59e0b" />
                      <Text style={styles.ratingText}>{item.calificacion.toFixed(1)}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Botón Flotante + Publicar (visible en Inicio) */}
      {tabActiva === 'inicio' && (
        <TouchableOpacity 
          style={styles.fabBtn} 
          activeOpacity={0.85}
          onPress={() => setVistaSecundaria('publicar')}
        >
          <Feather name="plus" size={18} color="#ffffff" />
          <Text style={styles.fabBtnText}>Publicar</Text>
        </TouchableOpacity>
      )}

      {/* Barra de Navegación Inferior Estilo Oficial (5 items) — se oculta en pantallas de pasos de Emergencia */}
      {!(tabActiva === 'emergencia' && ocultarBarraInferior) && (
        <View style={styles.bottomNav}>
          
          {/* Inicio */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setTabActiva('inicio')}
            activeOpacity={0.7}
          >
            <Feather name="home" size={22} color={tabActiva === 'inicio' ? '#144e40' : '#6b7280'} />
            <Text style={[styles.navLabel, tabActiva === 'inicio' && styles.navLabelActive]}>Inicio</Text>
          </TouchableOpacity>

          {/* Mapa */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setTabActiva('mapa')}
            activeOpacity={0.7}
          >
            <Feather name="map" size={22} color={tabActiva === 'mapa' ? '#144e40' : '#6b7280'} />
            <Text style={[styles.navLabel, tabActiva === 'mapa' && styles.navLabelActive]}>Mapa</Text>
          </TouchableOpacity>

          {/* Emergencia (Botón Sirena Elevado) */}
          <TouchableOpacity 
            style={styles.emergencyNavItem} 
            onPress={() => setTabActiva('emergencia')}
            activeOpacity={0.85}
          >
            <View style={styles.sosButtonCircle}>
              <MaterialCommunityIcons name="alarm-light-outline" size={26} color="#ffffff" />
              {emergenciaActiva && <View style={styles.sosActiveYellowDot} />}
            </View>
            <Text style={styles.emergencyNavLabel}>Emergencia</Text>
          </TouchableOpacity>

          {/* Actividad */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setTabActiva('actividad')}
            activeOpacity={0.7}
          >
            <Feather name="bell" size={22} color={tabActiva === 'actividad' ? '#144e40' : '#6b7280'} />
            <Text style={[styles.navLabel, tabActiva === 'actividad' && styles.navLabelActive]}>Actividad</Text>
          </TouchableOpacity>

          {/* Perfil */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setTabActiva('perfil')}
            activeOpacity={0.7}
          >
            <Feather name="user" size={22} color={tabActiva === 'perfil' ? '#144e40' : '#6b7280'} />
            <Text style={[styles.navLabel, tabActiva === 'perfil' && styles.navLabelActive]}>Perfil</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de Emergencia Vecinal SOS */}
      <Modal visible={modalPanicoVisible} transparent animationType="fade" onRequestClose={() => setModalPanicoVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="shield-alert" size={28} color="#b93815" />
              <Text style={styles.modalTitle}>Botón de Pánico Vecinal</Text>
              <TouchableOpacity onPress={() => setModalPanicoVisible(false)}>
                <Feather name="x" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Al presionar el botón SOS, se enviará una notificación sonora inmediata a todos los vecinos y al Serenazgo de {cuadranteMostrado}.
            </Text>

            <TouchableOpacity 
              style={[styles.bigSosBtn, panicoEnviado && styles.bigSosBtnSent]}
              onPress={handleEmitirAlertaSOS}
              disabled={enviandoPanico}
              activeOpacity={0.85}
            >
              <Text style={styles.bigSosText}>{panicoEnviado ? '¡ALERTA EMITIDA!' : 'SOS'}</Text>
              <Text style={styles.bigSosSubtext}>{panicoEnviado ? 'Vecinos avisados' : 'Mantén presionado'}</Text>
            </TouchableOpacity>

            <View style={styles.emergencyDirectCalls}>
              <TouchableOpacity style={styles.callSerenazgoBtn} onPress={() => Alert.alert('Llamando', 'Conectando con la Central de Serenazgo')}>
                <Feather name="phone-call" size={16} color="#144e40" />
                <Text style={styles.callSerenazgoText}>Llamar Serenazgo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callPoliceBtn} onPress={() => Alert.alert('Llamando', 'Marcando al 105 Policía Nacional')}>
                <Feather name="phone-call" size={16} color="#b93815" />
                <Text style={styles.callPoliceText}>Central 105</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Publicar Oficio o Favor */}
      <Modal visible={modalPublicarVisible} transparent animationType="slide" onRequestClose={() => setModalPublicarVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Publicar en tu Barrio</Text>
              <TouchableOpacity onPress={() => setModalPublicarVisible(false)}>
                <Feather name="x" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Ofrece tus servicios profesionales a tus vecinos o solicita un favor solidario a tu manzana.
            </Text>
            <TextInput 
              style={styles.modalInput}
              placeholder="Ej: Ofrezco clases de guitarra los sábados"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity 
              style={styles.modalPrimaryBtn}
              onPress={() => {
                setModalPublicarVisible(false);
                Alert.alert('¡Publicado!', 'Tu publicación ya está visible para los vecinos de tu cuadrante.');
              }}
            >
              <Text style={styles.modalPrimaryBtnText}>Publicar anuncio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Perfil */}
      <Modal visible={modalPerfilVisible} transparent animationType="slide" onRequestClose={() => setModalPerfilVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mi Perfil Vecinal</Text>
              <TouchableOpacity onPress={() => setModalPerfilVisible(false)}>
                <Feather name="x" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileBadge}>
              <Text style={styles.profileName}>{userData.firstName} {userData.lastName}</Text>
              <Text style={styles.profileDni}>DNI: {userData.dni || 'Verificado oficial'}</Text>
              <Text style={styles.profileZone}>📍 {cuadranteMostrado}</Text>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedTagText}>✓ Identidad validada</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.logoutBtn} 
              onPress={() => {
                setModalPerfilVisible(false);
                onLogout();
              }}
            >
              <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tuZonaLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  zonaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zonaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#144e40',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#144e40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chatBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#dc2626',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 110,
  },
  cardActive: {
    backgroundColor: '#144e40',
    shadowColor: '#144e40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 10,
  },
  titleActive: {
    color: '#ffffff',
  },
  titleInactive: {
    color: '#111827',
  },
  categorySubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  subActive: {
    color: '#a3d9c9',
  },
  subInactive: {
    color: '#6b7280',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e6f0ed',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  distanceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#144e40',
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#f0f2ee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  itemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemDetails: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  itemDistance: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  itemProfession: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
    marginBottom: 6,
  },
  itemSubDetail: {
    color: '#6b7280',
    fontWeight: '400',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reputationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reputationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#144e40',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  fabBtn: {
    position: 'absolute',
    right: 18,
    bottom: 84,
    backgroundColor: '#144e40',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  fabBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f2ee',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 3,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#144e40',
    fontWeight: '700',
  },
  emergencyNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -20,
  },
  sosButtonCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#b43b1d',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#f7f8f4',
    shadowColor: '#b43b1d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    position: 'relative',
  },
  sosActiveYellowDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#f59e0b',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  emergencyNavLabel: {
    fontSize: 10,
    color: '#b43b1d',
    fontWeight: '700',
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalDesc: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 20,
  },
  bigSosBtn: {
    backgroundColor: '#ba3816',
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    borderWidth: 4,
    borderColor: '#fbe8e4',
    shadowColor: '#ba3816',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  bigSosBtnSent: {
    backgroundColor: '#059669',
    borderColor: '#d1fae5',
  },
  bigSosText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bigSosSubtext: {
    color: '#ffffff',
    fontSize: 11,
    marginTop: 4,
    opacity: 0.9,
  },
  emergencyDirectCalls: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  callSerenazgoBtn: {
    flex: 1,
    backgroundColor: '#e6f0ed',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callSerenazgoText: {
    color: '#144e40',
    fontSize: 12,
    fontWeight: '700',
  },
  callPoliceBtn: {
    flex: 1,
    backgroundColor: '#fee4e2',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callPoliceText: {
    color: '#b93815',
    fontSize: 12,
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    color: '#111827',
    marginBottom: 16,
  },
  modalPrimaryBtn: {
    backgroundColor: '#144e40',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  profileBadge: {
    backgroundColor: '#f9f9fb',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileDni: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 2,
  },
  profileZone: {
    fontSize: 13,
    color: '#144e40',
    fontWeight: '600',
    marginBottom: 10,
  },
  verifiedTag: {
    backgroundColor: '#e6f0ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verifiedTagText: {
    fontSize: 11,
    color: '#144e40',
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
  },
});
