import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Layers, ZoomIn, ZoomOut, ChevronUp, ChevronDown } from 'lucide-react';
import { apiService } from '../services/api';

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
const BASE_LAT = -12.0905;
const BASE_LNG = -76.9902;

interface BarrioMapaViewProps {
  onSelectNeighbor?: (neighbor: any) => void;
}

export const BarrioMapaView: React.FC<BarrioMapaViewProps> = ({ onSelectNeighbor }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [pinsList, setPinsList] = useState<NeighborPin[]>(NEIGHBOR_PINS);
  const [category, setCategory] = useState<'servicios' | 'favores'>('servicios');
  const [selectedTag, setSelectedTag] = useState('Todos');
  const [selectedNeighbor, setSelectedNeighbor] = useState<NeighborPin>(NEIGHBOR_PINS[0]);
  const [search, setSearch] = useState('');
  const [mapType, setMapType] = useState<'m' | 'y'>('m'); // 'm' = roadmap, 'y' = satellite
  const [sheetExpanded, setSheetExpanded] = useState(false);

  useEffect(() => {
    apiService.getPinesMapa().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        const mapped: NeighborPin[] = data.map((p: any) => ({
          id: String(p.id),
          initials: p.initials || 'VC',
          name: p.name || 'Vecino',
          trade: p.trade || 'Servicio',
          vouchCount: Number(p.vouchCount ?? 1),
          distance: p.distance || '200 m',
          walkingTime: p.walkingTime || '3 min a pie',
          lat: Number(p.lat ?? -12.0905),
          lng: Number(p.lng ?? -76.9902),
          category: p.category === 'favores' ? 'favores' : 'servicios',
          tag: p.tag || 'Todos',
        }));
        setPinsList(mapped);
        setSelectedNeighbor(mapped[0]);
      }
    }).catch(() => {});
  }, []);

  const filteredPins = pinsList.filter(pin => {
    const matchCat = pin.category === category;
    const matchTag = selectedTag === 'Todos' || pin.tag === selectedTag;
    const matchSearch = search.trim() === '' || 
      pin.name.toLowerCase().includes(search.toLowerCase()) ||
      pin.trade.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchTag && matchSearch;
  });

  // Inicializar Leaflet con Google Maps Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [BASE_LAT, BASE_LNG],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(
        `https://mt1.google.com/vt/lyrs=${mapType}&x={x}&y={y}&z={z}`,
        {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }
      ).addTo(map);

      tileLayerRef.current = tileLayer;

      // Icono central: Tu Casa (Punto negro + halo verde de radio 1 km)
      const userHomeIcon = L.divIcon({
        className: 'user-home-pin',
        html: `
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: #111827;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      L.marker([BASE_LAT, BASE_LNG], { icon: userHomeIcon, interactive: false }).addTo(map);

      // Círculo del radio vecinal de 1 km (Línea punteada)
      L.circle([BASE_LAT, BASE_LNG], {
        radius: 500, // Visualmente proporcionado al cuadrante
        color: '#144e40',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#144e40',
        fillOpacity: 0.05
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // Cambiar capa satelital / roadmap
  useEffect(() => {
    if (tileLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newLayer = L.tileLayer(
        `https://mt1.google.com/vt/lyrs=${mapType}&x={x}&y={y}&z={z}`,
        {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }
      ).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }
  }, [mapType]);

  // Renderizar pines filtrados
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Limpiar marcadores previos
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filteredPins.forEach(pin => {
      const isSelected = selectedNeighbor.id === pin.id;
      const pinIcon = L.divIcon({
        className: 'neighbor-map-pin',
        html: `
          <div style="position: relative; width: 42px; height: 46px; cursor: pointer; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s;">
            <div style="
              width: 40px; 
              height: 34px; 
              border-radius: 12px; 
              background: ${isSelected ? '#0d382d' : '#144e40'}; 
              border: 2px solid ${isSelected ? '#f5c242' : '#ffffff'}; 
              box-shadow: 0 4px 8px rgba(0,0,0,0.3); 
              display: flex; 
              align-items: center; 
              justify-content: center;
              color: #ffffff;
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 0.5px;
            ">
              ${pin.initials}
            </div>
            <div style="
              width: 0; 
              height: 0; 
              border-left: 6px solid transparent; 
              border-right: 6px solid transparent; 
              border-top: 7px solid ${isSelected ? '#0d382d' : '#144e40'}; 
              margin-left: 14px;
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [42, 46],
        iconAnchor: [21, 46]
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: pinIcon })
        .addTo(mapInstanceRef.current!)
        .on('click', () => {
          setSelectedNeighbor(pin);
        });

      markersRef.current.push(marker);
    });
  }, [filteredPins, selectedNeighbor]);

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-72px)] overflow-hidden select-none">
      
      {/* Contenedor del Mapa Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Controles Flotantes Superiores */}
      <div className="absolute top-3 left-4 right-4 z-20 flex flex-col gap-2.5 pointer-events-auto">
        
        {/* Barra de Búsqueda */}
        <div className="flex items-center gap-2.5 px-4 h-12 bg-white rounded-full border border-gray-200 shadow-md">
          <Search className="w-4.5 h-4.5 text-gray-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar servicio u oficio..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Toggle Servicios / Favores */}
        <div className="flex bg-white rounded-full p-1 border border-gray-200 shadow-sm">
          <button 
            onClick={() => setCategory('servicios')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
              category === 'servicios' ? 'bg-[#144e40] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Servicios
          </button>
          <button 
            onClick={() => setCategory('favores')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
              category === 'favores' ? 'bg-[#144e40] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Favores
          </button>
        </div>

        {/* Chips de Categorías */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {FILTER_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shadow-2xs ${
                selectedTag === tag 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Controles Flotantes Derecho: Satélite y Zoom */}
      <div className="absolute top-44 right-4 z-20 flex flex-col gap-2">
        <button 
          onClick={() => setMapType(m => m === 'm' ? 'y' : 'm')}
          className="bg-white hover:bg-gray-50 p-2.5 rounded-xl shadow-md border border-gray-200 text-gray-700 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
        >
          <Layers className="w-4 h-4 text-[#144e40]" />
          <span>{mapType === 'm' ? 'Satélite' : 'Mapa'}</span>
        </button>

        <div className="flex flex-col bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <button 
            onClick={() => handleZoom(1)}
            className="p-2.5 hover:bg-gray-50 text-gray-700 flex items-center justify-center cursor-pointer border-b border-gray-100"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleZoom(-1)}
            className="p-2.5 hover:bg-gray-50 text-gray-700 flex items-center justify-center cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Marca de agua oficial de Google Maps */}
      <div className="absolute bottom-24 left-4 z-10 pointer-events-none bg-white/85 px-2 py-0.5 rounded text-[10px] font-bold text-gray-700 shadow-xs flex items-center gap-0.5">
        <span className="text-[#4285F4]">G</span>
        <span className="text-[#EA4335]">o</span>
        <span className="text-[#FBBC05]">o</span>
        <span className="text-[#4285F4]">g</span>
        <span className="text-[#34A853]">l</span>
        <span className="text-[#EA4335]">e</span>
      </div>

      {/* Tarjeta Flotante Inferior Expansible con Resultados */}
      <div className={`absolute bottom-5 left-4 right-4 z-20 bg-white rounded-2xl px-4 pt-2.5 pb-3.5 shadow-xl border border-gray-200 transition-all ${sheetExpanded ? 'max-h-[300px] flex flex-col' : ''}`}>
        <div
          onClick={() => setSheetExpanded(prev => !prev)}
          className="cursor-pointer pb-2 select-none"
        >
          <div className="w-9 h-1 rounded-full bg-gray-300 mx-auto mb-2" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">{filteredPins.length} resultados cerca de ti</span>
              {sheetExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#144e40]" />
              ) : (
                <ChevronUp className="w-4 h-4 text-[#144e40]" />
              )}
            </div>
            <span className="text-xs text-[#144e40] font-semibold">
              {sheetExpanded ? 'Contraer' : 'Ver todos · radio 1 km'}
            </span>
          </div>
        </div>

        {sheetExpanded ? (
          <div className="overflow-y-auto space-y-2 pr-0.5 max-h-[220px]">
            {filteredPins.map(pin => {
              const isCurrent = selectedNeighbor?.id === pin.id;
              return (
                <div
                  key={pin.id}
                  onClick={() => {
                    setSelectedNeighbor(pin);
                    onSelectNeighbor?.(pin);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-xl border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-[#eef6f2] border-[#144e40]'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#144e40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {pin.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 text-xs truncate">{pin.name}</h4>
                      <span className="font-bold text-gray-900 text-xs">{pin.distance}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-0.5">
                      <span className="truncate">{pin.trade} · {pin.vouchCount} vistos buenos</span>
                      <span className="shrink-0">{pin.walkingTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          (selectedNeighbor || filteredPins[0]) && (() => {
            const item = selectedNeighbor && filteredPins.some(p => p.id === selectedNeighbor.id)
              ? selectedNeighbor
              : filteredPins[0];
            if (!item) return null;
            return (
              <div 
                onClick={() => onSelectNeighbor?.(item)}
                className="flex items-center gap-3 p-1 rounded-xl hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-[#144e40] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {item.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                    <span className="font-bold text-gray-900 text-xs">{item.distance}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-0.5">
                    <span className="truncate">{item.trade} · {item.vouchCount} vistos buenos</span>
                    <span className="shrink-0">{item.walkingTime}</span>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>

    </div>
  );
};
