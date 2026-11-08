import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { mobileApiService } from '../services/api';
import { formatearCelularInternacional } from '../utils/phone';

interface Props {
  phone: string;
  devCode?: string;
  canal?: 'SMS' | 'WHATSAPP';
  mode?: 'login' | 'register';
  onBack: () => void;
  onVerify: () => void;
}

export const OtpScreen: React.FC<Props> = ({
  phone,
  devCode,
  canal = 'SMS',
  mode = 'login',
  onBack,
  onVerify,
}) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [codigoActual, setCodigoActual] = useState(devCode || mobileApiService.getUltimoCodigoOtp() || '1234');

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (devCode) {
      setCodigoActual(devCode);
    }
  }, [devCode]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1);
    setDigits(newDigits);
    setErrorMessage('');

    if (clean && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isReady = digits.every(d => d.length === 1);

  const handleVerifyPress = async () => {
    if (!isReady || isVerifying) return;
    setIsVerifying(true);
    setErrorMessage('');
    try {
      const code = digits.join('');
      const resp = await mobileApiService.verificarCodigo(code, phone);
      if (resp.valido) {
        setIsVerifying(false);
        onVerify();
      } else {
        setIsVerifying(false);
        setErrorMessage(resp.mensaje || 'El código ingresado es incorrecto.');
      }
    } catch (err: unknown) {
      setIsVerifying(false);
      setErrorMessage(err instanceof Error ? err.message : 'El código ingresado es incorrecto.');
    }
  };

  const handleResendPress = async () => {
    if (isResending) return;
    setIsResending(true);
    setErrorMessage('');
    try {
      const resp = await mobileApiService.solicitarCodigo(phone || '987654321', canal);
      if (resp?.devCode) {
        setCodigoActual(resp.devCode);
      }
      setDigits(['', '', '', '']);
      setCountdown(30);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'No pudimos reenviar el código.');
    } finally {
      setIsResending(false);
    }
  };

  const handleQuickFill = () => {
    const chars = (codigoActual || '1234').slice(0, 4).split('');
    if (chars.length === 4) {
      setDigits(chars);
    } else {
      setDigits(['1', '2', '3', '4']);
    }
    setErrorMessage('');
  };

  const telefonoFormateado = phone?.includes('@')
    ? phone
    : formatearCelularInternacional(phone || '987654321');

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Atrás</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Ingresa el código</Text>
        <Text style={styles.subtitle}>
          Enviamos 4 dígitos por {canal === 'WHATSAPP' ? 'WhatsApp' : 'mensaje de texto (SMS)'} a tu celular.{mode === 'login' ? ' Luego escanearás tu DNI para ingresar.' : ''}
        </Text>

        <View style={styles.phoneBox}>
          <Text style={styles.phoneLabel}>Número de celular</Text>
          <View style={styles.phoneBoxRow}>
            <Text style={styles.phoneNumber}>{telefonoFormateado}</Text>
            <View style={styles.channelBadge}>
              <Text style={styles.channelBadgeText}>{canal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.otpRow}>
          {[0, 1, 2, 3].map((i) => (
            <TextInput
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              style={styles.otpBox}
              maxLength={1}
              keyboardType="number-pad"
              value={digits[i]}
              onChangeText={(val) => handleChange(i, val)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleQuickFill} style={styles.quickFill}>
          <Text style={styles.quickFillText}>
            {canal} Recibido: {codigoActual} (Toca para autollenar)
          </Text>
        </TouchableOpacity>

        {Boolean(errorMessage) && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {countdown > 0 ? (
          <Text style={styles.timer}>
            Reenviar código en 0:{countdown < 10 ? `0${countdown}` : countdown}
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResendPress} disabled={isResending} style={styles.resendBtn}>
            <Text style={styles.resendBtnText}>
              {isResending ? 'Reenviando código...' : `Reenviar código por ${canal}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.verifyButton, (!isReady || isVerifying) && styles.buttonDisabled]} 
        onPress={handleVerifyPress}
        disabled={!isReady || isVerifying}
        activeOpacity={0.85}
      >
        <Text style={[styles.verifyButtonText, (!isReady || isVerifying) && styles.buttonDisabledText]}>
          {isVerifying
            ? 'Verificando...'
            : mode === 'login'
              ? 'Verificar código y continuar al DNI'
              : 'Verificar y entrar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
    backgroundColor: '#f6f8f5',
  },
  backButton: {
    paddingVertical: 4,
    marginBottom: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#144e40',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#141c18',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#4e5650',
    marginBottom: 16,
  },
  phoneBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  phoneLabel: {
    fontSize: 11,
    color: '#717b73',
    marginBottom: 2,
  },
  phoneBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141c18',
  },
  channelBadge: {
    backgroundColor: '#e3f2ec',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  channelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#144e40',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  otpBox: {
    width: 56,
    height: 58,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d5dbd3',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#141c18',
  },
  quickFill: {
    padding: 8,
    backgroundColor: '#e3f2ec',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  quickFillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#144e40',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  timer: {
    fontSize: 12,
    color: '#717b73',
    textAlign: 'center',
  },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  resendBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#144e40',
  },
  verifyButton: {
    backgroundColor: '#144e40',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ded8cc',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabledText: {
    color: '#787165',
  },
});
