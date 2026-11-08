import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Dimensions,
  Image,
  LayoutChangeEvent 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

interface Props {
  userData: {
    firstName: string;
    lastName: string;
    quadrant?: string;
  };
  onSelectNeighbor?: (neighborId: string) => void;
}

interface NeighborPin {
  id: string;
  initials: string;
  name: string;
  trade: string;
  vouchCount: number;
  distance: string;
  walkingTime: string;
  lat: number;
  lng: number;
  category: 'servicios' | 'favores';
  tag: string;
}

const TILE_SIZE = 256;
const BASE_LAT = -12.0905;
const BASE_LNG = -76.9902;

const NEIGHBOR_PINS: NeighborPin[] = [
  {
    id: '1',
    initials: 'RQ',
    name: 'Rosa Quispe',
    trade: 'Gasfitería',
    vouchCount: 42,
    distance: '180 m',
    walkingTime: '2 min a pie',
    lat: -12.0892,
    lng: -76.9890,
    category: 'servicios',
    tag: 'Gasfitería',
  },
  {
    id: '2',
    initials: 'MH',
    name: 'Miguel Huamán',
    trade: 'Electricista domiciliario',
    vouchCount: 31,
    distance: '350 m',
    walkingTime: '4 min a pie',
    lat: -12.0920,
    lng: -76.9922,
    category: 'servicios',
    tag: 'Electricidad',
  },
  {
    id: '3',
    initials: 'LT',
    name: 'Lucía Torres',
    trade: 'Clases de matemática',
    vouchCount: 27,
    distance: '420 m',
    walkingTime: '5 min a pie',
    lat: -12.0918,
    lng: -76.9875,
    category: 'servicios',
    tag: 'Clases',
  },
  {
    id: '4',
    initials: 'JC',
    name: 'Jorge Córdova',
    trade: 'Cerrajería y carpintería',
    vouchCount: 19,
    distance: '600 m',
    walkingTime: '7 min a pie',
    lat: -12.0875,
    lng: -76.9935,
    category: 'servicios',
    tag: 'Todos',
  },
  {
    id: '5',
    initials: 'JR',
    name: 'Julio R. · Mz. A',
    trade: 'Presto taladro percutor',
    vouchCount: 23,
    distance: '150 m',
    walkingTime: '2 min a pie',
    lat: -12.0895,
    lng: -76.9915,
    category: 'favores',
    tag: 'Todos',
  },
  {
    id: '6',
    initials: 'TL',
    name: 'Teresa L.',
    trade: 'Presto escalera telescópica',
    vouchCount: 15,
    distance: '310 m',
    walkingTime: '4 min a pie',
    lat: -12.0910,
    lng: -76.9880,
    category: 'favores',
    tag: 'Todos',
  },
];

const FILTER_TAGS = ['Todos', 'Gasfitería', 'Electricidad', 'Clases'];

export const BarrioMapaScreen: React.FC<Props> = ({ userData }) => {
  const [category, setCategory] = useState<'servicios' | 'favores'>('servicios');
  const [selectedTag, setSelectedTag] = useState('Todos');
  const [selectedNeighbor, setSelectedNeighbor] = useState<NeighborPin>(NEIGHBOR_PINS[0]);
  const [search, setSearch] = useState('');
  
  // Controles de Mapa Google Maps
  const [zoom, setZoom] = useState(16);
  const [mapType, setMapType] = useState<'m' | 'y'>('m'); // 'm' = estándar, 'y' = satélite
  const [canvasSize, setCanvasSize] = useState({ 
    width: Dimensions.get('window').width, 
    height: Dimensions.get('window').height - 120 
  });

  const filteredPins = NEIGHBOR_PINS.filter(pin => {
    const matchCat = pin.category === category;
    const matchTag = selectedTag === 'Todos' || pin.tag === selectedTag;
    const matchSearch = search.trim() === '' || 
      pin.name.toLowerCase().includes(search.toLowerCase()) ||
      pin.trade.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchTag && matchSearch;
  });

  const onCanvasLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCanvasSize({ width, height });
    }
  };

  // Cálculo de coordenadas Web Mercator de Google Maps
  const n = Math.pow(2, zoom);
  const exactTileX = ((BASE_LNG + 180) / 360) * n;
  const latRad = (BASE_LAT * Math.PI) / 180;
  const exactTileY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;

  const centerTileX = Math.floor(exactTileX);
  const centerTileY = Math.floor(exactTileY);

  const pixelOffsetX = (exactTileX - centerTileX) * TILE_SIZE;
  const pixelOffsetY = (exactTileY - centerTileY) * TILE_SIZE;

  // Cuadrícula 4x4 de teselas Google Maps
  const deltaIndices = [-2, -1, 0, 1, 2];
  const gridTiles = deltaIndices.flatMap(dy => 
    deltaIndices.map(dx => ({
      x: centerTileX + dx,
      y: centerTileY + dy,
      col: dx + 2,
      row: dy + 2,
      key: `${zoom}_${centerTileX + dx}_${centerTileY + dy}_${mapType}`
    }))
  );

  const containerLeft = (canvasSize.width / 2) - (TILE_SIZE * 2 + pixelOffsetX);
  const containerTop = (canvasSize.height / 2) - (TILE_SIZE * 2 + pixelOffsetY);

  // Proyección de pines a píxeles exactos en pantalla
  const getPinPixelPosition = (lat: number, lng: number) => {
    const pinTileX = ((lng + 180) / 360) * n;
    const pLatRad = (lat * Math.PI) / 180;
    const pinTileY = ((1 - Math.log(Math.tan(pLatRad) + 1 / Math.cos(pLatRad)) / Math.PI) / 2) * n;

    const x = (pinTileX - exactTileX) * TILE_SIZE + canvasSize.width / 2;
    const y = (pinTileY - exactTileY) * TILE_SIZE + canvasSize.height / 2;
    return { x, y };
  };

  // Radio de 1 km en píxeles (a latitud ~ -12 deg)
  const metersPerPixel = (156543.03392 * Math.cos(latRad)) / n;
  const radius1kmPx = Math.max(90, Math.min(260, 500 / metersPerPixel));

  return (
    <View style={styles.container}>
      
      {/* Controles superiores flotantes sobre el mapa */}
      <View style={styles.topFloatingControls}>
        
        {/* Barra de búsqueda */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#9ca3af" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar servicio u oficio..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Toggle Servicios / Favores */}
        <View style={styles.categoryToggle}>
          <TouchableOpacity 
            style={[styles.toggleBtn, category === 'servicios' && styles.toggleBtnActive]}
            onPress={() => setCategory('servicios')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, category === 'servicios' && styles.toggleTextActive]}>
              Servicios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toggleBtn, category === 'favores' && styles.toggleBtnActive]}
            onPress={() => setCategory('favores')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, category === 'favores' && styles.toggleTextActive]}>
              Favores
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chips de filtro horizontal */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
          {FILTER_TAGS.map(tag => (
            <TouchableOpacity 
              key={tag}
              style={[styles.tagChip, selectedTag === tag ? styles.tagChipActive : styles.tagChipInactive]}
              onPress={() => setSelectedTag(tag)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tagText, selectedTag === tag ? styles.tagTextActive : styles.tagTextInactive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Área del Mapa Visual Google Maps Real */}
      <View style={styles.mapCanvas} onLayout={onCanvasLayout}>
        
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

        {/* Manzanas de parques destacadas del cuadrante vecinal */}
        <View 
          style={[
            styles.parkHighlight, 
            { top: canvasSize.height * 0.28, right: '10%', width: 110, height: 75 }
          ]} 
          pointerEvents="none"
        />
        <View 
          style={[
            styles.parkHighlight, 
            { bottom: canvasSize.height * 0.32, left: '8%', width: 130, height: 65 }
          ]} 
          pointerEvents="none"
        />

        {/* Radio de proximidad de 1 km alrededor de la casa del usuario */}
        <View 
          style={[
            styles.userHomeAnchor,
            { left: canvasSize.width / 2, top: canvasSize.height / 2 }
          ]}
          pointerEvents="none"
        >
          <View 
            style={[
              styles.radiusCircleDotted, 
              { 
                width: radius1kmPx * 2, 
                height: radius1kmPx * 2, 
                borderRadius: radius1kmPx,
                left: -radius1kmPx,
                top: -radius1kmPx,
              }
            ]} 
          />
          <View 
            style={[
              styles.radiusCircleFill, 
              { 
                width: radius1kmPx * 2, 
                height: radius1kmPx * 2, 
                borderRadius: radius1kmPx,
                left: -radius1kmPx,
                top: -radius1kmPx,
              }
            ]} 
          />
          {/* Punto negro central de tu casa */}
          <View style={styles.userHomeDot}>
            <View style={styles.userHomeCore} />
          </View>
        </View>

        {/* Pines interactivos de Vecinos (Estilo Google Maps) */}
        {filteredPins.map(pin => {
          const isSelected = selectedNeighbor?.id === pin.id;
          const pos = getPinPixelPosition(pin.lat, pin.lng);

          return (
            <TouchableOpacity 
              key={pin.id}
              style={[
                styles.neighborPinWrapper, 
                { left: pos.x - 22, top: pos.y - 44 },
                isSelected && styles.neighborPinSelected
              ]}
              onPress={() => setSelectedNeighbor(pin)}
              activeOpacity={0.85}
            >
              {/* Pin Verde Teardrop con Iniciales */}
              <View style={[styles.neighborPinBubble, isSelected && styles.neighborPinBubbleActive]}>
                <Text style={styles.pinInitials}>{pin.initials}</Text>
              </View>
              {/* Pico inferior del pin */}
              <View style={[styles.neighborPinPointer, isSelected && styles.neighborPinPointerActive]} />
              <View style={styles.neighborPinShadow} />
            </TouchableOpacity>
          );
        })}

        {/* Botón flotante para alternar Mapa / Satélite */}
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
            onPress={() => setZoom(z => Math.max(14, z - 1))}
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
      </View>

      {/* Tarjeta inferior flotante del resultado seleccionado */}
      <View style={styles.bottomCard}>
        <View style={styles.bottomCardHeader}>
          <Text style={styles.bottomCardTitle}>{filteredPins.length} resultados cerca de ti</Text>
          <Text style={styles.bottomCardRadio}>radio 1 km</Text>
        </View>

        {selectedNeighbor && (
          <View style={styles.neighborItemRow}>
            <View style={styles.neighborAvatar}>
              <Text style={styles.neighborAvatarText}>{selectedNeighbor.initials}</Text>
            </View>

            <View style={styles.neighborInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.neighborName}>{selectedNeighbor.name}</Text>
                <Text style={styles.neighborDist}>{selectedNeighbor.distance}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.neighborTrade}>
                  {selectedNeighbor.trade} · {selectedNeighbor.vouchCount} vistos buenos
                </Text>
                <Text style={styles.neighborWalking}>{selectedNeighbor.walkingTime}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebe9e4',
  },
  topFloatingControls: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    zIndex: 10,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  categoryToggle: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#144e40',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  toggleTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tagsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tagChipActive: {
    backgroundColor: '#1f2937',
  },
  tagChipInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#ffffff',
  },
  tagTextInactive: {
    color: '#4b5563',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#e5e3df',
  },
  tilesCanvas: {
    width: TILE_SIZE * 5,
    height: TILE_SIZE * 5,
    position: 'absolute',
  },
  mapTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    position: 'absolute',
    backgroundColor: '#e5e3df',
  },
  parkHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(202, 233, 203, 0.45)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(164, 214, 166, 0.6)',
  },
  userHomeAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusCircleDotted: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: '#144e40',
    borderStyle: 'dashed',
  },
  radiusCircleFill: {
    position: 'absolute',
    backgroundColor: 'rgba(20, 78, 64, 0.06)',
  },
  userHomeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  userHomeCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  neighborPinWrapper: {
    position: 'absolute',
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 5,
  },
  neighborPinSelected: {
    zIndex: 20,
    transform: [{ scale: 1.15 }],
  },
  neighborPinBubble: {
    width: 40,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#144e40',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 4,
    elevation: 5,
  },
  neighborPinBubbleActive: {
    backgroundColor: '#0d382d',
    borderColor: '#f5c242',
    borderWidth: 2.5,
  },
  neighborPinPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#144e40',
    marginTop: -1,
  },
  neighborPinPointerActive: {
    borderTopColor: '#0d382d',
  },
  neighborPinShadow: {
    width: 16,
    height: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    marginTop: 2,
  },
  pinInitials: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mapTypeToggle: {
    position: 'absolute',
    top: 154,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
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
    right: 16,
    bottom: 120,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#374151',
    lineHeight: 22,
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  googleLogoContainer: {
    position: 'absolute',
    bottom: 115,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 5,
  },
  googleLogoG: { fontSize: 13, fontWeight: '700', color: '#4285F4' },
  googleLogoO1: { fontSize: 13, fontWeight: '700', color: '#EA4335' },
  googleLogoO2: { fontSize: 13, fontWeight: '700', color: '#FBBC05' },
  googleLogoG2: { fontSize: 13, fontWeight: '700', color: '#4285F4' },
  googleLogoL: { fontSize: 13, fontWeight: '700', color: '#34A853' },
  googleLogoE: { fontSize: 13, fontWeight: '700', color: '#EA4335' },
  bottomCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 15,
  },
  bottomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  bottomCardRadio: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  neighborItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  neighborAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#144e40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neighborAvatarText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  neighborInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  neighborName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  neighborDist: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  neighborTrade: {
    fontSize: 12,
    color: '#6b7280',
  },
  neighborWalking: {
    fontSize: 12,
    color: '#6b7280',
  },
});
