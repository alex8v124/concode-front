import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';

interface Props {
  userData: {
    firstName: string;
    lastName: string;
    quadrant: string;
  };
  onLogout: () => void;
}

export const BarrioHomeScreen: React.FC<Props> = ({ userData, onLogout }) => {
  const [panicSent, setPanicSent] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image 
            source={require('../../assets/app-icon.png')} 
            style={styles.headerLogo} 
            resizeMode="contain" 
          />
          <View>
            <Text style={styles.quadrantTag}>{userData.quadrant || 'San Borja - Sector 4'}</Text>
            <Text style={styles.greeting}>Hola, {userData.firstName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.panicCard}>
        <Text style={styles.panicTitle}>ALERTA DE EMERGENCIA VECINAL</Text>
        <TouchableOpacity 
          style={[styles.panicBtn, panicSent && styles.panicBtnSent]}
          onPress={() => setPanicSent(!panicSent)}
          activeOpacity={0.8}
        >
          <Text style={styles.panicBtnText}>{panicSent ? '¡EMITIDA!' : 'SOS'}</Text>
        </TouchableOpacity>
        <Text style={styles.panicHelper}>
          {panicSent ? 'Alerta enviada a tu manzana y cuadrante.' : 'Presiona para alertar a tus vecinos cercanos.'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Alertas en tu zona</Text>
        <View style={styles.alertItem}>
          <Text style={styles.alertType}>SOSPECHA</Text>
          <Text style={styles.alertName}>Vehículo sospechoso sin placa</Text>
          <Text style={styles.alertDesc}>Auto polarizado en esquina Jacarandá con Las Acacias.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f8f4',
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  quadrantTag: {
    fontSize: 11,
    color: '#165a4c',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a2320',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  panicCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginBottom: 20,
  },
  panicTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#dc2626',
    letterSpacing: 1,
    marginBottom: 12,
  },
  panicBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  panicBtnSent: {
    backgroundColor: '#16a34a',
  },
  panicBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  panicHelper: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a2320',
    marginBottom: 12,
  },
  alertItem: {
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
  },
  alertType: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
  },
  alertName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a2320',
    marginTop: 2,
  },
  alertDesc: {
    fontSize: 11,
    color: '#4b554e',
    marginTop: 2,
  },
});
