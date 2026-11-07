import React, { useState } from 'react';

interface DomicilioMapScreenProps {
  onBack: () => void;
  onSaveDomicilio: (locationData: { address: string; lat: number; lng: number; quadrantName: string }) => void;
  initialAddress?: string;
}

export const DomicilioMapScreen: React.FC<DomicilioMapScreenProps> = ({
  onBack,
  onSaveDomicilio,
  initialAddress
}) => {
  // Posición del pin en la cuadrícula comunal (filas 0-7, columnas 0-5)
  const [pinPosition, setPinPosition] = useState({ col: 2, row: 4 });
  const [address, setAddress] = useState(initialAddress || 'Jr. Jacarandá 342, San Borja');

  // Nombres de calles comunales simuladas según el cuadrante
  const streetNames = [
    'Jr. Jacarandá 342, San Borja',
    'Calle Las Acacias 120, San Borja',
    'Av. San Borja Norte 845, San Borja',
    'Jr. Las Gardenias 215, San Borja',
    'Pasaje Los Sauces 104, San Borja',
    'Calle Monterrey 310, Chacarilla',
  ];

  const handleTileClick = (colIndex: number, rowIndex: number) => {
    setPinPosition({ col: colIndex, row: rowIndex });
    const street = streetNames[(colIndex + rowIndex * 2) % streetNames.length];
    setAddress(street);
  };

  return (
    <div className="flex flex-col justify-between h-full px-6 py-6 bg-surface-bg select-none">
      {/* Cabecera y Título */}
      <div className="flex flex-col">
        {/* Enlace Atrás (Figma: ‹ Atrás) */}
        <button
          onClick={onBack}
          className="self-start text-[13px] font-medium text-ink-primary hover:text-brand-800 mb-2 -ml-0.5 py-0.5 transition cursor-pointer"
        >
          ‹ Atrás
        </button>

        {/* Indicador de Paso */}
        <p className="text-[12px] font-medium text-ink-muted mb-1">
          Paso 2 de 3 · Tu domicilio
        </p>

        {/* Título de Pantalla */}
        <h2 className="text-[22px] font-bold text-ink-primary tracking-tight mb-1">
          Ubica tu casa
        </h2>
        
        {/* Subtítulo de Privacidad Vecinal */}
        <p className="text-[12px] text-ink-secondary leading-normal mb-3">
          Solo vecinos verificados de tu cuadrante verán tu zona.
        </p>

        {/* Mapa Cuadrícula Comunal (Figma 4 · Domicilio en...) */}
        <div className="relative w-full h-[270px] rounded-2xl bg-[#dfede0] border border-[#cbdcd0] overflow-hidden shadow-2xs">
          
          {/* Cuadrícula de calles vecinales (6 columnas x 8 filas) */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-8 gap-[2px] p-[2px] bg-white/40">
            {Array.from({ length: 48 }).map((_, idx) => {
              const col = idx % 6;
              const row = Math.floor(idx / 6);
              const isSelected = pinPosition.col === col && pinPosition.row === row;

              return (
                <div
                  key={idx}
                  onClick={() => handleTileClick(col, row)}
                  className={`neighborhood-grid-tile cursor-pointer transition-colors ${
                    isSelected ? 'bg-brand-100/60' : 'bg-[#dfede0]/90 hover:bg-[#d0e5d2]'
                  }`}
                />
              );
            })}
          </div>

          {/* Pin Verde de Ubicación Teardrop (Figma wireframe) */}
          <div 
            className="absolute pointer-events-none transition-all duration-300 ease-out z-20 flex flex-col items-center"
            style={{
              left: `calc(${(pinPosition.col / 6) * 100}% + 8.33% - 14px)`,
              top: `calc(${(pinPosition.row / 8) * 100}% + 6.25% - 28px)`,
            }}
          >
            {/* Ícono de Pin verde con círculo blanco interno */}
            <div className="relative">
              <svg className="w-7 h-7 text-brand-800 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Etiqueta flotante de Cuadrante */}
          <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-brand-800 shadow-2xs border border-white/60">
            Cuadrante San Borja · Sector 4
          </div>
        </div>

        {/* Input: Arrastra el pin hasta tu casa */}
        <div className="mt-3">
          <div className="rounded-xl bg-white border border-surface-border px-3.5 py-3 shadow-2xs flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink-primary truncate">
              {address}
            </span>
            <span className="text-[11px] text-ink-muted ml-2 shrink-0">
              Arrastra o toca el plano
            </span>
          </div>
        </div>
      </div>

      {/* Botón Guardar Domicilio */}
      <div className="w-full pb-1 pt-3">
        <button
          onClick={() => onSaveDomicilio({
            address,
            lat: -12.0905 + (pinPosition.row * 0.001),
            lng: -76.9902 + (pinPosition.col * 0.001),
            quadrantName: 'San Borja - Sector 4'
          })}
          className="w-full py-3.5 px-5 rounded-xl bg-brand-800 hover:bg-brand-900 active:scale-[0.99] text-white font-semibold text-[15px] shadow-xs transition flex items-center justify-center cursor-pointer"
        >
          Guardar domicilio
        </button>
      </div>
    </div>
  );
};
