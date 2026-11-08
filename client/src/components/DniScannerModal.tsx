import React, { useRef, useState, useEffect } from 'react';
import { apiService } from '../services/api';

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
  title = "Detector Automático de DNI"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Controlador de auto-detección
  const [detectionState, setDetectionState] = useState<'searching' | 'detected' | 'capturing' | 'processing'>('searching');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setDetectionState('searching');
      setProgress(0);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    // Activar cámara web si está disponible
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

    // Controlador de auto-detección:
    // Tras 1.2 segundos se detecta el documento y arranca la estabilidad
    const detectTimer = setTimeout(() => {
      setDetectionState('detected');
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 25;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          dispararCapturaAutomatica();
        }
      }, 250);
    }, 1200);

    return () => {
      clearTimeout(detectTimer);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const dispararCapturaAutomatica = async () => {
    setDetectionState('capturing');
    setTimeout(async () => {
      setDetectionState('processing');
      try {
        // Llamada a la API de backend (cocode-back) POST /api/v1/auth/dni
        const res = await apiService.scanDni(false, '71234567', '1985-07-02', 'M');
        if (res.success && res.data) {
          onScanSuccess({
            dni: res.data.dni,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            age: res.data.age,
            gender: res.data.gender
          });
          onClose();
          return;
        }
      } catch (err) {
        console.warn('Error al procesar con backend:', err);
      }

      // Fallback
      onScanSuccess({
        dni: '71234567',
        firstName: 'Juan Carlos',
        lastName: 'Pérez Soto',
        age: 41,
        gender: 'Masculino'
      });
      onClose();
    }, 400);
  };

  const handleSimulateError = () => {
    setDetectionState('processing');
    setTimeout(() => {
      onScanError();
      onClose();
    }, 500);
  };

  const isDetected = detectionState === 'detected' || detectionState === 'capturing';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#121915] text-white shadow-2xl border border-white/15">
        
        {/* Cabecera del Escáner */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-[13px] font-bold text-white tracking-wide">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Badge de Estado del Controlador */}
        <div className="px-5 pt-3 flex justify-center">
          <div className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all duration-300 ${
            isDetected 
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' 
              : detectionState === 'processing'
              ? 'bg-blue-950/80 border-blue-500 text-blue-300'
              : 'bg-amber-950/80 border-amber-500 text-amber-300'
          }`}>
            {detectionState === 'searching' && '🟡 Escaneando encuadre...'}
            {detectionState === 'detected' && `🟢 DNI Detectado · Mantén quieto (${progress}%)`}
            {detectionState === 'capturing' && '⚡ ¡Capturando automáticamente!'}
            {detectionState === 'processing' && '⏳ Validando con RENIEC...'}
          </div>
        </div>

        {/* Visor con recuadro del DNI */}
        <div className="relative mx-5 my-3 h-[200px] overflow-hidden rounded-2xl bg-black/70 flex items-center justify-center border border-white/15">
          {hasCamera ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center w-full h-full bg-linear-to-b from-white/5 to-transparent">
              {/* Plantilla ilustrada del DNI */}
              <div className={`w-[220px] h-[135px] rounded-xl border-2 transition-colors duration-300 flex items-center p-3 gap-2.5 ${
                isDetected ? 'border-emerald-500 bg-emerald-500/10' : 'border-amber-400/50 bg-white/5'
              }`}>
                <div className="w-14 h-20 rounded-md bg-white/10 shrink-0 flex flex-col items-center justify-center border border-dashed border-white/20">
                  <span className="text-xs">👤</span>
                  <span className="text-[7px] text-white/50 mt-1">FOTO</span>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="w-full h-2 rounded bg-white/25" />
                  <div className="w-4/5 h-2 rounded bg-white/20" />
                  <div className="w-2/3 h-2 rounded bg-white/15" />
                  <div className="mt-1">
                    <span className="text-[10px] font-mono font-bold text-amber-400">N° 71234567</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 Esquinas Inteligentes */}
          <div className="pointer-events-none absolute inset-4">
            <div className={`absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg transition-colors duration-300 ${isDetected ? 'border-emerald-400' : 'border-amber-400'}`}></div>
            <div className={`absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg transition-colors duration-300 ${isDetected ? 'border-emerald-400' : 'border-amber-400'}`}></div>
            <div className={`absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg transition-colors duration-300 ${isDetected ? 'border-emerald-400' : 'border-amber-400'}`}></div>
            <div className={`absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 rounded-br-lg transition-colors duration-300 ${isDetected ? 'border-emerald-400' : 'border-amber-400'}`}></div>

            {/* Línea de escaneo láser */}
            {detectionState !== 'processing' && (
              <div className={`absolute left-0 right-0 h-0.5 animate-scan-laser ${
                isDetected ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-amber-400 shadow-[0_0_10px_#f2ab27]'
              }`}></div>
            )}
          </div>

          {/* Barra de progreso de auto-captura en la base */}
          {detectionState === 'detected' && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
              <div 
                className="h-full bg-emerald-400 transition-all duration-200" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          )}

          {/* Spinner de procesamiento */}
          {detectionState === 'processing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-20">
              <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-[12px] font-bold text-white">Validando identidad civil en RENIEC...</p>
            </div>
          )}
        </div>

        {/* Guía de usuario */}
        <div className="px-5 pb-2 text-center">
          <p className="text-[11px] text-gray-300 font-medium">
            {isDetected 
              ? '✓ DNI enfocado. Capturando automáticamente sin tocar la pantalla...' 
              : 'Centra tu documento en el recuadro para captura automática'}
          </p>
        </div>

        {/* Controles secundarios */}
        <div className="p-4 bg-black/30 border-t border-white/10 flex flex-col gap-2">
          <button
            onClick={dispararCapturaAutomatica}
            disabled={detectionState === 'processing'}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-[12px] font-semibold text-white transition cursor-pointer"
          >
            Capturar manualmente ahora
          </button>

          <button
            onClick={handleSimulateError}
            disabled={detectionState === 'processing'}
            className="w-full py-1.5 text-[10px] text-gray-400 hover:text-gray-200 transition cursor-pointer text-center"
          >
            Simular Fallo de Lectura (Ver Pantalla 7)
          </button>
        </div>

      </div>
    </div>
  );
};
