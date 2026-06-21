import { useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getLocale, t } from '../i18n/native'
import { colors } from '../theme'

const weekdays = ['L', 'M', 'M', 'G', 'V', 'S', 'D']

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(value) {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return new Date()

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function isValidDateKey(value) {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
}

function getMonthDays(monthDate) {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: startOffset }, (_, index) => ({ id: `blank-${index}` }))

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day)
    cells.push({ date, id: toDateKey(date), label: String(day) })
  }

  return cells
}

function formatReadableDate(value, language) {
  if (!isValidDateKey(value)) return ''
  return new Intl.DateTimeFormat(getLocale(language), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parseDateKey(value))
}

export function DateField({
  label,
  language = 'it',
  onChange,
  placeholder,
  value,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [visibleMonth, setVisibleMonth] = useState(() => parseDateKey(value))
  const [draftKey, setDraftKey] = useState(() => (isValidDateKey(value) ? value : toDateKey(new Date())))
  const selectedKey = isValidDateKey(value) ? value : ''
  const activeKey = isOpen ? draftKey : selectedKey
  const monthCells = useMemo(() => getMonthDays(visibleMonth), [visibleMonth])
  const monthTitle = new Intl.DateTimeFormat(getLocale(language), {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth)
  const displayValue = formatReadableDate(value, language)

  function shiftMonth(direction) {
    setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1))
  }

  function selectDate(date) {
    setDraftKey(toDateKey(date))
  }

  function clearDate() {
    onChange?.('')
    setIsOpen(false)
  }

  function confirmDate() {
    if (!isValidDateKey(draftKey)) return
    onChange?.(draftKey)
    setIsOpen(false)
  }

  function selectToday() {
    const todayKey = toDateKey(new Date())
    setDraftKey(todayKey)
    setVisibleMonth(parseDateKey(todayKey))
  }

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={() => {
          const nextDraftKey = isValidDateKey(value) ? value : toDateKey(new Date())
          setDraftKey(nextDraftKey)
          setVisibleMonth(parseDateKey(nextDraftKey))
          setIsOpen(true)
        }}
        style={styles.input}
      >
        <Text style={displayValue ? styles.valueText : styles.placeholderText}>
          {displayValue || placeholder || t(language, 'deadlineDate')}
        </Text>
        <Ionicons color={colors.cyanDark} name="calendar-outline" size={20} />
      </Pressable>

      <Modal animationType="fade" onRequestClose={() => setIsOpen(false)} transparent visible={isOpen}>
        <View style={styles.backdrop}>
          <View style={styles.calendar}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={() => shiftMonth(-1)} style={styles.navButton}>
                <Ionicons color={colors.ink} name="chevron-back" size={22} />
              </Pressable>
              <Text style={styles.monthTitle}>{monthTitle}</Text>
              <Pressable onPress={() => shiftMonth(1)} style={styles.navButton}>
                <Ionicons color={colors.ink} name="chevron-forward" size={22} />
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {weekdays.map((weekday, index) => (
                <Text key={`${weekday}-${index}`} style={styles.weekday}>{weekday}</Text>
              ))}
            </View>

            <View style={styles.dayGrid}>
              {monthCells.map((cell) => {
                if (!cell.date) return <View key={cell.id} style={styles.dayCell} />

                const dateKey = toDateKey(cell.date)
                const selected = dateKey === activeKey
                return (
                  <Pressable
                    key={cell.id}
                    onPress={() => selectDate(cell.date)}
                    style={[styles.dayCell, selected && styles.dayCellSelected]}
                  >
                    <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{cell.label}</Text>
                  </Pressable>
                )
              })}
            </View>

            <View style={styles.selectedDateBox}>
              <Text style={styles.selectedDateLabel}>{t(language, 'selectedDate')}</Text>
              <Text style={styles.selectedDateValue}>{formatReadableDate(draftKey, language)}</Text>
            </View>

            <View style={styles.footer}>
              <Pressable onPress={() => setIsOpen(false)} style={styles.footerButton}>
                <Text style={styles.footerText}>{t(language, 'cancel')}</Text>
              </Pressable>
              <Pressable onPress={clearDate} style={styles.footerButton}>
                <Text style={styles.footerText}>{t(language, 'clear')}</Text>
              </Pressable>
              <Pressable onPress={selectToday} style={styles.footerButton}>
                <Text style={styles.footerText}>{t(language, 'today')}</Text>
              </Pressable>
              <Pressable onPress={confirmDate} style={styles.footerButtonPrimary}>
                <Text style={styles.footerTextPrimary}>{t(language, 'confirm')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  calendar: {
    backgroundColor: colors.white,
    borderRadius: 18,
    maxWidth: 420,
    padding: 14,
    width: '100%',
  },
  calendarHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayCell: {
    alignItems: 'center',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: '14.28%',
  },
  dayCellSelected: {
    backgroundColor: colors.cyan,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  dayTextSelected: {
    color: colors.ink,
    fontWeight: '900',
  },
  field: {
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  footerButton: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    flexGrow: 1,
    minHeight: 40,
    minWidth: '47%',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  footerButtonPrimary: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 999,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: '47%',
    paddingHorizontal: 10,
  },
  footerText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  footerTextPrimary: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  input: {
    alignItems: 'center',
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
  },
  monthTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  placeholderText: {
    color: '#94a3b8',
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  selectedDateBox: {
    alignItems: 'center',
    backgroundColor: '#ecfeff',
    borderColor: '#a5f3fc',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedDateLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  selectedDateValue: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  valueText: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  weekday: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    width: '14.28%',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
})
