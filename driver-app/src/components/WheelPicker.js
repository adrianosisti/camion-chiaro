import { useEffect, useRef, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../theme'

const wheelItemHeight = 58

export function getWheelOptionLabel(options = [], value = '', fallback = 'Seleziona') {
  return options.find((option) => option.id === value)?.label ?? fallback
}

export function WheelPickerField({ helper, label, onPress, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={onPress} style={styles.button}>
        <View style={styles.copy}>
          <Text numberOfLines={1} style={styles.value}>{value || 'Seleziona'}</Text>
          {helper ? <Text numberOfLines={1} style={styles.helper}>{helper}</Text> : null}
        </View>
        <View style={styles.icon}>
          <Ionicons color={colors.cyanDark} name="chevron-expand-outline" size={19} />
        </View>
      </Pressable>
    </View>
  )
}

export function SelectionWheelModal({ onClose, onConfirm, options = [], title = 'Seleziona', value = '', visible = false }) {
  const scrollRef = useRef(null)
  const [pendingValue, setPendingValue] = useState(value)

  useEffect(() => {
    if (!visible) return undefined

    const safeOptions = options.length ? options : [{ id: '', label: 'Nessun dato' }]
    const selectedIndex = Math.max(0, safeOptions.findIndex((option) => option.id === value))
    const nextValue = safeOptions[selectedIndex]?.id ?? ''
    setPendingValue(nextValue)

    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ animated: false, y: selectedIndex * wheelItemHeight })
    }, 60)

    return () => clearTimeout(timer)
  }, [options, value, visible])

  if (!visible) return null

  const safeOptions = options.length ? options : [{ id: '', label: 'Nessun dato' }]

  function moveToIndex(index, animated = true) {
    const nextIndex = Math.max(0, Math.min(index, safeOptions.length - 1))
    setPendingValue(safeOptions[nextIndex]?.id ?? '')
    scrollRef.current?.scrollTo({ animated, y: nextIndex * wheelItemHeight })
  }

  function handleScrollEnd(event) {
    const offsetY = event.nativeEvent.contentOffset.y
    moveToIndex(Math.round(offsetY / wheelItemHeight), false)
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable onPress={onClose} style={styles.dismissArea} />
        <View style={styles.sheet}>
          <View style={styles.grip} />
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.headerButton}>
              <Text style={styles.cancelText}>Annulla</Text>
            </Pressable>
            <Text numberOfLines={1} style={styles.title}>{title}</Text>
            <Pressable onPress={() => onConfirm?.(pendingValue)} style={styles.headerButton}>
              <Text style={styles.confirmText}>Conferma</Text>
            </Pressable>
          </View>
          <View style={styles.window}>
            <View pointerEvents="none" style={styles.highlight} />
            <ScrollView
              decelerationRate="fast"
              nestedScrollEnabled
              onMomentumScrollEnd={handleScrollEnd}
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={wheelItemHeight}
              style={styles.scroller}
            >
              <View style={styles.spacer} />
              {safeOptions.map((option, index) => {
                const active = option.id === pendingValue
                return (
                  <Pressable key={`${option.id}-${index}`} onPress={() => moveToIndex(index)} style={styles.option}>
                    <Text numberOfLines={1} style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                    {option.subtitle ? (
                      <Text numberOfLines={1} style={[styles.optionSubtitle, active && styles.optionSubtitleActive]}>
                        {option.subtitle}
                      </Text>
                    ) : null}
                  </Pressable>
                )
              })}
              <View style={styles.spacer} />
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(2, 6, 23, 0.48)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#a5f3fc',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  confirmText: {
    color: colors.cyanDark,
    fontSize: 13,
    fontWeight: '900',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  dismissArea: {
    flex: 1,
  },
  field: {
    marginBottom: 10,
  },
  grip: {
    alignSelf: 'center',
    backgroundColor: '#cbd5e1',
    borderRadius: 999,
    height: 5,
    marginBottom: 12,
    width: 44,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 72,
  },
  helper: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  highlight: {
    backgroundColor: '#ecfeff',
    borderColor: '#67e8f9',
    borderRadius: 18,
    borderWidth: 1,
    height: wheelItemHeight,
    left: 0,
    position: 'absolute',
    right: 0,
    top: wheelItemHeight * 2,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#ecfeff',
    borderRadius: 14,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
    marginTop: 4,
  },
  option: {
    alignItems: 'center',
    height: wheelItemHeight,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  optionSubtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  optionSubtitleActive: {
    color: colors.cyanDark,
  },
  optionText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  optionTextActive: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  scroller: {
    zIndex: 1,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    elevation: 24,
    maxHeight: '76%',
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 2,
  },
  spacer: {
    height: wheelItemHeight * 2,
  },
  title: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  value: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  window: {
    height: wheelItemHeight * 5,
    marginTop: 12,
    overflow: 'hidden',
  },
})
