import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface DniCameraScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: {
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    dni: string;
  }) => void;
  onScanError: () => void;
  title?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 330);
const CARD_HEIGHT = Math.round(CARD_WIDTH / 1.586); // Proporción estándar DNI ID-1 (85.6mm x 53.98mm)

export const DniCameraScanner: React.FC<DniCameraScannerProps> = ({
  visible,
  onClose,
  onScanSuccess,
  onScanError,
  title = "Escanear DNI Peruano"
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [isProcessing, setIsProcessing] = useState(false);

  // Animación del láser de escaneo
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scanLineAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  const handleCapture = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onScanSuccess({
        firstName: 'Ana María',
        lastName: 'Quispe Ramos',
        age: '34',
        gender: 'Femenino',
        dni: '47892134',
      });
      onClose();
    }, 1100);
  };

  const handleSimulateError = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onScanError();
      onClose();
    }, 600);
  };

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, CARD_HEIGHT - 12],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Vista de Permiso de Cámara si no está otorgado */}
        {!permission?.granted ? (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionEmoji}>📷</Text>
            <Text style={styles.permissionTitle}>Permiso de Cámara necesario</Text>
            <Text style={styles.permissionText}>
              Para escanear tu DNI y verificar tu identidad civil con la Comuna Vecinal, necesitamos acceso a la cámara.
            </Text>
            <TouchableOpacity 
              style={styles.permissionBtn} 
              onPress={requestPermission}
              activeOpacity={0.85}
            >
              <Text style={styles.permissionBtnText}>Dar permiso a la cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={StyleSheet.absoluteFillObject}>
            {/* Cámara en Vivo */}
            <CameraView 
              style={StyleSheet.absoluteFillObject} 
              facing={facing} 
              enableTorch={torch}
            />

            {/* Máscara oscura semitransparente con recorte central */}
            <View style={styles.overlay}>
              
              {/* Barra Superior con Controles */}
              <View style={styles.topBar}>
                <TouchableOpacity onPress={onClose} style={styles.circleBtn} activeOpacity={0.8}>
                  <Text style={styles.circleBtnText}>✕</Text>
                </TouchableOpacity>

                <View style={styles.titleBadge}>
                  <Text style={styles.titleText}>{title}</Text>
                </View>

                <TouchableOpacity 
                  onPress={() => setTorch(!torch)} 
                  style={[styles.circleBtn, torch && styles.circleBtnActive]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.circleBtnText}>⚡</Text>
                </TouchableOpacity>
              </View>

              {/* Guía Visual con Recuadro y Plantilla de DNI */}
              <View style={styles.viewfinderContainer}>
                <View style={[styles.cardCutout, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
                  
                  {/* 4 Esquinas amarillas de precisión */}
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />

                  {/* Silueta y Diseño del DNI Peruano */}
                  <View style={styles.dniDesign}>
                    <Text style={styles.dniHeader}>REPÚBLICA DEL PERÚ · DNI</Text>
                    
                    <View style={styles.dniBody}>
                      {/* Área de la Foto */}
                      <View style={styles.dniPhotoBox}>
                        <Text style={styles.dniPhotoIcon}>👤</Text>
                        <Text style={styles.dniPhotoLabel}>FOTO</Text>
                      </View>

                      {/* Líneas de datos personales */}
                      <View style={styles.dniDataLines}>
                        <View style={styles.dniLineShort} />
                        <View style={styles.dniLineLong} />
                        <View style={styles.dniLineMedium} />
                        <View style={styles.dniLineDniNumber}>
                          <Text style={styles.dniSampleNumber}>N° 00000000</Text>
                        </View>
                      </View>
                    </View>

                    {/* Pie del DNI: Huella y Chip */}
                    <View style={styles.dniFooter}>
                      <Text style={styles.dniFooterText}>DOCUMENTO NACIONAL DE IDENTIDAD</Text>
                      <View style={styles.dniChipIcon} />
                    </View>
                  </View>

                  {/* Láser de Escaneo Animado */}
                  <Animated.View style={[styles.scanLaser, { transform: [{ translateY }] }]} />

                  {/* Loader si está procesando la captura */}
                  {isProcessing && (
                    <View style={styles.processingOverlay}>
                      <ActivityIndicator size="large" color="#f2ab27" />
                      <Text style={styles.processingText}>Validando DNI con RENIEC...</Text>
                    </View>
                  )}
                </View>

                {/* Mensaje de guía */}
                <View style={styles.helperPill}>
                  <Text style={styles.helperText}>
                    Centra el frente de tu DNI dentro del recuadro
                  </Text>
                </View>
              </View>

              {/* Barra Inferior con Botón de Disparo y Pruebas */}
              <View style={styles.bottomBar}>
                {/* Botón de Captura Principal */}
                <TouchableOpacity 
                  style={[styles.captureBtn, isProcessing && styles.btnDisabled]} 
                  onPress={handleCapture}
                  disabled={isProcessing}
                  activeOpacity={0.85}
                >
                  <View style={styles.captureBtnInner}>
                    <Text style={styles.captureBtnText}>📷 Capturar y Validar DNI</Text>
                  </View>
                </TouchableOpacity>

                {/* Botón secundario para simular fallo y probar pantalla 7 */}
                <TouchableOpacity 
                  style={styles.errorSimBtn}
                  onPress={handleSimulateError}
                  disabled={isProcessing}
                  activeOpacity={0.8}
                >
                  <Text style={styles.errorSimBtnText}>Simular DNI Ilegible (Pantalla 7)</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#181c1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionEmoji: {
    fontSize: 54,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionBtn: {
    backgroundColor: '#144e40',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'ios' ? 44 : 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBtnActive: {
    backgroundColor: '#f2ab27',
    borderColor: '#ffffff',
  },
  circleBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  titleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCutout: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: -1,
    left: -1,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#f2ab27',
    borderTopLeftRadius: 16,
    zIndex: 10,
  },
  cornerTR: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#f2ab27',
    borderTopRightRadius: 16,
    zIndex: 10,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#f2ab27',
    borderBottomLeftRadius: 16,
    zIndex: 10,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#f2ab27',
    borderBottomRightRadius: 16,
    zIndex: 10,
  },
  dniDesign: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
    opacity: 0.65,
  },
  dniHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  dniBody: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  dniPhotoBox: {
    width: 65,
    height: 85,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dniPhotoIcon: {
    fontSize: 28,
    opacity: 0.8,
  },
  dniPhotoLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  dniDataLines: {
    flex: 1,
    gap: 7,
  },
  dniLineShort: {
    width: '45%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dniLineLong: {
    width: '90%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dniLineMedium: {
    width: '70%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  dniLineDniNumber: {
    marginTop: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(242, 171, 39, 0.2)',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(242, 171, 39, 0.5)',
  },
  dniSampleNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f2ab27',
    letterSpacing: 1,
  },
  dniFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dniFooterText: {
    fontSize: 7,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
  },
  dniChipIcon: {
    width: 14,
    height: 10,
    borderRadius: 2,
    backgroundColor: 'rgba(242, 171, 39, 0.4)',
    borderWidth: 1,
    borderColor: '#f2ab27',
  },
  scanLaser: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: '#f2ab27',
    shadowColor: '#f2ab27',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 20,
  },
  processingText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  helperPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  helperText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: 24,
    gap: 10,
  },
  captureBtn: {
    backgroundColor: '#144e40',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5ba98f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  captureBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  errorSimBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
  },
  errorSimBtnText: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '500',
  },
});
