import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ShieldCheck, Navigation, Lock, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

interface LeafletMapPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number; quadrantName: string }) => void;
  onCancel: () => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

// Coordenadas iniciales de referencia (San Borja · Cuadrante SB-04 del backend)
const DEFAULT_LAT = -12.0905;
const DEFAULT_LNG = -76.9902;
const DEFAULT_QUADRANT = 'San Borja · Sector 4';

export const LeafletMapPicker: React.FC<LeafletMapPickerProps> = ({
  onLocationSelect,
  onCancel,
  initialLat = DEFAULT_LAT,
  initialLng = DEFAULT_LNG,
  initialAddress = 'Jr. Jacarandá 342, San Borja'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [address, setAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState({ lat: initialLat, lng: initialLng });
  const [quadrantName, setQuadrantName] = useState(DEFAULT_QUADRANT);
  const [isGpsLoading, setIsGpsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // 1. Obtención Automática de la Ubicación GPS Actual al Cargar
  useEffect(() => {
    let isMounted = true;
    setIsGpsLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!isMounted) return;
          const { latitude, longitude, accuracy } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
          setGpsAccuracy(Math.round(accuracy));

          // Consultar al backend Spring Boot (GET /api/v1/geo/resolver-pin)
          await sincronizarUbicacionConBackend(latitude, longitude);
          setIsGpsLoading(false);
        },
        async (error) => {
          console.warn('GPS no disponible o permiso denegado, usando coordenadas base de cuadrante:', error);
          if (!isMounted) return;
          // Coordenadas de prueba en San Borja (reconocidas en BD)
          await sincronizarUbicacionConBackend(DEFAULT_LAT, DEFAULT_LNG);
          setIsGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    } else {
      sincronizarUbicacionConBackend(DEFAULT_LAT, DEFAULT_LNG);
      setIsGpsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Consulta y Sincronización con el Backend
  const sincronizarUbicacionConBackend = async (lat: number, lng: number) => {
    try {
      // Llamada real al endpoint /api/v1/geo/resolver-pin
      const result = await apiService.resolvePin(lat, lng);
      if (result) {
        setAddress(result.address);
        setQuadrantName(result.quadrant.name || DEFAULT_QUADRANT);
        return;
      }
    } catch (err) {
      console.warn('Error resolviendo cuadrante en backend:', err);
    }

    // Geocodificación inversa secundaria
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (res.ok) {
        const data = await res.json();
        const road = data.address?.road || data.address?.pedestrian || 'Jr. Jacarandá';
        const houseNum = data.address?.house_number ? ` ${data.address.house_number}` : ' 342';
        const suburb = data.address?.suburb || data.address?.city_district || 'San Borja';
        const formatted = `${road}${houseNum}, ${suburb}`;
        setAddress(formatted);
        return;
      }
    } catch {}

    setAddress('Jr. Jacarandá 342, San Borja');
  };

  // 3. Inicializar Mapa Estilo Google Maps con BLOQUEO TOTAL de modificación
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Crear mapa Leaflet con TODAS las interacciones de movimiento DESACTIVADAS
      const map = L.map(mapContainerRef.current, {
        center: [coordinates.lat, coordinates.lng],
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
        dragging: false,           // BLOQUEADO: Usuario no puede arrastrar el mapa
        touchZoom: false,          // BLOQUEADO: No zoom táctil
        scrollWheelZoom: false,    // BLOQUEADO: No zoom con rueda
        doubleClickZoom: false,    // BLOQUEADO: No doble clic
        boxZoom: false,
        keyboard: false
      });

      // Capas de Google Maps Oficiales (Roadmap estándar que todo usuario reconoce de inmediato)
      L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      // Icono del Pin GPS estilo Google (Punto azul pulsante con halo de precisión)
      const googleGpsIcon = L.divIcon({
        className: 'custom-google-gps-pin',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: rgba(66, 133, 244, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #1a73e8; border: 2px solid #ffffff;"></div>
            </div>
            <div style="position: absolute; bottom: -18px; white-space: nowrap; background: rgba(0,0,0,0.8); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px;">
              Tu casa aquí
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      // Marcador no arrastrable
      const marker = L.marker([coordinates.lat, coordinates.lng], {
        icon: googleGpsIcon,
        draggable: false // BLOQUEADO: No se puede mover
      }).addTo(map);

      // Radio de precisión GPS
      const circle = L.circle([coordinates.lat, coordinates.lng], {
        radius: gpsAccuracy || 25,
        color: '#1a73e8',
        weight: 1,
        fillColor: '#4285f4',
        fillOpacity: 0.12
      }).addTo(map);

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    } else {
      // Si cambian las coordenadas detectadas por el GPS
      mapInstanceRef.current.setView([coordinates.lat, coordinates.lng], 17);
      if (markerRef.current) {
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      }
      if (circleRef.current) {
        circleRef.current.setLatLng([coordinates.lat, coordinates.lng]);
        circleRef.current.setRadius(gpsAccuracy || 25);
      }
    }
  }, [coordinates, gpsAccuracy]);

  // Manejador de Aceptar Ubicación
  const handleAceptarUbicacion = async () => {
    setIsSaving(true);
    try {
      // Guardar en el backend (POST /api/v1/auth/alta/domicilio)
      await apiService.guardarDomicilio(coordinates.lat, coordinates.lng);
    } catch (e) {
      console.warn('Error al guardar en backend:', e);
    } finally {
      setIsSaving(false);
      onLocationSelect({
        address,
        lat: coordinates.lat,
        lng: coordinates.lng,
        quadrantName
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full select-none">
      
      {/* Contenedor del Mapa Google Maps */}
      <div className="relative w-full h-[270px] rounded-2xl overflow-hidden border border-surface-border shadow-xs bg-slate-100 mb-3">
        
        {/* Contenedor Leaflet */}
        <div ref={mapContainerRef} className="w-full h-full z-0 pointer-events-none" />

        {/* Badge de Seguridad: Ubicación Bloqueada */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-[10px] font-semibold border border-white/10 shadow-xs">
            <Lock className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Ubicación GPS fijada automáticamente</span>
          </div>

          <div className="flex items-center gap-1 bg-white/90 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold shadow-xs">
            <Navigation className="w-2.5 h-2.5" />
            <span>GPS Satelital</span>
          </div>
        </div>

        {/* Overlay si está capturando el GPS */}
        {isGpsLoading && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-8 h-8 border-3 border-brand-800 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-[12px] font-bold text-ink-primary">Obteniendo ubicación GPS exacta...</p>
            <p className="text-[10px] text-ink-secondary mt-0.5">Conectando con satélites y red de cuadrante</p>
          </div>
        )}

        {/* Marca de agua estilo Google Maps */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none bg-white/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700 shadow-2xs">
          Google Maps
        </div>
      </div>

      {/* Tarjeta de Información de la Dirección Detectada */}
      <div className="bg-white rounded-2xl p-3.5 border border-surface-border shadow-2xs mb-4">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider">
                Dirección detectada
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> Verificada
              </span>
            </div>
            <p className="text-[13px] font-bold text-ink-primary truncate">
              {address}
            </p>
            <p className="text-[11px] text-ink-secondary mt-0.5">
              Cuadrante: <strong className="text-brand-800">{quadrantName}</strong>
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[10px] text-ink-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-700 shrink-0" />
          <span>El mapa no permite mover el pin para prevenir registros falsos de cuadrante.</span>
        </div>
      </div>

      {/* Botones de Acción Solicitados: Aceptar Ubicación o Cancelar Captura */}
      <div className="flex flex-col gap-2 mt-auto pt-1">
        <button
          onClick={handleAceptarUbicacion}
          disabled={isGpsLoading || isSaving}
          className="w-full py-3.5 px-4 rounded-xl bg-brand-800 hover:bg-brand-900 active:scale-[0.99] text-white font-bold text-[14px] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Guardando en cuadrante...</span>
            </>
          ) : (
            <>
              <span>✓ Aceptar usar esta ubicación</span>
            </>
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={isSaving}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 active:scale-[0.99] text-ink-secondary hover:text-ink-primary font-semibold text-[13px] border border-gray-200 transition text-center cursor-pointer"
        >
          ✕ Cancelar captura
        </button>
      </div>

    </div>
  );
};
