import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
  onBack: () => void;
  onPedirPrestado?: () => void;
}

export const FavorDetalleScreen: React.FC<Props> = ({ onBack }) => {
  const [solicitado, setSolicitado] = useState(false);

  const handlePedir = () => {
    setSolicitado(true);
    Alert.alert(
      'Solicitud Enviada',
      'Le notificamos a Julio R. que deseas pedir prestado el taladro. Podrán coordinar por el chat vecinal.'
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favor</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Tarjeta Principal del Favor */}
        <View style={styles.favorCard}>
          <View style={styles.tagLine}>
            <View style={styles.prestoBadge}>
              <Text style={styles.prestoBadgeText}>Presto</Text>
            </View>
            <Text style={styles.distanceText}>150 m</Text>
          </View>

          <Text style={styles.title}>Presto taladro percutor con brocas</Text>
          
          <Text style={styles.description}>
            Para el fin de semana. Solo pido que lo devuelvas limpio.
          </Text>

          {/* Chips de Condiciones */}
          <View style={styles.conditionChips}>
            <View style={styles.conditionChip}>
              <Text style={styles.conditionChipText}>Disponible: fin de semana</Text>
            </View>
            <View style={styles.conditionChip}>
              <Text style={styles.conditionChipText}>Préstamo máximo: 3 días</Text>
            </View>
          </View>

          {/* Tarjeta del Dueño / Vecino */}
          <View style={styles.ownerRow}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>JR</Text>
            </View>
            <View style={styles.ownerDetails}>
              <Text style={styles.ownerName}>Julio R. · Mz. A</Text>
              <Text style={styles.ownerReputation}>Vecino verificado · 23 vistos buenos</Text>
            </View>
          </View>
        </View>

        {/* Nota Comunitaria */}
        <View style={styles.infoBox}>
          <Feather name="info" size={16} color="#144e40" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Al pedirlo prestado te comprometes a devolverlo en la fecha acordada. Julio podrá darte su visto bueno al recibirlo.
          </Text>
        </View>

      </ScrollView>

      {/* Botón Inferior Fijo: Pedir prestado */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.borrowBtn, solicitado && styles.borrowBtnSuccess]}
          onPress={handlePedir}
          activeOpacity={0.85}
        >
          <Text style={styles.borrowBtnText}>
            {solicitado ? '✓ Solicitud en curso' : 'Pedir prestado'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  favorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#edebe6',
  },
  tagLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  prestoBadge: {
    backgroundColor: '#e0ecff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  prestoBadgeText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  distanceText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 28,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  conditionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  conditionChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  conditionChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1f2937',
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  ownerReputation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e6f0ed',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    alignItems: 'flex-start',
    gap: 10,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#144e40',
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f2ee',
  },
  borrowBtn: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borrowBtnSuccess: {
    backgroundColor: '#059669',
  },
  borrowBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
