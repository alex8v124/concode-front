import React, { useState } from 'react';
import { ChevronLeft, MessageSquare, ShieldCheck, Smartphone } from 'lucide-react';
import {
  formatearCelularAlEscribir,
  esCelularPeruValido,
  limpiarDigitosCelularPeru,
} from '../utils/phone';

interface LoginScreenProps {
  onBack: () => void;
  onOpenScanner?: () => void;
  onContinue: (identificador: string, canal?: 'SMS' | 'WHATSAPP') => Promise<void> | void;
  onRegister?: () => void;
  dniScanned?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onContinue,
  onRegister,
}) => {
  const [tab, setTab] = useState<'celular' | 'correo'>('celular');
  const [phoneNumber, setPhoneNumber] = useState('987 654 321');
  const [canal, setCanal] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const digitosCelular = limpiarDigitosCelularPeru(phoneNumber);
  const celularValido = esCelularPeruValido(phoneNumber);
  const isValid = tab === 'celular' ? celularValido : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setPhoneNumber(formatearCelularAlEscribir(e.target.value));
  };

  const handleSubmit = async () => {
    if (!isValid || isSending) return;
    setErrorMsg('');
    setIsSending(true);
    try {
      const val = tab === 'celular' ? digitosCelular : email.trim();
      await onContinue(val, canal);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'No pudimos enviar el código. Intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full px-6 py-6 bg-[#f7f8f4] select-none overflow-y-auto">
      <div>
        {/* Botón Atrás */}
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-gray-700 hover:bg-gray-100 mb-5 transition cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Título y Subtítulo */}
        <h2 className="text-2xl font-black text-gray-900 mb-1.5 tracking-tight">
          Hola de nuevo, vecino
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Paso 1 de 2 · Ingresa tu celular o correo para recibir tu código de verificación. Luego confirmarás tu identidad escaneando tu DNI.
        </p>

        {/* Selector Pestañas: Celular / Correo */}
        <div className="flex bg-[#e5e7eb] p-1 rounded-xl mb-6">
          <button
            onClick={() => {
              setTab('celular');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition cursor-pointer ${
              tab === 'celular' 
                ? 'bg-white text-gray-900 shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Celular
          </button>
          <button
            onClick={() => {
              setTab('correo');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition cursor-pointer ${
              tab === 'correo' 
                ? 'bg-white text-gray-900 shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Correo
          </button>
        </div>

        {/* Inputs */}
        {tab === 'celular' ? (
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Número de celular
            </label>
            <div className="flex gap-2.5">
              <div className="w-16 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-900">
                +51
              </div>
              <input 
                type="tel"
                inputMode="numeric"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="987 654 321"
                className={`flex-1 h-12 bg-white rounded-xl border px-4 text-sm font-medium text-gray-900 outline-none transition ${
                  digitosCelular.length > 0 && !celularValido
                    ? 'border-amber-500 focus:border-amber-600'
                    : 'border-gray-200 focus:border-[#144e40]'
                }`}
              />
            </div>
            {digitosCelular.length > 0 && !digitosCelular.startsWith('9') && (
              <p className="text-[11px] text-amber-700 mt-1.5 font-medium">
                El número de celular en Perú debe empezar con 9 y tener 9 dígitos.
              </p>
            )}

            {/* Selector de Canal de Envío: SMS o WhatsApp */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Recibir por:</span>
              <button
                type="button"
                onClick={() => setCanal('SMS')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  canal === 'SMS'
                    ? 'bg-[#144e40] text-white border-[#144e40]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                SMS
              </button>
              <button
                type="button"
                onClick={() => setCanal('WHATSAPP')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  canal === 'WHATSAPP'
                    ? 'bg-[#144e40] text-white border-[#144e40]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                WhatsApp
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Correo electrónico
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => {
                setErrorMsg('');
                setEmail(e.target.value);
              }}
              placeholder="vecino@correo.com"
              className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-900 outline-none focus:border-[#144e40]"
            />
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-red-600 font-medium mb-3 text-center">
            {errorMsg}
          </p>
        )}

        {/* Botón Enviarme el código */}
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSending}
          className={`w-full py-3.5 bg-black text-white font-bold rounded-xl text-base transition cursor-pointer ${
            !isValid || isSending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
          }`}
        >
          {isSending ? 'Enviando código...' : 'Enviarme el código'}
        </button>

        {/* Banner de Verificación en 2 Pasos (2FA) */}
        <div className="mt-6 flex items-center bg-[#eef6f2] p-4 rounded-2xl border border-[#cde4d8]">
          <div className="w-10 h-10 rounded-xl bg-[#d6eee2] flex items-center justify-center text-[#144e40] mr-3.5 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-gray-900">Acceso seguro en 2 pasos (2FA)</h4>
            <p className="text-xs text-gray-600">1. Verificamos tu código · 2. Escaneas tu DNI para entrar</p>
          </div>
        </div>
      </div>

      {/* Footer Crea tu cuenta */}
      <div className="text-center py-4">
        <span className="text-sm text-gray-500">¿Eres nuevo? </span>
        <button 
          onClick={onRegister}
          className="text-sm font-bold text-[#144e40] hover:underline cursor-pointer"
        >
          Crea tu cuenta
        </button>
      </div>
    </div>
  );
};
