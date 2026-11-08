import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';

interface LoginScreenProps {
  onBack: () => void;
  onOpenScanner: () => void;
  onContinue: (identificador: string) => void;
  onRegister?: () => void;
  dniScanned?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onOpenScanner,
  onContinue,
  onRegister,
  dniScanned
}) => {
  const [tab, setTab] = useState<'celular' | 'correo'>('celular');
  const [phoneNumber, setPhoneNumber] = useState('987 654 321');
  const [email, setEmail] = useState('');

  const isValid = tab === 'celular' ? phoneNumber.replace(/\s/g, '').length >= 9 : email.includes('@');

  const handleSubmit = () => {
    if (!isValid) return;
    const val = tab === 'celular' ? phoneNumber.replace(/\s/g, '') : email.trim();
    onContinue(val);
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
          Escribe tu celular o correo y te enviamos un código para entrar.
        </p>

        {/* Selector Pestañas: Celular / Correo */}
        <div className="flex bg-[#e5e7eb] p-1 rounded-xl mb-6">
          <button
            onClick={() => setTab('celular')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition cursor-pointer ${
              tab === 'celular' 
                ? 'bg-white text-gray-900 shadow-xs' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Celular
          </button>
          <button
            onClick={() => setTab('correo')}
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
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Número de celular
            </label>
            <div className="flex gap-2.5">
              <div className="w-16 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center font-bold text-sm text-gray-900">
                +51
              </div>
              <input 
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="987 654 321"
                className="flex-1 h-12 bg-white rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-900 outline-none focus:border-[#144e40]"
              />
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vecino@correo.com"
              className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-900 outline-none focus:border-[#144e40]"
            />
          </div>
        )}

        {/* Botón Enviarme el código */}
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`w-full py-3.5 bg-black text-white font-bold rounded-xl text-base transition cursor-pointer ${
            !isValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
          }`}
        >
          Enviarme el código
        </button>

        {/* Tarjeta Recuperación con DNI */}
        <div 
          onClick={onOpenScanner}
          className="mt-6 flex items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-xs hover:border-[#144e40] transition cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 mr-3.5 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-gray-900">¿Perdiste tu celular o correo?</h4>
            <p className="text-xs text-gray-500">Recupera tu cuenta escaneando tu DNI</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
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
