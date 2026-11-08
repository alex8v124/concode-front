import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
  onBack: () => void;
  onSelectChat?: (chatId: string) => void;
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
    avatarBg: '#d6eee2',
    avatarColor: '#144e40',
    name: 'Rosa Quispe',
    subtitle: 'Servicio · Gasfitería',
    lastMessage: 'Puedo pasar mañana a las 9, ¿le ...',
    time: '23:05',
    unreadCount: 2,
  },
  {
    id: '2',
    avatarInitials: 'JR',
    avatarBg: '#e0e7fb',
    avatarColor: '#2b4290',
    name: 'Julio R.',
    subtitle: 'Favor · Presto taladro',
    lastMessage: 'Te lo dejo en la portería el sábado.',
    time: '21:40',
    unreadCount: 1,
  },
  {
    id: '3',
    avatarInitials: 'MD',
    avatarBg: '#faecd5',
    avatarColor: '#8c531b',
    name: 'Vecinos Mz. D',
    subtitle: 'Grupo de manzana',
    lastMessage: 'Gladys: ¿Alguien sabe a qué hora pasa...',
    time: '19:12',
  },
  {
    id: '4',
    avatarInitials: 'TL',
    avatarBg: '#fee4e2',
    avatarColor: '#912018',
    name: 'Teresa L.',
    subtitle: 'Favor · Necesito escalera',
    lastMessage: 'Tú: Yo tengo una, te la presto el domin...',
    time: 'Ayer',
  },
  {
    id: '5',
    avatarInitials: 'JV',
    avatarBg: '#1f2937',
    avatarColor: '#ffffff',
    name: 'Junta vecinal Los Pinos',
    subtitle: 'Canal oficial',
    lastMessage: 'Reunión del sábado en el local comunal.',
    time: 'Lun',
    isOfficial: true,
  },
];

const CHAT_FILTERS = ['Todos', 'Servicios', 'Favores', 'Grupos'];

export const MensajesScreen: React.FC<Props> = ({ onBack }) => {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      
      {/* Cabecera */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="chevron-left" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.title}>Mensajes</Text>
          <Text style={styles.subtitle}>Solo con vecinos verificados de Los Pinos</Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#9ca3af" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar vecino o publicación"
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {CHAT_FILTERS.map(f => (
            <TouchableOpacity 
              key={f}
              style={[styles.filterChip, filter === f ? styles.filterChipActive : styles.filterChipInactive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === f ? styles.filterTextActive : styles.filterTextInactive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Chats */}
      <ScrollView contentContainerStyle={styles.chatsList} showsVerticalScrollIndicator={false}>
        {CHATS_MOCK.map(chat => (
          <TouchableOpacity key={chat.id} style={styles.chatRow} activeOpacity={0.7}>
            <View style={[styles.avatar, { backgroundColor: chat.avatarBg }, chat.isOfficial && styles.avatarOfficial]}>
              <Text style={[styles.avatarText, { color: chat.avatarColor }]}>
                {chat.avatarInitials}
              </Text>
            </View>

            <View style={styles.chatContent}>
              <View style={styles.chatTopLine}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>

              <Text style={styles.chatSubtitle}>{chat.subtitle}</Text>
              
              <View style={styles.lastMessageRow}>
                <Text style={styles.lastMessageText} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
                {chat.unreadCount && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Nota de Privacidad al final */}
        <View style={styles.privacyCard}>
          <Feather name="lock" size={16} color="#144e40" style={styles.lockIcon} />
          <Text style={styles.privacyText}>
            Tu número de teléfono no se comparte. Puedes bloquear o reportar a cualquier usuario desde la conversación.
          </Text>
        </View>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 46,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  filtersContainer: {
    marginBottom: 10,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#111827',
  },
  filterChipInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  filterTextInactive: {
    color: '#374151',
  },
  chatsList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOfficial: {
    borderRadius: 10,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
  },
  chatContent: {
    flex: 1,
  },
  chatTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  chatTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  chatSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
    marginBottom: 3,
  },
  lastMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    fontSize: 13,
    color: '#4b5563',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#144e40',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: '#e6f0ed',
    padding: 14,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'flex-start',
    gap: 10,
  },
  lockIcon: {
    marginTop: 2,
  },
  privacyText: {
    fontSize: 11,
    color: '#144e40',
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
});
