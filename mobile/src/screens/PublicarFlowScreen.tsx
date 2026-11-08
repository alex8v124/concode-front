import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export type PublicarTipo = 'servicio' | 'dono' | 'presto' | 'ofrezco' | 'necesito';

export interface PublicacionData {
  tipo: PublicarTipo;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  metodoContacto: 'chat' | 'whatsapp';
}

interface Props {
  onClose: () => void;
  onSuccessPublish: (data: PublicacionData) => void;
  userQuadrant?: string;
}

export const PublicarFlowScreen: React.FC<Props> = ({ 
  onClose, 
  onSuccessPublish,
  userQuadrant = 'Mz. D, Los Pinos'
}) => {
  const [paso, setPaso] = useState<1 | 2 | 3 | 4>(1); // 4 = Listo / Éxito
  const [tipoSeleccionado, setTipoSeleccionado] = useState<PublicarTipo>('necesito');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState(userQuadrant);
  const [metodoContacto, setMetodoContacto] = useState<'chat' | 'whatsapp'>('chat');

  // Configuración de badges y textos por tipo
  const infoTipo = {
    servicio: {
      label: 'Servicio',
      letra: 'S',
      bgBadge: '#d6eee2',
      textColor: '#144e40',
      tituloPlaceholder: 'Ej.: Ofrezco clases de matemática o gasfitería',
      descPlaceholder: 'Describe tu experiencia, horarios y condiciones...',
    },
    dono: {
      label: 'Dono',
      letra: 'D',
      bgBadge: '#d6eee2',
      textColor: '#144e40',
      tituloPlaceholder: 'Ej.: Dono ropa de invierno y libros escolares',
      descPlaceholder: 'Indica el estado de las cosas y cómo recogerlas...',
    },
    presto: {
      label: 'Presto',
      letra: 'P',
      bgBadge: '#e0e7fb',
      textColor: '#2b4290',
      tituloPlaceholder: 'Ej.: Presto taladro percutor con brocas',
      descPlaceholder: '¿Para qué fechas y por cuántos días lo prestas?',
    },
    ofrezco: {
      label: 'Ofrezco',
      letra: 'O',
      bgBadge: '#ede9fe',
      textColor: '#5b21b6',
      tituloPlaceholder: 'Ej.: Ayuda con compras o paseo de mascotas',
      descPlaceholder: '¿En qué horarios estás disponible para ayudar?',
    },
    necesito: {
      label: 'Necesito',
      letra: 'N',
      bgBadge: '#ffedd5',
      textColor: '#9a3412',
      tituloPlaceholder: 'Ej.: Necesito un taladro',
      descPlaceholder: '¿Para qué y hasta cuándo?',
    },
  }[tipoSeleccionado];

  const handleSeleccionarTipo = (tipo: PublicarTipo) => {
    setTipoSeleccionado(tipo);
    setPaso(2);
  };

  const handlePaso2Siguiente = () => {
    if (!titulo.trim()) {
      Alert.alert('Falta título', 'Por favor ingresa un título corto para tu publicación.');
      return;
    }
    setPaso(3);
  };

  const handlePublicarFinal = () => {
    const data: PublicacionData = {
      tipo: tipoSeleccionado,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      ubicacion,
      metodoContacto,
    };
    onSuccessPublish(data);
    setPaso(4);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Cabecera Superior con progreso */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeBtn} 
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Feather name="x" size={20} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.stepTitle}>
            {paso === 4 ? 'Listo' : `Paso ${paso} de 3`}
          </Text>

          {paso === 2 || paso === 3 ? (
            <TouchableOpacity 
              onPress={() => setPaso((prev) => (prev - 1) as 1 | 2)}
              activeOpacity={0.7}
            >
              <Text style={styles.atrasLink}>Atrás</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderRight} />
          )}
        </View>

        {/* Barra de progreso de 3 segmentos */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, paso >= 1 && styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, paso >= 2 && styles.progressSegmentFilled]} />
          <View style={[styles.progressSegment, paso >= 3 && styles.progressSegmentFilled]} />
        </View>

        {/* -------------------- PASO 1: ¿Qué quieres publicar? -------------------- */}
        {paso === 1 && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.titleSection}>
              <Text style={styles.mainHeading}>¿Qué quieres publicar?</Text>
              <Text style={styles.subHeading}>Un servicio o un favor para tus vecinos.</Text>
            </View>

            {/* Sección SERVICIOS */}
            <Text style={styles.sectionHeaderLabel}>SERVICIOS</Text>
            <TouchableOpacity 
              style={styles.serviceBigCard}
              onPress={() => handleSeleccionarTipo('servicio')}
              activeOpacity={0.8}
            >
              <View style={styles.wrenchIconContainer}>
                <MaterialCommunityIcons name="wrench" size={22} color="#ffffff" />
              </View>
              <View style={styles.serviceCardTextContainer}>
                <Text style={styles.serviceCardTitle}>Ofrecer mi servicio</Text>
                <Text style={styles.serviceCardSubtitle}>Tu oficio o profesión en el directorio</Text>
              </View>
            </TouchableOpacity>

            {/* Sección FAVORES · SIN DINERO */}
            <Text style={[styles.sectionHeaderLabel, { marginTop: 28 }]}>FAVORES · SIN DINERO</Text>
            <View style={styles.favoresGrid}>
              
              {/* Dono */}
              <TouchableOpacity 
                style={styles.favorGridCard}
                onPress={() => handleSeleccionarTipo('dono')}
                activeOpacity={0.8}
              >
                <View style={[styles.badgeIcon, { backgroundColor: '#d6eee2' }]}>
                  <Text style={[styles.badgeLetter, { color: '#144e40' }]}>D</Text>
                </View>
                <Text style={styles.favorCardTitle}>Dono</Text>
                <Text style={styles.favorCardSubtitle}>Ropa, víveres, muebles...</Text>
              </TouchableOpacity>

              {/* Presto */}
              <TouchableOpacity 
                style={styles.favorGridCard}
                onPress={() => handleSeleccionarTipo('presto')}
                activeOpacity={0.8}
              >
                <View style={[styles.badgeIcon, { backgroundColor: '#e0e7fb' }]}>
                  <Text style={[styles.badgeLetter, { color: '#2b4290' }]}>P</Text>
                </View>
                <Text style={styles.favorCardTitle}>Presto</Text>
                <Text style={styles.favorCardSubtitle}>Herramientas, escaleras, sillas...</Text>
              </TouchableOpacity>

              {/* Ofrezco */}
              <TouchableOpacity 
                style={styles.favorGridCard}
                onPress={() => handleSeleccionarTipo('ofrezco')}
                activeOpacity={0.8}
              >
                <View style={[styles.badgeIcon, { backgroundColor: '#ede9fe' }]}>
                  <Text style={[styles.badgeLetter, { color: '#5b21b6' }]}>O</Text>
                </View>
                <Text style={styles.favorCardTitle}>Ofrezco</Text>
                <Text style={styles.favorCardSubtitle}>Clases, ayuda, tu tiempo...</Text>
              </TouchableOpacity>

              {/* Necesito */}
              <TouchableOpacity 
                style={styles.favorGridCard}
                onPress={() => handleSeleccionarTipo('necesito')}
                activeOpacity={0.8}
              >
                <View style={[styles.badgeIcon, { backgroundColor: '#ffedd5' }]}>
                  <Text style={[styles.badgeLetter, { color: '#9a3412' }]}>N</Text>
                </View>
                <Text style={styles.favorCardTitle}>Necesito</Text>
                <Text style={styles.favorCardSubtitle}>Pide un favor a tus vecinos</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* -------------------- PASO 2: Cuéntalo en corto -------------------- */}
        {paso === 2 && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Tag del tipo seleccionado */}
            <View style={[styles.selectedTypePill, { backgroundColor: infoTipo.bgBadge }]}>
              <Text style={[styles.selectedTypePillText, { color: infoTipo.textColor }]}>
                {infoTipo.label}
              </Text>
            </View>

            <Text style={styles.mainHeading}>Cuéntalo en corto</Text>

            {/* Campo Título */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título</Text>
              <TextInput 
                style={styles.textInput}
                placeholder={infoTipo.tituloPlaceholder}
                placeholderTextColor="#9ca3af"
                value={titulo}
                onChangeText={setTitulo}
                maxLength={60}
              />
            </View>

            {/* Campo Descripción Corta */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción corta</Text>
              <TextInput 
                style={styles.textArea}
                placeholder={infoTipo.descPlaceholder}
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                value={descripcion}
                onChangeText={setDescripcion}
                maxLength={140}
                textAlignVertical="top"
              />
              <Text style={styles.charCounter}>{descripcion.length}/140 caracteres</Text>
            </View>

            {/* Botón Siguiente */}
            <TouchableOpacity 
              style={styles.actionBtnDark}
              onPress={handlePaso2Siguiente}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnDarkText}>Siguiente</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* -------------------- PASO 3: ¿Dónde y cómo te contactan? -------------------- */}
        {paso === 3 && (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.mainHeading}>¿Dónde y cómo te contactan?</Text>

            {/* Ubicación */}
            <View style={styles.sectionContainer}>
              <Text style={styles.inputLabel}>Ubicación</Text>
              <View style={styles.locationCard}>
                <View style={styles.locationLeftRow}>
                  <Feather name="map-pin" size={20} color="#144e40" style={styles.locationIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locationTitle}>{ubicacion}</Text>
                    <Text style={styles.locationSubtitle}>Se muestra solo la manzana, no tu dirección</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => {
                    Alert.prompt(
                      'Cambiar sector',
                      'Ingresa tu manzana o sector de referencia:',
                      (text) => text && setUbicacion(text),
                      'plain-text',
                      ubicacion
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cambiarLink}>Cambiar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contacto */}
            <View style={styles.sectionContainer}>
              <Text style={styles.inputLabel}>Contacto</Text>

              {/* Opción 1: Chat dentro de la app */}
              <TouchableOpacity 
                style={[
                  styles.contactCard, 
                  metodoContacto === 'chat' && styles.contactCardSelected
                ]}
                onPress={() => setMetodoContacto('chat')}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={metodoContacto === 'chat' ? 'radio-button-on' : 'radio-button-off'} 
                  size={22} 
                  color={metodoContacto === 'chat' ? '#144e40' : '#9ca3af'} 
                />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactTitle}>Chat dentro de la app</Text>
                  <Text style={styles.contactSubtitle}>Tu número queda privado</Text>
                </View>
              </TouchableOpacity>

              {/* Opción 2: WhatsApp */}
              <TouchableOpacity 
                style={[
                  styles.contactCard, 
                  metodoContacto === 'whatsapp' && styles.contactCardSelected
                ]}
                onPress={() => setMetodoContacto('whatsapp')}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={metodoContacto === 'whatsapp' ? 'radio-button-on' : 'radio-button-off'} 
                  size={22} 
                  color={metodoContacto === 'whatsapp' ? '#144e40' : '#9ca3af'} 
                />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactTitle}>WhatsApp</Text>
                  <Text style={styles.contactSubtitle}>Los vecinos verán tu número</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Botón Publicar Verde */}
            <TouchableOpacity 
              style={styles.actionBtnGreen}
              onPress={handlePublicarFinal}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnGreenText}>Publicar</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* -------------------- PASO 4 (Éxito): ¡Publicado! -------------------- */}
        {paso === 4 && (
          <View style={styles.successContainer}>
            <View style={styles.successIconCircle}>
              <Feather name="check" size={38} color="#144e40" />
            </View>

            <Text style={styles.successHeading}>¡Publicado!</Text>
            
            <Text style={styles.successDescription}>
              Tu {tipoSeleccionado === 'servicio' ? 'servicio' : 'favor'} ya aparece en {tipoSeleccionado === 'servicio' ? 'Servicios' : 'Favores'} para los vecinos de Los Pinos. Te avisaremos cuando alguien responda.
            </Text>

            <TouchableOpacity 
              style={styles.actionBtnDark}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnDarkText}>Volver al inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.publicarOtraBtn}
              onPress={() => {
                setTitulo('');
                setDescripcion('');
                setPaso(1);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.publicarOtraText}>Publicar otra cosa</Text>
            </TouchableOpacity>
          </View>
        )}

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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    paddingBottom: 14,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  atrasLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#144e40',
  },
  placeholderRight: {
    width: 36,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  progressSegmentFilled: {
    backgroundColor: '#144e40',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 24,
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subHeading: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 20,
  },
  sectionHeaderLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  serviceBigCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  wrenchIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#144e40',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  serviceCardTextContainer: {
    flex: 1,
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  serviceCardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeLetter: {
    fontSize: 15,
    fontWeight: '800',
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
  selectedTypePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedTypePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputGroup: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    height: 120,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  charCounter: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 6,
  },
  actionBtnDark: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  actionBtnDarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtnGreen: {
    backgroundColor: '#144e40',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  actionBtnGreenText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionContainer: {
    marginTop: 22,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  cambiarLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#144e40',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },
  contactCardSelected: {
    borderColor: '#144e40',
    backgroundColor: '#f6fbf9',
  },
  contactTextContainer: {
    marginLeft: 14,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d6eee2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successHeading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  successDescription: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  publicarOtraBtn: {
    marginTop: 20,
    paddingVertical: 10,
  },
  publicarOtraText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#144e40',
  },
});
