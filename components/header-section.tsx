import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/theme-context';
import { ThemeSwitcher } from './theme-switcher';
import { Logo } from './logo';

export function HeaderSection() {
  const { colors } = useTheme();

  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Logo width={200} />
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Paste a URL to auto-analyze
        </Text>
      </View>
      <ThemeSwitcher />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 60,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});