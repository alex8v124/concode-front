import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { mobileApiService } from '../services/api';

interface Props {
  userData: {
    firstName?: string;
    lastName?: string;
    age?: string;
    gender?: string;
    dni?: string;
    quadrant?: string;
    phone?: string;
  };
  onLogout?: () => void;
  onNavigateRestablecer?: () => void;
}

interface OcupacionInfo {
  oficio: string;
  anios: string;
}

export const MiPerfilScreen: React.FC<Props> = ({ userData, onLogout, onNavigateRestablecer }) => {
  const nombreCompleto = `${userData.firstName || 'Carlos Alberto'} ${userData.lastName || 'Mendoza Ríos'}`.trim();
  const iniciales = `${(userData.firstName || 'C')[0] || 'C'}${(userData.lastName || 'M')[0] || 'M'}`.toUpperCase();
  const edadMostrada = userData.age ? `${userData.age} años` : '34 años';
  const dniEnmascarado = userData.dni && userData.dni.length >= 4
    ? `• • • • ${userData.dni.slice(-4)}`
    : '• • • • 5678';
  const zonaMostrada = userData.quadrant || 'Urb. Los Pinos, Surco';
  const sexoMostrado = userData.gender === 'F' || userData.gender === 'Femenino' ? 'Femenino' : 'Masculino';
  const celularMostrado = userData.phone
    ? `+51 ${userData.phone.slice(0, 3)} • • • ${userData.phone.slice(-3)}`
    : '+51 987 • • • 321';

  const [ocupacion, setOcupacion] = useState<OcupacionInfo | null>({
    oficio: 'Electricidad',
    anios: '8',
  });
  const [modalOcupacionVisible, setModalOcupacionVisible] = useState(false);
  const [formOficio, setFormOficio] = useState('Electricidad');
  const [formAnios, setFormAnios] = useState('8');

  useEffect(() => {
    mobileApiService.obtenerOcupacion().then((data) => {
      if (data && typeof data.oficio === 'string') {
        if (data.oficio.trim() === '') {
          setOcupacion(null);
        } else {
          const aniosStr = String(data.aniosExperiencia ?? 1);
          setOcupacion({ oficio: data.oficio, anios: aniosStr });
          setFormOficio(data.oficio);
          setFormAnios(aniosStr);
        }
      }
    }).catch(() => {});
  }, []);

  const [correo] = useState('No registrado');
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false);

  const abrirModalOcupacion = () => {
    setFormOficio(ocupacion?.oficio || '');
    setFormAnios(ocupacion?.anios || '');
    setModalOcupacionVisible(true);
  };

  const handleGuardarOcupacion = async () => {
    const oficioLimpio = formOficio.trim();
    if (!oficioLimpio) {
      Alert.alert('Campo requerido', 'Ingresa el nombre de tu ocupación, oficio o profesión.');
      return;
    }
    const aniosLimpio = formAnios.replace(/\D/g, '') || '1';
    setOcupacion({ oficio: oficioLimpio, anios: aniosLimpio });
    setModalOcupacionVisible(false);
    try {
      await mobileApiService.actualizarOcupacion({
        oficio: oficioLimpio,
        aniosExperiencia: parseInt(aniosLimpio, 10) || 1,
        visibleDirectorio: true,
      });
    } catch (e) {
      console.warn('Error al sincronizar ocupación:', e);
    }
  };

  const handleEliminarOcupacion = async () => {
    setOcupacion(null);
    setModalOcupacionVisible(false);
    try {
      await mobileApiService.actualizarOcupacion({
        oficio: '',
        aniosExperiencia: 0,
        visibleDirectorio: false,
      });
    } catch (e) {
      console.warn('Error al eliminar ocupación:', e);
    }
  };

  const handleCambiarCelular = () => {
    Alert.alert('Cambiar Celular', 'Se enviará un código SMS al nuevo número para verificarlo.');
  };

  const handleAgregarCorreo = () => {
    Alert.alert('Agregar Correo', 'Ingresa tu correo para asociarlo a tu cuenta.');
  };

  const handleActualizarZona = () => {
    Alert.alert('Actualizar Zona', 'Para cambiar de comunidad vecinal debes verificar tu nuevo domicilio en el mapa.');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. Cabecera Superior: "Mi perfil" + Badge "✓ Verificado con DNI" */}
        <View style={styles.topHeaderRow}>
          <Text style={styles.screenTitle}>Mi perfil</Text>
          <View style={styles.verifiedDniPill}>
            <Feather name="check" size={13} color="#144e40" />
            <Text style={styles.verifiedDniPillText}>Verificado con DNI</Text>
          </View>
        </View>

        {/* 2. Tarjeta Principal del Vecino (Avatar + Nombre + Zona + Tag Ocupación) */}
        <View style={styles.heroProfileCard}>
          <View style={styles.heroAvatarCircle}>
            <Text style={styles.heroAvatarInitials}>{iniciales}</Text>
          </View>

          <View style={styles.heroInfoCol}>
            <Text style={styles.heroFullName}>{nombreCompleto}</Text>
            <Text style={styles.heroNeighborhoodText}>
              {zonaMostrada} · vecino desde marzo 2026
            </Text>

            {ocupacion ? (
              <TouchableOpacity
                style={styles.heroProfessionPill}
                onPress={abrirModalOcupacion}
                activeOpacity={0.8}
              >
                <Text style={styles.heroProfessionPillText}>{ocupacion.oficio}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.heroAddProfessionPill}
                onPress={abrirModalOcupacion}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={12} color="#144e40" />
                <Text style={styles.heroAddProfessionPillText}>Añadir profesión u oficio</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. Fila de 3 Estadísticas: Vistos buenos, Favores hechos, Publicaciones */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>vistos buenos</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>favores{'\n'}hechos</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>publicaciones</Text>
          </View>
        </View>

        {/* 4. Sección: Mis datos (Edad, Sexo, DNI) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Mis datos</Text>

          <View style={styles.dataCard}>
            <View style={styles.dataRow}>
              <Text style={styles.dataFieldLabel}>Edad</Text>
              <Text style={styles.dataFieldValue}>{edadMostrada}</Text>
            </View>
            <View style={styles.dataDivider} />

            <View style={styles.dataRow}>
              <Text style={styles.dataFieldLabel}>Sexo</Text>
              <Text style={styles.dataFieldValue}>{sexoMostrado}</Text>
            </View>
            <View style={styles.dataDivider} />

            <View style={styles.dataRow}>
              <Text style={styles.dataFieldLabel}>DNI</Text>
              <Text style={styles.dataFieldValue}>{dniEnmascarado}</Text>
            </View>
            <View style={styles.dataDivider} />

            <View style={styles.privacyNoteRow}>
              <Feather name="lock" size={13} color="#9ca3af" style={{ marginRight: 6 }} />
              <Text style={styles.privacyNoteText}>Vienen de tu DNI y no se pueden editar.</Text>
            </View>
          </View>
        </View>

        {/* 5. Sección: Ocupación o profesión (Añadir / Modificar / Eliminar) */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Ocupación o profesión</Text>
          
          {ocupacion ? (
            <View style={styles.professionCard}>
              <View style={styles.professionIconBox}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color="#b45309" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.professionTitle}>
                  {ocupacion.oficio}
                  {ocupacion.anios ? ` · ${ocupacion.anios} años` : ''}
                </Text>
                <Text style={styles.professionSubtitle}>Visible en el directorio de Servicios</Text>
              </View>

              <TouchableOpacity 
                onPress={abrirModalOcupacion}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.actionLinkText}>Editar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyProfessionCard}
              onPress={abrirModalOcupacion}
              activeOpacity={0.8}
            >
              <View style={styles.addProfessionIconBox}>
                <Feather name="plus" size={20} color="#144e40" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.professionTitle}>Añadir ocupación o profesión</Text>
                <Text style={styles.professionSubtitle}>
                  Ofrece tu oficio o especialidad a los vecinos de tu barrio
                </Text>
              </View>
              <Text style={styles.actionLinkText}>Añadir</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 6. Sección: Acceso y seguridad */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Acceso y seguridad</Text>
          
          <View style={styles.dataCard}>
            {/* Fila Celular */}
            <View style={styles.securityRow}>
              <View style={styles.securityLeft}>
                <Feather name="smartphone" size={20} color="#374151" style={{ marginRight: 12 }} />
                <View>
                  <Text style={styles.securityLabel}>Celular</Text>
                  <Text style={styles.securityValue}>{celularMostrado}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleCambiarCelular} activeOpacity={0.7}>
                <Text style={styles.actionLinkText}>Cambiar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dataDivider} />

            {/* Fila Correo */}
            <View style={styles.securityRow}>
              <View style={styles.securityLeft}>
                <Feather name="mail" size={20} color="#374151" style={{ marginRight: 12 }} />
                <View>
                  <Text style={styles.securityLabel}>Correo</Text>
                  <Text style={styles.securityValue}>{correo}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleAgregarCorreo} activeOpacity={0.7}>
                <Text style={styles.actionLinkText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {onNavigateRestablecer && (
            <TouchableOpacity 
              onPress={onNavigateRestablecer}
              activeOpacity={0.7}
              style={{ paddingHorizontal: 4 }}
            >
              <Text style={styles.restablecerLink}>
                ¿Ya no tienes acceso a ninguno? Restablece con tu DNI
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 7. Sección: Mi zona */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Mi zona</Text>
          
          <View style={styles.zoneCard}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Feather name="map-pin" size={16} color="#144e40" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.zoneTitle}>{zonaMostrada}</Text>
                <Text style={styles.zoneSubtitle}>
                  Si te mudas, actualiza tu ubicación para cambiar de comunidad
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleActualizarZona} activeOpacity={0.7}>
              <Text style={styles.actionLinkText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 8. Botón de Cerrar Sesión */}
        {onLogout && (
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={() => setMostrarModalConfirmar(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Modal para Añadir / Modificar / Eliminar Ocupación o Profesión */}
      <Modal
        visible={modalOcupacionVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOcupacionVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModalCard}>
            <View style={styles.professionModalHeader}>
              <Text style={styles.confirmModalTitle}>
                {ocupacion ? 'Editar ocupación o profesión' : 'Añadir ocupación o profesión'}
              </Text>
              <TouchableOpacity onPress={() => setModalOcupacionVisible(false)}>
                <Feather name="x" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.professionModalSub}>
              Tus vecinos podrán encontrarte en el directorio de Servicios de tu barrio.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Profesión u oficio</Text>
              <TextInput
                style={styles.modalTextInput}
                value={formOficio}
                onChangeText={setFormOficio}
                placeholder="Ej. Electricidad, Gasfitería, Clases..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Años de experiencia</Text>
              <TextInput
                style={styles.modalTextInput}
                value={formAnios}
                onChangeText={setFormAnios}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="Ej. 8"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.confirmButtonsCol}>
              <TouchableOpacity
                style={styles.saveProfessionBtn}
                onPress={handleGuardarOcupacion}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmLogoutBtnText}>Guardar ocupación</Text>
              </TouchableOpacity>

              {ocupacion && (
                <TouchableOpacity
                  style={styles.deleteProfessionBtn}
                  onPress={handleEliminarOcupacion}
                  activeOpacity={0.8}
                >
                  <Feather name="trash-2" size={15} color="#b43b1d" />
                  <Text style={styles.deleteProfessionBtnText}>Eliminar ocupación</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.cancelLogoutBtn}
                onPress={() => setModalOcupacionVisible(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelLogoutBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación "¿Estás seguro de que deseas cerrar sesión?" */}
      <Modal
        visible={mostrarModalConfirmar}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarModalConfirmar(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModalCard}>
            <View style={styles.confirmIconCircle}>
              <Feather name="log-out" size={26} color="#b43b1d" />
            </View>

            <Text style={styles.confirmModalTitle}>¿Estás seguro?</Text>
            <Text style={styles.confirmModalDesc}>
              Vas a cerrar tu sesión en DeBarrio. Para volver a ingresar necesitarás validar tu acceso nuevamente.
            </Text>

            <View style={styles.confirmButtonsCol}>
              <TouchableOpacity
                style={styles.confirmLogoutBtn}
                onPress={() => {
                  setMostrarModalConfirmar(false);
                  onLogout?.();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmLogoutBtnText}>Sí, cerrar sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelLogoutBtn}
                onPress={() => setMostrarModalConfirmar(false)}
                activeOpacity={0.75}
              >
                <Text style={styles.cancelLogoutBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 12,
    gap: 18,
    paddingBottom: 95,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  verifiedDniPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#e6f2ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedDniPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#144e40',
  },
  heroProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 14,
  },
  heroAvatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dce6f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarInitials: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  heroInfoCol: {
    flex: 1,
  },
  heroFullName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 22,
  },
  heroNeighborhoodText: {
    fontSize: 12.5,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 17,
  },
  heroProfessionPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5e8c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  heroProfessionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350f',
  },
  heroAddProfessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#e6f2ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  heroAddProfessionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#144e40',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 15,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  dataCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  dataFieldLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  dataFieldValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.5,
  },
  dataDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  privacyNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  privacyNoteText: {
    fontSize: 11.5,
    color: '#6b7280',
    fontWeight: '500',
  },
  professionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  emptyProfessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#144e40',
    gap: 12,
  },
  professionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addProfessionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#e6f2ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  professionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  securityValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 1,
  },
  actionLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#144e40',
  },
  restablecerLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#144e40',
    lineHeight: 18,
  },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  zoneTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  zoneSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 16,
  },
  logoutBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9e3218',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebe6dc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  professionModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  professionModalSub: {
    width: '100%',
    fontSize: 12.5,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  modalTextInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  saveProfessionBtn: {
    backgroundColor: '#144e40',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteProfessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 18,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteProfessionBtnText: {
    color: '#b43b1d',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f9ebe6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  confirmModalDesc: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
  },
  confirmButtonsCol: {
    width: '100%',
    gap: 10,
    marginTop: 4,
  },
  confirmLogoutBtn: {
    backgroundColor: '#b43b1d',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLogoutBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelLogoutBtn: {
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLogoutBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
});
