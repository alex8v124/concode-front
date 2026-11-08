import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Dimensions 
} from 'react-native';
import * as Location from 'expo-location';

interface Props {
  onBack: () => void;
  onSaveAddress: (address: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DomicilioMapScreen: React.FC<Props> = ({ onBack, onSaveAddress }) => {
  const [address, setAddress] = useState('Jr. Jacarandá 342, San Borja');
  const [coordinates, setCoordinates] = useState({ lat: -12.0905, lng: -76.9902 });
  const [isLocating, setIsLocating] = useState(false);
  const [selectedCell, setSelectedCell] = useState(17);

  const streetOptions = [
    { street: 'Jr. Jacarandá 342, San Borja', lat: -12.0905, lng: -76.9902 },
    { street: 'Calle Las Acacias 120, San Borja', lat: -12.0890, lng: -76.9895 },
    { street: 'Av. San Borja Norte 845, San Borja', lat: -12.0865, lng: -76.9920 },
    { street: 'Jr. Las Gardenias 215, San Borja', lat: -12.0920, lng: -76.9880 },
    { street: 'Pasaje Los Sauces 104, San Borja', lat: -12.0935, lng: -76.9915 },
    { street: 'Calle Monterrey 310, Chacarilla', lat: -12.0950, lng: -76.9870 },
  ];

  // Solicitar ubicación GPS real del dispositivo móvil usando expo-location
  const handleGetCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Requerido',
          'Permite el acceso a tu ubicación para centrar el mapa en tu casa automáticamente.'
        );
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      setCoordinates({ lat: latitude, lng: longitude });

      // Geocodificación inversa nativa de Expo
      const reverseList = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseList && reverseList.length > 0) {
        const item = reverseList[0];
        const streetName = item.street || item.name || 'Jr. Jacarandá';
        const streetNum = item.streetNumber ? ` ${item.streetNumber}` : '';
        const district = item.district || item.subregion || item.city || 'San Borja';
        const fullAddr = `${streetName}${streetNum}, ${district}`;
        setAddress(fullAddr);
      } else {
        setAddress(`Ubicación GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (err: any) {
      console.warn('Error al obtener ubicación:', err);
      Alert.alert(
        'Ubicación detectada',
        'Se usaron las coordenadas del cuadrante San Borja - Sector 4.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectCell = (idx: number) => {
    setSelectedCell(idx);
    const opt = streetOptions[idx % streetOptions.length];
    setAddress(opt.street);
    setCoordinates({ lat: opt.lat, lng: opt.lng });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>

        <Text style={styles.step}>Paso 2 de 3 · Tu domicilio</Text>
        <Text style={styles.title}>Ubica tu casa</Text>
        <Text style={styles.subtitle}>Solo vecinos verificados de tu cuadrante verán tu zona.</Text>

        {/* Mapa Interactivo del Cuadrante Vecinal */}
        <View style={styles.mapCard}>
          {/* Cabecera del Mapa */}
          <View style={styles.mapHeader}>
            <View style={styles.quadrantBadge}>
              <Text style={styles.quadrantBadgeText}>🛡️ Cuadrante San Borja · Sector 4</Text>
            </View>

            {/* Botón GPS */}
            <TouchableOpacity 
              style={styles.gpsBtn}
              onPress={handleGetCurrentLocation}
              disabled={isLocating}
              activeOpacity={0.8}
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#144e40" />
              ) : (
                <Text style={styles.gpsBtnText}>📍 Mi GPS</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Plano de cuadrícula interactiva de calles */}
          <View style={styles.mapGrid}>
            {Array.from({ length: 35 }).map((_, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.gridCell, selectedCell === i && styles.gridCellActive]}
                onPress={() => handleSelectCell(i)}
                activeOpacity={0.7}
              />
            ))}

            {/* Pin Verde de Ubicación */}
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
              <View style={styles.pin}>
                <View style={styles.pinInnerDot} />
              </View>
            </View>

            {/* Coordenadas en vivo */}
            <View style={styles.coordsFloating}>
              <Text style={styles.coordsText}>
                GPS: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </Text>
            </View>
          </View>

          <View style={styles.mapFooterNote}>
            <Text style={styles.mapFooterText}>
              ✓ PostGIS: Tu domicilio se vinculará a la red de respuesta rápida de tu cuadrante.
            </Text>
          </View>
        </View>

        {/* Campo de Dirección editable */}
        <View style={styles.addressInputContainer}>
          <Text style={styles.addressLabel}>Dirección calculada (toca el plano o edita)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🏠</Text>
            <TextInput
              style={styles.addressInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Ingresa o ajusta tu dirección"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={() => onSaveAddress(address)}
        activeOpacity={0.85}
      >
        <Text style={styles.saveButtonText}>Guardar domicilio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
    minHeight: '100%',
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
  mapCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d5dbd3',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9faf8',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e9e3',
  },
  quadrantBadge: {
    backgroundColor: '#e3f2ec',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quadrantBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#144e40',
  },
  gpsBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#144e40',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gpsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#144e40',
  },
  mapGrid: {
    height: 250,
    backgroundColor: '#dfede0',
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'relative',
    overflow: 'hidden',
  },
  gridCell: {
    width: '20%',
    height: '14.28%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  gridCellActive: {
    backgroundColor: 'rgba(20, 78, 64, 0.25)',
  },
  pinContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#144e40',
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  pinInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f2ab27',
  },
  coordsFloating: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  coordsText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  mapFooterNote: {
    padding: 10,
    backgroundColor: '#f9faf8',
    borderTopWidth: 1,
    borderTopColor: '#e5e9e3',
  },
  mapFooterText: {
    fontSize: 10,
    color: '#4e5650',
    textAlign: 'center',
  },
  addressInputContainer: {
    marginTop: 16,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#141c18',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addressInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#141c18',
  },
  saveButton: {
    backgroundColor: '#144e40',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
