import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/theme-context';

interface ImagePreviewProps {
  imageUri: string;
  onRemove: () => void;
  onReplace?: () => void;
}

export function ImagePreview({ imageUri, onRemove, onReplace }: ImagePreviewProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.imageContainer, { backgroundColor: colors.surface }]}
        onPress={onReplace}
        activeOpacity={0.9}
      >
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={[styles.fileName, { color: colors.text }]}>Screenshot selected</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>Tap to change</Text>
        </View>
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.surface }]}
          onPress={onRemove}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  hint: {
    fontSize: 13,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  });
}