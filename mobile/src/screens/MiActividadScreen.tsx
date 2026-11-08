import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
  onOpenChat?: () => void;
  onOpenPublicar?: () => void;
}

type TabActividad = 'publicaciones' | 'hice' | 'pedi';

export const MiActividadScreen: React.FC<Props> = ({ onOpenChat, onOpenPublicar }) => {
  const [tab, setTab] = useState<TabActividad>('publicaciones');

  // Estado de publicaciones
  const [publicaciones, setPublicaciones] = useState([
    {
      id: '1',
      tipo: 'servicio',
      tipoLabel: 'Mi servicio',
      tipoBg: '#144e40',
      tipoColor: '#ffffff',
      estado: 'Activo',
      estadoBg: '#d6eee2',
      estadoColor: '#144e40',
      titulo: 'Electricidad · 8 años de experiencia',
      detalle: 'Visible en Servicios · 4 vecinos te contactaron esta semana',
      tipoAccion: 'servicio',
    },
    {
      id: '2',
      tipo: 'presto',
      tipoLabel: 'Presto',
      tipoBg: '#e0e7fb',
      tipoColor: '#2b4290',
      estado: 'En curso',
      estadoBg: '#fef3c7',
      estadoColor: '#b45309',
      titulo: 'Presto escalera de 3 metros',
      detalle: 'Prestada a Teresa L. hasta el domingo',
      tipoAccion: 'prestamo',
    },
    {
      id: '3',
      tipo: 'dono',
      tipoLabel: 'Dono',
      tipoBg: '#d6eee2',
      tipoColor: '#144e40',
      estado: 'Activo',
      estadoBg: '#d6eee2',
      estadoColor: '#144e40',
      titulo: 'Dono libros escolares de primaria',
      detalle: 'Publicado hace 3 días · 2 vecinos interesados',
      tipoAccion: 'donacion',
    },
  ]);

  const handlePausar = (id: string) => {
    setPublicaciones(prev => prev.map(p => {
      if (p.id === id) {
        const nuevoEstado = p.estado === 'Activo' ? 'Pausado' : 'Activo';
        return {
          ...p,
          estado: nuevoEstado,
          estadoBg: nuevoEstado === 'Activo' ? '#d6eee2' : '#f3f4f6',
          estadoColor: nuevoEstado === 'Activo' ? '#144e40' : '#6b7280',
        };
      }
      return p;
    }));
  };

  const handleDevuelto = (id: string) => {
    setPublicaciones(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          estado: 'Completado',
          estadoBg: '#f3f4f6',
          estadoColor: '#4b5563',
          detalle: 'Objeto devuelto en perfecto estado',
        };
      }
      return p;
    }));
    Alert.alert('¡Préstamo Completado!', 'Se registró la devolución y se actualizó tu historial solidario.');
  };

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi actividad</Text>
          <Text style={styles.subtitle}>
            Lo que publicaste, los favores que hiciste y los que pediste
          </Text>
        </View>

        {/* Segmented Control de 3 pestañas */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[styles.segBtn, tab === 'publicaciones' && styles.segBtnActive]}
            onPress={() => setTab('publicaciones')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segBtnText, tab === 'publicaciones' && styles.segBtnTextActive]}>
              Publicaciones <Text style={styles.countBadge}>3</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segBtn, tab === 'hice' && styles.segBtnActive]}
            onPress={() => setTab('hice')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segBtnText, tab === 'hice' && styles.segBtnTextActive]}>
              Hice <Text style={styles.countBadge}>3</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segBtn, tab === 'pedi' && styles.segBtnActive]}
            onPress={() => setTab('pedi')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segBtnText, tab === 'pedi' && styles.segBtnTextActive]}>
              Pedí <Text style={styles.countBadge}>3</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido de la pestaña Publicaciones */}
        {tab === 'publicaciones' && (
          <View style={styles.cardsList}>
            {publicaciones.map(item => (
              <View key={item.id} style={styles.activityCard}>
                
                {/* Fila de badges */}
                <View style={styles.badgesRow}>
                  <View style={[styles.pillBadge, { backgroundColor: item.tipoBg }]}>
                    <Text style={[styles.pillBadgeText, { color: item.tipoColor }]}>
                      {item.tipoLabel}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: item.estadoBg }]}>
                    <Text style={[styles.statusBadgeText, { color: item.estadoColor }]}>
                      {item.estado}
                    </Text>
                  </View>
                </View>

                {/* Título y Detalle */}
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={styles.cardSubtitle}>{item.detalle}</Text>

                {/* Fila de Botones según tipo */}
                <View style={styles.actionsRow}>
                  {item.tipoAccion === 'servicio' && (
                    <>
                      <TouchableOpacity 
                        style={styles.whiteBtn}
                        onPress={() => Alert.alert('Editar Servicio', 'Modifica tu tarifa o experiencia.')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.whiteBtnText}>Editar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.whiteBtn}
                        onPress={() => handlePausar(item.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.whiteBtnText}>
                          {item.estado === 'Activo' ? 'Pausar' : 'Reanudar'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {item.tipoAccion === 'prestamo' && (
                    <>
                      <TouchableOpacity 
                        style={styles.blackBtn}
                        onPress={() => {
                          if (onOpenChat) {
                            onOpenChat();
                          } else {
                            Alert.alert('Chat', 'Abriendo conversación con Teresa L...');
                          }
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.blackBtnText}>Ir al chat</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.whiteBtn}
                        onPress={() => handleDevuelto(item.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.whiteBtnText}>Ya me la devolvió</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {item.tipoAccion === 'donacion' && (
                    <>
                      <TouchableOpacity 
                        style={styles.blackBtn}
                        onPress={() => Alert.alert('Interesados', '2 vecinos solicitaron los libros:\n1. Rosa Q. · Mz. C\n2. Luis M. · Mz. A')}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.blackBtnText}>Ver interesados</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.whiteBtn}
                        onPress={() => handlePausar(item.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.whiteBtnText}>
                          {item.estado === 'Activo' ? 'Pausar' : 'Reanudar'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

              </View>
            ))}
          </View>
        )}

        {/* Contenido de la pestaña Hice */}
        {tab === 'hice' && (
          <View style={styles.cardsList}>
            <View style={styles.activityCard}>
              <View style={styles.badgesRow}>
                <View style={[styles.pillBadge, { backgroundColor: '#d6eee2' }]}>
                  <Text style={[styles.pillBadgeText, { color: '#144e40' }]}>Favor cumplido</Text>
                </View>
                <Text style={styles.timeMuted}>Hace 2 días</Text>
              </View>
              <Text style={styles.cardTitle}>Presté taladro percutor a Rosa Q.</Text>
              <Text style={styles.cardSubtitle}>Completado con éxito · Calificado con 5 estrellas</Text>
            </View>

            <View style={styles.activityCard}>
              <View style={styles.badgesRow}>
                <View style={[styles.pillBadge, { backgroundColor: '#e0e7fb' }]}>
                  <Text style={[styles.pillBadgeText, { color: '#2b4290' }]}>Ayuda comunitaria</Text>
                </View>
                <Text style={styles.timeMuted}>Hace 5 días</Text>
              </View>
              <Text style={styles.cardTitle}>Remoción de escombros en calle 4</Text>
              <Text style={styles.cardSubtitle}>Aporte solidario por alerta de lluvias en Los Pinos</Text>
            </View>
          </View>
        )}

        {/* Contenido de la pestaña Pedí */}
        {tab === 'pedi' && (
          <View style={styles.cardsList}>
            <View style={styles.activityCard}>
              <View style={styles.badgesRow}>
                <View style={[styles.pillBadge, { backgroundColor: '#ffedd5' }]}>
                  <Text style={[styles.pillBadgeText, { color: '#9a3412' }]}>Favor recibido</Text>
                </View>
                <Text style={styles.timeMuted}>Hace 1 semana</Text>
              </View>
              <Text style={styles.cardTitle}>Pedí escalera para reparar canaleta</Text>
              <Text style={styles.cardSubtitle}>Te prestó Teresa L. · Devolución confirmada</Text>
            </View>
          </View>
        )}

      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 10,
    gap: 16,
    paddingBottom: 90,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    padding: 3,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  segBtnTextActive: {
    color: '#111827',
    fontWeight: '800',
  },
  countBadge: {
    fontSize: 12,
    color: '#9ca3af',
  },
  cardsList: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  pillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeMuted: {
    fontSize: 11,
    color: '#9ca3af',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  whiteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  whiteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  blackBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#111827',
  },
  blackBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
