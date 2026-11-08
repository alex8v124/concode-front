import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  targetNeighbor: {
    nombre: string;
    iniciales: string;
    rubro: string;
    fechaAtencion?: string;
  };
  onSubmitSuccess: (review: {
    rating: number;
    recomienda: boolean;
    tags: string[];
    comentario: string;
  }) => void;
}

const TAGS_DESTACADOS = [
  'Puntual',
  'Precio justo',
  'Trabajo limpio',
  'Honesta',
  'Explica bien',
  'Volvería a llamarla',
];

export const EscribirResenaModal: React.FC<Props> = ({
  visible,
  onClose,
  targetNeighbor,
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [recomienda, setRecomienda] = useState<boolean | null>(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Puntual', 'Trabajo limpio']);
  const [comentario, setComentario] = useState<string>('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handlePublicar = () => {
    if (rating === 0) {
      Alert.alert('Calificación requerida', 'Por favor toca las estrellas para calificar el servicio.');
      return;
    }
    onSubmitSuccess({
      rating,
      recomienda: recomienda ?? true,
      tags: selectedTags,
      comentario: comentario.trim(),
    });
    Alert.alert('¡Reseña Publicada!', `Gracias por aportar tu Visto Bueno a ${targetNeighbor.nombre} en el barrio.`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Escribir reseña</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Target Neighbor Card */}
            <View style={styles.neighborCard}>
              <View style={styles.neighborAvatar}>
                <Text style={styles.neighborAvatarText}>{targetNeighbor.iniciales}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.neighborName}>{targetNeighbor.nombre}</Text>
                <Text style={styles.neighborDetail}>
                  {targetNeighbor.rubro} · {targetNeighbor.fechaAtencion || 'te atendió el 7 de noviembre'}
                </Text>
              </View>
            </View>

            {/* ¿Cómo fue el servicio? (Estrellas) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>¿Cómo fue el servicio?</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setRating(s)}
                    activeOpacity={0.7}
                    style={styles.starTouch}
                  >
                    <Ionicons
                      name={s <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={s <= rating ? '#f59e0b' : '#d1d5db'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.starsHelper}>
                {rating === 0 ? 'Toca una estrella para calificar' : `${rating} de 5 estrellas seleccionadas`}
              </Text>
            </View>

            {/* ¿Le das tu Visto Bueno Vecinal? */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>¿Le das tu Visto Bueno Vecinal?</Text>
              <View style={styles.recomiendaRow}>
                <TouchableOpacity
                  style={[styles.recomiendaBtn, recomienda === true && styles.recomiendaBtnActive]}
                  onPress={() => setRecomienda(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.recomiendaText, recomienda === true && styles.recomiendaTextActive]}>
                    Sí, la recomiendo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.recomiendaBtn, recomienda === false && styles.recomiendaBtnActive]}
                  onPress={() => setRecomienda(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.recomiendaText, recomienda === false && styles.recomiendaTextActive]}>
                    Todavía no
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ¿Qué destacas? (opcional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>¿Qué destacas? (opcional)</Text>
              <View style={styles.tagsContainer}>
                {TAGS_DESTACADOS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagChip, isSelected && styles.tagChipActive]}
                      onPress={() => toggleTag(tag)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tagChipText, isSelected && styles.tagChipTextActive]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Cuéntales a tus vecinos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cuéntales a tus vecinos</Text>
              <TextInput
                style={styles.textArea}
                placeholder="¿Qué hizo? ¿Llegó a tiempo? ¿Cobró lo acordado?"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                maxLength={280}
                value={comentario}
                onChangeText={setComentario}
                textAlignVertical="top"
              />
              <Text style={styles.counterText}>
                {comentario.length} / 280 caracteres
              </Text>
            </View>

            {/* Botón Publicar Reseña */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handlePublicar}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>Publicar reseña</Text>
            </TouchableOpacity>

          </ScrollView>

        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  neighborCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  neighborAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d6eee2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neighborAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#144e40',
  },
  neighborName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  neighborDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  starTouch: {
    padding: 4,
  },
  starsHelper: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  recomiendaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recomiendaBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recomiendaBtnActive: {
    borderColor: '#144e40',
    backgroundColor: '#d6eee2',
  },
  recomiendaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  recomiendaTextActive: {
    color: '#144e40',
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  tagChipActive: {
    borderColor: '#144e40',
    backgroundColor: '#144e40',
  },
  tagChipText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  tagChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 14,
    height: 100,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fafafa',
  },
  counterText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'right',
  },
  submitBtn: {
    backgroundColor: '#144e40',
    borderRadius: 24,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
