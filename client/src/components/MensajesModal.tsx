import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Lock, Shield, Send } from 'lucide-react';

export interface TargetChatContactWeb {
  id?: string;
  name: string;
  initials: string;
  subtitle: string;
}

interface MensajesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChatId?: string;
  targetContact?: TargetChatContactWeb | null;
}

interface ChatItem {
  id: string;
  avatarInitials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  subtitle: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOfficial?: boolean;
}

const CHATS_MOCK: ChatItem[] = [
  {
    id: '1',
    avatarInitials: 'RQ',
    avatarBg: 'bg-emerald-100',
    avatarColor: 'text-emerald-900',
    name: 'Rosa Quispe',
    subtitle: 'Servicio · Gasfitería',
    lastMessage: 'Puedo pasar mañana a las 9, ¿le ...',
    time: '23:05',
    unreadCount: 2,
  },
  {
    id: '2',
    avatarInitials: 'JR',
    avatarBg: 'bg-blue-100',
    avatarColor: 'text-blue-900',
    name: 'Julio R.',
    subtitle: 'Favor · Presto taladro',
    lastMessage: 'Te lo dejo en la portería el sábado.',
    time: '21:40',
    unreadCount: 1,
  },
  {
    id: '3',
    avatarInitials: 'MD',
    avatarBg: 'bg-amber-100',
    avatarColor: 'text-amber-900',
    name: 'Vecinos Mz. D',
    subtitle: 'Grupo de manzana',
    lastMessage: 'Gladys: ¿Alguien sabe a qué hora pasa...',
    time: '19:12',
  },
  {
    id: '4',
    avatarInitials: 'TL',
    avatarBg: 'bg-rose-100',
    avatarColor: 'text-rose-900',
    name: 'Teresa L.',
    subtitle: 'Favor · Necesito escalera',
    lastMessage: 'Tú: Yo tengo una, te la presto el domin...',
    time: 'Ayer',
  },
  {
    id: '5',
    avatarInitials: 'JV',
    avatarBg: 'bg-gray-900',
    avatarColor: 'text-white',
    name: 'Junta vecinal Los Pinos',
    subtitle: 'Canal oficial',
    lastMessage: 'Reunión del sábado en el local comunal.',
    time: 'Lun',
    isOfficial: true,
  },
];

const CHAT_FILTERS = ['Todos', 'Servicios', 'Favores', 'Grupos'];

export const MensajesModal: React.FC<MensajesModalProps> = ({
  isOpen,
  onClose,
  initialChatId,
  targetContact,
}) => {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [chatsList, setChatsList] = useState<ChatItem[]>(CHATS_MOCK);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(
    initialChatId ? CHATS_MOCK.find(c => c.id === initialChatId) || null : null
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!targetContact) {
      setSelectedChat(initialChatId ? CHATS_MOCK.find(c => c.id === initialChatId) || null : null);
      return;
    }
    const firstWord = targetContact.name.split(' ')[0].toLowerCase();
    setChatsList(prev => {
      const existing = prev.find(
        c => c.id === targetContact.id || c.name.toLowerCase().includes(firstWord)
      );
      if (existing) {
        setSelectedChat(existing);
        return prev;
      }
      const nuevo: ChatItem = {
        id: targetContact.id || `chat-${targetContact.name}`,
        avatarInitials: targetContact.initials || 'VC',
        avatarBg: 'bg-emerald-100',
        avatarColor: 'text-emerald-900',
        name: targetContact.name,
        subtitle: targetContact.subtitle || 'Servicio vecinal',
        lastMessage: 'Conversación iniciada',
        time: 'Ahora',
      };
      setSelectedChat(nuevo);
      return [nuevo, ...prev];
    });
  }, [isOpen, targetContact, initialChatId]);
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [threads, setThreads] = useState<Record<string, Array<{ id: string; texto: string; remitente: 'yo' | 'otro'; hora: string }>>>({
    '1': [
      { id: '1', texto: 'Hola Rosa, buenas noches. Quería consultar por la fuga de agua en mi lavadero.', remitente: 'yo', hora: '22:50' },
      { id: '2', texto: 'Hola vecino. Sí, claro, revisé tu mensaje.', remitente: 'otro', hora: '23:02' },
      { id: '3', texto: 'Puedo pasar mañana a las 9, ¿le parece bien?', remitente: 'otro', hora: '23:05' }
    ],
    '2': [
      { id: '1', texto: 'Hola Julio, ¿aún tienes disponible el taladro percutor?', remitente: 'yo', hora: '21:30' },
      { id: '2', texto: 'Hola vecino. Sí, está listo con todas sus brocas.', remitente: 'otro', hora: '21:35' },
      { id: '3', texto: 'Te lo dejo en la portería el sábado.', remitente: 'otro', hora: '21:40' }
    ]
  });

  if (!isOpen) return null;

  const handleEnviar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mensajeTexto.trim() || !selectedChat) return;
    const nuevo = {
      id: Date.now().toString(),
      texto: mensajeTexto.trim(),
      remitente: 'yo' as const,
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setThreads(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), nuevo]
    }));
    setMensajeTexto('');
  };

  const listaFiltrada = chatsList.filter(chat => {
    const matchSearch = search.trim() === '' || 
      chat.name.toLowerCase().includes(search.toLowerCase()) || 
      chat.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[640px] max-h-[92vh] border border-gray-200">
        
        {/* VISTA 1: CHAT ABIERTO CONVERSACIÓN */}
        {selectedChat ? (
          <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* Cabecera del chat */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${selectedChat.avatarBg} ${selectedChat.avatarColor}`}>
                  {selectedChat.avatarInitials}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 leading-tight">{selectedChat.name}</h3>
                  <p className="text-[11px] text-gray-500">{selectedChat.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[#e6f0ed] text-[#144e40] px-2 py-1 rounded-full text-[10px] font-bold">
                <Shield className="w-3 h-3" />
                <span>Verificado</span>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="bg-[#e6f0ed] text-[#144e40] text-[11px] font-medium p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Chat cifrado entre vecinos de Los Pinos. Tu número no es público.</span>
              </div>

              {(threads[selectedChat.id] || [
                { id: '1', texto: `Hola, bienvenido a la coordinación vecinal con ${selectedChat.name}.`, remitente: 'otro', hora: selectedChat.time }
              ]).map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.remitente === 'yo' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs ${
                    msg.remitente === 'yo' 
                      ? 'bg-[#144e40] text-white rounded-br-xs' 
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-xs'
                  }`}>
                    <p className="leading-relaxed">{msg.texto}</p>
                    <span className={`text-[9px] block text-right mt-1 ${msg.remitente === 'yo' ? 'text-emerald-200' : 'text-gray-400'}`}>
                      {msg.hora}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input de respuesta */}
            <form onSubmit={handleEnviar} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
              <input 
                type="text" 
                placeholder={`Escribe a ${selectedChat.name.split(' ')[0]}...`}
                value={mensajeTexto}
                onChange={e => setMensajeTexto(e.target.value)}
                className="flex-1 bg-gray-100 text-xs px-3.5 py-2.5 rounded-full border border-gray-200 outline-none focus:border-[#144e40]"
              />
              <button 
                type="submit"
                disabled={!mensajeTexto.trim()}
                className="w-9 h-9 rounded-full bg-[#144e40] disabled:bg-gray-300 text-white flex items-center justify-center transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          /* VISTA 2: LISTA DE MENSAJES */
          <div className="flex flex-col h-full">
            {/* Cabecera */}
            <div className="px-5 pt-4 pb-2 border-b border-gray-150 flex items-center gap-3">
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Mensajes</h2>
                <p className="text-xs text-gray-500">Solo con vecinos verificados de Los Pinos</p>
              </div>
            </div>

            {/* Buscador */}
            <div className="px-5 pt-3">
              <div className="flex items-center gap-2 px-3.5 h-10 bg-gray-100 rounded-full border border-gray-200">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Buscar vecino o publicación"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-transparent text-xs text-gray-800 outline-none"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
              {CHAT_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Lista de chats */}
            <div className="flex-1 overflow-y-auto px-5 divide-y divide-gray-100">
              {listaFiltrada.map(chat => (
                <div 
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="py-3.5 flex items-center gap-3 hover:bg-gray-50/70 transition cursor-pointer rounded-xl px-1"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${chat.avatarBg} ${chat.avatarColor}`}>
                    {chat.avatarInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{chat.name}</h4>
                      <span className="text-[11px] text-gray-400">{chat.time}</span>
                    </div>

                    <p className="text-xs text-gray-500 truncate mt-0.5">{chat.subtitle}</p>

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-700 truncate pr-2">{chat.lastMessage}</p>
                      {chat.unreadCount && (
                        <span className="w-4.5 h-4.5 rounded-full bg-[#144e40] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Nota de privacidad al final */}
              <div className="mt-4 mb-5 p-3.5 rounded-2xl bg-[#e6f0ed] flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#144e40] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#144e40] leading-relaxed">
                  Tu número de teléfono no se comparte. Puedes bloquear o reportar a cualquier usuario desde la conversación.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
