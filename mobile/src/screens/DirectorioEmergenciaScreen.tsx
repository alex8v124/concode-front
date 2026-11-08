import React, { useState } from 'react';
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
  Linking
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onBack: () => void;
  userQuadrant?: string;
}

type SubVistaEmergencia = 'directorio' | 'activar_tablero' | 'tablero_activo' | 'reportar_necesidad' | 'ofrecer_ayuda';

export const DirectorioEmergenciaScreen: React.FC<Props> = ({
  onBack,
  userQuadrant = 'Urb. Los Pinos, Surco'
}) => {
  const [subVista, setSubVista] = useState<SubVistaEmergencia>('directorio');
  const [estoyASalvo, setEstoyASalvo] = useState(false);
  const [salvoCount, setSalvoCount] = useState(126);
  const [tabTablero, setTabTablero] = useState<'necesita' | 'ofrece'>('necesita');
  const [tipoEmergenciaSeleccionado, setTipoEmergenciaSeleccionado] = useState('Lluvias o huaico');
  const [detalleEmergencia, setDetalleEmergencia] = useState('');

  // Items de ayuda humanitaria comunitaria
  const [itemsNecesidad, setItemsNecesidad] = useState([
    { id: '1', nombre: 'Agua embotellada', prioridad: 'Prioridad alta', reunido: 120, meta: 300, unidad: 'L', aportado: false },
    { id: '2', nombre: 'Frazadas', prioridad: 'Prioridad alta', reunido: 45, meta: 80, unidad: '', aportado: false },
    { id: '3', nombre: 'Botiquín básico', prioridad: 'Prioridad alta', reunido: 6, meta: 20, unidad: '', aportado: false },
    { id: '4', nombre: 'Voluntarios para limpieza', prioridad: 'Prioridad media', reunido: 8, meta: 15, unidad: 'personas', aportado: false },
  ]);

  const handleLlamar = (numero: string, nombre: string) => {
    Alert.alert(`Llamar a ${nombre}`, `¿Deseas marcar al ${numero}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Llamar', onPress: () => Linking.openURL(`tel:${numero}`).catch(() => {}) }
    ]);
  };

  const handleAportar = (id: string) => {
    setItemsNecesidad(prev => prev.map(item => {
      if (item.id === id) {
        const aportadoNuevo = !item.aportado;
        return {
          ...item,
          aportado: aportadoNuevo,
          reunido: aportadoNuevo ? item.reunido + 5 : item.reunido - 5
        };
      }
      return item;
    }));
    Alert.alert('¡Aporte registrado!', 'Gracias por apoyar a tus vecinos. Se notificó al centro comunal.');
  };

  // ------------------------- VISTA: TABLERO ACTIVO (MODO EMERGENCIA) -------------------------
  if (subVista === 'tablero_activo') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Header Naranja / Óxido Modo Emergencia */}
          <View style={styles.emergencyHeaderBanner}>
            <View style={styles.bannerTopRow}>
              <TouchableOpacity 
                style={styles.backCircleBtn}
                onPress={() => setSubVista('directorio')}
                activeOpacity={0.7}
              >
                <Feather name="chevron-left" size={24} color="#ffffff" />
              </TouchableOpacity>

              <View style={styles.modoBadge}>
                <Text style={styles.modoBadgeText}>MODO EMERGENCIA</Text>
              </View>
            </View>

            <Text style={styles.bannerTitle}>Lluvias intensas en Los Pinos</Text>
            <Text style={styles.bannerSubtitle}>
              Activado hoy 06:40 · confirmado por 5 vecinos en 12 min
            </Text>

            <TouchableOpacity 
              style={[styles.estoyASalvoBtn, estoyASalvo && styles.estoyASalvoBtnActive]}
              onPress={() => {
                if (!estoyASalvo) {
                  setEstoyASalvo(true);
                  setSalvoCount(prev => prev + 1);
                  Alert.alert('Estado actualizado', 'Tus vecinos saben que te encuentras a salvo.');
                }
              }}
              activeOpacity={0.85}
            >
              <Feather name="check" size={20} color={estoyASalvo ? '#144e40' : '#111827'} />
              <Text style={styles.estoyASalvoText}>
                {estoyASalvo ? '¡Marcado a salvo!' : 'Estoy a salvo'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.salvoCountText}>
              {salvoCount} vecinos ya marcaron que están a salvo
            </Text>
          </View>

          {/* Selector Se necesita / Se ofrece */}
          <View style={styles.tableroTabsRow}>
            <TouchableOpacity 
              style={[styles.tableroTab, tabTablero === 'necesita' && styles.tableroTabActive]}
              onPress={() => setTabTablero('necesita')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tableroTabText, tabTablero === 'necesita' && styles.tableroTabTextActive]}>
                Se necesita
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tableroTab, tabTablero === 'ofrece' && styles.tableroTabActive]}
              onPress={() => setTabTablero('ofrece')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tableroTabText, tabTablero === 'ofrece' && styles.tableroTabTextActive]}>
                Se ofrece
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lista de Necesidades con Barra de Progreso y Botón Aporto */}
          <ScrollView contentContainerStyle={styles.tableroList} showsVerticalScrollIndicator={false}>
            {itemsNecesidad.map(item => {
              const porcentaje = Math.min(100, Math.round((item.reunido / item.meta) * 100));
              return (
                <View key={item.id} style={styles.needCard}>
                  <View style={styles.needCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.needTitle}>{item.nombre}</Text>
                      <Text style={styles.needPriority}>{item.prioridad}</Text>
                    </View>

                    <TouchableOpacity 
                      style={[styles.aportoBtn, item.aportado && styles.aportoBtnActive]}
                      onPress={() => handleAportar(item.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.aportoBtnText, item.aportado && styles.aportoBtnTextActive]}>
                        {item.aportado ? 'Aportado' : 'Aporto'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Barra de Progreso */}
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${porcentaje}%` }]} />
                  </View>

                  <Text style={styles.gatheredText}>
                    {item.reunido} {item.unidad} de {item.meta} {item.unidad} reunidos
                  </Text>
                </View>
              );
            })}

            <TouchableOpacity 
              style={styles.nuevaAlertaLink}
              onPress={() => setSubVista('reportar_necesidad')}
            >
              <Text style={styles.nuevaAlertaLinkText}>+ Reportar otra necesidad para el barrio</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------- VISTA: ACTIVAR TABLERO (FORMULARIO 3 PASOS) -------------------------
  if (subVista === 'activar_tablero') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backCircleBtnLight}
              onPress={() => setSubVista('directorio')}
              activeOpacity={0.7}
            >
              <Feather name="chevron-left" size={24} color="#111827" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Activar tablero de ayuda</Text>
              <Text style={styles.headerSubtitle}>{userQuadrant}</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Tarjeta ¿Cómo se activa? */}
            <View style={styles.howItWorksCard}>
              <Text style={styles.howItWorksTitle}>¿Cómo se activa?</Text>

              <View style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepHeading}>Un vecino lo solicita</Text>
                  <Text style={styles.stepBody}>Cualquier vecino verificado de la zona puede reportar una emergencia.</Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepHeading}>5 vecinos lo confirman en 30 minutos</Text>
                  <Text style={styles.stepBody}>Avisamos a los vecinos cercanos. Al llegar a 5 confirmaciones, el tablero se abre para todo el barrio.</Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepHeading}>Si no se confirma, expira</Text>
                  <Text style={styles.stepBody}>Si en 30 minutos no hay 5 confirmaciones, la solicitud se cancela sola.</Text>
                </View>
              </View>
            </View>

            {/* Chips de Tipo de Emergencia */}
            <Text style={styles.sectionHeading}>Tipo de emergencia</Text>
            <View style={styles.chipsWrap}>
              {['Lluvias o huaico', 'Sismo', 'Incendio', 'Sin agua o luz', 'Otro'].map(tag => {
                const isSelected = tipoEmergenciaSeleccionado === tag;
                return (
                  <TouchableOpacity 
                    key={tag}
                    style={[styles.emergencyChip, isSelected && styles.emergencyChipActive]}
                    onPress={() => setTipoEmergenciaSeleccionado(tag)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.emergencyChipText, isSelected && styles.emergencyChipTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input ¿Qué está pasando? */}
            <Text style={[styles.sectionHeading, { marginTop: 20 }]}>¿Qué está pasando?</Text>
            <TextInput 
              style={styles.emergencyInput}
              placeholder="Ej.: Se inundó la calle 4 y hay casas sin luz"
              placeholderTextColor="#9ca3af"
              value={detalleEmergencia}
              onChangeText={setDetalleEmergencia}
              multiline
              numberOfLines={3}
            />

            {/* Botón Solicitar Activación */}
            <TouchableOpacity 
              style={styles.solicitarActivacionBtn}
              onPress={() => {
                setSubVista('tablero_activo');
                Alert.alert(
                  'Activación Solicitada',
                  'Se envió la alerta de verificación a los vecinos del cuadrante. El tablero ha sido inicializado.'
                );
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.solicitarActivacionBtnText}>Solicitar activación</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------- VISTA: REPORTAR NECESIDAD O OFRECER AYUDA -------------------------
  if (subVista === 'reportar_necesidad' || subVista === 'ofrecer_ayuda') {
    const esNecesidad = subVista === 'reportar_necesidad';
    const catalogo = [
      { id: '1', nombre: 'Agua', desc: 'Embotellada o bidones', alert: true },
      { id: '2', nombre: 'Alimentos', desc: 'Víveres o comida lista', alert: false },
      { id: '3', nombre: 'Abrigo', desc: 'Frazadas, ropa', alert: true },
      { id: '4', nombre: 'Botiquín', desc: 'Primeros auxilios', alert: true },
      { id: '5', nombre: 'Voluntarios', desc: 'Manos para ayudar', alert: true },
      { id: '6', nombre: 'Transporte', desc: 'Llevar personas o cosas', alert: false },
      { id: '7', nombre: 'Alojamiento', desc: 'Un lugar para dormir', alert: false },
      { id: '8', nombre: 'Otro', desc: 'Algo distinto', alert: false },
    ];

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backCircleBtnLight}
              onPress={() => setSubVista('tablero_activo')}
              activeOpacity={0.7}
            >
              <Feather name="x" size={20} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Paso 1 de 3</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressSegment, { backgroundColor: esNecesidad ? '#b93815' : '#144e40' }]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.badgeTag, { backgroundColor: esNecesidad ? '#b93815' : '#144e40' }]}>
              <Text style={styles.badgeTagText}>
                {esNecesidad ? 'REPORTAR NECESIDAD' : 'OFRECER AYUDA'}
              </Text>
            </View>

            <Text style={styles.mainHeading}>
              {esNecesidad ? '¿Qué se necesita?' : '¿Qué puedes aportar?'}
            </Text>

            <View style={styles.favoresGrid}>
              {catalogo.map(c => (
                <TouchableOpacity 
                  key={c.id} 
                  style={[styles.favorGridCard, c.alert && styles.favorGridCardAlert]}
                  onPress={() => {
                    Alert.alert('Seleccionado', `${c.nombre} añadido al reporte comunitario.`);
                    setSubVista('tablero_activo');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.favorCardTitle}>{c.nombre}</Text>
                  <Text style={styles.favorCardSubtitle}>
                    {c.alert ? 'Se necesita ahora' : c.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------- VISTA PRINCIPAL: DIRECTORIO DE EMERGENCIA -------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Cabecera */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backCircleBtnLight}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Emergencias</Text>
            <Text style={styles.headerSubtitle}>{userQuadrant}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Banner de Acceso al Tablero Comunitario de Ayuda */}
          <TouchableOpacity 
            style={styles.tableroBannerCard}
            onPress={() => setSubVista('activar_tablero')}
            activeOpacity={0.85}
          >
            <View style={styles.tableroBannerIcon}>
              <MaterialCommunityIcons name="bullhorn" size={24} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tableroBannerTitle}>Tablero de ayuda vecinal</Text>
              <Text style={styles.tableroBannerSub}>Reportar o sumarse a una emergencia barrial</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#b93815" />
          </TouchableOpacity>

          {/* Cuadrícula de 4 Números de Emergencia Nacionales */}
          <View style={styles.emergencias4Grid}>
            
            {/* 105 Policía Nacional */}
            <TouchableOpacity 
              style={[styles.emergencyCallCard, { backgroundColor: '#b93815' }]}
              onPress={() => handleLlamar('105', 'Policía Nacional')}
              activeOpacity={0.85}
            >
              <Feather name="shield" size={22} color="#ffffff" style={styles.cardTopIcon} />
              <Text style={styles.cardNumberWhite}>105</Text>
              <Text style={styles.cardLabelWhite}>Policía Nacional</Text>
            </TouchableOpacity>

            {/* 116 Bomberos */}
            <TouchableOpacity 
              style={[styles.emergencyCallCard, { backgroundColor: '#18181b' }]}
              onPress={() => handleLlamar('116', 'Bomberos Voluntarios')}
              activeOpacity={0.85}
            >
              <Feather name="zap" size={22} color="#ffffff" style={styles.cardTopIcon} />
              <Text style={styles.cardNumberWhite}>116</Text>
              <Text style={styles.cardLabelWhite}>Bomberos</Text>
            </TouchableOpacity>

            {/* 106 SAMU · Ambulancia */}
            <TouchableOpacity 
              style={[styles.emergencyCallCard, styles.whiteCard]}
              onPress={() => handleLlamar('106', 'SAMU Ambulancia')}
              activeOpacity={0.85}
            >
              <Feather name="plus-square" size={22} color="#b93815" style={styles.cardTopIcon} />
              <Text style={styles.cardNumberDark}>106</Text>
              <Text style={styles.cardLabelDark}>SAMU · Ambulancia</Text>
            </TouchableOpacity>

            {/* 115 Defensa Civil */}
            <TouchableOpacity 
              style={[styles.emergencyCallCard, styles.whiteCard]}
              onPress={() => handleLlamar('115', 'Defensa Civil INDECI')}
              activeOpacity={0.85}
            >
              <Feather name="activity" size={22} color="#b93815" style={styles.cardTopIcon} />
              <Text style={styles.cardNumberDark}>115</Text>
              <Text style={styles.cardLabelDark}>Defensa Civil</Text>
            </TouchableOpacity>

          </View>

          {/* Sección En tu barrio */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeading}>En tu barrio</Text>
            <Text style={styles.sectionSub}>Los más cercanos a tu ubicación</Text>
          </View>

          <View style={styles.localDirectoryList}>
            
            {/* Serenazgo */}
            <View style={styles.localItemCard}>
              <View style={[styles.avatarInitial, { backgroundColor: '#faecd5' }]}>
                <Text style={[styles.avatarInitialText, { color: '#8c531b' }]}>SZ</Text>
              </View>
              <View style={styles.localItemDetails}>
                <Text style={styles.localItemName}>Serenazgo de Surco</Text>
                <Text style={styles.localItemMeta}>[Nº SERENAZGO] · 24 h</Text>
              </View>
              <TouchableOpacity 
                style={styles.callCircleBtn}
                onPress={() => handleLlamar('014115555', 'Serenazgo')}
                activeOpacity={0.7}
              >
                <Feather name="phone" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Comisaría */}
            <View style={styles.localItemCard}>
              <View style={[styles.avatarInitial, { backgroundColor: '#fee4e2' }]}>
                <Text style={[styles.avatarInitialText, { color: '#912018' }]}>CM</Text>
              </View>
              <View style={styles.localItemDetails}>
                <Text style={styles.localItemName}>Comisaría del sector</Text>
                <Text style={styles.localItemMeta}>1.2 km · [Nº COMISARÍA]</Text>
              </View>
              <TouchableOpacity 
                style={styles.callCircleBtn}
                onPress={() => handleLlamar('012712233', 'Comisaría')}
                activeOpacity={0.7}
              >
                <Feather name="phone" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Posta de salud */}
            <View style={styles.localItemCard}>
              <View style={[styles.avatarInitial, { backgroundColor: '#faecd5' }]}>
                <Text style={[styles.avatarInitialText, { color: '#8c531b' }]}>PS</Text>
              </View>
              <View style={styles.localItemDetails}>
                <Text style={styles.localItemName}>Posta de salud</Text>
                <Text style={styles.localItemMeta}>800 m · Abierta hasta 20:00</Text>
              </View>
              <TouchableOpacity 
                style={styles.callCircleBtn}
                onPress={() => handleLlamar('014498877', 'Posta de Salud')}
                activeOpacity={0.7}
              >
                <Feather name="phone" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Farmacia de turno */}
            <View style={styles.localItemCard}>
              <View style={[styles.avatarInitial, { backgroundColor: '#fee4e2' }]}>
                <Text style={[styles.avatarInitialText, { color: '#912018' }]}>FT</Text>
              </View>
              <View style={styles.localItemDetails}>
                <Text style={styles.localItemName}>Farmacia de turno</Text>
                <Text style={styles.localItemMeta}>350 m · Abierta ahora</Text>
              </View>
              <TouchableOpacity 
                style={styles.callCircleBtn}
                onPress={() => handleLlamar('014481122', 'Farmacia')}
                activeOpacity={0.7}
              >
                <Feather name="phone" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Cerrajería 24 h */}
            <View style={styles.localItemCard}>
              <View style={[styles.avatarInitial, { backgroundColor: '#fee4e2' }]}>
                <Text style={[styles.avatarInitialText, { color: '#912018' }]}>CJ</Text>
              </View>
              <View style={styles.localItemDetails}>
                <Text style={styles.localItemName}>Cerrajería 24 h · Ana Paredes</Text>
                <Text style={styles.localItemMeta}>Atención vecinal inmediata</Text>
              </View>
              <TouchableOpacity 
                style={styles.callCircleBtn}
                onPress={() => handleLlamar('987654321', 'Ana Paredes')}
                activeOpacity={0.7}
              >
                <Feather name="phone" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    paddingBottom: 16,
  },
  backCircleBtnLight: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tableroBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#ffedd5',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  tableroBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#b93815',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  tableroBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9a3412',
    marginBottom: 2,
  },
  tableroBannerSub: {
    fontSize: 12,
    color: '#c2410c',
  },
  emergencias4Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 26,
  },
  emergencyCallCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    height: 120,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  whiteCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTopIcon: {
    marginBottom: 6,
  },
  cardNumberWhite: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  cardLabelWhite: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f3f4f6',
  },
  cardNumberDark: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  cardLabelDark: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  sectionHeaderWrap: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSub: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  localDirectoryList: {
    gap: 10,
  },
  localItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatarInitial: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitialText: {
    fontSize: 14,
    fontWeight: '800',
  },
  localItemDetails: {
    flex: 1,
  },
  localItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  localItemMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  callCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#b93815',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Estilos Modo Emergencia Banner
  emergencyHeaderBanner: {
    backgroundColor: '#b93815',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 12,
    paddingBottom: 24,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modoBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modoBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#b93815',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#fed7aa',
    marginBottom: 20,
  },
  estoyASalvoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    height: 48,
    gap: 8,
    marginBottom: 12,
  },
  estoyASalvoBtnActive: {
    backgroundColor: '#dcfce7',
  },
  estoyASalvoText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  salvoCountText: {
    fontSize: 12,
    color: '#ffedd5',
    textAlign: 'center',
  },
  tableroTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 14,
    gap: 10,
  },
  tableroTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  tableroTabActive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tableroTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  tableroTabTextActive: {
    color: '#111827',
  },
  tableroList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  needCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  needCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  needTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  needPriority: {
    fontSize: 12,
    fontWeight: '700',
    color: '#b93815',
  },
  aportoBtn: {
    backgroundColor: '#18181b',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
  },
  aportoBtnActive: {
    backgroundColor: '#144e40',
  },
  aportoBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  aportoBtnTextActive: {
    color: '#ffffff',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#b93815',
    borderRadius: 4,
  },
  gatheredText: {
    fontSize: 12,
    color: '#6b7280',
  },
  nuevaAlertaLink: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  nuevaAlertaLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b93815',
  },

  // Estilos How It Works
  howItWorksCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 22,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  stepBody: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  emergencyChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emergencyChipActive: {
    backgroundColor: '#b93815',
    borderColor: '#b93815',
  },
  emergencyChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  emergencyChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  emergencyInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 10,
    height: 90,
    textAlignVertical: 'top',
  },
  solicitarActivacionBtn: {
    backgroundColor: '#b93815',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  solicitarActivacionBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Helper chips & grid
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 18,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  badgeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 18,
  },
  favoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  favorGridCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  favorGridCardAlert: {
    borderColor: '#b93815',
    backgroundColor: '#fff7ed',
  },
  favorCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  favorCardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
});
