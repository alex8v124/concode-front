import React, { useRef, useState, useEffect } from 'react';

interface DniScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: {
    dni: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
  }) => void;
  onScanError: () => void;
  title?: string;
}

export const DniScannerModal: React.FC<DniScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  onScanError,
  title = "Escanea tu DNI"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
          setStream(mediaStream);
          setHasCamera(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch(() => {
          setHasCamera(false);
        });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateSuccess = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onScanSuccess({
        dni: '00000000',
        firstName: 'Ana María',
        lastName: 'Quispe Ramos',
        age: 34,
        gender: 'Femenino'
      });
      onClose();
    }, 700);
  };

  const handleSimulateError = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onScanError();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-surface-scanner text-white shadow-2xl border border-white/10">
        
        {/* Cabecera del Escáner */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-[14px] font-bold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Visor con marco de esquinas amarillas (Figma wireframe) */}
        <div className="relative mx-4 my-2 h-[180px] overflow-hidden rounded-xl bg-black/60 flex items-center justify-center border border-white/10">
          {hasCamera ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              {/* Silueta simulada del DNI peruano */}
              <div className="w-[180px] h-[110px] rounded-lg border border-dashed border-white/30 flex items-center p-3 gap-2 bg-white/5">
                <div className="w-12 h-16 rounded bg-white/10 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="w-full h-2 rounded bg-white/20" />
                  <div className="w-3/4 h-2 rounded bg-white/20" />
                  <div className="w-1/2 h-2 rounded bg-white/15" />
                </div>
              </div>
            </div>
          )}

          {/* 4 Esquinas amarillas exactas */}
          <div className="pointer-events-none absolute inset-3">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-[2.5px] border-l-[2.5px] border-accent-yellow"></div>
            <div className="absolute top-0 right-0 w-5 h-5 border-t-[2.5px] border-r-[2.5px] border-accent-yellow"></div>
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-[2.5px] border-l-[2.5px] border-accent-yellow"></div>
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-[2.5px] border-r-[2.5px] border-accent-yellow"></div>

            {/* Línea de escaneo láser */}
            <div className="absolute left-0 right-0 h-0.5 bg-accent-yellow shadow-[0_0_8px_#f2ab27] animate-scan-laser"></div>
          </div>

          {/* Feedback de lectura */}
          {isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <div className="w-6 h-6 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-[12px] font-semibold text-white">Leyendo DNI...</p>
            </div>
          )}
        </div>

        {/* Instrucciones amigables */}
        <div className="px-5 py-2 text-center">
          <p className="text-[12px] text-gray-300 font-normal">
            Coloca el frente de tu DNI dentro del recuadro
          </p>
        </div>

        {/* Acciones para prueba rápida */}
        <div className="p-4 pt-1 bg-black/40 border-t border-white/5 flex flex-col gap-2">
          <button
            onClick={handleSimulateSuccess}
            disabled={isScanning}
            className="w-full py-2.5 px-4 rounded-xl bg-accent-yellow hover:bg-accent-yellowHover active:scale-[0.99] text-[13px] font-bold text-ink-primary transition cursor-pointer"
          >
            Escanear DNI de Demostración (Ana María)
          </button>

          <button
            onClick={handleSimulateError}
            disabled={isScanning}
            className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-medium text-gray-300 transition cursor-pointer"
          >
            Simular Fallo de Lectura (Ver Pantalla 7)
          </button>
        </div>

      </div>
    </div>
  );
};
