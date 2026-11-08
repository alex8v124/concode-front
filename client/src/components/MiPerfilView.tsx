import React, { useState } from 'react';
import type { UserFormData } from '../types';
import { Check, Lock, Zap, LogOut } from 'lucide-react';

interface Props {
  userData: UserFormData;
  onLogout?: () => void;
}

export const MiPerfilView: React.FC<Props> = ({ userData, onLogout }) => {
  const nombreMostrado = `${userData.firstName || 'Carlos Alberto'} ${userData.lastName || 'Mendoza Ríos'}`.trim();
  const iniciales = `${userData.firstName?.[0] || 'C'}${userData.lastName?.[0] || 'M'}`.toUpperCase();
  const dniEnmascarado = userData.dni && userData.dni.length >= 8 
    ? `•••• ${userData.dni.slice(-4)}`
    : '•••• 5678';
  const zonaMostrada = userData.quadrantName || 'Urb. Los Pinos, Surco';
  const edadMostrada = userData.age ? `${userData.age} años` : '34 años';
  const sexoMostrado = userData.gender === 'F' ? 'Femenino' : 'Masculino';

  const [ocupacion, setOcupacion] = useState('Electricidad · 8 años');

  const handleEditarOcupacion = () => {
    const nuevo = prompt('Ingresa tu ocupación u oficio y años de experiencia:', ocupacion);
    if (nuevo) setOcupacion(nuevo);
  };

  return (
    <div className="flex flex-col gap-4 p-5 pb-24 select-none">
      
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mi perfil</h1>
        <div className="flex items-center gap-1.5 bg-[#d6eee2] text-[#144e40] px-3 py-1 rounded-full text-xs font-bold shadow-2xs">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Verificado con DNI</span>
        </div>
      </div>

      {/* Tarjeta de Usuario */}
      <div className="bg-white rounded-3xl p-4.5 border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#e0e7fb] text-[#2b4290] flex items-center justify-center font-black text-xl shrink-0">
          {iniciales}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-gray-900 text-[17px] truncate">{nombreMostrado}</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {zonaMostrada} · vecino desde marzo 2026
          </p>
          <span className="inline-block mt-2 bg-[#ffedd5] text-[#9a3412] text-[11px] font-bold px-2.5 py-0.5 rounded-md">
            Electricista
          </span>
        </div>
      </div>

      {/* Fila de Estadísticas Comunitarias */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 text-center border border-gray-200 shadow-2xs">
          <span className="block text-lg font-black text-gray-900">12</span>
          <span className="block text-[11px] text-gray-500 font-medium mt-0.5">vistos buenos</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 text-center border border-gray-200 shadow-2xs">
          <span className="block text-lg font-black text-gray-900">7</span>
          <span className="block text-[11px] text-gray-500 font-medium mt-0.5">favores hechos</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 text-center border border-gray-200 shadow-2xs">
          <span className="block text-lg font-black text-gray-900">3</span>
          <span className="block text-[11px] text-gray-500 font-medium mt-0.5">publicaciones</span>
        </div>
      </div>

      {/* Sección: Mis Datos */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-gray-900">Mis datos</h4>
        
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs divide-y divide-gray-100">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs text-gray-500 font-medium">Edad</span>
            <span className="text-sm font-bold text-gray-900">{edadMostrada}</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-gray-500 font-medium">Sexo</span>
            <span className="text-sm font-bold text-gray-900">{sexoMostrado}</span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-xs text-gray-500 font-medium">DNI</span>
            <span className="text-sm font-bold text-gray-900">{dniEnmascarado}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-1 text-[11px] text-gray-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Vienen de tu DNI y no se pueden editar</span>
        </div>
      </div>

      {/* Sección: Ocupación o profesión */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-gray-900">Ocupación o profesión</h4>
        
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>

          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-gray-900 text-sm truncate">{ocupacion}</h5>
            <p className="text-xs text-gray-500 truncate">Visible en el directorio de Servicios</p>
          </div>

          <button 
            onClick={handleEditarOcupacion}
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition cursor-pointer"
          >
            Editar
          </button>
        </div>
      </div>

      {/* Cerrar Sesión */}
      {onLogout && (
        <button 
          onClick={onLogout}
          className="mt-2 w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      )}

    </div>
  );
};
