import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';

interface Props {
  onBack: () => void;
  onSaveAddress: (address: string) => void;
}

export const DomicilioMapScreen: React.FC<Props> = ({ onBack, onSaveAddress }) => {
  const [address, setAddress] = useState('Jr. Jacarandá 342, San Borja');
  const [selectedCell, setSelectedCell] = useState(17);

  const streetOptions = [
    'Jr. Jacarandá 342, San Borja',
    'Calle Las Acacias 120, San Borja',
    'Av. San Borja Norte 845, San Borja',
    'Jr. Las Gardenias 215, San Borja',
  ];

  const handleSelectCell = (idx: number) => {
    setSelectedCell(idx);
    setAddress(streetOptions[idx % streetOptions.length]);
  };

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>

        <Text style={styles.step}>Paso 2 de 3 · Tu domicilio</Text>
        <Text style={styles.title}>Ubica tu casa</Text>
        <Text style={styles.subtitle}>Solo vecinos verificados de tu cuadrante verán tu zona.</Text>

        {/* Cuadrícula Comunal de Calles (Figma 4 · Domicilio en...) */}
        <View style={styles.mapGrid}>
          {Array.from({ length: 35 }).map((_, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.gridCell, selectedCell === i && styles.gridCellActive]}
              onPress={() => handleSelectCell(i)}
              activeOpacity={0.7}
            />
          ))}
          <View 
            style={[
              styles.pinContainer, 
              { 
                left: `${(selectedCell % 5) * 20 + 7}%`, 
                top: `${Math.floor(selectedCell / 5) * 14.28 + 2}%` 
              }
            ]} 
            pointerEvents="none"
          >
            <View style={styles.pin} />
          </View>
        </View>

        <View style={styles.addressInputContainer}>
          <Text style={styles.addressLabel}>Arrastra el pin hasta tu casa</Text>
          <TextInput
            style={styles.addressInput}
            value={address}
            onChangeText={setAddress}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={() => onSaveAddress(address)}
        activeOpacity={0.85}
      >
        <Text style={styles.saveButtonText}>Guardar domicilio</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
    backgroundColor: '#f6f8f5',
  },
  backButton: {
    paddingVertical: 4,
    marginBottom: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#144e40',
  },
  step: {
    fontSize: 12,
    fontWeight: '500',
    color: '#717b73',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#141c18',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#4e5650',
    marginBottom: 16,
  },
  mapGrid: {
    height: 280,
    backgroundColor: '#dfede0',
    borderRadius: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbdcd0',
  },
  gridCell: {
    width: '20%',
    height: '14.28%',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  gridCellActive: {
    backgroundColor: 'rgba(20, 78, 64, 0.15)',
  },
  pinContainer: {
    position: 'absolute',
  },
  pin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#144e40',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressInputContainer: {
    marginTop: 16,
  },
  addressLabel: {
    fontSize: 11,
    color: '#717b73',
    marginBottom: 4,
  },
  addressInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#141c18',
  },
  saveButton: {
    backgroundColor: '#144e40',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
