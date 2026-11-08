import React, { useState } from 'react';
import type { UserFormData, EmergencyAlert } from '../types';

interface BarrioHomeScreenProps {
  userData: UserFormData;
  onLogout: () => void;
}

export const BarrioHomeScreen: React.FC<BarrioHomeScreenProps> = ({
  userData,
  onLogout
}) => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([
    {
      id: 'alt-1',
      userName: 'Carlos Mendoza (Coordinador)',
      type: 'SOSPECHA',
      title: 'Vehículo sospechoso sin placa',
      description: 'Auto negro polarizado rondando la esquina de Jacarandá con Las Acacias.',
      time: 'Hace 15 min',
      status: 'ACTIVA'
    }
  ]);

  const [panicSent, setPanicSent] = useState(false);

  const handleTriggerPanic = () => {
    setPanicSent(true);
    const newAlert: EmergencyAlert = {
      id: `alt-${Date.now()}`,
      userName: `${userData.firstName || 'Ana María'} ${userData.lastName || 'Quispe Ramos'}`,
      type: 'PANIC',
      title: '¡ALERTA DE EMERGENCIA ACTIVADA!',
      description: `Alerta comunitaria emitida en ${userData.addressText || 'Jr. Jacarandá 342'}`,
      time: 'Ahora mismo',
      status: 'ACTIVA'
    };
    setAlerts([newAlert, ...alerts]);
  };

  return (
    <div className="flex flex-col h-full bg-surface-bg select-none overflow-y-auto">
      {/* Cabecera Comunal */}
      <div className="bg-brand-800 text-white px-6 pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <img 
              src="/app-icon.png" 
              alt="VECI" 
              className="w-9 h-9 rounded-xl shadow-xs border border-white/20"
            />
            <div>
              <span className="text-[10px] uppercase tracking-wider text-brand-200 font-semibold block">
                VECI · Red Vecinal Activa
              </span>
              <h2 className="text-[15px] font-bold text-white">
                {userData.quadrantName || 'San Borja · Sector 4'}
              </h2>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition cursor-pointer"
          >
            Salir
          </button>
        </div>

        {/* Saludo y Distintivo */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div>
            <p className="text-[11px] text-brand-200">Vecina conectada</p>
            <p className="text-[14px] font-bold text-white">{userData.firstName || 'Ana María'} {userData.lastName || 'Quispe Ramos'}</p>
          </div>
          <span className="text-[10px] font-medium bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full">
            DNI Verificado
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* BOTÓN DE EMERGENCIA COMUNAL (Grande y claro para todos los vecinos) */}
        <div className="rounded-2xl bg-white p-5 border border-surface-border shadow-2xs flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-wide mb-1">
            Botón de Emergencia Vecinal
          </span>
          
          <button
            onClick={handleTriggerPanic}
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center my-2 shadow-sm transition active:scale-95 cursor-pointer ${
              panicSent 
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                : 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-100'
            }`}
          >
            {panicSent ? (
              <span className="text-[12px] font-bold uppercase">¡Emitida!</span>
            ) : (
              <span className="text-[16px] font-black uppercase tracking-wider">SOS</span>
            )}
          </button>

          <p className="text-[11px] text-ink-secondary mt-1 font-normal max-w-[240px]">
            {panicSent 
              ? 'Vecinos de tu cuadrante han sido alertados.' 
              : 'Presiona para alertar a los vecinos de tu manzana en caso de urgencia.'}
          </p>
        </div>

        {/* Alertas en tu zona */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[12px] font-bold text-ink-primary uppercase tracking-wide">
              Alertas en tu zona ({alerts.length})
            </h3>
            <span className="text-[10px] text-brand-800 font-medium">Tiempo real</span>
          </div>

          <div className="flex flex-col gap-2">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="rounded-xl bg-white border border-surface-border p-3 shadow-2xs flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                    alert.type === 'PANIC' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {alert.type}
                  </span>
                  <span className="text-[10px] text-ink-muted">{alert.time}</span>
                </div>
                <h4 className="text-[12px] font-bold text-ink-primary mt-0.5">{alert.title}</h4>
                <p className="text-[11px] text-ink-secondary leading-normal">{alert.description}</p>
                <p className="text-[10px] text-ink-muted pt-1 border-t border-surface-borderLight">
                  Emitido por {alert.userName}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Central Telefónica Local */}
        <div className="rounded-xl bg-brand-50 border border-brand-200 p-3 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-brand-800">Serenazgo San Borja</p>
            <p className="text-[10px] text-ink-secondary">(01) 631-1000 · Emergencias 24/7</p>
          </div>
          <a 
            href="tel:6311000" 
            className="px-3 py-1.5 rounded-lg bg-brand-800 text-white text-[11px] font-semibold"
          >
            Llamar
          </a>
        </div>
      </div>
    </div>
  );
};
