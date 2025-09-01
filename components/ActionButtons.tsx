import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/theme-context';
import { fonts } from '../constants/fonts';

export type InputMode = 'screenshot' | 'text';

interface ActionButtonsProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ActionButtons({ mode, onModeChange, onSubmit, disabled }: ActionButtonsProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.buttonsRow}>
        <TouchableOpacity 
          style={[
            styles.button, 
            { 
              backgroundColor: mode === 'screenshot' ? colors.primary : colors.background,
            }
          ]}
          onPress={() => onModeChange('screenshot')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="camera-outline" 
            size={20} 
            color={mode === 'screenshot' ? '#fff' : colors.text} 
          />
          <Text style={[
            styles.buttonText, 
            { color: mode === 'screenshot' ? '#fff' : colors.text }
          ]}>
            Screenshot
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.button, 
            { 
              backgroundColor: mode === 'text' ? colors.primary : colors.background,
            }
          ]}
          onPress={() => onModeChange('text')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="document-text-outline" 
            size={20} 
            color={mode === 'text' ? '#fff' : colors.text} 
          />
          <Text style={[
            styles.buttonText, 
            { color: mode === 'text' ? '#fff' : colors.text }
          ]}>
            Paste text
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[
          styles.uploadButton,
          disabled && styles.uploadButtonDisabled
        ]}
        onPress={onSubmit}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <View style={[
          styles.uploadCircle, 
          { 
            backgroundColor: disabled ? colors.background : colors.primary,
            borderColor: disabled ? 'rgba(255, 255, 255, 0.1)' : colors.primary,
          }
        ]}>
          <Ionicons 
            name="arrow-up" 
            size={24} 
            color={disabled ? colors.textSecondary : '#fff'} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  uploadButton: {
    marginLeft: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});