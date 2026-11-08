import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert
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
}

export const MiPerfilScreen: React.FC<Props> = ({ userData, onLogout }) => {
  const nombreMostrado = `${userData.firstName || 'Carlos Alberto'} ${userData.lastName || 'Mendoza Ríos'}`.trim();
  const iniciales = `${userData.firstName?.[0] || 'C'}${userData.lastName?.[0] || 'M'}`.toUpperCase();
  const dniEnmascarado = userData.dni && userData.dni.length >= 8 
    ? `•••• ${userData.dni.slice(-4)}`
    : '•••• 5678';
  const zonaMostrada = userData.quadrant || 'Urb. Los Pinos, Surco';
  const edadMostrada = userData.age ? `${userData.age} años` : '34 años';
  const sexoMostrado = userData.gender === 'F' ? 'Femenino' : 'Masculino';

  const [ocupacion, setOcupacion] = useState('Electricidad · 8 años');

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

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cabecera del Perfil */}
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Mi perfil</Text>
          <View style={styles.verifiedBadge}>
            <Feather name="check" size={14} color="#144e40" style={{ marginRight: 4 }} />
            <Text style={styles.verifiedBadgeText}>Verificado con DNI</Text>
          </View>
        </View>

        {/* Tarjeta de Identidad del Usuario */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{iniciales}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{nombreMostrado}</Text>
            <Text style={styles.userZone}>
              {zonaMostrada} · vecino desde marzo 2026
            </Text>
            <View style={styles.professionPill}>
              <Text style={styles.professionPillText}>Electricista</Text>
            </View>
          </View>
        </View>

        {/* Fila de Estadísticas Comunitarias */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>vistos buenos</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNum}>7</Text>
            <Text style={styles.statLabel}>favores hechos</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLabel}>publicaciones</Text>
          </View>
        </View>

        {/* Sección: Mis Datos */}
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
          </View>

          <View style={styles.privacyNoteRow}>
            <Feather name="lock" size={13} color="#6b7280" style={{ marginRight: 6 }} />
            <Text style={styles.privacyNoteText}>Vienen de tu DNI y no se pueden editar</Text>
          </View>
        </View>

        {/* Sección: Ocupación o profesión */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Ocupación o profesión</Text>
          
          <View style={styles.professionCard}>
            <View style={styles.professionIconBox}>
              <MaterialCommunityIcons name="lightning-bolt" size={22} color="#b45309" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.professionTitle}>{ocupacion}</Text>
              <Text style={styles.professionSubtitle}>Visible en el directorio de Servicios</Text>
            </View>

            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={handleEditarOcupacion}
              activeOpacity={0.7}
            >
              <Text style={styles.editBtnText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón de Cerrar Sesión */}
        {onLogout && (
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={16} color="#dc2626" style={{ marginRight: 6 }} />
            <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

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
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    gap: 18,
    paddingBottom: 90,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d6eee2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#144e40',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2b4290',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  userZone: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  professionPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffedd5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  professionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9a3412',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  dataCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dataFieldLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  dataFieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  dataDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  privacyNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    marginTop: 2,
  },
  privacyNoteText: {
    fontSize: 11,
    color: '#6b7280',
  },
  professionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  professionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  professionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#dc2626',
  },
});
