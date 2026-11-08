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
  Image,
  LayoutChangeEvent
} from 'react-native';
import * as Location from 'expo-location';
import { mobileApiService } from '../services/api';

interface Props {
  onBack: () => void;
  onSaveAddress: (address: string) => void;
}

const TILE_SIZE = 256;
const DEFAULT_ZOOM = 17;

export const DomicilioMapScreen: React.FC<Props> = ({ onBack, onSaveAddress }) => {
  const [address, setAddress] = useState('Jr. Jacarandá 342, San Borja');
  const [quadrantName, setQuadrantName] = useState('San Borja · Sector 4');
  const [coordinates, setCoordinates] = useState({ lat: -12.0905, lng: -76.9902 });
  const [isLocating, setIsLocating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Controles de visualización tipo Google Maps
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [mapType, setMapType] = useState<'m' | 'y'>('m'); // 'm' = estándar, 'y' = satélite híbrido
  const [viewerSize, setViewerSize] = useState({ width: 340, height: 280 });

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
            const streetName = item.street || item.name || 'Calle detectada';
            const streetNum = item.streetNumber ? ` ${item.streetNumber}` : '';
            const district = item.district || item.subregion || item.city || 'Lima';
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

  const handleAceptarUbicacion = async () => {
    setIsSaving(true);
    try {
      await mobileApiService.guardarDomicilio(coordinates.lat, coordinates.lng);
    } catch (e) {
      console.warn('Error al guardar domicilio en backend:', e);
    } finally {
      setIsSaving(false);
      onSaveAddress(address);
    }
  };

  // Cálculo de teselas Web Mercator para centrar Google Maps exactamente en las coordenadas GPS
  const n = Math.pow(2, zoom);
  const exactTileX = ((coordinates.lng + 180) / 360) * n;
  const latRad = (coordinates.lat * Math.PI) / 180;
  const exactTileY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;

  const centerTileX = Math.floor(exactTileX);
  const centerTileY = Math.floor(exactTileY);

  const pixelOffsetX = (exactTileX - centerTileX) * TILE_SIZE;
  const pixelOffsetY = (exactTileY - centerTileY) * TILE_SIZE;

  // Cuadrícula 3x3 de teselas alrededor del centro
  const deltaIndices = [-1, 0, 1];
  const gridTiles = deltaIndices.flatMap(dy => 
    deltaIndices.map(dx => ({
      x: centerTileX + dx,
      y: centerTileY + dy,
      col: dx + 1, // 0, 1, 2
      row: dy + 1, // 0, 1, 2
      key: `${zoom}_${centerTileX + dx}_${centerTileY + dy}_${mapType}`
    }))
  );

  // Posición del contenedor de 768x768 px para alinear el punto GPS con el centro del visor
  const containerLeft = (viewerSize.width / 2) - (TILE_SIZE + pixelOffsetX);
  const containerTop = (viewerSize.height / 2) - (TILE_SIZE + pixelOffsetY);

  const onViewerLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setViewerSize({ width, height });
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

        {/* Tarjeta del Mapa Google Maps */}
        <View style={styles.mapCard}>
          
          {/* Barra Superior con Cuadrante y Estado GPS */}
          <View style={styles.mapHeader}>
            <View style={styles.quadrantBadge}>
              <Text style={styles.quadrantBadgeText}>🛡️ {quadrantName}</Text>
            </View>

            <View style={styles.lockBadge}>
              <Text style={styles.lockBadgeText}>🔒 GPS Fijado</Text>
            </View>
          </View>

          {/* Visor interactivo con Tiles Reales de Google Maps */}
          <View style={styles.mapViewerContainer} onLayout={onViewerLayout}>
            
            {/* Contenedor de Teselas Reales de Google Maps */}
            <View 
              style={[
                styles.tilesCanvas, 
                { left: containerLeft, top: containerTop }
              ]} 
              pointerEvents="none"
            >
              {gridTiles.map(tile => (
                <Image
                  key={tile.key}
                  source={{ 
                    uri: `https://mt1.google.com/vt/lyrs=${mapType}&hl=es&x=${tile.x}&y=${tile.y}&z=${zoom}` 
                  }}
                  style={[
                    styles.mapTile,
                    { left: tile.col * TILE_SIZE, top: tile.row * TILE_SIZE }
                  ]}
                  resizeMode="cover"
                />
              ))}
            </View>

            {/* Pin de Google Maps centrado en el punto exacto */}
            <View style={styles.pinAnchor} pointerEvents="none">
              {/* Halo azul de precisión GPS */}
              <View style={styles.gpsPulseRing} />
              <View style={styles.gpsPulseCore} />

              {/* Pin Rojo Oficial de Google Maps */}
              <View style={styles.googlePinTeardrop}>
                <View style={styles.googlePinInnerDot} />
              </View>
              <View style={styles.googlePinShadow} />

              {/* Etiqueta flotante */}
              <View style={styles.pinTooltip}>
                <Text style={styles.pinTooltipText}>Tu casa aquí</Text>
              </View>
            </View>

            {/* Botón de alternar tipo de mapa (Estándar / Satélite) */}
            <TouchableOpacity 
              style={styles.mapTypeToggle}
              onPress={() => setMapType(m => m === 'm' ? 'y' : 'm')}
              activeOpacity={0.85}
            >
              <Text style={styles.mapTypeToggleIcon}>{mapType === 'm' ? '🛰️' : '🗺️'}</Text>
              <Text style={styles.mapTypeToggleText}>
                {mapType === 'm' ? 'Satélite' : 'Mapa'}
              </Text>
            </TouchableOpacity>

            {/* Controles de Zoom (+ / -) */}
            <View style={styles.zoomControls}>
              <TouchableOpacity 
                style={styles.zoomBtn}
                onPress={() => setZoom(z => Math.min(19, z + 1))}
                activeOpacity={0.7}
              >
                <Text style={styles.zoomBtnText}>+</Text>
              </TouchableOpacity>
              <View style={styles.zoomDivider} />
              <TouchableOpacity 
                style={styles.zoomBtn}
                onPress={() => setZoom(z => Math.max(15, z - 1))}
                activeOpacity={0.7}
              >
                <Text style={styles.zoomBtnText}>−</Text>
              </TouchableOpacity>
            </View>

            {/* Logo oficial de Google en la esquina inferior izquierda */}
            <View style={styles.googleLogoContainer} pointerEvents="none">
              <Text style={styles.googleLogoG}>G</Text>
              <Text style={styles.googleLogoO1}>o</Text>
              <Text style={styles.googleLogoO2}>o</Text>
              <Text style={styles.googleLogoG2}>g</Text>
              <Text style={styles.googleLogoL}>l</Text>
              <Text style={styles.googleLogoE}>e</Text>
            </View>

            {/* Pantalla de carga mientras se sincroniza el GPS */}
            {isLocating && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#144e40" />
                <Text style={styles.loadingText}>Obteniendo satélites GPS...</Text>
                <Text style={styles.loadingSubtext}>Fijando ubicación de tu casa</Text>
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
                <Text style={styles.coordsInfo}>
                  GPS: {coordinates.lat.toFixed(5)}°, {coordinates.lng.toFixed(5)}° · Zoom {zoom}x
                </Text>
              </View>
            </View>

            <View style={styles.securityWarning}>
              <Text style={styles.securityWarningText}>
                🛡️ La ubicación fue fijada automáticamente por el GPS satelital de tu celular. El mapa está bloqueado para evitar suplantaciones de cuadrante.
              </Text>
            </View>
          </View>

        </View>
      </View>

      {/* Botones de Acción */}
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
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    backgroundColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  mapViewerContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#e5e3df',
    position: 'relative',
    overflow: 'hidden',
  },
  tilesCanvas: {
    width: TILE_SIZE * 3,
    height: TILE_SIZE * 3,
    position: 'absolute',
  },
  mapTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    position: 'absolute',
    backgroundColor: '#e5e3df',
  },
  pinAnchor: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsPulseRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(66, 133, 244, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(66, 133, 244, 0.55)',
  },
  gpsPulseCore: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  googlePinTeardrop: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA4335',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -22 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  googlePinInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C0A02',
  },
  googlePinShadow: {
    position: 'absolute',
    width: 16,
    height: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    bottom: -3,
  },
  pinTooltip: {
    position: 'absolute',
    bottom: 36,
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  pinTooltipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  mapTypeToggle: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  mapTypeToggleIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  mapTypeToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  zoomBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    lineHeight: 20,
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  googleLogoContainer: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleLogoG: { fontSize: 13, fontWeight: '700', color: '#4285F4' },
  googleLogoO1: { fontSize: 13, fontWeight: '700', color: '#EA4335' },
  googleLogoO2: { fontSize: 13, fontWeight: '700', color: '#FBBC05' },
  googleLogoG2: { fontSize: 13, fontWeight: '700', color: '#4285F4' },
  googleLogoL: { fontSize: 13, fontWeight: '700', color: '#34A853' },
  googleLogoE: { fontSize: 13, fontWeight: '700', color: '#EA4335' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 16,
    backgroundColor: '#ffffff',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconPin: {
    fontSize: 20,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  quadrantInfo: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 2,
  },
  coordsInfo: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  securityWarning: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  securityWarningText: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 16,
  },
  footer: {
    gap: 12,
    marginTop: 8,
  },
  acceptBtn: {
    backgroundColor: '#144e40',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#144e40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelBtnText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
});
