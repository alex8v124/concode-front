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
  Alert,
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
  const [recomienda, setRecomienda] = useState<boolean>(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comentario, setComentario] = useState<string>('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const isValid = rating > 0;

  const handlePublicar = () => {
    if (!isValid) return;
    onSubmitSuccess({
      rating,
      recomienda,
      tags: selectedTags,
      comentario: comentario.trim(),
    });
    Alert.alert('¡Reseña Publicada!', `Gracias por aportar tu Visto Bueno a ${targetNeighbor.nombre} en el barrio.`);
    onClose();
  };

  const nombrePrimer = targetNeighbor?.nombre?.split(' ')[0] || 'Rosa';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Barra de arrastre y cerrar */}
          <View style={styles.headerBar}>
            <View style={{ width: 32 }} />
            <View style={styles.dragHandle} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Feather name="x" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {/* Sección 1: ¿Cómo fue el servicio? */}
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
                      color={s <= rating ? '#f59e0b' : '#9ca3af'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.starsHelper}>
                {rating === 0 ? 'Toca una estrella para calificar' : `${rating} de 5 estrellas`}
              </Text>
            </View>

            {/* Sección 2: ¿Le das tu Visto Bueno Vecinal? */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>¿Le das tu Visto Bueno Vecinal?</Text>
              <View style={styles.recomiendaRow}>
                <TouchableOpacity
                  style={[
                    styles.recomiendaBtn, 
                    recomienda && styles.recomiendaBtnActive
                  ]}
                  onPress={() => setRecomienda(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.recomiendaText, 
                    recomienda && styles.recomiendaTextActive
                  ]}>
                    Sí, la recomiendo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.recomiendaBtn, 
                    !recomienda && styles.recomiendaBtnActiveNo
                  ]}
                  onPress={() => setRecomienda(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.recomiendaText, 
                    !recomienda && styles.recomiendaTextActiveNo
                  ]}>
                    Todavía no
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sección 3: ¿Qué destacas? (opcional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                ¿Qué destacas? <Text style={styles.optionalText}>(opcional)</Text>
              </Text>
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

            {/* Sección 4: Cuéntales a tus vecinos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cuéntales a tus vecinos</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="¿Qué hizo? ¿Llegó a tiempo? ¿Cobró lo acordado?"
                  placeholderTextColor="#9ca3af"
                  multiline
                  maxLength={280}
                  value={comentario}
                  onChangeText={setComentario}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.counterText}>
                Máximo 280 caracteres
              </Text>
            </View>

            {/* Sección 5: Banner de verificación y transparencia */}
            <View style={styles.shieldBanner}>
              <Feather name="shield" size={18} color="#144e40" style={styles.shieldIcon} />
              <Text style={styles.shieldText}>
                Puedes reseñar porque contactaste a {nombrePrimer} por la app. Tu reseña se publica con tu nombre y tu manzana.
              </Text>
            </View>

            {/* Botón Publicar Reseña */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                isValid ? styles.submitBtnActive : styles.submitBtnDisabled
              ]}
              onPress={handlePublicar}
              disabled={!isValid}
              activeOpacity={0.85}
            >
              <Text style={[
                styles.submitBtnText,
                isValid ? styles.submitBtnTextActive : styles.submitBtnTextDisabled
              ]}>
                Publicar reseña
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#f7f8f4',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 20,
    gap: 18,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  optionalText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6b7280',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  starTouch: {
    padding: 2,
  },
  starsHelper: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  recomiendaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recomiendaBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recomiendaBtnActive: {
    borderColor: '#144e40',
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  recomiendaBtnActiveNo: {
    borderColor: '#d97706',
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  recomiendaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  recomiendaTextActive: {
    color: '#144e40',
    fontWeight: '700',
  },
  recomiendaTextActiveNo: {
    color: '#b45309',
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  tagChipActive: {
    borderColor: '#144e40',
    backgroundColor: '#144e40',
  },
  tagChipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  tagChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  textAreaContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    minHeight: 84,
    fontSize: 13.5,
    color: '#111827',
    lineHeight: 20,
  },
  counterText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'right',
    fontWeight: '500',
  },
  shieldBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f5ec',
    borderColor: '#c3e6cf',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  shieldIcon: {
    marginTop: 2,
  },
  shieldText: {
    flex: 1,
    fontSize: 12,
    color: '#144e40',
    lineHeight: 18,
    fontWeight: '500',
  },
  submitBtn: {
    borderRadius: 20,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnActive: {
    backgroundColor: '#144e40',
    shadowColor: '#144e40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnDisabled: {
    backgroundColor: '#ded8cc',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  submitBtnTextActive: {
    color: '#ffffff',
  },
  submitBtnTextDisabled: {
    color: '#787165',
  },
});
