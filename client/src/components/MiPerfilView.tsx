import React, { useState } from 'react';
import type { UserFormData } from '../types';
import { Lock, Zap, Smartphone, Mail, MapPin, LogOut } from 'lucide-react';

interface Props {
  userData: UserFormData;
  onLogout?: () => void;
  onNavigateRestablecer?: () => void;
}

export const MiPerfilView: React.FC<Props> = ({ userData, onLogout, onNavigateRestablecer }) => {
  const dniEnmascarado = userData.dni && userData.dni.length >= 8 
    ? `• • • • ${userData.dni.slice(-4)}`
    : '• • • • 5678';
  const zonaMostrada = userData.quadrantName || 'Urb. Los Pinos, Surco';
  const sexoMostrado = userData.gender === 'F' ? 'Femenino' : 'Masculino';
  const celularMostrado = userData.phone 
    ? `+51 ${userData.phone.slice(0, 3)} • • • ${userData.phone.slice(-3)}`
    : '+51 987 • • • 321';

  const [ocupacion, setOcupacion] = useState('Electricidad · 8 años');
  const [correo] = useState('No registrado');
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false);

  const handleEditarOcupacion = () => {
    const nuevo = prompt('Ingresa tu ocupación u oficio y años de experiencia:', ocupacion);
    if (nuevo) setOcupacion(nuevo);
  };

  const handleCambiarCelular = () => {
    alert('Para cambiar de celular se enviará un código de verificación por SMS.');
  };

  const handleAgregarCorreo = () => {
    prompt('Ingresa tu correo electrónico para vincularlo a tu cuenta:');
  };

  const handleActualizarZona = () => {
    alert('Para cambiar de comunidad vecinal debes verificar tu nuevo domicilio en el mapa.');
  };

  return (
    <div className="flex flex-col gap-5 p-5 pb-24 select-none bg-[#f7f8f4] min-h-full">
      
      {/* Sección 1: Datos que vienen de DNI */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-2xs divide-y divide-gray-100">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs text-gray-500 font-medium">Sexo</span>
          <span className="text-sm font-bold text-gray-900">{sexoMostrado}</span>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className="text-xs text-gray-500 font-medium">DNI</span>
          <span className="text-sm font-bold text-gray-900 tracking-wider">{dniEnmascarado}</span>
        </div>

        <div className="flex items-center gap-1.5 pt-3 text-[11px] text-gray-500 font-medium">
          <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>Vienen de tu DNI y no se pueden editar.</span>
        </div>
      </div>

      {/* Sección 2: Ocupación o profesión */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-gray-900">Ocupación o profesión</h4>
        
        <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>

            <div className="min-w-0">
              <h5 className="font-extrabold text-gray-900 text-sm truncate">{ocupacion}</h5>
              <p className="text-xs text-gray-500 truncate">Visible en el directorio de Servicios</p>
            </div>
          </div>

          <button 
            onClick={handleEditarOcupacion}
            className="text-sm font-bold text-[#144e40] hover:text-[#0f3d32] px-2 py-1 transition cursor-pointer shrink-0"
          >
            Editar
          </button>
        </div>
      </div>

      {/* Sección 3: Acceso y seguridad */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-gray-900">Acceso y seguridad</h4>
        
        <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-2xs divide-y divide-gray-100">
          
          {/* Fila Celular */}
          <div className="flex items-center justify-between pb-3.5">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Celular</p>
                <p className="text-sm font-bold text-gray-900">{celularMostrado}</p>
              </div>
            </div>
            <button 
              onClick={handleCambiarCelular}
              className="text-sm font-bold text-[#144e40] hover:text-[#0f3d32] px-2 py-1 transition cursor-pointer"
            >
              Cambiar
            </button>
          </div>

          {/* Fila Correo */}
          <div className="flex items-center justify-between pt-3.5">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Correo</p>
                <p className="text-sm font-bold text-gray-900">{correo}</p>
              </div>
            </div>
            <button 
              onClick={handleAgregarCorreo}
              className="text-sm font-bold text-[#144e40] hover:text-[#0f3d32] px-2 py-1 transition cursor-pointer"
            >
              Agregar
            </button>
          </div>

        </div>

        {/* Link Restablecer con tu DNI */}
        <p className="text-xs text-[#144e40] font-semibold px-1 mt-0.5 leading-snug cursor-pointer hover:underline"
           onClick={onNavigateRestablecer}
        >
          ¿Ya no tienes acceso a ninguno? Restablece con tu DNI
        </p>
      </div>

      {/* Sección 4: Mi zona */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-gray-900">Mi zona</h4>
        
        <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <MapPin className="w-4 h-4 text-[#144e40] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h5 className="font-extrabold text-gray-900 text-sm truncate">{zonaMostrada}</h5>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">
                Si te mudas, actualiza tu ubicación para cambiar de comunidad
              </p>
            </div>
          </div>

          <button 
            onClick={handleActualizarZona}
            className="text-sm font-bold text-[#144e40] hover:text-[#0f3d32] px-2 py-1 transition cursor-pointer shrink-0"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Botón Cerrar Sesión */}
      {onLogout && (
        <button 
          onClick={() => setMostrarModalConfirmar(true)}
          className="mt-3 w-full py-4 rounded-3xl bg-white border border-gray-200 text-[#9e3218] font-bold text-sm text-center shadow-2xs hover:bg-gray-50 active:scale-[0.99] transition cursor-pointer"
        >
          Cerrar sesión
        </button>
      )}

      {/* Modal de Confirmación "¿Estás seguro?" */}
      {mostrarModalConfirmar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-150">
            <div className="w-14 h-14 rounded-full bg-[#f9ebe6] text-[#b43b1d] flex items-center justify-center mx-auto mb-3.5">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 mb-2">¿Estás seguro?</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              Vas a cerrar tu sesión en VECI. Para volver a ingresar necesitarás validar tu acceso nuevamente.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMostrarModalConfirmar(false);
                  onLogout?.();
                }}
                className="w-full py-3.5 rounded-2xl bg-[#b43b1d] hover:bg-[#9e3218] text-white font-bold text-sm transition cursor-pointer"
              >
                Sí, cerrar sesión
              </button>

              <button
                onClick={() => setMostrarModalConfirmar(false)}
                className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
