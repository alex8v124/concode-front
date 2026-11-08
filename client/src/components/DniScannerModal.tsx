import React, { useRef, useState, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import { leerMrz, formatearNombre, type DatosMrz } from '../utils/mrz';
import { apiService, ErrorApi } from '../services/api';
import { X, Upload, AlertCircle, Sparkles } from 'lucide-react';

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
  modo?: 'ALTA' | 'INGRESO';
}

export const DniScannerModal: React.FC<DniScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  onScanError,
  title = "Detector Automático de DNI (OCR)",
  modo = 'ALTA',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Estados del escáner
  const [isOcrActive, setIsOcrActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Iniciando lector de DNI...');
  const [readAttempts, setReadAttempts] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const workerRef = useRef<any>(null);
  const scanningLoopRef = useRef<boolean>(false);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 1. Inicializar Cámara y Worker de Tesseract.js para OCR en Web
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setStatusMessage('Buscando cámara...');
    iniciarCamara();

    const initTesseract = async () => {
      try {
        const worker = await createWorker('eng');
        if (mounted) {
          workerRef.current = worker;
          setStatusMessage('Apunta la cámara al REVERSO de tu DNI (zona <<<)...');
          if (scanningLoopRef.current) {
            iniciarBucleLectura();
          }
        }
      } catch (err) {
        console.warn('Error al iniciar Tesseract:', err);
        if (mounted) {
          setStatusMessage('Cámara lista. Muestra el reverso de tu DNI o sube una foto.');
        }
      }
    };

    initTesseract();

    return () => {
      mounted = false;
      scanningLoopRef.current = false;
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      detenerCamara();
    };
  }, [isOpen]);

  const iniciarCamara = () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setHasCamera(false);
      setStatusMessage('Cámara no disponible. Puedes subir una foto del DNI.');
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    })
      .then((mediaStream) => {
        setStream(mediaStream);
        setHasCamera(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        scanningLoopRef.current = true;
        if (workerRef.current) {
          iniciarBucleLectura();
        }
      })
      .catch((err) => {
        console.warn('No se pudo acceder a la cámara:', err);
        setHasCamera(false);
        setStatusMessage('Cámara no disponible o sin permiso. Puedes subir una foto del DNI.');
      });
  };

  const detenerCamara = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // 2. Bucle de Captura y Análisis de Fotogramas en Vivo
  const iniciarBucleLectura = async () => {
    if (!scanningLoopRef.current || !workerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const procesarFrame = async () => {
      if (!scanningLoopRef.current || !videoRef.current) return;

      if (videoRef.current.readyState === 4) {
        const vw = videoRef.current.videoWidth;
        const vh = videoRef.current.videoHeight;

        // Recortar la franja inferior (donde está la MRZ del DNI)
        const cropY = Math.floor(vh * 0.45);
        const cropH = Math.floor(vh * 0.55);

        canvas.width = vw;
        canvas.height = cropH;

        if (ctx) {
          ctx.drawImage(videoRef.current, 0, cropY, vw, cropH, 0, 0, vw, cropH);

          try {
            setIsOcrActive(true);
            setReadAttempts(n => n + 1);

            const result = await workerRef.current.recognize(canvas);
            const text = result?.data?.text || '';

            // Analizar texto con el parser MRZ de DNI peruano
            const datosMrz = leerMrz(text);

            if (datosMrz && datosMrz.dni) {
              scanningLoopRef.current = false;
              await procesarDniLeido(datosMrz);
              return;
            }

            if (/<{3,}/.test(text)) {
              setStatusMessage('DNI detectado. Mantén la cámara firme y sin reflejos...');
            } else {
              setStatusMessage('Buscando las 3 líneas «<<<» del reverso del DNI...');
            }
          } catch (e) {
            console.warn('Error en frame OCR:', e);
          } finally {
            setIsOcrActive(false);
          }
        }
      }

      if (scanningLoopRef.current) {
        setTimeout(procesarFrame, 600);
      }
    };

    setTimeout(procesarFrame, 1000);
  };

  // 3. Procesar archivo de imagen cargado manualmente (foto DNI)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrActive(true);
    setStatusMessage('Analizando imagen del DNI con OCR...');
    setErrorMessage('');

    try {
      if (!workerRef.current) {
        workerRef.current = await createWorker('eng');
      }
      const result = await workerRef.current.recognize(file);
      const text = result?.data?.text || '';
      const datosMrz = leerMrz(text);

      if (datosMrz && datosMrz.dni) {
        await procesarDniLeido(datosMrz);
      } else {
        setErrorMessage('No se encontró una zona MRZ válida en la imagen. Asegúrate de mostrar el reverso del DNI.');
        setStatusMessage('Error de lectura.');
      }
    } catch (err) {
      console.warn('Error al procesar archivo:', err);
      setErrorMessage('Error al procesar la imagen del DNI.');
    } finally {
      setIsOcrActive(false);
    }
  };

  // 4. Validar Datos con el Backend Spring Boot y Culminar
  const procesarDniLeido = async (mrz: DatosMrz) => {
    setStatusMessage('¡DNI leído con éxito! Verificando con RENIEC...');
    setIsOcrActive(true);
    setErrorMessage('');

    try {
      const res = await apiService.validarDni(mrz.dni, 'ESCANEO', mrz.fechaNacimiento, mrz.sexo);

      if (modo === 'INGRESO') {
        setErrorMessage('Este DNI aún no tiene una cuenta registrada en DeBarrio. Regístrate primero.');
        setStatusMessage('DNI no registrado.');
        setIsOcrActive(false);
        return;
      }

      if (res && res.datos) {
        onScanSuccess({
          dni: res.datos.dni || mrz.dni,
          firstName: res.datos.nombres || formatearNombre(mrz.nombres),
          lastName: `${res.datos.apellidoPaterno || mrz.apellidoPaterno} ${res.datos.apellidoMaterno || mrz.apellidoMaterno}`.trim(),
          age: mrz.edad || res.datos.edad,
          gender: (mrz.sexo || res.datos.sexo) === 'F' ? 'Femenino' : 'Masculino'
        });
        onClose();
        return;
      }
    } catch (err: any) {
      if (err instanceof ErrorApi) {
        if (modo === 'ALTA' && (err.codigo === 'DNI_REGISTRADO' || err.codigo === 'MENOR_DE_EDAD')) {
          setErrorMessage(err.message || 'Este DNI ya está registrado en DeBarrio. Inicia sesión.');
          setStatusMessage('DNI ya registrado.');
          setIsOcrActive(false);
          return;
        }
        if (modo === 'INGRESO' && err.codigo === 'DNI_REGISTRADO') {
          let reniec = null;
          try {
            reniec = await apiService.consultarReniec(mrz.dni);
          } catch {}
          onScanSuccess({
            dni: mrz.dni,
            firstName: reniec?.nombres || formatearNombre(mrz.nombres),
            lastName: reniec ? `${reniec.apellidoPaterno} ${reniec.apellidoMaterno}`.trim() : formatearNombre(`${mrz.apellidoPaterno} ${mrz.apellidoMaterno}`.trim()),
            age: mrz.edad || 25,
            gender: mrz.sexo === 'F' ? 'Femenino' : 'Masculino'
          });
          onClose();
          return;
        }
      }
      console.warn('Error al validar con backend:', err);
    }

    let reniec = null;
    try {
      reniec = await apiService.consultarReniec(mrz.dni);
    } catch {}

    // Fallback: Si el backend no es alcanzable, continuar con datos de RENIEC/OCR
    onScanSuccess({
      dni: mrz.dni,
      firstName: reniec?.nombres || formatearNombre(mrz.nombres),
      lastName: reniec ? `${reniec.apellidoPaterno} ${reniec.apellidoMaterno}`.trim() : formatearNombre(`${mrz.apellidoPaterno} ${mrz.apellidoMaterno}`.trim()),
      age: mrz.edad || 25,
      gender: mrz.sexo === 'F' ? 'Femenino' : 'Masculino'
    });
    onClose();
  };

  // Simulación rápida para pruebas
  const handleSimularLectura = () => {
    procesarDniLeido({
      dni: '72407570',
      nombres: 'JUAN ALEXANDER',
      apellidoPaterno: 'MIRANDA',
      apellidoMaterno: 'QUISPE',
      edad: 25,
      sexo: 'M',
      fechaNacimiento: '2001-08-22',
      fechaExpiracion: '2031-08-22',
      controles: { documento: true, nacimiento: true, expiracion: true, compuesto: true },
      confiable: true
    });
  };

  // ¡CRUCIAL!: Si no está abierto, NO renderizar nada
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs select-none animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#121915] text-white shadow-2xl border border-white/15"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Cabecera del Escáner */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-[13px] font-bold text-white tracking-wide">{title}</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Badge de Estado del Lector OCR */}
        <div className="px-5 pt-3 flex flex-col items-center">
          <div className="px-3 py-1 rounded-full text-[11px] font-bold border transition-all duration-300 bg-emerald-950/80 border-emerald-500 text-emerald-300 text-center">
            {statusMessage}
          </div>
          {readAttempts > 0 && (
            <span className="text-[9px] text-gray-400 mt-1">Lecturas analizadas: {readAttempts}</span>
          )}
        </div>

        {/* Visor con marco del DNI */}
        <div className="relative mx-5 my-3 h-[210px] overflow-hidden rounded-2xl bg-black/70 flex items-center justify-center border border-white/15">
          {hasCamera ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center w-full h-full bg-gradient-to-b from-white/5 to-transparent">
              <div className="w-[220px] h-[135px] rounded-xl border-2 border-emerald-500/60 bg-white/5 flex flex-col justify-end p-2.5">
                <div className="bg-emerald-950/50 border border-emerald-500/40 p-1.5 rounded text-[8px] font-mono text-emerald-300">
                  <p>I&lt;PER········&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                  <p>······M······PER&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                  <p>APELLIDO&lt;APELLIDO&lt;&lt;NOMBRE&lt;&lt;&lt;</p>
                </div>
              </div>
            </div>
          )}

          {/* 4 Esquinas de Enfoque */}
          <div className="pointer-events-none absolute inset-4">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg border-emerald-400"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg border-emerald-400"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg border-emerald-400"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 rounded-br-lg border-emerald-400"></div>

            {/* Línea de escaneo láser animada */}
            <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-scan-laser"></div>
          </div>

          {/* Overlay de procesamiento OCR */}
          {isOcrActive && (
            <div className="absolute bottom-2 left-2 right-2 bg-black/80 rounded-lg py-1 px-2 flex items-center justify-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] text-emerald-300 font-semibold">Leyendo caracteres MRZ...</span>
            </div>
          )}
        </div>

        {/* Mensaje de Error si lo hay */}
        {errorMessage && (
          <div className="mx-5 mb-2 p-2 rounded-lg bg-red-950/80 border border-red-500 text-red-200 text-[11px] text-center flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Guía para el usuario */}
        <div className="px-5 pb-2 text-center">
          <p className="text-[11px] text-gray-300 font-medium">
            Coloca el <strong>reverso del DNI</strong> frente a la cámara. El OCR leerá las líneas automáticamente.
          </p>
        </div>

        {/* Controles de prueba e ingreso alternativo */}
        <div className="p-4 bg-black/30 border-t border-white/10 flex flex-col gap-2">
          {/* Opción de simulación rápida con DNI real de prueba */}
          <button
            type="button"
            onClick={handleSimularLectura}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-[12px] font-bold text-white transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>⚡ Simular escaneo de prueba (DNI 72407570)</span>
          </button>

          {/* Opción de subir foto del DNI para prueba directa */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-[12px] font-semibold text-white transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir foto del reverso del DNI</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onScanError();
            }}
            className="w-full py-1 text-[11px] text-gray-400 hover:text-gray-200 transition cursor-pointer text-center"
          >
            ¿Problemas con el escáner? Ingresar manualmente
          </button>
        </div>

      </div>
    </div>
  );
};
