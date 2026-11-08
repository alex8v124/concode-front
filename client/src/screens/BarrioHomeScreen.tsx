import React, { useState } from 'react';
import type { UserFormData } from '../types';
import { 
  MapPin, 
  ChevronDown, 
  MessageSquare, 
  Wrench, 
  Heart, 
  Search, 
  ThumbsUp, 
  Star, 
  Plus, 
  Home, 
  Map as MapIcon, 
  AlertTriangle, 
  ListChecks, 
  User,
  X,
  PhoneCall,
  ShieldAlert
} from 'lucide-react';
import { PublicarFlowModal, PublicacionData } from './PublicarFlowModal';

interface BarrioHomeScreenProps {
  userData: UserFormData;
  onLogout: () => void;
}

type Categoria = 'servicios' | 'favores';
type Tab = 'inicio' | 'mapa' | 'emergencia' | 'actividad' | 'perfil';

interface ServicioItem {
  id: string;
  iniciales: string;
  nombre: string;
  distancia: string;
  rubro: string;
  detalle: string;
  vistosBuenos: number;
  calificacion: number;
  bgAvatar: string;
  colorAvatar: string;
  categoria: Categoria;
}

const SERVICIOS_MOCK: ServicioItem[] = [
  {
    id: '1',
    iniciales: 'RQ',
    nombre: 'Rosa Quispe',
    distancia: '180 m',
    rubro: 'Gasfitería',
    detalle: 'Atiende hoy',
    vistosBuenos: 42,
    calificacion: 4.9,
    bgAvatar: 'bg-emerald-100',
    colorAvatar: 'text-emerald-900',
    categoria: 'servicios',
  },
  {
    id: '2',
    iniciales: 'MH',
    nombre: 'Miguel Huamán',
    distancia: '350 m',
    rubro: 'Electricista domiciliario',
    detalle: 'Instalaciones y emergencias',
    vistosBuenos: 31,
    calificacion: 4.8,
    bgAvatar: 'bg-amber-100',
    colorAvatar: 'text-amber-900',
    categoria: 'servicios',
  },
  {
    id: '3',
    iniciales: 'LT',
    nombre: 'Lucía Torres',
    distancia: '420 m',
    rubro: 'Clases de matemática',
    detalle: 'Secundaria y preuniversitario',
    vistosBuenos: 27,
    calificacion: 5.0,
    bgAvatar: 'bg-indigo-100',
    colorAvatar: 'text-indigo-900',
    categoria: 'servicios',
  },
  {
    id: '4',
    iniciales: 'JC',
    nombre: 'Jorge Córdova',
    distancia: '600 m',
    rubro: 'Carpintería y cerrajería',
    detalle: 'Duplicado de llaves y chapas',
    vistosBuenos: 19,
    calificacion: 4.7,
    bgAvatar: 'bg-rose-100',
    colorAvatar: 'text-rose-900',
    categoria: 'servicios',
  },
  {
    id: '5',
    iniciales: 'AM',
    nombre: 'Ana Mendoza',
    distancia: '210 m',
    rubro: 'Presto escalera telescópica',
    detalle: 'Disponible fin de semana',
    vistosBuenos: 15,
    calificacion: 5.0,
    bgAvatar: 'bg-indigo-100',
    colorAvatar: 'text-indigo-900',
    categoria: 'favores',
  },
  {
    id: '6',
    iniciales: 'CR',
    nombre: 'Carlos Ramos',
    distancia: '390 m',
    rubro: 'Dono libros escolares',
    detalle: '3ro y 4to de secundaria',
    vistosBuenos: 22,
    calificacion: 4.9,
    bgAvatar: 'bg-emerald-100',
    colorAvatar: 'text-emerald-900',
    categoria: 'favores',
  },
];

export const BarrioHomeScreen: React.FC<BarrioHomeScreenProps> = ({
  userData,
  onLogout
}) => {
  const [itemsList, setItemsList] = useState<ServicioItem[]>(SERVICIOS_MOCK);
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>('servicios');
  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState<Tab>('inicio');
  const [modalPanicoVisible, setModalPanicoVisible] = useState(false);
  const [modalPublicarVisible, setModalPublicarVisible] = useState(false);
  const [modalPerfilVisible, setModalPerfilVisible] = useState(false);
  const [panicoEnviado, setPanicoEnviado] = useState(false);

  const cuadranteMostrado = userData.quadrantName || 'Urb. Los Pinos, Surco';

  const handleSuccessPublish = (data: PublicacionData) => {
    const initials = `${userData.firstName?.[0] || 'T'}${userData.lastName?.[0] || 'U'}`.toUpperCase();
    const esServicio = data.tipo === 'servicio';
    const nuevo: ServicioItem = {
      id: Date.now().toString(),
      iniciales: initials,
      nombre: `${userData.firstName} ${userData.lastName}`.trim() || 'Tú',
      distancia: '0 m (Tu casa)',
      rubro: data.titulo,
      detalle: data.descripcion || 'Publicado recientemente en tu cuadrante',
      vistosBuenos: 1,
      calificacion: 5.0,
      bgAvatar: esServicio ? 'bg-emerald-100' : 'bg-indigo-100',
      colorAvatar: esServicio ? 'text-emerald-900' : 'text-indigo-900',
      categoria: esServicio ? 'servicios' : 'favores',
    };
    setItemsList(prev => [nuevo, ...prev]);
    setCategoriaActiva(esServicio ? 'servicios' : 'favores');
  };

  const listaFiltrada = itemsList.filter(item => {
    const coincideCat = item.categoria === categoriaActiva;
    const coincideBusqueda = busqueda.trim() === '' || 
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.rubro.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideBusqueda;
  });

  return (
    <div className="flex flex-col h-full bg-[#f7f8f4] select-none overflow-y-auto relative pb-20">
      
      {/* Top Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500 font-medium block">Tu zona</span>
          <button className="flex items-center gap-1.5 text-left text-[#111827] font-bold text-lg cursor-pointer">
            <MapPin className="w-4 h-4 text-[#144e40]" strokeWidth={2.5} />
            <span>{cuadranteMostrado}</span>
            <ChevronDown className="w-4 h-4 text-[#144e40]" strokeWidth={2.5} />
          </button>
        </div>

        <button 
          title="Mensajes vecinales"
          className="w-11 h-11 rounded-full bg-[#144e40] text-white flex items-center justify-center relative shadow-sm hover:opacity-95 transition cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" strokeWidth={2.2} />
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-600 border-2 border-white text-white text-[10px] font-bold flex items-center justify-center">
            3
          </span>
        </button>
      </div>

      {/* Main Categories Row */}
      <div className="px-5 grid grid-cols-2 gap-3 mb-4">
        
        {/* Servicios */}
        <button
          onClick={() => setCategoriaActiva('servicios')}
          className={`p-4 rounded-2xl flex flex-col justify-between text-left transition cursor-pointer min-h-[115px] ${
            categoriaActiva === 'servicios'
              ? 'bg-[#144e40] text-white shadow-md'
              : 'bg-white text-gray-800 border border-gray-200 hover:border-gray-300'
          }`}
        >
          <Wrench className={`w-6 h-6 ${categoriaActiva === 'servicios' ? 'text-white' : 'text-[#144e40]'}`} strokeWidth={2.2} />
          <div>
            <h3 className="font-bold text-[17px]">Servicios</h3>
            <p className={`text-xs mt-0.5 ${categoriaActiva === 'servicios' ? 'text-emerald-200' : 'text-gray-500'}`}>
              Oficios y profesiones
            </p>
          </div>
        </button>

        {/* Favores */}
        <button
          onClick={() => setCategoriaActiva('favores')}
          className={`p-4 rounded-2xl flex flex-col justify-between text-left transition cursor-pointer min-h-[115px] ${
            categoriaActiva === 'favores'
              ? 'bg-[#144e40] text-white shadow-md'
              : 'bg-white text-gray-800 border border-gray-200 hover:border-gray-300'
          }`}
        >
          <Heart className={`w-6 h-6 ${categoriaActiva === 'favores' ? 'text-white' : 'text-gray-800'}`} strokeWidth={2.2} />
          <div>
            <h3 className="font-bold text-[17px]">Favores</h3>
            <p className={`text-xs mt-0.5 ${categoriaActiva === 'favores' ? 'text-emerald-200' : 'text-gray-500'}`}>
              Presta, dona, ofrece o pide
            </p>
          </div>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-5 mb-5">
        <div className="flex items-center gap-2.5 px-4 h-12 bg-white rounded-full border border-gray-200 shadow-2xs">
          <Search className="w-4.5 h-4.5 text-gray-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Busca gasfitero, profesor de inglés..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Section Header: Cerca de ti */}
      <div className="px-5 mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">Cerca de ti</h2>
          <p className="text-xs text-gray-500">Ordenado por cercanía · hasta 1 km</p>
        </div>

        <div className="flex items-center gap-1 bg-[#e6f0ed] text-[#144e40] text-xs font-bold px-2.5 py-1 rounded-full">
          <MapPin className="w-3 h-3" strokeWidth={2.5} />
          <span>1 km</span>
        </div>
      </div>

      {/* List of services / neighbors */}
      <div className="px-5 flex flex-col gap-3">
        {listaFiltrada.map((item) => (
          <div 
            key={item.id}
            className="bg-white rounded-2xl p-3.5 border border-gray-150 shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${item.bgAvatar} ${item.colorAvatar}`}>
              {item.iniciales}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-gray-900 text-[15px] truncate">{item.nombre}</h4>
                <span className="text-xs text-gray-500 shrink-0 font-medium">{item.distancia}</span>
              </div>

              <p className="text-xs text-gray-600 truncate mt-0.5">
                {item.rubro} · <span className="text-gray-400">{item.detalle}</span>
              </p>

              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <span className="flex items-center gap-1 font-semibold text-[#144e40]">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {item.vistosBuenos} vistos buenos
                </span>
                <span className="flex items-center gap-0.5 font-bold text-gray-700">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {item.calificacion.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button: + Publicar */}
      <button 
        onClick={() => setModalPublicarVisible(true)}
        className="fixed bottom-22 right-5 bg-[#144e40] text-white font-bold text-sm px-4.5 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-[#114034] transition flex items-center gap-1.5 cursor-pointer z-30"
      >
        <Plus className="w-4 h-4" strokeWidth={3} />
        <span>Publicar</span>
      </button>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-18 bg-white border-t border-gray-200 flex items-center justify-around px-2 z-20">
        
        {/* Inicio */}
        <button 
          onClick={() => setTabActiva('inicio')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${tabActiva === 'inicio' ? 'text-[#144e40]' : 'text-gray-500'}`}
        >
          <Home className="w-5 h-5" strokeWidth={tabActiva === 'inicio' ? 2.5 : 1.8} />
          <span className={`text-[10px] mt-1 ${tabActiva === 'inicio' ? 'font-bold' : 'font-medium'}`}>Inicio</span>
        </button>

        {/* Mapa */}
        <button 
          onClick={() => setTabActiva('mapa')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${tabActiva === 'mapa' ? 'text-[#144e40]' : 'text-gray-500'}`}
        >
          <MapIcon className="w-5 h-5" strokeWidth={tabActiva === 'mapa' ? 2.5 : 1.8} />
          <span className={`text-[10px] mt-1 ${tabActiva === 'mapa' ? 'font-bold' : 'font-medium'}`}>Mapa</span>
        </button>

        {/* Emergencia (Central SOS Button) */}
        <button 
          onClick={() => setModalPanicoVisible(true)}
          className="flex flex-col items-center justify-center flex-1 -mt-5 cursor-pointer"
        >
          <div className="w-13 h-13 rounded-full bg-[#ba3816] text-white flex items-center justify-center border-3 border-[#f7f8f4] shadow-md hover:scale-105 transition">
            <AlertTriangle className="w-6 h-6" strokeWidth={2.4} />
          </div>
          <span className="text-[10px] font-bold text-[#ba3816] mt-1">Emergencia</span>
        </button>

        {/* Actividad */}
        <button 
          onClick={() => setTabActiva('actividad')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${tabActiva === 'actividad' ? 'text-[#144e40]' : 'text-gray-500'}`}
        >
          <ListChecks className="w-5 h-5" strokeWidth={tabActiva === 'actividad' ? 2.5 : 1.8} />
          <span className={`text-[10px] mt-1 ${tabActiva === 'actividad' ? 'font-bold' : 'font-medium'}`}>Actividad</span>
        </button>

        {/* Perfil */}
        <button 
          onClick={() => setModalPerfilVisible(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${tabActiva === 'perfil' ? 'text-[#144e40]' : 'text-gray-500'}`}
        >
          <User className="w-5 h-5" strokeWidth={tabActiva === 'perfil' ? 2.5 : 1.8} />
          <span className={`text-[10px] mt-1 ${tabActiva === 'perfil' ? 'font-bold' : 'font-medium'}`}>Perfil</span>
        </button>
      </div>

      {/* Modal de Emergencia */}
      {modalPanicoVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[#ba3816]">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-bold text-lg text-gray-900">Alerta Vecinal SOS</h3>
              </div>
              <button onClick={() => setModalPanicoVisible(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Al activar la alerta, se emitirá una señal prioritaria a los vecinos de {cuadranteMostrado} y a la central de serenazgo distrital.
            </p>

            <button
              onClick={() => setPanicoEnviado(true)}
              className={`w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center shadow-xl border-4 transition cursor-pointer ${
                panicoEnviado 
                  ? 'bg-emerald-600 border-emerald-200 text-white' 
                  : 'bg-[#ba3816] hover:bg-[#a02f12] border-rose-200 text-white animate-pulse'
              }`}
            >
              <span className="text-2xl font-black">{panicoEnviado ? '¡EMITIDA!' : 'SOS'}</span>
              <span className="text-[10px] opacity-90 mt-1">{panicoEnviado ? 'Vecinos alertados' : 'Presiona para alertar'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2 mt-6">
              <button 
                onClick={() => alert('Llamando a Serenazgo...')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 text-[#144e40] font-bold text-xs hover:bg-emerald-100 transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Serenazgo
              </button>
              <button 
                onClick={() => alert('Marcando al 105 Policía Nacional...')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 text-[#ba3816] font-bold text-xs hover:bg-rose-100 transition"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Central 105
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Flujo Publicar de 3 Pasos + Éxito */}
      <PublicarFlowModal
        isOpen={modalPublicarVisible}
        onClose={() => setModalPublicarVisible(false)}
        onSuccess={handleSuccessPublish}
        userQuadrant={cuadranteMostrado}
      />

      {/* Modal Perfil */}
      {modalPerfilVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Mi Perfil Vecinal</h3>
              <button onClick={() => setModalPerfilVisible(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-4">
              <h4 className="font-bold text-base text-gray-900">{userData.firstName} {userData.lastName}</h4>
              <p className="text-xs text-gray-500 mt-0.5">DNI: {userData.dni || 'Verificado con RENIEC'}</p>
              <p className="text-xs text-[#144e40] font-semibold mt-1">📍 {cuadranteMostrado}</p>
              <span className="inline-block mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                ✓ Vecino Verificado
              </span>
            </div>
            <button 
              onClick={() => {
                setModalPerfilVisible(false);
                onLogout();
              }}
              className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl text-xs hover:bg-red-100 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
