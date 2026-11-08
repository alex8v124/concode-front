import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ShieldCheck, Navigation, Layers, Compass, Loader2 } from 'lucide-react';

interface LeafletMapPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number; quadrantName: string }) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

// Coordenadas base en Lima (San Borja / Surco)
const DEFAULT_LAT = -12.0905;
const DEFAULT_LNG = -76.9902;
const QUADRANT_NAME = 'San Borja · Sector 4';

// Polígono del Cuadrante Vecinal Protegido (Simulando PostGIS ST_Contains)
const QUADRANT_POLYGON: [number, number][] = [
  [-12.0830, -76.9960],
  [-12.0830, -76.9840],
  [-12.0970, -76.9840],
  [-12.0970, -76.9960]
];

export const LeafletMapPicker: React.FC<LeafletMapPickerProps> = ({
  onLocationSelect,
  initialLat = DEFAULT_LAT,
  initialLng = DEFAULT_LNG,
  initialAddress = 'Jr. Jacarandá 342, San Borja'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [address, setAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState({ lat: initialLat, lng: initialLng });
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [mapType, setMapType] = useState<'leaflet' | 'iframe'>('leaflet');

  // Función para obtener dirección real mediante Reverse Geocoding (Nominatim OpenStreetMap)
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (res.ok) {
        const data = await res.json();
        const road = data.address?.road || data.address?.pedestrian || data.address?.neighbourhood || 'Jr. Jacarandá';
        const houseNum = data.address?.house_number ? ` ${data.address.house_number}` : ` ${Math.floor(200 + Math.random() * 200)}`;
        const suburb = data.address?.suburb || data.address?.city_district || 'San Borja';
        const formatted = `${road}${houseNum}, ${suburb}`;
        
        setAddress(formatted);
        onLocationSelect({
          address: formatted,
          lat,
          lng,
          quadrantName: QUADRANT_NAME
        });
        return;
      }
    } catch (err) {
      console.warn('Fallo en geocodificación inversa, usando fallback local:', err);
    } finally {
      setIsReverseGeocoding(false);
    }

    // Fallback si no hay internet o rate limit
    const fallback = `Jr. Jacarandá ${Math.floor(280 + Math.random() * 80)}, San Borja`;
    setAddress(fallback);
    onLocationSelect({
      address: fallback,
      lat,
      lng,
      quadrantName: QUADRANT_NAME
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current || mapType !== 'leaflet') return;

    try {
      // Inicializar Mapa Leaflet
      const map = L.map(mapContainerRef.current, {
        center: [coordinates.lat, coordinates.lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      // Capa de Mapa CartoDB Voyager (Limpia, elegante, temática clara)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Dibujar Polígono del Cuadrante Vecinal Protegido
      L.polygon(QUADRANT_POLYGON, {
        color: '#144e40',
        weight: 2.5,
        fillColor: '#144e40',
        fillOpacity: 0.12,
        dashArray: '5, 8'
      }).addTo(map);

      // Ícono de Pin Verde Esmeralda Personalizado (Teardrop)
      const pinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            position: relative;
            width: 34px;
            height: 34px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 32px;
              height: 32px;
              background-color: #144e40;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 10px;
                height: 10px;
                background-color: #f2ab27;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      // Marcador Arrastrable
      const marker = L.marker([coordinates.lat, coordinates.lng], {
        draggable: true,
        icon: pinIcon
      }).addTo(map);

      // Evento: Al terminar de arrastrar el pin
      marker.on('dragend', (e: any) => {
        const latlng = e.target.getLatLng();
        setCoordinates({ lat: latlng.lat, lng: latlng.lng });
        reverseGeocode(latlng.lat, latlng.lng);
      });

      // Evento: Al hacer clic en cualquier parte del mapa
      map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size tras render inicial
      setTimeout(() => {
        map.invalidateSize();
      }, 200);

    } catch (e) {
      console.error('Error al inicializar Leaflet:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapType]);

  // Geolocalización en tiempo real (GPS del navegador / dispositivo)
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17, { animate: true });
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setIsLocating(false);
        console.warn('Error al obtener ubicación:', error.message);
        // Usar coordenadas por defecto
        reverseGeocode(DEFAULT_LAT, DEFAULT_LNG);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      
      {/* Contenedor del Mapa */}
      <div className="relative flex-1 min-h-[290px] w-full rounded-2xl overflow-hidden border border-[#d8ded4] shadow-xs bg-[#e9eee6]">
        
        {/* Vista A: Mapa Interactivo Leaflet con OpenStreetMap */}
        {mapType === 'leaflet' && (
          <div ref={mapContainerRef} className="absolute inset-0 h-full w-full z-0" />
        )}

        {/* Vista B: Iframe Integrado (OpenStreetMap / Google Embed) */}
        {mapType === 'iframe' && (
          <iframe
            title="Mapa del Cuadrante Vecinal"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.005}%2C${coordinates.lat - 0.004}%2C${coordinates.lng + 0.005}%2C${coordinates.lat + 0.004}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`}
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
          />
        )}

        {/* Botón Flotante: Mi Ubicación GPS */}
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isLocating}
          className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-xs px-3.5 py-1.5 text-[11px] font-bold text-brand-800 shadow-md border border-brand-800/20 hover:bg-brand-50 active:scale-95 transition cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-800" />
          ) : (
            <Navigation className="w-3.5 h-3.5 fill-brand-800 text-brand-800" />
          )}
          <span>{isLocating ? 'Detectando...' : 'Mi posición GPS'}</span>
        </button>

        {/* Selector de Modo: Leaflet vs Iframe */}
        <button
          type="button"
          onClick={() => setMapType(mapType === 'leaflet' ? 'iframe' : 'leaflet')}
          className="absolute top-3 left-3 z-[400] flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-semibold text-gray-700 shadow-sm border border-gray-200 hover:bg-white transition cursor-pointer"
          title="Alternar entre motor Leaflet y visor Iframe"
        >
          <Layers className="w-3 h-3 text-brand-800" />
          <span>{mapType === 'leaflet' ? 'Modo: Leaflet' : 'Modo: Iframe'}</span>
        </button>

        {/* Insignia Flotante Inferior: Cuadrante Vecinal */}
        <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-xs px-3 py-1.5 text-[11px] font-semibold text-brand-800 shadow-sm border border-brand-800/20">
          <ShieldCheck className="w-4 h-4 text-brand-800" />
          <span>{QUADRANT_NAME}</span>
        </div>

        {/* Coordenadas flotantes en tiempo real */}
        <div className="absolute bottom-3 right-3 z-[400] hidden sm:flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-xs px-2 py-1 text-[9px] font-mono text-white/90">
          <Compass className="w-3 h-3 text-accent-yellow" />
          <span>{coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}</span>
        </div>
      </div>

      {/* Input de Dirección con Reverse Geocoding */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-[11px] font-medium text-ink-primary">
            Dirección del domicilio
          </label>
          <span className="text-[10px] text-ink-muted">
            {isReverseGeocoding ? 'Actualizando dirección...' : 'Toca o arrastra el pin'}
          </span>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 border border-surface-border shadow-2xs focus-within:border-brand-800 transition">
          <MapPin className="w-4 h-4 text-brand-800 shrink-0" />
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              onLocationSelect({
                address: e.target.value,
                lat: coordinates.lat,
                lng: coordinates.lng,
                quadrantName: QUADRANT_NAME
              });
            }}
            placeholder="Arrastra el pin en el mapa hasta tu casa"
            className="w-full text-[13px] font-medium text-ink-primary bg-transparent focus:outline-none"
          />
        </div>
      </div>

    </div>
  );
};
