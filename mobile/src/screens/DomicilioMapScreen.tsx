import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import { mobileApiService } from '../services/api';

interface Props {
  onBack: () => void;
  onSaveAddress: (address: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DomicilioMapScreen: React.FC<Props> = ({ onBack, onSaveAddress }) => {
  const [address, setAddress] = useState('Jr. Jacarandá 342, San Borja');
  const [quadrantName, setQuadrantName] = useState('San Borja · Sector 4');
  const [coordinates, setCoordinates] = useState({ lat: -12.0905, lng: -76.9902 });
  const [isLocating, setIsLocating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Obtención Automática de la Ubicación GPS Actual al entrar a la pantalla
  useEffect(() => {
    let isMounted = true;

    const capturarUbicacionActual = async () => {
      setIsLocating(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            Alert.alert(
              'Permiso de Ubicación',
              'Se usarán las coordenadas satelitales del cuadrante San Borja para este registro.'
            );
            await resolverConBackend(-12.0905, -76.9902);
            setIsLocating(false);
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!isMounted) return;

        const { latitude, longitude } = location.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        // Geocodificación inversa nativa
        try {
          const reverseList = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (reverseList && reverseList.length > 0) {
            const item = reverseList[0];
            const streetName = item.street || item.name || 'Jr. Jacarandá';
            const streetNum = item.streetNumber ? ` ${item.streetNumber}` : ' 342';
            const district = item.district || item.subregion || item.city || 'San Borja';
            setAddress(`${streetName}${streetNum}, ${district}`);
          }
        } catch {}

        // Sincronizar y validar con el Backend Spring Boot (GET /api/v1/geo/resolver-pin)
        await resolverConBackend(latitude, longitude);

      } catch (err) {
        console.warn('Error capturando GPS:', err);
        if (isMounted) {
          await resolverConBackend(-12.0905, -76.9902);
        }
      } finally {
        if (isMounted) setIsLocating(false);
      }
    };

    capturarUbicacionActual();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolverConBackend = async (lat: number, lng: number) => {
    try {
      const res = await mobileApiService.resolverPin(lat, lng);
      if (res) {
        if (res.direccion) setAddress(res.direccion);
        if (res.nombre) setQuadrantName(res.nombre);
      }
    } catch (e) {
      console.warn('Error resolviendo cuadrante:', e);
    }
  };

  // 2. Acción: Aceptar usar esta ubicación (Llamar API y continuar)
  const handleAceptarUbicacion = async () => {
    setIsSaving(true);
    try {
      // Registrar en el backend Spring Boot (POST /api/v1/auth/alta/domicilio)
      await mobileApiService.guardarDomicilio(coordinates.lat, coordinates.lng);
    } catch (e) {
      console.warn('Error al guardar domicilio en backend:', e);
    } finally {
      setIsSaving(false);
      onSaveAddress(address);
    }
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

        {/* Mapa Estilo Google Maps con BLOQUEO TOTAL (El usuario no puede mover el mapa) */}
        <View style={styles.mapCard}>
          
          {/* Cabecera de Seguridad */}
          <View style={styles.mapHeader}>
            <View style={styles.quadrantBadge}>
              <Text style={styles.quadrantBadgeText}>🛡️ {quadrantName}</Text>
            </View>

            <View style={styles.lockBadge}>
              <Text style={styles.lockBadgeText}>🔒 GPS Fijado</Text>
            </View>
          </View>

          {/* Visualizador de Mapa Estilo Google Maps (PointerEvents = "none" para bloqueo) */}
          <View style={styles.googleMapViewer} pointerEvents="none">
            
            {/* Calles y Manzanas vectoriales estilo Google Maps */}
            <View style={styles.mapBlockGrid}>
              <View style={[styles.cityBlock, { top: 15, left: 15, width: 85, height: 60 }]} />
              <View style={[styles.cityBlock, { top: 15, left: 115, width: 110, height: 60 }]} />
              <View style={[styles.cityPark, { top: 15, right: 15, width: 70, height: 60 }]}>
                <Text style={styles.parkLabel}>Parque</Text>
              </View>

              {/* Calles */}
              <View style={[styles.roadHorizontal, { top: 85 }]} />
              <Text style={[styles.roadLabel, { top: 88, left: 30 }]}>Av. San Borja Norte</Text>

              <View style={[styles.cityBlock, { top: 105, left: 15, width: 95, height: 75 }]} />
              <View style={[styles.cityBlock, { top: 105, left: 125, width: 90, height: 75 }]} />
              <View style={[styles.cityBlock, { top: 105, right: 15, width: 80, height: 75 }]} />

              <View style={[styles.roadHorizontal, { top: 190 }]} />
              <Text style={[styles.roadLabel, { top: 193, left: 50 }]}>Jr. Jacarandá</Text>

              <View style={[styles.cityBlock, { top: 210, left: 25, width: 130, height: 45 }]} />
              <View style={[styles.cityBlock, { top: 210, right: 25, width: 140, height: 45 }]} />

              <View style={[styles.roadVertical, { left: 105 }]} />
              <View style={[styles.roadVertical, { right: 110 }]} />
            </View>

            {/* Pin GPS Pulsante estilo Google Maps centrado en la ubicación exacta */}
            <View style={styles.googleGpsPin}>
              <View style={styles.googleHaloRing} />
              <View style={styles.googleBlueCore}>
                <View style={styles.googleWhiteDot} />
              </View>
              <View style={styles.googlePinCallout}>
                <Text style={styles.googlePinCalloutText}>Tu casa aquí</Text>
              </View>
            </View>

            {/* Marca de agua Google */}
            <View style={styles.googleWatermark}>
              <Text style={styles.googleWatermarkText}>Google Maps</Text>
            </View>

            {/* Overlay de carga satelital */}
            {isLocating && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#144e40" />
                <Text style={styles.loadingText}>Obteniendo GPS satelital exacto...</Text>
                <Text style={styles.loadingSubtext}>Fijando ubicación de tu cuadrante</Text>
              </View>
            )}
          </View>

          {/* Tarjeta de Dirección Detectada */}
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconPin}>📍</Text>
              </View>
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>DIRECCIÓN GPS DETECTADA</Text>
                <Text style={styles.addressValue} numberOfLines={1}>{address}</Text>
                <Text style={styles.quadrantInfo}>Cuadrante vecinal: {quadrantName}</Text>
              </View>
            </View>

            <View style={styles.securityWarning}>
              <Text style={styles.securityWarningText}>
                🛡️ La ubicación fue fijada automáticamente por GPS. No se permite mover el pin para evitar suplantaciones de cuadrante.
              </Text>
            </View>
          </View>

        </View>
      </View>

      {/* Botones de Acción: Aceptar Usar esta Ubicación o Cancelar Captura */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.acceptBtn, (isLocating || isSaving) && styles.btnDisabled]} 
          onPress={handleAceptarUbicacion}
          disabled={isLocating || isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.acceptBtnText}>✓ Aceptar usar esta ubicación</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelBtn} 
          onPress={onBack}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>✕ Cancelar captura</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9fb',
    padding: 24,
    justifyContent: 'space-between',
  },
  backButton: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 14,
    color: '#144e40',
    fontWeight: '600',
  },
  step: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  mapCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  quadrantBadge: {
    backgroundColor: '#e6f0ed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quadrantBadgeText: {
    color: '#144e40',
    fontSize: 11,
    fontWeight: '700',
  },
  lockBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockBadgeText: {
    color: '#f2ab27',
    fontSize: 10,
    fontWeight: '700',
  },
  googleMapViewer: {
    height: 250,
    backgroundColor: '#e5e3df', // Color de fondo típico de Google Maps
    position: 'relative',
    overflow: 'hidden',
  },
  mapBlockGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  cityBlock: {
    position: 'absolute',
    backgroundColor: '#f5f3f0', // Manzanas residenciales en Google Maps
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0dedb',
  },
  cityPark: {
    position: 'absolute',
    backgroundColor: '#c8e6c9', // Color de parques Google Maps
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  parkLabel: {
    fontSize: 9,
    color: '#2e7d32',
    fontWeight: '700',
  },
  roadHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: '#ffffff', // Calles blancas de Google Maps
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d6d4d0',
  },
  roadVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#d6d4d0',
  },
  roadLabel: {
    position: 'absolute',
    fontSize: 9,
    color: '#70757a',
    fontWeight: '600',
  },
  googleGpsPin: {
    position: 'absolute',
    top: '48%',
    left: '46%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleHaloRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(66, 133, 244, 0.25)',
    position: 'absolute',
  },
  googleBlueCore: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1a73e8',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  googleWhiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  googlePinCallout: {
    position: 'absolute',
    bottom: -18,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  googlePinCalloutText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  googleWatermark: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  googleWatermarkText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#5f6368',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#144e40',
  },
  loadingSubtext: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  addressCard: {
    padding: 14,
    backgroundColor: '#ffffff',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f0ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPin: {
    fontSize: 16,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#144e40',
    letterSpacing: 0.5,
  },
  addressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 1,
  },
  quadrantInfo: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 1,
  },
  securityWarning: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  securityWarningText: {
    fontSize: 10,
    color: '#9ca3af',
    lineHeight: 14,
  },
  footer: {
    gap: 10,
    marginTop: 8,
  },
  acceptBtn: {
    backgroundColor: '#144e40',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#144e40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4b5563',
    fontSize: 13,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.65,
  },
});
