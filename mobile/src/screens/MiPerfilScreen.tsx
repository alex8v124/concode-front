import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

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

export const MiPerfilScreen: React.FC<Props> = ({ userData, onLogout, onNavigateRestablecer }) => {
  const dniEnmascarado = userData.dni && userData.dni.length >= 8 
    ? `• • • • ${userData.dni.slice(-4)}`
    : '• • • • 5678';
  const zonaMostrada = userData.quadrant || 'Urb. Los Pinos, Surco';
  const sexoMostrado = userData.gender === 'F' ? 'Femenino' : 'Masculino';
  const celularMostrado = userData.phone 
    ? `+51 ${userData.phone.slice(0, 3)} • • • ${userData.phone.slice(-3)}`
    : '+51 987 • • • 321';

  const [ocupacion, setOcupacion] = useState('Electricidad · 8 años');
  const [correo] = useState('No registrado');
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false);

  const handleEditarOcupacion = () => {
    Alert.prompt 
      ? Alert.prompt(
          'Actualizar Ocupación',
          'Ingresa tu oficio o profesión y años de experiencia:',
          (text) => { if (text) setOcupacion(text); },
          'plain-text',
          ocupacion
        )
      : Alert.alert('Ocupación', `Tu ocupación actual es "${ocupacion}". Visible para tus vecinos.`);
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
        
        {/* Sección: Datos de Identidad (DNI) */}
        <View style={styles.dataCard}>
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

        {/* Sección: Ocupación o profesión */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Ocupación o profesión</Text>
          
          <View style={styles.professionCard}>
            <View style={styles.professionIconBox}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="#b45309" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.professionTitle}>{ocupacion}</Text>
              <Text style={styles.professionSubtitle}>Visible en el directorio de Servicios</Text>
            </View>

            <TouchableOpacity 
              onPress={handleEditarOcupacion}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.actionLinkText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sección: Acceso y seguridad */}
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

          {/* Enlace Restablecer con DNI */}
          <TouchableOpacity 
            onPress={onNavigateRestablecer}
            activeOpacity={0.7}
            style={{ paddingHorizontal: 4 }}
          >
            <Text style={styles.restablecerLink}>
              ¿Ya no tienes acceso a ninguno? Restablece con tu DNI
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Mi zona */}
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

        {/* Botón de Cerrar Sesión */}
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
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    gap: 18,
    paddingBottom: 90,
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
  professionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fef3c7',
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
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebe6dc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  confirmModalDesc: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  confirmButtonsCol: {
    width: '100%',
    gap: 10,
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
