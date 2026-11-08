import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Dimensions 
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
  x: number; // Porcentaje de posición en el mapa
  y: number;
  category: 'servicios' | 'favores';
  tag: string;
}

const NEIGHBOR_PINS: NeighborPin[] = [
  {
    id: '1',
    initials: 'RQ',
    name: 'Rosa Quispe',
    trade: 'Gasfitería',
    vouchCount: 42,
    distance: '180 m',
    walkingTime: '2 min a pie',
    x: 58,
    y: 33,
    category: 'servicios',
    tag: 'Gasfitería',
  },
  {
    id: '2',
    initials: 'MH',
    name: 'Miguel Huamán',
    trade: 'Electricidad domiciliaria',
    vouchCount: 31,
    distance: '350 m',
    walkingTime: '4 min a pie',
    x: 28,
    y: 46,
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
    x: 74,
    y: 50,
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
    x: 14,
    y: 29,
    category: 'servicios',
    tag: 'Todos',
  },
];

const FILTER_TAGS = ['Todos', 'Gasfitería', 'Electricidad', 'Clases'];

export const BarrioMapaScreen: React.FC<Props> = ({ userData }) => {
  const [category, setCategory] = useState<'servicios' | 'favores'>('servicios');
  const [selectedTag, setSelectedTag] = useState('Todos');
  const [selectedNeighbor, setSelectedNeighbor] = useState<NeighborPin>(NEIGHBOR_PINS[0]);
  const [search, setSearch] = useState('');

  const filteredPins = NEIGHBOR_PINS.filter(pin => {
    const matchCat = pin.category === category;
    const matchTag = selectedTag === 'Todos' || pin.tag === selectedTag;
    const matchSearch = search.trim() === '' || 
      pin.name.toLowerCase().includes(search.toLowerCase()) ||
      pin.trade.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchTag && matchSearch;
  });

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

      {/* Área del Mapa Visual con Calles y Cuadrantes */}
      <View style={styles.mapCanvas}>
        
        {/* Manzanas y calles esquemáticas de fondo */}
        <View style={styles.gridOverlay}>
          {/* Parques */}
          <View style={[styles.parkPatch, { top: '28%', right: '8%', width: 100, height: 70 }]} />
          <View style={[styles.parkPatch, { bottom: '38%', left: '8%', width: 120, height: 60 }]} />

          {/* Líneas de calles */}
          <View style={[styles.streetH, { top: '20%' }]} />
          <View style={[styles.streetH, { top: '40%' }]} />
          <View style={[styles.streetH, { top: '60%' }]} />
          <View style={[styles.streetV, { left: '25%' }]} />
          <View style={[styles.streetV, { left: '50%' }]} />
          <View style={[styles.streetV, { left: '75%' }]} />
        </View>

        {/* Radio de proximidad de 1 km alrededor de la casa del usuario */}
        <View style={styles.userHomeAnchor}>
          <View style={styles.radiusCircleDotted} />
          <View style={styles.radiusCircleFill} />
          {/* Punto negro de tu casa */}
          <View style={styles.userHomeDot}>
            <View style={styles.userHomeCore} />
          </View>
        </View>

        {/* Pines interactivos de Vecinos */}
        {filteredPins.map(pin => {
          const isSelected = selectedNeighbor.id === pin.id;
          return (
            <TouchableOpacity 
              key={pin.id}
              style={[
                styles.neighborPin, 
                { left: `${pin.x}%`, top: `${pin.y}%` },
                isSelected && styles.neighborPinSelected
              ]}
              onPress={() => setSelectedNeighbor(pin)}
              activeOpacity={0.85}
            >
              <Text style={styles.pinInitials}>{pin.initials}</Text>
            </TouchableOpacity>
          );
        })}
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
    fontWeight: '700',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  tagsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tagChipActive: {
    backgroundColor: '#111827',
  },
  tagChipInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagTextActive: {
    color: '#ffffff',
  },
  tagTextInactive: {
    color: '#374151',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#edebe6',
  },
  streetH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#ffffff',
  },
  streetV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: '#ffffff',
  },
  parkPatch: {
    position: 'absolute',
    backgroundColor: '#d6eedf',
    borderRadius: 18,
  },
  userHomeAnchor: {
    position: 'absolute',
    left: '50%',
    top: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusCircleDotted: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#144e40',
    borderStyle: 'dashed',
  },
  radiusCircleFill: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: 'rgba(214, 238, 223, 0.45)',
  },
  userHomeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  userHomeCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
  },
  neighborPin: {
    position: 'absolute',
    backgroundColor: '#144e40',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
    borderBottomLeftRadius: 3,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  neighborPinSelected: {
    transform: [{ scale: 1.15 }],
    borderColor: '#10b981',
  },
  pinInitials: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 84,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  bottomCardRadio: {
    fontSize: 11,
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
    borderRadius: 14,
    backgroundColor: '#144e40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neighborAvatarText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
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
    fontSize: 11,
    color: '#6b7280',
  },
  neighborWalking: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
});
