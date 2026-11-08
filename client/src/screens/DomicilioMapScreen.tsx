import React, { useState } from 'react';
import { LeafletMapPicker } from '../components/LeafletMapPicker';

interface DomicilioMapScreenProps {
  onBack: () => void;
  onSaveDomicilio: (locationData: { address: string; lat: number; lng: number; quadrantName: string }) => void;
  initialAddress?: string;
}

export const DomicilioMapScreen: React.FC<DomicilioMapScreenProps> = ({
  onBack,
  onSaveDomicilio,
  initialAddress = 'Jr. Jacarandá 342, San Borja'
}) => {
  const [selectedLocation, setSelectedLocation] = useState({
    address: initialAddress,
    lat: -12.0905,
    lng: -76.9902,
    quadrantName: 'San Borja · Sector 4'
  });

  return (
    <div className="flex flex-col justify-between h-full px-5 py-5 bg-surface-bg select-none">
      {/* Cabecera y Título */}
      <div className="flex flex-col flex-1">
        {/* Enlace Atrás */}
        <button
          onClick={onBack}
          className="self-start text-[13px] font-medium text-ink-primary hover:text-brand-800 mb-1 -ml-0.5 py-0.5 transition cursor-pointer"
        >
          ‹ Atrás
        </button>

        {/* Indicador de Paso */}
        <p className="text-[11px] font-medium text-ink-muted mb-0.5">
          Paso 2 de 3 · Tu domicilio
        </p>

        {/* Título de Pantalla */}
        <h2 className="text-[20px] font-bold text-ink-primary tracking-tight mb-0.5">
          Ubica tu casa
        </h2>
        
        {/* Subtítulo de Privacidad Vecinal */}
        <p className="text-[11px] text-ink-secondary leading-normal mb-2.5">
          Solo vecinos verificados de tu cuadrante verán tu zona.
        </p>

        {/* Mapa Interactivo con Geolocalización GPS e Iframe */}
        <LeafletMapPicker
          onLocationSelect={(loc) => setSelectedLocation(loc)}
          initialLat={selectedLocation.lat}
          initialLng={selectedLocation.lng}
          initialAddress={selectedLocation.address}
        />
      </div>

      {/* Botón Guardar Domicilio */}
      <div className="w-full pb-1 pt-3">
        <button
          onClick={() => onSaveDomicilio(selectedLocation)}
          className="w-full py-3.5 px-5 rounded-xl bg-brand-800 hover:bg-brand-900 active:scale-[0.99] text-white font-semibold text-[15px] shadow-xs transition flex items-center justify-center cursor-pointer"
        >
          Guardar domicilio
        </button>
      </div>
    </div>
  );
};
