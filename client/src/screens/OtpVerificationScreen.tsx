import React, { useState, useEffect, useRef } from 'react';

interface OtpVerificationScreenProps {
  onBack: () => void;
  phone: string;
  onVerifySuccess: () => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  onBack,
  phone,
  onVerifySuccess
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [countdown, setCountdown] = useState<number>(30);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setErrorMessage('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = digits.every(d => d !== '');

  const handleVerify = () => {
    setIsVerifying(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsVerifying(false);
      onVerifySuccess();
    }, 600);
  };

  const handleQuickFill = () => {
    setDigits(['1', '2', '3', '4']);
    setErrorMessage('');
  };

  return (
    <div className="flex flex-col justify-between h-full px-6 py-6 bg-surface-bg select-none">
      {/* Contenido Superior */}
      <div className="flex flex-col">
        {/* Enlace Atrás (Figma: ‹ Atrás) */}
        <button
          onClick={onBack}
          className="self-start text-[13px] font-medium text-ink-primary hover:text-brand-800 mb-2 -ml-0.5 py-0.5 transition cursor-pointer"
        >
          ‹ Atrás
        </button>

        {/* Título de Pantalla */}
        <h2 className="text-[22px] font-bold text-ink-primary tracking-tight mb-1">
          Ingresa el código
        </h2>
        
        {/* Subtítulo */}
        <p className="text-[12px] text-ink-secondary leading-normal mb-4">
          Enviamos 4 dígitos por mensaje de texto a tu celular.
        </p>

        {/* Caja de Número de Celular */}
        <div className="mb-5">
          <label className="block text-[11px] font-medium text-ink-primary mb-1">
            Número de celular
          </label>
          <div className="w-full rounded-xl bg-white border border-surface-border px-3.5 py-2.5 text-[13px] font-medium text-ink-primary shadow-2xs">
            {phone || '987 654 321'}
          </div>
        </div>

        {/* 4 Cajitas Grandes de Dígitos OTP (Figma wireframe 6) */}
        <div className="flex justify-between gap-3 mb-4">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-15 rounded-xl bg-white border border-surface-border text-center text-[22px] font-bold text-ink-primary focus:border-brand-800 focus:outline-none transition shadow-2xs"
            />
          ))}
        </div>

        {/* Notificación rápida de demostración */}
        <div 
          onClick={handleQuickFill}
          className="self-center inline-flex items-center gap-1.5 text-[11px] text-brand-800 bg-brand-100 hover:bg-brand-200 px-3 py-1 rounded-full cursor-pointer transition mb-2"
        >
          <span>SMS Recibido: <strong>1234</strong> (Toca para autollenar)</span>
        </div>

        {errorMessage && (
          <p className="text-[11px] text-red-600 font-medium text-center mb-2">
            {errorMessage}
          </p>
        )}

        {/* Temporizador */}
        <div className="text-center pt-2">
          {countdown > 0 ? (
            <p className="text-[12px] text-ink-muted font-normal">
              Reenviar código en <span className="font-semibold text-ink-secondary">0:{countdown < 10 ? `0${countdown}` : countdown}</span>
            </p>
          ) : (
            <button
              onClick={() => setCountdown(30)}
              className="text-[12px] font-semibold text-brand-800 hover:underline cursor-pointer"
            >
              Reenviar código por SMS
            </button>
          )}
        </div>
      </div>

      {/* Botón Inferior: Verificar */}
      <div className="w-full pb-1">
        <button
          onClick={handleVerify}
          disabled={!isComplete || isVerifying}
          className={`w-full py-3.5 px-5 rounded-xl font-semibold text-[15px] transition flex items-center justify-center ${
            isComplete && !isVerifying
              ? 'bg-brand-800 hover:bg-brand-900 active:scale-[0.99] text-white shadow-xs cursor-pointer'
              : 'bg-surface-mutedBtn text-surface-mutedText cursor-not-allowed'
          }`}
        >
          {isVerifying ? 'Verificando...' : 'Verificar'}
        </button>
      </div>
    </div>
  );
};
