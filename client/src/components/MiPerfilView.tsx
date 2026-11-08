import React, { useState, useEffect } from 'react';
import type { UserFormData } from '../types';
import { Lock, Zap, Smartphone, Mail, MapPin, LogOut, Check, Plus, Trash2, X } from 'lucide-react';
import { apiService } from '../services/api';

interface Props {
  userData: UserFormData;
  onLogout?: () => void;
  onNavigateRestablecer?: () => void;
}

interface OcupacionInfo {
  oficio: string;
  anios: string;
}

export const MiPerfilView: React.FC<Props> = ({ userData, onLogout, onNavigateRestablecer }) => {
  const nombreCompleto = `${userData.firstName || 'Carlos Alberto'} ${userData.lastName || 'Mendoza Ríos'}`.trim();
  const iniciales = `${(userData.firstName || 'C')[0] || 'C'}${(userData.lastName || 'M')[0] || 'M'}`.toUpperCase();
  const edadMostrada = userData.age ? `${userData.age} años` : '34 años';
  const dniEnmascarado = userData.dni && userData.dni.length >= 4
    ? `• • • • ${userData.dni.slice(-4)}`
    : '• • • • 5678';
  const zonaMostrada = userData.quadrantName || 'Urb. Los Pinos, Surco';
  const sexoMostrado = userData.gender === 'F' || userData.gender === 'Femenino' ? 'Femenino' : 'Masculino';
  const celularMostrado = userData.phone 
    ? `+51 ${userData.phone.slice(0, 3)} • • • ${userData.phone.slice(-3)}`
    : '+51 987 • • • 321';

  const [ocupacion, setOcupacion] = useState<OcupacionInfo | null>({
    oficio: 'Electricidad',
    anios: '8',
  });
  const [modalOcupacionVisible, setModalOcupacionVisible] = useState(false);
  const [formOficio, setFormOficio] = useState('Electricidad');
  const [formAnios, setFormAnios] = useState('8');

  useEffect(() => {
    apiService.obtenerOcupacion().then((data) => {
      if (data && typeof data.oficio === 'string') {
        if (data.oficio.trim() === '') {
          setOcupacion(null);
        } else {
          setOcupacion({
            oficio: data.oficio,
            anios: String(data.aniosExperiencia ?? 1),
          });
          setFormOficio(data.oficio);
          setFormAnios(String(data.aniosExperiencia ?? 1));
        }
      }
    }).catch(() => {});
  }, []);

  const [correo] = useState('No registrado');
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false);

  const abrirModalOcupacion = () => {
    setFormOficio(ocupacion?.oficio || '');
    setFormAnios(ocupacion?.anios || '');
    setModalOcupacionVisible(true);
  };

  const handleGuardarOcupacion = async () => {
    const oficioLimpio = formOficio.trim();
    if (!oficioLimpio) return;
    const aniosLimpio = formAnios.replace(/\D/g, '') || '1';
    setOcupacion({ oficio: oficioLimpio, anios: aniosLimpio });
    setModalOcupacionVisible(false);
    try {
      await apiService.actualizarOcupacion({
        oficio: oficioLimpio,
        aniosExperiencia: parseInt(aniosLimpio, 10) || 1,
        visibleDirectorio: true,
      });
    } catch (e) {
      console.warn('Error al sincronizar ocupación:', e);
    }
  };

  const handleEliminarOcupacion = async () => {
    setOcupacion(null);
    setModalOcupacionVisible(false);
    try {
      await apiService.actualizarOcupacion({
        oficio: '',
        aniosExperiencia: 0,
        visibleDirectorio: false,
      });
    } catch (e) {
      console.warn('Error al eliminar ocupación:', e);
    }
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
    <div className="flex flex-col gap-4 p-5 pb-24 select-none bg-[#f7f8f4] min-h-full">
      
      {/* 1. Cabecera Superior: Mi perfil + Verificado con DNI */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Mi perfil</h2>
        <span className="inline-flex items-center gap-1 bg-[#e6f2ed] text-[#144e40] text-xs font-bold px-3 py-1.5 rounded-full">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          Verificado con DNI
        </span>
      </div>

      {/* 2. Tarjeta Principal del Vecino */}
      <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-2xs flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-full bg-[#dce6f7] text-[#1e3a8a] flex items-center justify-center font-extrabold text-lg shrink-0">
          {iniciales}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-extrabold text-gray-900 leading-snug">{nombreCompleto}</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            {zonaMostrada} · vecino desde marzo 2026
          </p>

          {ocupacion ? (
            <button
              onClick={abrirModalOcupacion}
              className="mt-2 inline-block bg-[#f5e8c7] text-[#78350f] text-[11px] font-bold px-3 py-0.5 rounded-xl cursor-pointer hover:opacity-90 transition"
            >
              {ocupacion.oficio}
            </button>
          ) : (
            <button
              onClick={abrirModalOcupacion}
              className="mt-2 inline-flex items-center gap-1 bg-[#e6f2ed] text-[#144e40] text-[11px] font-bold px-2.5 py-0.5 rounded-xl cursor-pointer hover:opacity-90 transition"
            >
              <Plus className="w-3 h-3" />
              Añadir profesión u oficio
            </button>
          )}
        </div>
      </div>

      {/* 3. Fila de 3 Estadísticas */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-2xs">
          <span className="text-xl font-extrabold text-gray-900 block">12</span>
          <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">vistos buenos</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-2xs">
          <span className="text-xl font-extrabold text-gray-900 block">7</span>
          <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">favores hechos</span>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-2xs">
          <span className="text-xl font-extrabold text-gray-900 block">3</span>
          <span className="text-[11px] text-gray-500 leading-tight block mt-0.5">publicaciones</span>
        </div>
      </div>

      {/* 4. Sección: Mis datos (Edad, Sexo, DNI) */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-gray-900">Mis datos</h4>

        <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-2xs divide-y divide-gray-100">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs text-gray-500 font-medium">Edad</span>
            <span className="text-sm font-bold text-gray-900">{edadMostrada}</span>
          </div>

          <div className="flex items-center justify-between py-3">
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
      </div>

      {/* 5. Sección: Ocupación o profesión */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-bold text-gray-900">Ocupación o profesión</h4>
        
        {ocupacion ? (
          <div className="bg-white rounded-3xl p-4 border border-gray-200 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </div>

              <div className="min-w-0">
                <h5 className="font-extrabold text-gray-900 text-sm truncate">
                  {ocupacion.oficio}{ocupacion.anios ? ` · ${ocupacion.anios} años` : ''}
                </h5>
                <p className="text-xs text-gray-500 truncate">Visible en el directorio de Servicios</p>
              </div>
            </div>

            <button 
              onClick={abrirModalOcupacion}
              className="text-sm font-bold text-[#144e40] hover:text-[#0f3d32] px-2 py-1 transition cursor-pointer shrink-0"
            >
              Editar
            </button>
          </div>
        ) : (
          <div
            onClick={abrirModalOcupacion}
            className="bg-white rounded-3xl p-4 border border-dashed border-[#144e40] shadow-2xs flex items-center justify-between gap-3 cursor-pointer hover:bg-[#f6fbf9] transition"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#e6f2ed] text-[#144e40] flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <h5 className="font-extrabold text-gray-900 text-sm truncate">Añadir ocupación o profesión</h5>
                <p className="text-xs text-gray-500 truncate">Ofrece tu oficio a los vecinos de tu barrio</p>
              </div>
            </div>

            <span className="text-sm font-bold text-[#144e40] px-2 py-1 shrink-0">Añadir</span>
          </div>
        )}
      </div>

      {/* 6. Sección: Acceso y seguridad */}
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

        {onNavigateRestablecer && (
          <p className="text-xs text-[#144e40] font-semibold px-1 mt-0.5 leading-snug cursor-pointer hover:underline"
             onClick={onNavigateRestablecer}
          >
            ¿Ya no tienes acceso a ninguno? Restablece con tu DNI
          </p>
        )}
      </div>

      {/* 7. Sección: Mi zona */}
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

      {/* 8. Botón Cerrar Sesión */}
      {onLogout && (
        <button 
          onClick={() => setMostrarModalConfirmar(true)}
          className="mt-3 w-full py-4 rounded-3xl bg-white border border-gray-200 text-[#9e3218] font-bold text-sm text-center shadow-2xs hover:bg-gray-50 active:scale-[0.99] transition cursor-pointer"
        >
          Cerrar sesión
        </button>
      )}

      {/* Modal para Añadir / Modificar / Eliminar Ocupación */}
      {modalOcupacionVisible && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-150">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-lg font-extrabold text-gray-900">
                {ocupacion ? 'Editar ocupación o profesión' : 'Añadir ocupación o profesión'}
              </h3>
              <button onClick={() => setModalOcupacionVisible(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Tus vecinos podrán encontrarte en el directorio de Servicios de tu barrio.
            </p>

            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-900 mb-1">Profesión u oficio</label>
              <input
                type="text"
                value={formOficio}
                onChange={(e) => setFormOficio(e.target.value)}
                placeholder="Ej. Electricidad, Gasfitería, Clases..."
                className="w-full h-11 rounded-xl bg-gray-50 border border-gray-300 px-3.5 text-sm font-semibold text-gray-900 outline-none focus:border-[#144e40]"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-900 mb-1">Años de experiencia</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={formAnios}
                onChange={(e) => setFormAnios(e.target.value.replace(/\D/g, ''))}
                placeholder="Ej. 8"
                className="w-full h-11 rounded-xl bg-gray-50 border border-gray-300 px-3.5 text-sm font-semibold text-gray-900 outline-none focus:border-[#144e40]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleGuardarOcupacion}
                className="w-full py-3.5 rounded-2xl bg-[#144e40] hover:bg-[#0f3d32] text-white font-bold text-sm transition cursor-pointer"
              >
                Guardar ocupación
              </button>

              {ocupacion && (
                <button
                  onClick={handleEliminarOcupacion}
                  className="w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-[#b43b1d] border border-red-200 font-bold text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar ocupación
                </button>
              )}

              <button
                onClick={() => setModalOcupacionVisible(false)}
                className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
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
              Vas a cerrar tu sesión en Ayllu. Para volver a ingresar necesitarás validar tu acceso nuevamente.
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
