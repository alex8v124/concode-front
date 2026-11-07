import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ShieldCheck, Navigation } from 'lucide-react';

interface LeafletMapPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number; quadrantName: string }) => void;
  initialLat?: number;
  initialLng?: number;
}

export const LeafletMapPicker: React.FC<LeafletMapPickerProps> = ({
  onLocationSelect,
  initialLat = -12.0905,
  initialLng = -76.9902
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState('Jr. Jacarandá 342, San Borja');
  const [coordinates, setCoordinates] = useState({ lat: initialLat, lng: initialLng });
  const [quadrantName] = useState('Cuadrante San Borja - Sector 4');
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Si window.L (Leaflet) está disponible
    const L = (window as any).L;

    if (L && mapContainerRef.current && !mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 16,
          zoomControl: false,
          attributionControl: false
        });

        // Capa de mapa limpia y legible (OpenStreetMap estilo claro)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(map);

        // Polígono del Cuadrante Vecinal
        const quadrantPolygon = [
          [-12.0860, -76.9940],
          [-12.0860, -76.9860],
          [-12.0950, -76.9860],
          [-12.0950, -76.9940]
        ];

        L.polygon(quadrantPolygon, {
          color: '#165a4c',
          weight: 2,
          fillColor: '#165a4c',
          fillOpacity: 0.12,
          dashArray: '4, 6'
        }).addTo(map);

        // Ícono personalizado del Pin verde
        const greenIcon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="
            background-color: #165a4c;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 10px; height: 10px; background-color: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
          icon: greenIcon
        }).addTo(map);

        marker.on('dragend', (e: any) => {
          const latlng = e.target.getLatLng();
          setCoordinates({ lat: latlng.lat, lng: latlng.lng });
          const dynamicStreet = `Jr. Jacarandá ${Math.floor(300 + Math.random() * 80)}, San Borja`;
          setAddress(dynamicStreet);
          onLocationSelect({
            address: dynamicStreet,
            lat: latlng.lat,
            lng: latlng.lng,
            quadrantName
          });
        });

        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
          const dynamicStreet = `Calle Las Acacias ${Math.floor(100 + Math.random() * 90)}, San Borja`;
          setAddress(dynamicStreet);
          onLocationSelect({
            address: dynamicStreet,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            quadrantName
          });
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } catch (e) {
        console.warn('Leaflet error or initialization fallback:', e);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleUseCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        const updatedAddress = 'Ubicación actual detectada por GPS';
        setAddress(updatedAddress);
        onLocationSelect({
          address: updatedAddress,
          lat: latitude,
          lng: longitude,
          quadrantName
        });
      });
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Contenedor del Mapa con estilo de cuadrícula vecinal */}
      <div className="relative flex-1 min-h-[310px] w-full rounded-2xl overflow-hidden border border-[#d8ded4] shadow-inner bg-[#e9eee6]">
        
        {/* Contenedor Leaflet */}
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

        {/* Capa de respaldo visual tipo wireframe (por si no hay conexión de mapas) */}
        {!mapInstanceRef.current && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#ebefe8] to-[#dde5da]">
            {/* Cuadrícula estética tipo plano vecinal */}
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-6 opacity-25 pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="border border-[#165a4c]/20" />
              ))}
            </div>

            {/* Pin central interactivo */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#165a4c] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                <MapPin className="w-6 h-6 fill-white text-white" />
              </div>
              <div className="mt-2 bg-white/90 px-3 py-1 rounded-full text-[11px] font-bold text-[#165a4c] shadow-sm">
                Tu casa aquí
              </div>
            </div>
          </div>
        )}

        {/* Botón flotante para mi ubicación actual */}
        <button
          onClick={handleUseCurrentPosition}
          className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#165a4c] shadow-md border border-[#e1e6de] hover:bg-[#f2f7f3] active:scale-95 transition"
        >
          <Navigation className="w-3.5 h-3.5 fill-[#165a4c]" />
          Mi posición
        </button>

        {/* Etiqueta flotante del Cuadrante de Seguridad */}
        <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-1.5 rounded-xl bg-white/95 backdrop-blur-sm px-3 py-1.5 text-[11px] font-semibold text-[#165a4c] shadow-sm border border-[#165a4c]/20">
          <ShieldCheck className="w-4 h-4 text-[#165a4c]" />
          <span>{quadrantName}</span>
        </div>
      </div>

      {/* Input inferior "Arrastra el pin hasta tu casa" */}
      <div className="mt-3">
        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
          Dirección calculada
        </label>
        <div className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-3 border border-[#d8ded4] shadow-xs">
          <MapPin className="w-4 h-4 text-[#165a4c] shrink-0" />
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              onLocationSelect({
                address: e.target.value,
                lat: coordinates.lat,
                lng: coordinates.lng,
                quadrantName
              });
            }}
            placeholder="Arrastra el pin hasta tu casa"
            className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
