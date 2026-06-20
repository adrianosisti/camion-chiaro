import { StyleSheet, Text, View } from 'react-native'
import { colors, layout, shadows } from '../theme'

export function Panel({ children, kicker, right, title }) {
  return (
    <View style={styles.panel}>
      {(title || kicker || right) ? (
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
            {title ? <Text style={styles.title}>{title}</Text> : null}
          </View>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerCopy: {
    flex: 1,
  },
  kicker: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  panel: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: layout.radius,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
    ...shadows.panel,
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
})
