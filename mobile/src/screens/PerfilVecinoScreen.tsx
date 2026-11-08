import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Share,
  Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { mobileApiService } from '../services/api';

export interface VecinoPerfilData {
  id: string;
  iniciales: string;
  nombre: string;
  rubro: string;
  experiencia?: string;
  distancia: string;
  ubicacion: string;
  vistosBuenos: number;
  calificacion: number;
  resenasCount: number;
}

interface Props {
  vecino: VecinoPerfilData;
  onBack: () => void;
  onOpenEscribirResena: () => void;
  onContactar: () => void;
}

export const PerfilVecinoScreen: React.FC<Props> = ({
  vecino,
  onBack,
  onOpenEscribirResena,
  onContactar
}) => {
  const [dioVistoBueno, setDioVistoBueno] = useState(false);
  const [vistosCount, setVistosCount] = useState(vecino.vistosBuenos || 42);
  const [resenasList, setResenasList] = useState<Array<{
    id: string;
    autorIniciales: string;
    autorNombre: string;
    autorUbicacion: string;
    calificacion: number;
    comentario: string;
    tiempo: string;
  }>>([
    {
      id: 'r1',
      autorIniciales: 'CM',
      autorNombre: 'Carmen M.',
      autorUbicacion: 'Mz. B · a 2 cuadras',
      calificacion: 5,
      comentario: 'Vino en menos de media hora por una fuga en la cocina. Cobró lo que dijo y dejó todo limpio.',
      tiempo: 'Hace 3 días',
    },
    {
      id: 'r2',
      autorIniciales: 'JR',
      autorNombre: 'Julio R.',
      autorUbicacion: 'Mz. A · a 1 cuadra',
      calificacion: 5,
      comentario: 'Muy puntual y honesta con los repuestos. Explicó todo antes de comenzar el trabajo.',
      tiempo: 'Hace 1 semana',
    },
  ]);

  useEffect(() => {
    mobileApiService.getPerfilVecino(vecino.id).then((perfil) => {
      if (perfil) {
        if (typeof perfil.vistosBuenos === 'number') setVistosCount(perfil.vistosBuenos);
        if (typeof perfil.dioVistoBueno === 'boolean') setDioVistoBueno(perfil.dioVistoBueno);
      }
    }).catch(() => {});

    mobileApiService.listarResenas(vecino.id).then((resenas) => {
      if (Array.isArray(resenas) && resenas.length > 0) {
        setResenasList(resenas.map((r: any) => ({
          id: String(r.id),
          autorIniciales: r.autorIniciales || 'VC',
          autorNombre: r.autorNombre || 'Vecino',
          autorUbicacion: r.autorUbicacion || 'Tu cuadrante',
          calificacion: Number(r.calificacion ?? 5),
          comentario: r.comentario || '',
          tiempo: r.tiempo || 'Reciente',
        })));
      }
    }).catch(() => {});
  }, [vecino.id]);

  const toggleVistoBueno = async () => {
    if (!dioVistoBueno) {
      setDioVistoBueno(true);
      setVistosCount(c => c + 1);
      Alert.alert('¡Visto Bueno Otorgado!', `Has recomendado a ${vecino.nombre} en tu cuadrante.`);
    } else {
      setDioVistoBueno(false);
      setVistosCount(c => c - 1);
    }
    try {
      const resp = await mobileApiService.alternarVistoBueno(vecino.id);
      if (resp && typeof resp.vistosBuenos === 'number') {
        setVistosCount(resp.vistosBuenos);
      }
    } catch {}
  };

  const handleCompartir = async () => {
    try {
      await Share.share({
        message: `Te recomiendo a ${vecino.nombre} (${vecino.rubro}) en nuestro cuadrante vecinal. ¡Tiene ${vistosCount} vistos buenos!`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Cabecera Verde del Perfil */}
          <View style={styles.headerHero}>
            {/* Barra superior de navegación */}
            <View style={styles.topNavRow}>
              <TouchableOpacity onPress={onBack} style={styles.circleBtn} activeOpacity={0.8}>
                <Feather name="chevron-left" size={22} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCompartir} style={styles.circleBtn} activeOpacity={0.8}>
                <Feather name="share-2" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Identidad del Vecino */}
            <View style={styles.profileInfoRow}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{vecino.iniciales}</Text>
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.profileName} numberOfLines={1}>{vecino.nombre}</Text>
                <Text style={styles.profileRubro}>
                  {vecino.rubro} · {vecino.experiencia || '12 años de oficio'}
                </Text>
                <Text style={styles.profileDist}>
                  A {vecino.distancia} · {vecino.ubicacion || 'Mz. D, Los Pinos'}
                </Text>
              </View>
            </View>

            {/* Tarjeta de Estadísticas de Reputación */}
            <View style={styles.statsCard}>
              <View style={styles.statCol}>
                <Text style={styles.statNumber}>{vistosCount}</Text>
                <Text style={styles.statLabel}>vistos buenos</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCol}>
                <Text style={styles.statNumber}>
                  {vecino.calificacion?.toFixed(1) || '4.9'} <Ionicons name="star" size={15} color="#ffffff" />
                </Text>
                <Text style={styles.statLabel}>{vecino.resenasCount || 18} reseñas</Text>
              </View>
            </View>
          </View>

          {/* Tarjeta Visto Bueno Vecinal */}
          <View style={styles.vistoBuenoCard}>
            <View style={styles.vbHeaderRow}>
              <View style={styles.vbIconCircle}>
                <Feather name="thumbs-up" size={18} color="#144e40" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vbTitle}>Visto Bueno Vecinal</Text>
                <Text style={styles.vbSubtitle}>Solo opinan vecinos verificados de Los Pinos</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.vbActionBtn, dioVistoBueno && styles.vbActionBtnActive]}
              onPress={toggleVistoBueno}
              activeOpacity={0.85}
            >
              <Text style={[styles.vbActionBtnText, dioVistoBueno && styles.vbActionBtnTextActive]}>
                {dioVistoBueno ? '✓ Visto bueno registrado' : '✓ Dar mi visto bueno'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sección: Lo que dicen tus vecinos */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Lo que dicen tus vecinos</Text>
              <TouchableOpacity 
                style={styles.writeReviewPill}
                onPress={onOpenEscribirResena}
                activeOpacity={0.8}
              >
                <Text style={styles.writeReviewPillText}>Escribir reseña</Text>
              </TouchableOpacity>
            </View>

            {resenasList.map((rev, idx) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeaderRow}>
                  <View style={[styles.reviewerAvatar, idx % 2 === 1 && { backgroundColor: '#e0e7fb' }]}>
                    <Text style={[styles.reviewerAvatarText, idx % 2 === 1 && { color: '#2b4290' }]}>
                      {rev.autorIniciales}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewerName}>{rev.autorNombre}</Text>
                    <Text style={styles.reviewerDist}>{rev.autorUbicacion}</Text>
                  </View>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Ionicons
                        key={s}
                        name={s <= rev.calificacion ? 'star' : 'star-outline'}
                        size={14}
                        color="#f59e0b"
                      />
                    ))}
                  </View>
                </View>

                <Text style={styles.reviewText}>{rev.comentario}</Text>

                <View style={styles.reviewTagsRow}>
                  <View style={styles.tagVerified}>
                    <Text style={styles.tagVerifiedText}>Vecino verificado</Text>
                  </View>
                  <View style={styles.tagTime}>
                    <Text style={styles.tagTimeText}>{rev.tiempo}</Text>
                  </View>
                </View>
              </View>
            ))}

          </View>

          <View style={{ height: 90 }} />
        </ScrollView>

        {/* Botón Inferior Fijo: Contactar */}
        <View style={styles.fixedBottomBar}>
          <TouchableOpacity 
            style={styles.contactBtn}
            onPress={onContactar}
            activeOpacity={0.85}
          >
            <Feather name="message-square" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.contactBtnText}>Contactar a {vecino.nombre.split(' ')[0]}</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#144e40',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f8f4',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerHero: {
    backgroundColor: '#144e40',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 8,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#d6eee2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#144e40',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  profileRubro: {
    fontSize: 13,
    color: '#a7f3d0',
    marginTop: 2,
    fontWeight: '500',
  },
  profileDist: {
    fontSize: 12,
    color: '#d1fae5',
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: '#d1fae5',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  vistoBuenoCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 18,
    marginTop: -12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  vbHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  vbIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#d6eee2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vbTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  vbSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 1,
  },
  vbActionBtn: {
    borderWidth: 1.5,
    borderColor: '#144e40',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  vbActionBtnActive: {
    backgroundColor: '#144e40',
  },
  vbActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#144e40',
  },
  vbActionBtnTextActive: {
    color: '#ffffff',
  },
  reviewsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  writeReviewPill: {
    backgroundColor: '#d6eee2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  writeReviewPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#144e40',
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  reviewerDist: {
    fontSize: 11,
    color: '#6b7280',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 19,
    marginBottom: 12,
  },
  reviewTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagVerified: {
    backgroundColor: '#d6eee2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagVerifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#144e40',
  },
  tagTime: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagTimeText: {
    fontSize: 11,
    color: '#6b7280',
  },
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  contactBtn: {
    backgroundColor: '#111827',
    borderRadius: 24,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
