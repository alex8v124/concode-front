import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Image,
  LayoutChangeEvent,
  GestureResponderEvent
} from 'react-native';
import * as Location from 'expo-location';
import { mobileApiService } from '../services/api';

interface Props {
  onBack: () => void;
  onSaveAddress: (address: string) => void;
}

const TILE_SIZE = 256;
const DEFAULT_ZOOM = 17;

// Componente de Tesela de Mapa con respaldo automático contra pantallas grises
const MapTileImage: React.FC<{
  tileKey: string;
  tileX: number;
  tileY: number;
  zoom: number;
  col: number;
  row: number;
  mapType: 'm' | 'y';
}> = ({ tileX, tileY, zoom, col, row, mapType }) => {
  const [useFallback, setUseFallback] = useState(false);

  // Primario: Google Maps
  const googleUri = mapType === 'y'
    ? `https://mt1.google.com/vt/lyrs=y&x=${tileX}&y=${tileY}&z=${zoom}`
    : `https://mt1.google.com/vt/lyrs=m&hl=es&x=${tileX}&y=${tileY}&z=${zoom}`;

  // Respaldo global ultra-rápido: CartoDB Voyager / ArcGIS Satellite (nunca falla en Perú)
  const fallbackUri = mapType === 'y'
    ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY}/${tileX}`
    : `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tileX}/${tileY}.png`;

  return (
    <Image
      source={{ uri: useFallback ? fallbackUri : googleUri }}
      onError={() => setUseFallback(true)}
      style={[
        styles.mapTile,
        { left: col * TILE_SIZE, top: row * TILE_SIZE }
      ]}
      resizeMode="cover"
    />
  );
};

export const DomicilioMapScreen: React.FC<Props> = ({ onBack, onSaveAddress }) => {
  const [address, setAddress] = useState('Detectando tu dirección...');
  const [quadrantName, setQuadrantName] = useState('Detectando cuadrante...');
  const [coordinates, setCoordinates] = useState({ lat: -12.0905, lng: -76.9902 });
  const [isLocating, setIsLocating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Controles de visualización tipo Google Maps
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [mapType, setMapType] = useState<'m' | 'y'>('m'); // 'm' = estándar, 'y' = satélite híbrido
  const [viewerSize, setViewerSize] = useState({ width: 340, height: 280 });

  // 1. Obtención Automática de la Ubicación GPS Actual al entrar a la pantalla
  const capturarUbicacionActual = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de Ubicación',
          'Activa la ubicación para detectar tu dirección exacta.'
        );
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const { latitude, longitude } = location.coords;
      setCoordinates({ lat: latitude, lng: longitude });

      let distritoDetectado = 'Lima';
      // Geocodificación inversa nativa (detecta calle y distrito real)
      try {
        const reverseList = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseList && reverseList.length > 0) {
          const item = reverseList[0];
          const streetName = item.street || item.name || 'Calle detectada';
          const streetNum = item.streetNumber ? ` ${item.streetNumber}` : '';
          distritoDetectado = item.district || item.subregion || item.city || 'Lima';
          setAddress(`${streetName}${streetNum}, ${distritoDetectado}`);
          setQuadrantName(`${distritoDetectado} · Sector 1`);
        }
      } catch (e) {
        console.warn('Error en reverse geocode nativo:', e);
      }

      // Sincronizar y validar con el Backend Spring Boot
      await resolverConBackend(latitude, longitude, distritoDetectado);

    } catch (err) {
      console.warn('Error capturando GPS:', err);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    capturarUbicacionActual();
  }, []);

  const resolverConBackend = async (lat: number, lng: number, distritoFallback: string = 'Lima') => {
    try {
      const res = await mobileApiService.resolverPin(lat, lng);
      if (res && res.nombre && res.nombre !== 'San Borja · Sector 4') {
        if (res.direccion) setAddress(res.direccion);
        setQuadrantName(res.nombre);
        return;
      }
    } catch (e) {
      console.warn('Error resolviendo cuadrante:', e);
    }
    // Si está fuera de los cuadrantes demo o en otra zona de Lima:
    setQuadrantName(`${distritoFallback} · Sector 1`);
  };

  // Ajuste táctil en el mapa si el GPS del celular tuvo unos metros de desfase
  const handleMapTap = async (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - viewerSize.width / 2;
    const dy = locationY - viewerSize.height / 2;

    const newTileX = exactTileX + dx / TILE_SIZE;
    const newTileY = exactTileY + dy / TILE_SIZE;

    const newLng = (newTileX / n) * 360 - 180;
    const latRadNew = Math.atan(Math.sinh(Math.PI * (1 - 2 * (newTileY / n))));
    const newLat = (latRadNew * 180) / Math.PI;

    setCoordinates({ lat: newLat, lng: newLng });

    try {
      const rev = await Location.reverseGeocodeAsync({ latitude: newLat, longitude: newLng });
      if (rev && rev[0]) {
        const item = rev[0];
        const streetName = item.street || item.name || 'Calle detectada';
        const streetNum = item.streetNumber ? ` ${item.streetNumber}` : '';
        const dist = item.district || item.subregion || item.city || 'Lima';
        setAddress(`${streetName}${streetNum}, ${dist}`);
        setQuadrantName(`${dist} · Sector 1`);
      }
    } catch (err) {
      console.warn('Error geocodificando toque:', err);
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

  // Cálculo de teselas Web Mercator para centrar el mapa exactamente en las coordenadas GPS
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

        {/* Tarjeta del Mapa */}
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

          {/* Visor interactivo con Tiles de Mapa */}
          <View 
            style={styles.mapViewerContainer} 
            onLayout={onViewerLayout}
            onStartShouldSetResponder={() => true}
            onResponderRelease={handleMapTap}
          >
            
            {/* Contenedor de Teselas */}
            <View 
              style={[
                styles.tilesCanvas, 
                { left: containerLeft, top: containerTop }
              ]} 
              pointerEvents="none"
            >
              {gridTiles.map(tile => (
                <MapTileImage
                  key={tile.key}
                  tileKey={tile.key}
                  tileX={tile.x}
                  tileY={tile.y}
                  zoom={zoom}
                  col={tile.col}
                  row={tile.row}
                  mapType={mapType}
                />
              ))}
            </View>

            {/* Pin centrado en el punto exacto */}
            <View style={styles.pinAnchor} pointerEvents="none">
              {/* Halo azul de precisión GPS */}
              <View style={styles.gpsPulseRing} />
              <View style={styles.gpsPulseCore} />

              {/* Pin Rojo Oficial */}
              <View style={styles.googlePinTeardrop}>
                <View style={styles.googlePinInnerDot} />
              </View>
              <View style={styles.googlePinShadow} />

              {/* Etiqueta flotante */}
              <View style={styles.pinTooltip}>
                <Text style={styles.pinTooltipText}>Tu casa aquí</Text>
              </View>
            </View>

            {/* Botón de Re-centrar GPS */}
            <TouchableOpacity 
              style={styles.gpsRecentBtn}
              onPress={capturarUbicacionActual}
              activeOpacity={0.85}
            >
              <Text style={styles.gpsRecentText}>🎯 GPS Actual</Text>
            </TouchableOpacity>

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

            {/* Logo en la esquina inferior izquierda */}
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
                🛡️ Ubicación fijada por GPS. Si necesitas corregir unos metros, puedes tocar sobre el mapa para fijar la puerta exacta de tu casa.
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
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
    backgroundColor: '#f7f8f4',
    minHeight: '100%',
    justifyContent: 'space-between',
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    color: '#144e40',
    fontSize: 16,
    fontWeight: '700',
  },
  step: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  title: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  mapCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quadrantBadge: {
    backgroundColor: '#d6eee2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quadrantBadgeText: {
    color: '#144e40',
    fontSize: 12,
    fontWeight: '800',
  },
  lockBadge: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  mapViewerContainer: {
    height: 280,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tilesCanvas: {
    position: 'absolute',
    width: TILE_SIZE * 3,
    height: TILE_SIZE * 3,
  },
  mapTile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#e5e7eb',
  },
  pinAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    zIndex: 10,
  },
  gpsPulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(66, 133, 244, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(66, 133, 244, 0.6)',
  },
  gpsPulseCore: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285f4',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  googlePinTeardrop: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ea4335',
    borderBottomRightRadius: 2,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
    marginBottom: 24,
  },
  googlePinInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  googlePinShadow: {
    position: 'absolute',
    bottom: 12,
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  pinTooltip: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  pinTooltipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  gpsRecentBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  gpsRecentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#144e40',
  },
  mapTypeToggle: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  mapTypeToggleIcon: {
    fontSize: 12,
  },
  mapTypeToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  zoomBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  googleLogoContainer: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  googleLogoG: { fontSize: 13, fontWeight: '800', color: '#4285f4' },
  googleLogoO1: { fontSize: 13, fontWeight: '800', color: '#ea4335' },
  googleLogoO2: { fontSize: 13, fontWeight: '800', color: '#fbbc05' },
  googleLogoG2: { fontSize: 13, fontWeight: '800', color: '#4285f4' },
  googleLogoL: { fontSize: 13, fontWeight: '800', color: '#34a853' },
  googleLogoE: { fontSize: 13, fontWeight: '800', color: '#ea4335' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '800',
    color: '#144e40',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  addressCard: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPin: {
    fontSize: 18,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10b981',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  addressValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  quadrantInfo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 2,
  },
  coordsInfo: {
    fontSize: 11,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  securityWarning: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  securityWarningText: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
  },
  footer: {
    marginTop: 20,
    gap: 12,
  },
  acceptBtn: {
    backgroundColor: '#144e40',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#144e40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  acceptBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '700',
  },
});
