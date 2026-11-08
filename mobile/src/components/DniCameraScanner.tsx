import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { leerMrz, mismaLectura, formatearNombre, type DatosMrz } from '../utils/mrz';
import { mobileApiService, ErrorApi } from '../services/api';

export interface DniEscaneado {
  dni: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  fechaNacimiento: string;
  // true si RENIEC (via backend) confirmo los datos; false si solo se leyeron del DNI
  verificado: boolean;
}

interface DniCameraScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: DniEscaneado) => void;
  onScanError: () => void;
  title?: string;
  // En login solo se necesita el numero: no se abre un tramite de alta en el backend
  validarConBackend?: boolean;
}

type Estado = 'buscando' | 'mrz_visible' | 'confirmando' | 'validando' | 'error';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 40, 340);
const CARD_HEIGHT = Math.round(CARD_WIDTH / 1.586);
const INTENTOS_PARA_AYUDA = 18;

export const DniCameraScanner: React.FC<DniCameraScannerProps> = ({
  visible,
  onClose,
  onScanSuccess,
  onScanError,
  title = 'Escanear DNI',
  validarConBackend = true,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const activoRef = useRef(false);
  const previaRef = useRef<DatosMrz | null>(null);

  const [camaraLista, setCamaraLista] = useState(false);
  const [torch, setTorch] = useState(false);
  const [estado, setEstado] = useState<Estado>('buscando');
  const [intentos, setIntentos] = useState(0);
  const [mensajeError, setMensajeError] = useState('');
  const [sesion, setSesion] = useState(0);

  const laser = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(laser, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(laser, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, laser]);

  useEffect(() => {
    if (!visible) {
      setCamaraLista(false);
      setEstado('buscando');
      setIntentos(0);
      setMensajeError('');
      previaRef.current = null;
    }
  }, [visible]);

  // Bucle de lectura: foto -> OCR -> MRZ. Dispara solo con una lectura consistente.
  useEffect(() => {
    if (!visible || !permission?.granted || !camaraLista) return;
    activoRef.current = true;
    let timer: ReturnType<typeof setTimeout>;

    const ciclo = async () => {
      if (!activoRef.current) return;
      try {
        const foto = await cameraRef.current?.takePictureAsync({ quality: 0.7, skipProcessing: true });
        if (foto?.uri && activoRef.current) {
          const resultado = await TextRecognition.recognize(foto.uri);
          setIntentos(n => n + 1);
          const datos = leerMrz(resultado.text);

          if (datos && (datos.confiable || mismaLectura(datos, previaRef.current))) {
            activoRef.current = false;
            await finalizar(datos);
            return;
          }
          if (datos) {
            previaRef.current = datos;
            setEstado('confirmando');
          } else {
            setEstado(/<{4,}/.test(resultado.text) ? 'mrz_visible' : 'buscando');
          }
        }
      } catch (e) {
        console.warn('Error leyendo fotograma:', e);
      }
      if (activoRef.current) timer = setTimeout(ciclo, 250);
    };

    timer = setTimeout(ciclo, 500);
    return () => {
      activoRef.current = false;
      clearTimeout(timer);
    };
  }, [visible, permission?.granted, camaraLista, sesion]);

  const finalizar = async (mrz: DatosMrz) => {
    setEstado('validando');
    Vibration.vibrate(120);

    const desdeMrz: DniEscaneado = {
      dni: mrz.dni,
      firstName: formatearNombre(mrz.nombres),
      lastName: formatearNombre(`${mrz.apellidoPaterno} ${mrz.apellidoMaterno}`.trim()),
      age: String(mrz.edad),
      gender: mrz.sexo === 'F' ? 'Femenino' : 'Masculino',
      fechaNacimiento: mrz.fechaNacimiento,
      verificado: false,
    };

    if (!validarConBackend) {
      onScanSuccess(desdeMrz);
      onClose();
      return;
    }

    try {
      const respuesta = await mobileApiService.validarDni(mrz.dni, 'ESCANEO', mrz.fechaNacimiento, mrz.sexo);
      if (respuesta?.datos) {
        const d = respuesta.datos;
        onScanSuccess({
          ...desdeMrz,
          firstName: d.nombres || desdeMrz.firstName,
          lastName: `${d.apellidoPaterno ?? ''} ${d.apellidoMaterno ?? ''}`.trim() || desdeMrz.lastName,
          age: d.edad != null ? String(d.edad) : desdeMrz.age,
          verificado: !!d.verificado,
        });
      } else {
        // Sin conexion con el backend: se usan los datos impresos en el DNI
        onScanSuccess(desdeMrz);
      }
      onClose();
    } catch (e) {
      setMensajeError(e instanceof ErrorApi ? e.message : 'No pudimos validar tu DNI. Intenta nuevamente.');
      setEstado('error');
    }
  };

  const reintentar = () => {
    previaRef.current = null;
    setMensajeError('');
    setIntentos(0);
    setEstado('buscando');
    setSesion(s => s + 1);
  };

  const translateY = laser.interpolate({ inputRange: [0, 1], outputRange: [8, CARD_HEIGHT - 10] });
  const enfocado = estado === 'confirmando' || estado === 'validando';

  const textoEstado: Record<Estado, string> = {
    buscando: 'Buscando la zona de lectura del DNI...',
    mrz_visible: 'Veo el DNI. Acércalo un poco y evita reflejos',
    confirmando: 'DNI detectado. Mantén el teléfono quieto...',
    validando: validarConBackend ? 'DNI leído. Validando con RENIEC...' : 'DNI leído correctamente',
    error: 'No pudimos validar este DNI',
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {!permission?.granted ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionEmoji}>📷</Text>
            <Text style={styles.permissionTitle}>Necesitamos tu cámara</Text>
            <Text style={styles.permissionText}>
              La usamos solo para leer tu DNI. La lectura se hace en tu teléfono y no guardamos fotos.
            </Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission} activeOpacity={0.85}>
              <Text style={styles.permissionBtnText}>Dar permiso a la cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkBtn} onPress={onClose}>
              <Text style={styles.linkBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={StyleSheet.absoluteFillObject}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFillObject}
              facing="back"
              enableTorch={torch}
              autofocus="on"
              onCameraReady={() => setCamaraLista(true)}
            />

            <View style={styles.overlay}>
              <View style={styles.topBar}>
                <TouchableOpacity onPress={onClose} style={styles.circleBtn}>
                  <Text style={styles.circleBtnText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.titleBadge}>
                  <Text style={styles.titleText}>{title}</Text>
                </View>
                <TouchableOpacity onPress={() => setTorch(t => !t)} style={[styles.circleBtn, torch && styles.circleBtnActive]}>
                  <Text style={styles.circleBtnText}>⚡</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.center}>
                <Text style={styles.instruction}>Muestra el REVERSO de tu DNI</Text>

                <View style={[styles.card, { width: CARD_WIDTH, height: CARD_HEIGHT }, enfocado && styles.cardOk]}>
                  <View style={[styles.corner, styles.cTL, enfocado && styles.cornerOk]} />
                  <View style={[styles.corner, styles.cTR, enfocado && styles.cornerOk]} />
                  <View style={[styles.corner, styles.cBL, enfocado && styles.cornerOk]} />
                  <View style={[styles.corner, styles.cBR, enfocado && styles.cornerOk]} />

                  {/* Franja donde debe quedar la MRZ (las 3 lineas con <<<) */}
                  <View style={[styles.mrzBand, enfocado && styles.mrzBandOk]}>
                    <Text style={styles.mrzHint} numberOfLines={1}>I{'<'}PER········{'<<<<<<<<<<<<'}</Text>
                    <Text style={styles.mrzHint} numberOfLines={1}>······M······PER{'<<<<<<<<<<'}</Text>
                    <Text style={styles.mrzHint} numberOfLines={1}>APELLIDO{'<'}APELLIDO{'<<'}NOMBRE{'<<<'}</Text>
                  </View>

                  {estado !== 'validando' && estado !== 'error' && (
                    <Animated.View style={[styles.laser, enfocado && styles.laserOk, { transform: [{ translateY }] }]} />
                  )}

                  {estado === 'validando' && (
                    <View style={styles.processing}>
                      <ActivityIndicator size="large" color="#10b981" />
                      <Text style={styles.processingText}>{textoEstado.validando}</Text>
                    </View>
                  )}
                </View>

                <View style={[styles.statusPill, enfocado && styles.statusPillOk, estado === 'error' && styles.statusPillError]}>
                  <Text style={styles.statusText}>{textoEstado[estado]}</Text>
                </View>

                {estado !== 'error' && (
                  <Text style={styles.subHint}>Alinea las 3 líneas con «&lt;&lt;&lt;» dentro de la franja verde</Text>
                )}
              </View>

              <View style={styles.bottomBar}>
                {estado === 'error' ? (
                  <>
                    <Text style={styles.errorText}>{mensajeError}</Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={reintentar}>
                      <Text style={styles.primaryBtnText}>Volver a escanear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkBtn} onPress={onClose}>
                      <Text style={styles.linkBtnText}>Cerrar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.autoBadge}>
                      <View style={styles.dot} />
                      <Text style={styles.autoText}>Captura automática · {intentos} lecturas</Text>
                    </View>
                    {intentos >= INTENTOS_PARA_AYUDA && (
                      <TouchableOpacity
                        style={styles.linkBtn}
                        onPress={() => {
                          onClose();
                          onScanError();
                        }}
                      >
                        <Text style={styles.linkBtnText}>¿No logras escanearlo? Ingresa tus datos</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const AMARILLO = '#f2ab27';
const VERDE = '#10b981';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, backgroundColor: '#181c1a', justifyContent: 'center', alignItems: 'center', padding: 30 },
  permissionEmoji: { fontSize: 54, marginBottom: 16 },
  permissionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
  permissionText: { fontSize: 13, color: '#9ca3af', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  permissionBtn: { backgroundColor: '#144e40', paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 12 },
  permissionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'space-between', paddingVertical: 44, paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center' },
  circleBtnActive: { backgroundColor: AMARILLO },
  circleBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  titleBadge: { backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  titleText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  center: { alignItems: 'center' },
  instruction: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  card: { borderRadius: 14, borderWidth: 2, borderColor: 'rgba(242,171,39,0.6)', overflow: 'hidden', justifyContent: 'flex-end' },
  cardOk: { borderColor: VERDE },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: AMARILLO, zIndex: 5 },
  cornerOk: { borderColor: VERDE },
  cTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 14 },
  cTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 14 },
  cBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 14 },
  cBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 14 },
  mrzBand: {
    margin: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(242,171,39,0.8)',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  mrzBandOk: { borderColor: VERDE, backgroundColor: 'rgba(16,185,129,0.12)' },
  mrzHint: { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 },
  laser: { position: 'absolute', top: 0, left: 6, right: 6, height: 2.5, backgroundColor: AMARILLO },
  laserOk: { backgroundColor: VERDE },
  processing: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,25,20,0.88)', justifyContent: 'center', alignItems: 'center' },
  processingText: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 10 },
  statusPill: { marginTop: 16, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: AMARILLO },
  statusPillOk: { borderColor: VERDE, backgroundColor: 'rgba(6,78,59,0.85)' },
  statusPillError: { borderColor: '#ef4444', backgroundColor: 'rgba(127,29,29,0.85)' },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  subHint: { color: '#d1d5db', fontSize: 11, marginTop: 8, textAlign: 'center' },
  bottomBar: { alignItems: 'center', gap: 10 },
  autoBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: VERDE },
  autoText: { color: '#34d399', fontSize: 11, fontWeight: '700' },
  errorText: { color: '#fecaca', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  primaryBtn: { backgroundColor: '#144e40', paddingVertical: 14, borderRadius: 14, width: '100%', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  linkBtn: { paddingVertical: 8 },
  linkBtnText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, textDecorationLine: 'underline', textAlign: 'center' },
});
