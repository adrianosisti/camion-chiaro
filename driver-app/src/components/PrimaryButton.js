import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { colors } from '../theme'

export function PrimaryButton({ disabled = false, loading = false, onPress, tone = 'dark', title }) {
  const isDisabled = disabled || loading
  const isLight = tone === 'light'

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        isLight ? styles.lightButton : styles.darkButton,
        isDisabled && styles.disabledButton,
      ]}
    >
      {loading ? <ActivityIndicator color={isLight ? colors.ink : colors.white} size="small" /> : null}
      <Text style={[styles.text, isLight ? styles.lightText : styles.darkText]}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 16,
  },
  darkButton: {
    backgroundColor: colors.ink,
  },
  darkText: {
    color: colors.white,
  },
  disabledButton: {
    opacity: 0.55,
  },
  lightButton: {
    backgroundColor: '#e0f2fe',
  },
  lightText: {
    color: colors.ink,
  },
  text: {
    fontSize: 14,
    fontWeight: '900',
  },
})
