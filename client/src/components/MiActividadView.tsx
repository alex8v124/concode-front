import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

type TabActividad = 'publicaciones' | 'hice' | 'pedi';

export const MiActividadView: React.FC = () => {
  const [tab, setTab] = useState<TabActividad>('publicaciones');

  const [publicaciones, setPublicaciones] = useState([
    {
      id: '1',
      tipo: 'servicio',
      tipoLabel: 'Mi servicio',
      tipoBg: 'bg-[#144e40] text-white',
      estado: 'Activo',
      estadoBg: 'bg-[#d6eee2] text-[#144e40]',
      titulo: 'Electricidad · 8 años de experiencia',
      detalle: 'Visible en Servicios · 4 vecinos te contactaron esta semana',
      tipoAccion: 'servicio',
    },
    {
      id: '2',
      tipo: 'presto',
      tipoLabel: 'Presto',
      tipoBg: 'bg-[#e0e7fb] text-[#2b4290]',
      estado: 'En curso',
      estadoBg: 'bg-[#fef3c7] text-[#b45309]',
      titulo: 'Presto escalera de 3 metros',
      detalle: 'Prestada a Teresa L. hasta el domingo',
      tipoAccion: 'prestamo',
    },
    {
      id: '3',
      tipo: 'dono',
      tipoLabel: 'Dono',
      tipoBg: 'bg-[#d6eee2] text-[#144e40]',
      estado: 'Activo',
      estadoBg: 'bg-[#d6eee2] text-[#144e40]',
      titulo: 'Dono libros escolares de primaria',
      detalle: 'Publicado hace 3 días · 2 vecinos interesados',
      tipoAccion: 'donacion',
    },
  ]);

  useEffect(() => {
    apiService.listarMisPublicaciones().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setPublicaciones(data.map((d: any) => {
          const esPrestamo = d.tipo === 'presto' || d.tipoAccion === 'prestamo';
          const esDonacion = d.tipo === 'dono' || d.tipoAccion === 'donacion';
          const estado = d.estado || 'Activo';
          return {
            id: String(d.id),
            tipo: d.tipo || 'servicio',
            tipoLabel: d.tipoLabel || (esPrestamo ? 'Presto' : esDonacion ? 'Dono' : 'Mi servicio'),
            tipoBg: esPrestamo ? 'bg-[#e0e7fb] text-[#2b4290]' : esDonacion ? 'bg-[#d6eee2] text-[#144e40]' : 'bg-[#144e40] text-white',
            estado,
            estadoBg: estado === 'Activo' ? 'bg-[#d6eee2] text-[#144e40]' : estado === 'En curso' ? 'bg-[#fef3c7] text-[#b45309]' : 'bg-gray-100 text-gray-600',
            titulo: d.titulo || 'Publicación',
            detalle: d.detalle || 'Publicado en tu cuadrante',
            tipoAccion: d.tipoAccion || (esPrestamo ? 'prestamo' : esDonacion ? 'donacion' : 'servicio'),
          };
        }));
      }
    }).catch(() => {});
  }, []);

  const handlePausar = (id: string) => {
    let estadoEnviar = 'Pausado';
    setPublicaciones(prev => prev.map(p => {
      if (p.id === id) {
        const nuevo = p.estado === 'Activo' ? 'Pausado' : 'Activo';
        estadoEnviar = nuevo;
        return {
          ...p,
          estado: nuevo,
          estadoBg: nuevo === 'Activo' ? 'bg-[#d6eee2] text-[#144e40]' : 'bg-gray-100 text-gray-600',
        };
      }
      return p;
    }));
    apiService.cambiarEstadoPublicacion(id, estadoEnviar).catch(() => {});
  };

  const handleDevuelto = (id: string) => {
    setPublicaciones(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          estado: 'Completado',
          estadoBg: 'bg-gray-100 text-gray-600',
          detalle: 'Objeto devuelto en perfecto estado',
        };
      }
      return p;
    }));
    apiService.confirmarDevolucionFavor(id).catch(() => {});
    alert('Devolución registrada en el cuadrante.');
  };

  return (
    <div className="flex flex-col gap-4 p-5 pb-24 select-none">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mi actividad</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Lo que publicaste, los favores que hiciste y los que pediste
        </p>
      </div>

      {/* Segmented Control */}
      <div className="flex bg-gray-200 p-1 rounded-2xl">
        <button 
          onClick={() => setTab('publicaciones')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === 'publicaciones' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Publicaciones <span className="text-[10px] text-gray-400">3</span>
        </button>

        <button 
          onClick={() => setTab('hice')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === 'hice' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Hice <span className="text-[10px] text-gray-400">3</span>
        </button>

        <button 
          onClick={() => setTab('pedi')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            tab === 'pedi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Pedí <span className="text-[10px] text-gray-400">3</span>
        </button>
      </div>

      {/* Contenido Pestaña Publicaciones */}
      {tab === 'publicaciones' && (
        <div className="flex flex-col gap-3">
          {publicaciones.map(item => (
            <div key={item.id} className="bg-white rounded-3xl p-4.5 border border-gray-200 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${item.tipoBg}`}>
                  {item.tipoLabel}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${item.estadoBg}`}>
                  {item.estado}
                </span>
              </div>

              <h3 className="font-extrabold text-gray-900 text-[15px]">{item.titulo}</h3>
              <p className="text-xs text-gray-500">{item.detalle}</p>

              <div className="flex items-center gap-2 mt-2 pt-1">
                {item.tipoAccion === 'servicio' && (
                  <>
                    <button 
                      onClick={() => alert('Editar servicio')}
                      className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition cursor-pointer"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handlePausar(item.id)}
                      className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition cursor-pointer"
                    >
                      {item.estado === 'Activo' ? 'Pausar' : 'Reanudar'}
                    </button>
                  </>
                )}

                {item.tipoAccion === 'prestamo' && (
                  <>
                    <button 
                      onClick={() => alert('Abriendo chat con Teresa L...')}
                      className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                    >
                      Ir al chat
                    </button>
                    <button 
                      onClick={() => handleDevuelto(item.id)}
                      className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition cursor-pointer"
                    >
                      Ya me la devolvió
                    </button>
                  </>
                )}

                {item.tipoAccion === 'donacion' && (
                  <>
                    <button 
                      onClick={() => alert('Interesados:\n1. Rosa Q. · Mz. C\n2. Luis M. · Mz. A')}
                      className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                    >
                      Ver interesados
                    </button>
                    <button 
                      onClick={() => handlePausar(item.id)}
                      className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 transition cursor-pointer"
                    >
                      {item.estado === 'Activo' ? 'Pausar' : 'Reanudar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contenido Pestaña Hice */}
      {tab === 'hice' && (
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-3xl p-4.5 border border-gray-200 shadow-2xs flex flex-col gap-1.5">
            <span className="self-start text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d6eee2] text-[#144e40]">
              Favor cumplido
            </span>
            <h4 className="font-extrabold text-gray-900 text-sm mt-1">Presté taladro percutor a Rosa Q.</h4>
            <p className="text-xs text-gray-500">Completado con éxito · Calificado con 5 estrellas</p>
          </div>
        </div>
      )}

      {/* Contenido Pestaña Pedí */}
      {tab === 'pedi' && (
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-3xl p-4.5 border border-gray-200 shadow-2xs flex flex-col gap-1.5">
            <span className="self-start text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ffedd5] text-[#9a3412]">
              Favor recibido
            </span>
            <h4 className="font-extrabold text-gray-900 text-sm mt-1">Pedí escalera para reparar canaleta</h4>
            <p className="text-xs text-gray-500">Te prestó Teresa L. · Devolución confirmada</p>
          </div>
        </div>
      )}

    </div>
  );
};
