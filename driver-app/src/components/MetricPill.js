import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

export function MetricPill({ label, onPress, tone = 'info', value }) {
  const content = (
    <View style={[styles.pill, styles[tone]]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )

  if (!onPress) return content

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  danger: {
    backgroundColor: '#fee2e2',
  },
  info: {
    backgroundColor: '#e0f2fe',
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  pill: {
    borderRadius: 14,
    flex: 1,
    minHeight: 76,
    padding: 12,
  },
  pressable: {
    flex: 1,
  },
  success: {
    backgroundColor: '#dcfce7',
  },
  value: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
})
