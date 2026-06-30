import { useEffect, useMemo, useState } from 'react'
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { Ionicons } from '@expo/vector-icons'
import { DateField } from '../components/DateField'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { getWheelOptionLabel, SelectionWheelModal, WheelPickerField } from '../components/WheelPicker'
import { getLocale } from '../i18n/native'
import { getDaysUntilDate, isComplianceActionRequired, sortByDueDate } from '../services/deadlineRules'
import { createCompanyAssetSignedUrl } from '../services/driverApi'
import { colors, layout } from '../theme'

const fleetTypes = [
  { id: 'furgone', label: 'Furgone' },
  { id: 'motrice', label: 'Motrice' },
  { id: 'trattore', label: 'Trattore' },
  { id: 'semirimorchio', label: 'Semirim.' },
]

const scopes = [
  { id: 'driver', label: 'Autista' },
  { id: 'vehicle', label: 'Mezzo' },
  { id: 'company', label: 'Azienda' },
]

const workforceScopes = [
  ...scopes,
  { id: 'person', label: 'Persona' },
  { id: 'asset', label: 'Attrezzatura' },
]

const departmentOptions = [
  { id: 'office', label: 'Ufficio' },
  { id: 'warehouse', label: 'Magazzino' },
]

const personTypeOptions = {
  office: [
    { id: 'office', label: 'Impiegato ufficio' },
    { id: 'manager', label: 'Responsabile ufficio' },
  ],
  warehouse: [
    { id: 'forklift_operator', label: 'Carrellista' },
    { id: 'warehouse_worker', label: 'Magazziniere' },
    { id: 'manager', label: 'Responsabile magazzino' },
  ],
}

const assetTypes = [
  { id: 'forklift', label: 'Muletto' },
  { id: 'pallet_truck', label: 'Transpallet' },
  { id: 'warehouse_equipment', label: 'Attrezzatura' },
  { id: 'other', label: 'Altro' },
]

const costCategoryOptions = [
  { id: 'maintenance', label: 'Manutenzione' },
  { id: 'repair', label: 'Riparazione' },
  { id: 'tires', label: 'Gomme' },
  { id: 'insurance', label: 'Assicurazione' },
  { id: 'revision', label: 'Revisione' },
  { id: 'tax', label: 'Bollo / tasse' },
  { id: 'fuel', label: 'Carburante' },
  { id: 'cleaning', label: 'Lavaggio' },
  { id: 'toll', label: 'Pedaggi' },
  { id: 'fine', label: 'Sanzione' },
  { id: 'other', label: 'Altro' },
]

const costTargetTypeOptions = [
  { id: 'vehicle', label: 'Mezzo', subtitle: 'Targa o veicolo della flotta' },
  { id: 'asset', label: 'Attrezzatura', subtitle: 'Muletto o strumento di lavoro' },
  { id: 'driver', label: 'Autista', subtitle: 'Persona responsabile o collegata' },
  { id: 'company', label: 'Azienda', subtitle: 'Spesa generale non collegata' },
]

const costPeriodOptions = [
  { id: 'today', label: 'Oggi' },
  { id: 'month', label: 'Mese' },
  { id: 'year', label: 'Anno' },
  { id: 'all', label: 'Sempre' },
]

const archiveListOptions = [
  { id: 'people', label: 'Persone' },
  { id: 'office', label: 'Ufficio' },
  { id: 'warehouse', label: 'Magazzino' },
  { id: 'drivers', label: 'Autisti' },
  { id: 'vehicles', label: 'Flotta' },
  { id: 'faults', label: 'Guasti' },
  { id: 'checks', label: 'Check' },
  { id: 'deadlines', label: 'Scadenze' },
  { id: 'costs', label: 'Centro costi' },
]

const createFormOptions = [
  { icon: 'person-add-outline', id: 'driver', label: 'Autista' },
  { icon: 'people-outline', id: 'person', label: 'Persona' },
  { icon: 'cube-outline', id: 'asset', label: 'Attrezzatura' },
  { icon: 'bus-outline', id: 'vehicle', label: 'Mezzo' },
  { icon: 'calendar-outline', id: 'deadline', label: 'Scadenza' },
]

function formatDate(value, language = 'it') {
  if (!value) return 'Senza data'
  return new Intl.DateTimeFormat(getLocale(language), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

function getDeadlineDays(value) {
  return getDaysUntilDate(value)
}

function getDeadlineTone(item) {
  const days = getDeadlineDays(item.dueDate)
  if (days < 0) return 'danger'
  if (days <= 30) return 'warning'
  return 'info'
}

function getDeadlineStatusLabel(item) {
  const days = getDeadlineDays(item.dueDate)
  if (days < 0) return `Scaduta da ${Math.abs(days)} gg`
  if (days === 0) return 'Scade oggi'
  return `Tra ${days} gg`
}

function isValidDateValue(value = '') {
  if (!value) return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return Number.isFinite(new Date(value).getTime())
}

function formatDateTime(value, language = 'it') {
  if (!value) return ''
  return new Intl.DateTimeFormat(getLocale(language), {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
}

function formatMoneyCents(cents = 0, currency = 'EUR') {
  return new Intl.NumberFormat('it-IT', {
    currency: currency || 'EUR',
    style: 'currency',
  }).format((Number(cents) || 0) / 100)
}

function formatMoneyInput(cents = 0) {
  if (!cents) return ''
  return String((Number(cents) / 100).toFixed(2)).replace('.', ',')
}

function parseMoneyToCents(value = '') {
  const normalized = String(value).replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const amount = Number.parseFloat(normalized)

  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0
}

const currencyByLanguage = {
  de: 'EUR',
  en: 'EUR',
  es: 'EUR',
  fr: 'EUR',
  it: 'EUR',
  pl: 'PLN',
  ro: 'RON',
}

function getDefaultCurrency(language = 'it') {
  return currencyByLanguage[language] ?? 'EUR'
}

function getRepairCostDate(fault = {}) {
  return fault.repairRecordedAt || fault.updatedAt || fault.createdAt
}

function getCostEntryDate(entry = {}) {
  return entry.spentAt || entry.updatedAt || entry.createdAt
}

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10)
}

function getRepairPeriodStart(period) {
  const now = new Date()
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1)
  if (period === 'year') return new Date(now.getFullYear(), 0, 1)
  return null
}

function getCurrentMonthRange(referenceDate = new Date(), language = 'it') {
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1)
  const label = new Intl.DateTimeFormat(getLocale(language), {
    month: 'long',
    year: 'numeric',
  }).format(referenceDate)

  return { end, label, start }
}

function getMonthArchiveKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) return ''

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthRangeFromKey(monthKey, language = 'it') {
  const [year, month] = String(monthKey ?? '').split('-').map((part) => Number(part))
  if (!year || !month) return getCurrentMonthRange(new Date(), language)

  return getCurrentMonthRange(new Date(year, month - 1, 1), language)
}

function isDateInRange(value, startDate, endDate) {
  if (!value) return false

  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return false

  return date >= startDate && date < endDate
}

function getDriverName(drivers, driverId) {
  return drivers.find((driver) => driver.id === driverId)?.name ?? 'Autista'
}

function getVehiclePlate(vehicles, vehicleId) {
  return vehicles.find((vehicle) => vehicle.id === vehicleId)?.plate ?? 'Mezzo'
}

function isCheckResolved(check = {}) {
  return ['resolved', 'archived', 'done', 'closed'].includes(check.status)
}

function getCheckIssues(check = {}) {
  return [
    check.lightsOk ? null : 'Luci',
    check.tiresOk ? null : 'Pneumatici',
    check.documentsOnBoard ? null : 'Documenti a bordo',
  ].filter(Boolean)
}

function getAssetTypeLabel(value = '') {
  return assetTypes.find((entry) => entry.id === value)?.label ?? 'Attrezzatura'
}

function getCostCategoryLabel(value = '') {
  return costCategoryOptions.find((entry) => entry.id === value)?.label ?? 'Spesa'
}

function buildCostRanking(rows = [], getGroup) {
  return Array.from(rows.reduce((ranking, row) => {
    const group = getGroup(row)
    if (!group?.key) return ranking

    const current = ranking.get(group.key) ?? {
      count: 0,
      key: group.key,
      name: group.name,
      totalCents: 0,
    }

    ranking.set(group.key, {
      ...current,
      count: current.count + 1,
      totalCents: current.totalCents + Number(row.amountCents ?? 0),
    })

    return ranking
  }, new Map()).values()).sort((first, second) => second.totalCents - first.totalCents)
}

function getDepartmentLabel(value = '') {
  return departmentOptions.find((entry) => entry.id === value)?.label ?? 'Persone'
}

function getPersonTypeLabel(value = '') {
  return Object.values(personTypeOptions)
    .flat()
    .find((entry) => entry.id === value)?.label ?? 'Persona'
}

function getDeadlineSubject(item, drivers, vehicles, people = [], assets = []) {
  if (item.scope === 'driver') {
    return drivers.find((driver) => driver.id === item.driverId)?.name ?? 'Autista'
  }

  if (item.scope === 'vehicle') {
    return vehicles.find((vehicle) => vehicle.id === item.vehicleId)?.plate ?? 'Mezzo'
  }

  if (item.scope === 'person') {
    return people.find((person) => person.id === item.personId)?.name ?? 'Persona'
  }

  if (item.scope === 'asset') {
    return assets.find((asset) => asset.id === item.assetId)?.code ?? 'Attrezzatura'
  }

  return 'Azienda'
}

function getSortedDeadlines(deadlines) {
  return deadlines
    .filter((item) => item.dueDate && !['done', 'archived'].includes(item.status))
    .slice()
    .sort((first, second) => new Date(first.dueDate) - new Date(second.dueDate))
}

function RelatedDeadlines({ deadlines, language = 'it' }) {
  const visibleDeadlines = getSortedDeadlines(deadlines).slice(0, 4)

  if (!visibleDeadlines.length) {
    return <Text style={styles.noDeadlinesText}>Nessuna scadenza collegata</Text>
  }

  return (
    <View style={styles.deadlineChipList}>
      {visibleDeadlines.map((item) => {
        const tone = getDeadlineTone(item)
        return (
          <View key={item.id} style={[styles.deadlineChip, styles[`${tone}Chip`]]}>
            <Text numberOfLines={1} style={styles.deadlineChipTitle}>{item.type}</Text>
            <Text style={[styles.deadlineChipMeta, styles[`${tone}Text`]]}>{formatDate(item.dueDate, language)}</Text>
          </View>
        )
      })}
    </View>
  )
}

function TextField({ keyboardType, label, multiline = false, onChangeText, placeholder, secureTextEntry = false, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.textAreaInput]}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
      />
    </View>
  )
}

function SummaryCard({ icon, label, value }) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Ionicons color={colors.cyanDark} name={icon} size={19} />
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  )
}

function AttachmentButton({ file, label, onPress, onRemove }) {
  return (
    <View style={styles.attachmentRow}>
      <Pressable onPress={onPress} style={styles.attachmentButton}>
        <Ionicons color={colors.cyanDark} name="attach-outline" size={18} />
        <Text numberOfLines={1} style={styles.attachmentText}>{file?.name || label}</Text>
      </Pressable>
      {file ? (
        <Pressable onPress={onRemove} style={styles.attachmentRemove}>
          <Ionicons color={colors.danger} name="close" size={18} />
        </Pressable>
      ) : null}
    </View>
  )
}

export function DeadlineRenewModal({
  drivers = [],
  item,
  language = 'it',
  onClose,
  onMarkDone,
  onSave,
  onSendReminder,
  people = [],
  vehicles = [],
  assets = [],
}) {
  const [form, setForm] = useState({
    documentNumber: '',
    dueDate: '',
    file: null,
    owner: '',
    type: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isSendingReminder, setIsSendingReminder] = useState(false)
  const [isOpeningFile, setIsOpeningFile] = useState(false)

  useEffect(() => {
    if (!item) return
    setForm({
      documentNumber: item.documentNumber ?? '',
      dueDate: item.dueDate ?? '',
      file: null,
      owner: item.owner ?? '',
      type: item.type ?? '',
    })
  }, [item?.id])

  if (!item) return null

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  async function pickRenewFile() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    })

    if (result.canceled || !result.assets?.[0]) return

    const file = result.assets[0]
    updateField('file', {
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
      uri: file.uri,
    })
  }

  async function openCurrentFile() {
    if (!item.filePath) {
      Alert.alert('Allegato mancante', 'Questa scadenza non ha ancora un documento allegato.')
      return
    }

    setIsOpeningFile(true)
    const directUrl = /^https?:\/\//i.test(item.filePath) ? item.filePath : ''
    const result = directUrl ? { data: { signedUrl: directUrl } } : await createCompanyAssetSignedUrl(item.filePath)
    setIsOpeningFile(false)

    const signedUrl = result.data?.signedUrl
    if (!signedUrl) {
      Alert.alert('Documento non disponibile', result.error?.message ?? 'Riprova tra qualche secondo.')
      return
    }

    await Linking.openURL(signedUrl)
  }

  async function saveRenewal() {
    const cleanType = form.type.trim()
    const cleanDueDate = form.dueDate.trim()

    if (!cleanType || !cleanDueDate) {
      Alert.alert('Dati mancanti', 'Inserisci tipo scadenza e nuova data.')
      return
    }

    if (!isValidDateValue(cleanDueDate)) {
      Alert.alert('Data non valida', 'Scegli la data dal calendario.')
      return
    }

    setIsSaving(true)
    const saved = await onSave?.(item, {
      documentNumber: form.documentNumber.trim(),
      dueDate: cleanDueDate,
      owner: form.owner.trim(),
      type: cleanType,
    }, form.file)
    setIsSaving(false)

    if (saved) {
      Alert.alert('Scadenza aggiornata', 'Nuovo documento e nuova data sono stati salvati.')
      onClose?.()
    }
  }

  async function sendReminder() {
    if (!onSendReminder) return

    setIsSendingReminder(true)
    const sent = await onSendReminder(item)
    setIsSendingReminder(false)

    if (sent) {
      Alert.alert('Sollecito inviato', 'La persona ricevera messaggio in chat e notifica sul telefono.')
    }
  }

  async function markDone() {
    if (!onMarkDone) return

    setIsClosing(true)
    const closed = await onMarkDone(item.id)
    setIsClosing(false)

    if (closed !== false) {
      Alert.alert('Pratica chiusa', 'La scadenza e stata archiviata dal registro operativo.')
      onClose?.()
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible>
      <View style={styles.detailScreen}>
        <View style={styles.detailHeader}>
          <Pressable disabled={isSaving} onPress={onClose} style={styles.detailCloseButton}>
            <Text style={styles.detailCloseText}>‹</Text>
          </Pressable>
          <View style={styles.listCopy}>
            <Text style={styles.detailKicker}>Rinnovo scadenza</Text>
            <Text numberOfLines={1} style={styles.detailHeaderTitle}>{item.type}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.detailContent}>
          <Text style={styles.detailTitle}>{item.type}</Text>
          <View style={styles.renewSummaryBox}>
            <Text style={styles.renewSummaryTitle}>{getDeadlineSubject(item, drivers, vehicles, people, assets)}</Text>
            <Text style={styles.renewSummaryMeta}>
              Attuale: {formatDate(item.dueDate, language)} · {getDeadlineStatusLabel(item)}
            </Text>
          </View>

          <TextField label="Tipo scadenza" onChangeText={(value) => updateField('type', value)} placeholder="Assicurazione, visita medica..." value={form.type} />
          <DateField label="Nuova data scadenza" language={language} onChange={(value) => updateField('dueDate', value)} value={form.dueDate} />
          <TextField label="Numero documento" onChangeText={(value) => updateField('documentNumber', value)} placeholder="Opzionale" value={form.documentNumber} />
          <TextField label="Responsabile" onChangeText={(value) => updateField('owner', value)} placeholder="Opzionale" value={form.owner} />

          <View style={styles.attachmentRenewBox}>
            <View style={styles.listCopy}>
              <Text style={styles.attachmentRenewTitle}>Documento attuale</Text>
              <Text style={styles.attachmentRenewMeta}>{item.filePath ? 'Allegato presente' : 'Nessun allegato presente'}</Text>
            </View>
            <Pressable disabled={isOpeningFile || !item.filePath} onPress={openCurrentFile} style={[styles.smallButton, !item.filePath && styles.smallButtonDisabled]}>
              <Text style={styles.smallButtonText}>{isOpeningFile ? 'Apro...' : 'Apri'}</Text>
            </Pressable>
          </View>

          <AttachmentButton
            file={form.file}
            label="Carica nuovo PDF o foto"
            onPress={pickRenewFile}
            onRemove={() => updateField('file', null)}
          />

          {onSendReminder ? (
            <Pressable
              disabled={isSaving || isSendingReminder}
              onPress={sendReminder}
              style={[styles.reminderButton, (isSaving || isSendingReminder) && styles.smallButtonDisabled]}
            >
              <Ionicons color={colors.ink} name="notifications-outline" size={18} />
              <Text style={styles.reminderButtonText}>{isSendingReminder ? 'Invio sollecito...' : 'Sollecita su app'}</Text>
            </Pressable>
          ) : null}

          <PrimaryButton loading={isSaving} onPress={saveRenewal} title="Salva rinnovo e aggiorna" />
          {onMarkDone ? (
            <Pressable disabled={isSaving || isClosing} onPress={markDone} style={[styles.closeDeadlineButton, (isSaving || isClosing) && styles.smallButtonDisabled]}>
              <Ionicons color={colors.danger} name="checkmark-done-outline" size={18} />
              <Text style={styles.closeDeadlineButtonText}>{isClosing ? 'Chiudo pratica...' : 'Segna gestita senza rinnovo'}</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  )
}

function FaultRepairModal({ fault, language = 'it', onClose, onSave, vehicles = [] }) {
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!fault?.id) return
    setAmount(formatMoneyInput(fault.repairCostCents))
    setNotes(fault.repairNotes ?? '')
    setIsSaving(false)
  }, [fault?.id, fault?.repairCostCents, fault?.repairNotes])

  if (!fault) return null

  const repairCostCents = parseMoneyToCents(amount)
  const vehicle = vehicles.find((entry) => entry.id === fault.vehicleId)
  const repairCurrency = fault.repairCostCurrency || getDefaultCurrency(language)

  async function saveRepair() {
    setIsSaving(true)
    const saved = await onSave?.(fault.id, {
      repairCostCents,
      repairCostCurrency: repairCurrency,
      repairNotes: notes,
    })
    setIsSaving(false)

    if (saved !== false) {
      Alert.alert('Costo salvato', 'Il costo riparazione e stato aggiornato.')
      onClose?.()
    }
  }

  function deleteRepair() {
    Alert.alert(
      'Eliminare costo?',
      'Il guasto restera nello storico, ma il costo riparazione verra azzerato.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          onPress: async () => {
            setIsSaving(true)
            const saved = await onSave?.(fault.id, {
              repairCleared: true,
              repairCostCents: 0,
              repairCostCurrency: repairCurrency,
              repairNotes: '',
            })
            setIsSaving(false)

            if (saved !== false) {
              Alert.alert('Costo eliminato', 'Il costo riparazione e stato tolto dal guasto.')
              onClose?.()
            }
          },
          style: 'destructive',
          text: 'Elimina costo',
        },
      ],
    )
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} visible>
      <View style={styles.detailScreen}>
        <View style={styles.detailHeader}>
          <Pressable disabled={isSaving} onPress={onClose} style={styles.detailCloseButton}>
            <Text style={styles.detailCloseText}>‹</Text>
          </Pressable>
          <View style={styles.listCopy}>
            <Text style={styles.detailKicker}>Costo riparazione</Text>
            <Text numberOfLines={1} style={styles.detailHeaderTitle}>{fault.title}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.detailContent}>
          <View style={styles.renewSummaryBox}>
            <Text style={styles.renewSummaryTitle}>{vehicle?.plate ?? 'Mezzo non indicato'}</Text>
            <Text style={styles.renewSummaryMeta}>{formatDateTime(fault.createdAt, language)} · {fault.description || 'Nessuna descrizione'}</Text>
          </View>
          <TextField label="Importo speso" keyboardType="decimal-pad" onChangeText={setAmount} placeholder="Es. 450,00" value={amount} />
          <TextField label="Note officina/intervento" multiline onChangeText={setNotes} placeholder="Es. sostituito alternatore" value={notes} />
          <Text style={styles.repairTotalText}>
            {repairCostCents ? `Totale: ${formatMoneyCents(repairCostCents, repairCurrency)}` : 'Lascia vuoto se il costo non e ancora noto.'}
          </Text>
          <PrimaryButton loading={isSaving} onPress={saveRepair} title="Salva costo" />
          {fault.repairCostCents ? (
            <Pressable disabled={isSaving} onPress={deleteRepair} style={[styles.rowActionButtonDanger, styles.repairDeleteButton]}>
              <Ionicons color={colors.danger} name="trash-outline" size={16} />
              <Text style={styles.rowActionDangerText}>Elimina costo riparazione</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  )
}

export function CompanyManagementScreen({
  context,
  initialSection = 'drivers',
  initialMode = 'archive',
  language = 'it',
  startCostEntryKey = 0,
  onCreateDeadline,
  onCreateCostEntry,
  onCreateDriver,
  onCreatePerson,
  onCreateVehicle,
  onCreateWarehouseAsset,
  onCloseDeadline,
  onDeleteCostEntry,
  onRenewDeadline,
  onResetAccessPassword,
  onSendDeadlineReminder,
  onUpdateCostEntry,
  onUpdateFaultRepair,
}) {
  const workforceSchemaReady = context?.workforceSchemaReady !== false
  const drivers = context?.drivers ?? []
  const people = context?.people ?? []
  const vehicles = context?.vehicles ?? []
  const assets = context?.assets ?? []
  const deadlines = context?.complianceItems ?? []
  const faults = context?.faultReports ?? []
  const costEntries = context?.costEntries ?? []
  const checks = context?.vehicleChecks ?? []
  const defaultCurrency = getDefaultCurrency(language)
  const activeVehicles = vehicles.filter((vehicle) => !['Archiviato', 'archived'].includes(vehicle.status))
  const archivedFaults = faults.filter((fault) => ['closed', 'archived'].includes(fault.status))
  const archivedChecks = checks.filter(isCheckResolved)
  const fallbackDriverPeople = drivers.map((driver) => ({
    department: 'drivers',
    id: `driver-${driver.id}`,
    jobTitle: driver.role || 'Autista',
    linkedDriverId: driver.id,
    name: driver.name,
    personType: 'driver',
    phone: driver.phone,
    username: driver.username,
  }))
  const allPeople = workforceSchemaReady ? people : fallbackDriverPeople
  const officePeople = allPeople.filter((person) => person.department === 'office')
  const warehousePeople = allPeople.filter((person) => person.department === 'warehouse')
  const warehouseAssets = assets.filter((asset) => !['Archiviato', 'archived'].includes(asset.status))
  const isCreateOnly = initialMode === 'create'
  const [activeForm, setActiveForm] = useState('driver')
  const [activeList, setActiveList] = useState(initialSection)
  const [selectedDeadline, setSelectedDeadline] = useState(null)
  const [selectedFault, setSelectedFault] = useState(null)
  const [mode, setMode] = useState(initialMode)
  const [driverForm, setDriverForm] = useState({
    adrDueDate: '',
    depot: '',
    cqcDueDate: '',
    licenseDueDate: '',
    medicalDueDate: '',
    name: '',
    password: '',
    phone: '',
    role: 'Autista',
    tachographCardDueDate: '',
    username: '',
  })
  const [personForm, setPersonForm] = useState({
    department: 'office',
    depot: '',
    email: '',
    forkliftLicenseDueDate: '',
    jobTitle: 'Impiegato ufficio',
    medicalDueDate: '',
    name: '',
    password: '',
    personType: 'office',
    phone: '',
    safetyTrainingDueDate: '',
    username: '',
  })
  const [assetForm, setAssetForm] = useState({
    assetType: 'forklift',
    code: '',
    location: '',
    maintenanceDueDate: '',
    model: '',
    serialNumber: '',
  })
  const [vehicleForm, setVehicleForm] = useState({
    insuranceDueDate: '',
    insuranceFile: null,
    bookletDueDate: '',
    bookletFile: null,
    fleetType: 'trattore',
    km: '',
    model: '',
    plate: '',
    revisionDueDate: '',
    revisionFile: null,
    tachographDueDate: '',
    tachographFile: null,
    type: '',
  })
  const [deadlineForm, setDeadlineForm] = useState({
    assigneeId: '',
    documentNumber: '',
    dueDate: '',
    file: null,
    owner: '',
    scope: 'vehicle',
    type: '',
  })
  const [costForm, setCostForm] = useState({
    amount: '',
    assetId: '',
    category: 'maintenance',
    driverId: '',
    file: null,
    id: '',
    notes: '',
    odometerKm: '',
    spentAt: getTodayInputDate(),
    supplier: '',
    targetType: 'vehicle',
    title: '',
    vehicleId: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingCost, setIsSavingCost] = useState(false)
  const [costPeriod, setCostPeriod] = useState('month')
  const [costTargetFilter, setCostTargetFilter] = useState('all')
  const [selectedArchiveMonthKey, setSelectedArchiveMonthKey] = useState(() => getMonthArchiveKey())
  const [showAllDeadlines, setShowAllDeadlines] = useState(false)
  const [wheelPicker, setWheelPicker] = useState(null)
  const currentScopes = workforceSchemaReady ? workforceScopes : scopes
  const costVehicleOptions = useMemo(
    () => [
      { id: '', label: 'Senza targa', subtitle: 'Non collegare a un mezzo' },
      ...vehicles.map((vehicle) => ({
        id: vehicle.id,
        label: vehicle.plate,
        subtitle: [vehicle.model, vehicle.fleetType].filter(Boolean).join(' · '),
      })),
    ],
    [vehicles],
  )
  const costDriverOptions = useMemo(
    () => [
      { id: '', label: 'Senza autista', subtitle: 'Non collegare a una persona' },
      ...drivers.map((driver) => ({
        id: driver.id,
        label: driver.name,
        subtitle: driver.phone || driver.role || '',
      })),
    ],
    [drivers],
  )
  const costAssetOptions = useMemo(
    () => [
      { id: '', label: 'Senza codice', subtitle: 'Non collegare ad attrezzatura' },
      ...warehouseAssets.map((asset) => ({
        id: asset.id,
        label: asset.code,
        subtitle: [asset.model, asset.location].filter(Boolean).join(' · '),
      })),
    ],
    [warehouseAssets],
  )
  const costReportFilterOptions = useMemo(
    () => [
      { id: 'all', label: 'Tutti', subtitle: 'Tutte le spese' },
      { id: 'company', label: 'Azienda', subtitle: 'Solo spese generali' },
      ...vehicles.map((vehicle) => ({
        id: `vehicle:${vehicle.id}`,
        label: `Mezzo ${vehicle.plate}`,
        subtitle: vehicle.model || vehicle.fleetType || '',
      })),
      ...drivers.map((driver) => ({
        id: `driver:${driver.id}`,
        label: `Autista ${driver.name}`,
        subtitle: driver.phone || driver.role || '',
      })),
      ...warehouseAssets.map((asset) => ({
        id: `asset:${asset.id}`,
        label: `Attr. ${asset.code}`,
        subtitle: asset.model || asset.location || '',
      })),
    ],
    [drivers, vehicles, warehouseAssets],
  )
  const deadlineAssignees = useMemo(() => {
    if (deadlineForm.scope === 'driver') return drivers
    if (deadlineForm.scope === 'vehicle') return activeVehicles
    if (deadlineForm.scope === 'person') return allPeople
    if (deadlineForm.scope === 'asset') return warehouseAssets
    return []
  }, [activeVehicles, allPeople, deadlineForm.scope, drivers, warehouseAssets])
  const deadlineAssigneeOptions = useMemo(
    () => deadlineAssignees.map((item) => ({
      id: item.id,
      label: deadlineForm.scope === 'driver'
        ? item.name
        : deadlineForm.scope === 'vehicle'
          ? item.plate
          : deadlineForm.scope === 'asset'
            ? item.code
            : item.name,
      subtitle: deadlineForm.scope === 'vehicle'
        ? item.model || item.fleetType || ''
        : deadlineForm.scope === 'asset'
          ? item.model || item.location || ''
          : item.phone || item.jobTitle || '',
    })),
    [deadlineAssignees, deadlineForm.scope],
  )
  const deadlinesToWork = useMemo(
    () => sortByDueDate(deadlines.filter(isComplianceActionRequired)),
    [deadlines],
  )
  const allDeadlineRows = useMemo(
    () => sortByDueDate(deadlines.filter((item) => item.dueDate)),
    [deadlines],
  )
  const nextDeadlines = useMemo(
    () => (showAllDeadlines ? allDeadlineRows : deadlinesToWork),
    [allDeadlineRows, deadlinesToWork, showAllDeadlines],
  )
  const allCostRows = useMemo(() => {
    const faultRows = faults
      .filter((fault) => Number(fault.repairCostCents ?? 0) > 0)
      .map((fault) => ({
        amountCents: Number(fault.repairCostCents ?? 0),
        assetId: '',
        category: 'repair',
        currency: fault.repairCostCurrency || defaultCurrency,
        date: getRepairCostDate(fault),
        description: fault.description ?? '',
        driverId: fault.driverId ?? '',
        fault,
        id: `fault-${fault.id}`,
        kind: 'fault',
        title: fault.title,
        vehicleId: fault.vehicleId,
      }))
    const entryRows = costEntries
      .filter((entry) => Number(entry.amountCents ?? 0) > 0)
      .map((entry) => ({
        amountCents: Number(entry.amountCents ?? 0),
        assetId: entry.assetId ?? '',
        category: entry.category ?? 'maintenance',
        currency: entry.currency || defaultCurrency,
        date: getCostEntryDate(entry),
        description: entry.notes ?? '',
        driverId: entry.driverId ?? '',
        entry,
        id: `entry-${entry.id}`,
        kind: 'entry',
        title: entry.title,
        vehicleId: entry.vehicleId ?? '',
      }))

    return [...faultRows, ...entryRows].sort((first, second) => new Date(second.date) - new Date(first.date))
  }, [costEntries, defaultCurrency, faults])
  const costRows = useMemo(() => {
    const periodStart = getRepairPeriodStart(costPeriod)

    return allCostRows
      .filter((row) => {
        if (costTargetFilter === 'all') return true
        if (costTargetFilter === 'company') return !row.vehicleId && !row.assetId && !row.driverId

        const [targetType, targetId] = costTargetFilter.split(':')
        if (targetType === 'vehicle') return row.vehicleId === targetId
        if (targetType === 'driver') return row.driverId === targetId
        if (targetType === 'asset') return row.assetId === targetId

        return true
      })
      .filter((row) => {
        if (!periodStart) return true
        const costDate = new Date(row.date)
        return Number.isFinite(costDate.getTime()) && costDate >= periodStart
      })
  }, [allCostRows, costPeriod, costTargetFilter])
  const repairCostTotalCents = costRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const repairCostAverageCents = costRows.length ? Math.round(repairCostTotalCents / costRows.length) : 0
  const fineCostRows = costRows.filter((row) => row.category === 'fine')
  const fineCostTotalCents = fineCostRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const fineRanking = Array.from(fineCostRows.reduce((ranking, row) => {
    const key = row.driverId || 'unassigned'
    const current = ranking.get(key) ?? {
      count: 0,
      driverId: row.driverId,
      name: row.driverId ? drivers.find((driver) => driver.id === row.driverId)?.name ?? 'Autista' : 'Non assegnate',
      totalCents: 0,
    }
    ranking.set(key, {
      ...current,
      count: current.count + 1,
      totalCents: current.totalCents + Number(row.amountCents ?? 0),
    })
    return ranking
  }, new Map()).values()).sort((first, second) => second.totalCents - first.totalCents)
  const unlinkedCostRows = costRows.filter((row) => !row.vehicleId && !row.assetId && !row.driverId)
  const targetCostRanking = buildCostRanking(costRows, (row) => ({
    key: row.vehicleId
      ? `vehicle:${row.vehicleId}`
      : row.assetId
        ? `asset:${row.assetId}`
        : row.driverId
          ? `driver:${row.driverId}`
          : 'company',
    name: getCostTargetLabel(row),
  }))
  const categoryCostRanking = buildCostRanking(costRows, (row) => ({
    key: row.category || 'maintenance',
    name: getCostCategoryLabel(row.category),
  }))
  const topTargetCost = targetCostRanking[0] ?? null
  const topCategoryCost = categoryCostRanking[0] ?? null
  const monthlyRange = useMemo(() => getMonthRangeFromKey(selectedArchiveMonthKey, language), [language, selectedArchiveMonthKey])
  const monthlyCostRows = useMemo(
    () => allCostRows.filter((row) => isDateInRange(row.date, monthlyRange.start, monthlyRange.end)),
    [allCostRows, monthlyRange.end, monthlyRange.start],
  )
  const monthlyTotalCents = monthlyCostRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const monthlyFineRows = monthlyCostRows.filter((row) => row.category === 'fine')
  const monthlyFineTotalCents = monthlyFineRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0)
  const monthlyFaultRows = faults.filter((fault) => isDateInRange(fault.createdAt || fault.updatedAt, monthlyRange.start, monthlyRange.end))
  const monthlyOpenFaultRows = faults.filter((fault) => !['closed', 'archived'].includes(fault.status))
  const monthlyCheckRows = checks.filter((check) => isDateInRange(check.createdAt || check.updatedAt, monthlyRange.start, monthlyRange.end))
  const monthlyCriticalCheckRows = monthlyCheckRows.filter((check) => getCheckIssues(check).length > 0)
  const monthlyOkCheckRows = monthlyCheckRows.filter((check) => getCheckIssues(check).length === 0)
  const monthlyDeadlineRows = deadlines.filter((item) => !['done', 'archived'].includes(item.status) && isDateInRange(item.dueDate, monthlyRange.start, monthlyRange.end))
  const monthlyUnassignedFineRows = monthlyFineRows.filter((row) => !row.driverId)
  const monthlyUnlinkedCostRows = monthlyCostRows.filter((row) => !row.vehicleId && !row.assetId && !row.driverId)
  const monthlyTopTargetCost = buildCostRanking(monthlyCostRows, (row) => ({
    key: row.vehicleId
      ? `vehicle:${row.vehicleId}`
      : row.assetId
        ? `asset:${row.assetId}`
        : row.driverId
          ? `driver:${row.driverId}`
          : 'company',
    name: getCostTargetLabel(row),
  }))[0] ?? null
  const monthlyTopCategoryCost = buildCostRanking(monthlyCostRows, (row) => ({
    key: row.category || 'maintenance',
    name: getCostCategoryLabel(row.category),
  }))[0] ?? null
  const monthlyActionRows = [
    deadlinesToWork.length
      ? {
          icon: 'calendar-outline',
          tone: 'danger',
          title: 'Scadenze da lavorare',
          value: `${deadlinesToWork.length} pratiche`,
        }
      : null,
    monthlyOpenFaultRows.length
      ? {
          icon: 'construct-outline',
          tone: 'danger',
          title: 'Guasti ancora aperti',
          value: `${monthlyOpenFaultRows.length} segnalazioni`,
        }
      : null,
    monthlyCriticalCheckRows.length
      ? {
          icon: 'warning-outline',
          tone: 'warning',
          title: 'Check con anomalie',
          value: `${monthlyCriticalCheckRows.length} check`,
        }
      : null,
    monthlyUnassignedFineRows.length
      ? {
          icon: 'alert-circle-outline',
          tone: 'warning',
          title: 'Multe non assegnate',
          value: `${monthlyUnassignedFineRows.length} multe`,
        }
      : null,
    monthlyUnlinkedCostRows.length
      ? {
          icon: 'link-outline',
          tone: 'warning',
          title: 'Spese scollegate',
          value: `${monthlyUnlinkedCostRows.length} voci`,
        }
      : null,
  ].filter(Boolean).slice(0, 4)
  const monthlyArchiveRows = useMemo(() => Array.from(new Set([
    getMonthArchiveKey(),
    ...allCostRows.map((row) => getMonthArchiveKey(row.date)),
    ...faults.map((fault) => getMonthArchiveKey(fault.createdAt || fault.updatedAt)),
    ...checks.map((check) => getMonthArchiveKey(check.createdAt || check.updatedAt)),
    ...deadlines.map((item) => getMonthArchiveKey(item.dueDate)),
  ].filter(Boolean)))
    .sort((first, second) => second.localeCompare(first))
    .slice(0, 18)
    .map((monthKey) => {
      const range = getMonthRangeFromKey(monthKey, language)
      const archiveCostRows = allCostRows.filter((row) => isDateInRange(row.date, range.start, range.end))
      const archiveFaultRows = faults.filter((fault) => isDateInRange(fault.createdAt || fault.updatedAt, range.start, range.end))
      const archiveCheckRows = checks.filter((check) => isDateInRange(check.createdAt || check.updatedAt, range.start, range.end))
      const archiveCriticalChecks = archiveCheckRows.filter((check) => getCheckIssues(check).length > 0)
      const archiveDeadlineRows = deadlines.filter((item) => !['done', 'archived'].includes(item.status) && isDateInRange(item.dueDate, range.start, range.end))

      return {
        costCount: archiveCostRows.length,
        criticalCheckCount: archiveCriticalChecks.length,
        deadlineCount: archiveDeadlineRows.length,
        faultCount: archiveFaultRows.length,
        key: monthKey,
        label: range.label,
        totalCents: archiveCostRows.reduce((total, row) => total + Number(row.amountCents ?? 0), 0),
      }
    }), [allCostRows, checks, deadlines, faults, language])
  const monthlyArchiveOptions = useMemo(
    () => monthlyArchiveRows.map((row) => ({
      id: row.key,
      label: row.label,
      subtitle: `${formatMoneyCents(row.totalCents, defaultCurrency)} · ${row.costCount} costi`,
    })),
    [defaultCurrency, monthlyArchiveRows],
  )

  useEffect(() => {
    if (initialSection) {
      setActiveList(initialSection)
    }
    setMode(initialMode)
  }, [initialMode, initialSection])

  useEffect(() => {
    if (!startCostEntryKey) return
    setActiveList('costs')
    setMode('archive')
    resetCostForm()
  }, [startCostEntryKey])

  function openWheelPicker(config) {
    setWheelPicker(config)
  }

  function closeWheelPicker() {
    setWheelPicker(null)
  }

  function confirmWheelPicker(nextValue) {
    wheelPicker?.onSelect?.(nextValue)
    setWheelPicker(null)
  }

  function openArchive(section = activeList) {
    setActiveList(section)
    if (!isCreateOnly) setMode('archive')
  }

  function updateDriverForm(field, value) {
    setDriverForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updatePersonForm(field, value) {
    setPersonForm((currentForm) => {
      if (field === 'department') {
        const nextPersonType = value === 'warehouse' ? 'forklift_operator' : 'office'
        const nextLabel = personTypeOptions[value]?.find((entry) => entry.id === nextPersonType)?.label ?? ''
        return {
          ...currentForm,
          department: value,
          jobTitle: nextLabel,
          personType: nextPersonType,
        }
      }

      if (field === 'personType') {
        const nextLabel = personTypeOptions[currentForm.department]?.find((entry) => entry.id === value)?.label ?? currentForm.jobTitle
        return { ...currentForm, jobTitle: nextLabel, personType: value }
      }

      return { ...currentForm, [field]: value }
    })
  }

  function updateAssetForm(field, value) {
    setAssetForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updateVehicleForm(field, value) {
    setVehicleForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updateDeadlineForm(field, value) {
    setDeadlineForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updateCostForm(field, value) {
    setCostForm((currentForm) => {
      if (field === 'category' && value === 'fine') {
        return {
          ...currentForm,
          category: value,
          driverId: currentForm.driverId || drivers[0]?.id || '',
          supplier: currentForm.supplier || 'Sanzione',
          targetType: 'driver',
        }
      }

      if (field === 'targetType') {
        return {
          ...currentForm,
          assetId: '',
          driverId: '',
          targetType: value,
          vehicleId: '',
        }
      }

      return { ...currentForm, [field]: value }
    })
  }

  async function pickAttachment(onSelected) {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    })

    if (result.canceled || !result.assets?.[0]) return

    const file = result.assets[0]
    onSelected({
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
      uri: file.uri,
    })
  }

  async function submitCostEntry() {
    const amountCents = parseMoneyToCents(costForm.amount)
    const isFineEntry = costForm.category === 'fine'
    const payload = {
      amountCents,
      assetId: !isFineEntry && costForm.targetType === 'asset' ? costForm.assetId : '',
      category: costForm.category,
      currency: defaultCurrency,
      driverId: isFineEntry ? costForm.driverId : costForm.targetType === 'driver' ? costForm.driverId : '',
      notes: costForm.notes.trim(),
      odometerKm: costForm.odometerKm.trim(),
      spentAt: costForm.spentAt.trim(),
      supplier: costForm.supplier.trim(),
      title: costForm.title.trim(),
      vehicleId: isFineEntry ? costForm.vehicleId : costForm.targetType === 'vehicle' ? costForm.vehicleId : '',
    }

    if (!payload.title || !payload.amountCents || !payload.spentAt) {
      Alert.alert('Dati mancanti', 'Inserisci titolo, importo e data della spesa.')
      return
    }

    setIsSavingCost(true)
    const previousEntry = costEntries.find((entry) => entry.id === costForm.id)
    const saved = costForm.id
      ? await onUpdateCostEntry?.(costForm.id, payload, costForm.file, previousEntry)
      : await onCreateCostEntry?.(payload, costForm.file)
    setIsSavingCost(false)

    if (saved) {
      resetCostForm()
      Alert.alert(costForm.id ? 'Spesa aggiornata' : 'Spesa salvata', 'Il Centro costi e stato aggiornato.')
    }
  }

  function resetCostForm() {
    setCostForm({
      amount: '',
      assetId: '',
      category: 'maintenance',
      driverId: '',
      file: null,
      id: '',
      notes: '',
      odometerKm: '',
      spentAt: getTodayInputDate(),
      supplier: '',
      targetType: 'vehicle',
      title: '',
      vehicleId: '',
    })
  }

  function startEditCostEntry(entry = {}) {
    setCostForm({
      amount: entry.amountCents ? String((Number(entry.amountCents) / 100).toFixed(2)).replace('.', ',') : '',
      assetId: entry.assetId ?? '',
      category: entry.category ?? 'maintenance',
      driverId: entry.driverId ?? '',
      file: null,
      id: entry.id ?? '',
      notes: entry.notes ?? '',
      odometerKm: entry.odometerKm ? String(entry.odometerKm) : '',
      spentAt: entry.spentAt ?? getTodayInputDate(),
      supplier: entry.supplier ?? '',
      targetType: entry.driverId ? 'driver' : entry.assetId ? 'asset' : entry.vehicleId ? 'vehicle' : 'company',
      title: entry.title ?? '',
      vehicleId: entry.vehicleId ?? '',
    })
  }

  function deleteCostEntry(entry = {}) {
    Alert.alert(
      'Eliminare spesa?',
      `Vuoi eliminare "${entry.title}" dal Centro costi?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          onPress: async () => {
            const deleted = await onDeleteCostEntry?.(entry)
            if (deleted && costForm.id === entry.id) resetCostForm()
          },
          style: 'destructive',
          text: 'Elimina',
        },
      ],
    )
  }

  function deleteFaultRepair(fault = {}) {
    Alert.alert(
      'Eliminare costo guasto?',
      `Vuoi azzerare il costo registrato su "${fault.title}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          onPress: async () => {
            await onUpdateFaultRepair?.(fault.id, {
              repairCleared: true,
              repairCostCents: 0,
              repairCostCurrency: fault.repairCostCurrency || defaultCurrency,
              repairNotes: '',
            })
          },
          style: 'destructive',
          text: 'Elimina costo',
        },
      ],
    )
  }

  function getCostTargetLabel(row = {}) {
    if (row.vehicleId) return getVehiclePlate(vehicles, row.vehicleId)
    if (row.assetId) return warehouseAssets.find((asset) => asset.id === row.assetId)?.code ?? 'Attrezzatura'
    if (row.driverId) return drivers.find((driver) => driver.id === row.driverId)?.name ?? 'Autista'
    return 'Azienda'
  }

  function resetAccess(targetType, targetId, name) {
    Alert.alert(
      'Reimposta password',
      `Genero una nuova password temporanea per ${name}?`,
      [
        { style: 'cancel', text: 'Annulla' },
        {
          onPress: () => onResetAccessPassword?.({ name, targetId, targetType }),
          text: 'Genera',
        },
      ],
    )
  }

  async function submitDriver() {
    const payload = {
      depot: driverForm.depot.trim(),
      name: driverForm.name.trim(),
      phone: driverForm.phone.trim(),
      role: driverForm.role.trim() || 'Autista',
      username: driverForm.username.trim(),
    }
    const password = driverForm.password.trim()

    if (!payload.name || !payload.phone || !payload.username || !password) {
      Alert.alert('Dati mancanti', 'Compila nome, telefono, username e password temporanea.')
      return
    }

    setIsSaving(true)
    const savedDriver = await onCreateDriver?.(payload, password)

    if (savedDriver?.id) {
      const initialDeadlines = [
        { dueDate: driverForm.licenseDueDate.trim(), type: 'Patente' },
        { dueDate: driverForm.cqcDueDate.trim(), type: 'CQC' },
        { dueDate: driverForm.adrDueDate.trim(), type: 'ADR' },
        { dueDate: driverForm.tachographCardDueDate.trim(), type: 'Tessera tachigrafica' },
        { dueDate: driverForm.medicalDueDate.trim(), type: 'Visita medica' },
      ].filter((item) => item.dueDate)

      for (const item of initialDeadlines) {
        await onCreateDeadline?.({
          assigneeId: savedDriver.id,
          dueDate: item.dueDate,
          scope: 'driver',
          type: item.type,
        })
      }
    }

    setIsSaving(false)

    if (savedDriver) {
      setDriverForm({
        adrDueDate: '',
        cqcDueDate: '',
        depot: '',
        licenseDueDate: '',
        medicalDueDate: '',
        name: '',
        password: '',
        phone: '',
        role: 'Autista',
        tachographCardDueDate: '',
        username: '',
      })
      openArchive('drivers')
      Alert.alert('Autista creato', `Username: ${payload.username}\nPassword: ${password}`)
    }
  }

  async function submitPerson() {
    if (!workforceSchemaReady) {
      Alert.alert('Da attivare', 'Per creare ufficio e magazzino devi prima eseguire il file SQL 31 in Supabase.')
      return
    }

    const payload = {
      department: personForm.department,
      depot: personForm.depot.trim(),
      email: personForm.email.trim(),
      jobTitle: personForm.jobTitle.trim() || getPersonTypeLabel(personForm.personType),
      name: personForm.name.trim(),
      password: personForm.password.trim(),
      personType: personForm.personType,
      phone: personForm.phone.trim(),
      username: personForm.username.trim(),
    }

    if (!payload.name || !payload.department || !payload.personType || !payload.username || !payload.password) {
      Alert.alert('Dati mancanti', 'Compila nome, reparto, ruolo, username e password temporanea.')
      return
    }

    if (payload.password.length < 8) {
      Alert.alert('Password breve', 'La password temporanea deve avere almeno 8 caratteri.')
      return
    }

    setIsSaving(true)
    const savedPerson = await onCreatePerson?.(payload)

    if (savedPerson?.id) {
      const initialDeadlines = [
        { dueDate: personForm.medicalDueDate.trim(), type: 'Visita medica' },
        { dueDate: personForm.safetyTrainingDueDate.trim(), type: 'Formazione sicurezza' },
        personForm.personType === 'forklift_operator'
          ? { dueDate: personForm.forkliftLicenseDueDate.trim(), type: 'Patentino carrello' }
          : null,
      ].filter((item) => item?.dueDate)

      for (const item of initialDeadlines) {
        await onCreateDeadline?.({
          assigneeId: savedPerson.id,
          dueDate: item.dueDate,
          scope: 'person',
          type: item.type,
        })
      }
    }

    setIsSaving(false)

    if (savedPerson) {
      setPersonForm({
        department: 'office',
        depot: '',
        email: '',
        forkliftLicenseDueDate: '',
        jobTitle: 'Impiegato ufficio',
        medicalDueDate: '',
        name: '',
        password: '',
        personType: 'office',
        phone: '',
        safetyTrainingDueDate: '',
        username: '',
      })
      openArchive(savedPerson.department === 'warehouse' ? 'warehouse' : 'office')
      Alert.alert('Persona creata', `Username: ${payload.username}\nPassword: ${payload.password}`)
    }
  }

  async function submitWarehouseAsset() {
    if (!workforceSchemaReady) {
      Alert.alert('Da attivare', 'Per creare muletti e attrezzature devi prima eseguire il file SQL 31 in Supabase.')
      return
    }

    const payload = {
      assetType: assetForm.assetType,
      code: assetForm.code.trim(),
      location: assetForm.location.trim(),
      model: assetForm.model.trim(),
      serialNumber: assetForm.serialNumber.trim(),
    }

    if (!payload.code) {
      Alert.alert('Dati mancanti', 'Inserisci almeno codice o matricola interna.')
      return
    }

    setIsSaving(true)
    const savedAsset = await onCreateWarehouseAsset?.(payload)

    if (savedAsset?.id && assetForm.maintenanceDueDate.trim()) {
      await onCreateDeadline?.({
        assigneeId: savedAsset.id,
        dueDate: assetForm.maintenanceDueDate.trim(),
        scope: 'asset',
        type: 'Manutenzione attrezzatura',
      })
    }

    setIsSaving(false)

    if (savedAsset) {
      setAssetForm({
        assetType: 'forklift',
        code: '',
        location: '',
        maintenanceDueDate: '',
        model: '',
        serialNumber: '',
      })
      openArchive('warehouse')
      Alert.alert('Attrezzatura creata', `${savedAsset.code} e stata aggiunta al magazzino.`)
    }
  }

  async function submitVehicle() {
    const payload = {
      fleetType: vehicleForm.fleetType,
      km: vehicleForm.km,
      model: vehicleForm.model.trim(),
      plate: vehicleForm.plate.trim(),
      status: 'active',
      type: vehicleForm.type.trim(),
    }

    if (!payload.plate || !payload.fleetType) {
      Alert.alert('Dati mancanti', 'Inserisci almeno targa e tipo flotta.')
      return
    }

    const fileWithoutDate = [
      { date: vehicleForm.insuranceDueDate, file: vehicleForm.insuranceFile, label: 'Assicurazione' },
      { date: vehicleForm.revisionDueDate, file: vehicleForm.revisionFile, label: 'Revisione' },
      { date: vehicleForm.tachographDueDate, file: vehicleForm.tachographFile, label: 'Tachigrafo' },
      { date: vehicleForm.bookletDueDate, file: vehicleForm.bookletFile, label: 'Libretto mezzo' },
    ].find((item) => item.file && !item.date.trim())

    if (fileWithoutDate) {
      Alert.alert('Data mancante', `Per allegare ${fileWithoutDate.label} inserisci anche la data scadenza.`)
      return
    }

    setIsSaving(true)
    const savedVehicle = await onCreateVehicle?.(payload)

    if (savedVehicle?.id) {
      const initialDeadlines = [
        { dueDate: vehicleForm.insuranceDueDate.trim(), file: vehicleForm.insuranceFile, type: 'Assicurazione' },
        { dueDate: vehicleForm.revisionDueDate.trim(), file: vehicleForm.revisionFile, type: 'Revisione' },
        { dueDate: vehicleForm.tachographDueDate.trim(), file: vehicleForm.tachographFile, type: 'Tachigrafo' },
        { dueDate: vehicleForm.bookletDueDate.trim(), file: vehicleForm.bookletFile, type: 'Libretto mezzo' },
      ].filter((item) => item.dueDate)

      for (const item of initialDeadlines) {
        await onCreateDeadline?.({
          assigneeId: savedVehicle.id,
          dueDate: item.dueDate,
          scope: 'vehicle',
          type: item.type,
        }, item.file)
      }
    }

    setIsSaving(false)

    if (savedVehicle) {
      setVehicleForm({
        bookletDueDate: '',
        bookletFile: null,
        fleetType: 'trattore',
        insuranceFile: null,
        insuranceDueDate: '',
        km: '',
        model: '',
        plate: '',
        revisionDueDate: '',
        revisionFile: null,
        tachographDueDate: '',
        tachographFile: null,
        type: '',
      })
      openArchive('vehicles')
      Alert.alert('Mezzo creato', 'La flotta e stata aggiornata.')
    }
  }

  async function submitDeadline() {
    const payload = {
      assigneeId: deadlineForm.scope === 'company' ? '' : deadlineForm.assigneeId,
      documentNumber: deadlineForm.documentNumber.trim(),
      dueDate: deadlineForm.dueDate.trim(),
      owner: deadlineForm.owner.trim(),
      scope: deadlineForm.scope,
      type: deadlineForm.type.trim(),
    }

    if (!payload.type || !payload.dueDate) {
      Alert.alert('Dati mancanti', 'Inserisci tipo scadenza e data.')
      return
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.dueDate)) {
      Alert.alert('Data non valida', 'Scegli una data dal calendario.')
      return
    }

    if (payload.scope !== 'company' && !payload.assigneeId) {
      Alert.alert('Soggetto mancante', 'Seleziona autista o mezzo collegato alla scadenza.')
      return
    }

    setIsSaving(true)
    const saved = await onCreateDeadline?.(payload, deadlineForm.file)
    setIsSaving(false)

    if (saved) {
      setDeadlineForm({
        assigneeId: '',
        documentNumber: '',
        dueDate: '',
        file: null,
        owner: '',
        scope: 'vehicle',
        type: '',
      })
      openArchive('deadlines')
      Alert.alert('Scadenza creata', 'La pratica e stata aggiunta.')
    }
  }

  async function renewDeadline(item, payload, file = null) {
    if (!item?.id) return null

    const saved = await onRenewDeadline?.(item, payload, file)
    if (saved) {
      setSelectedDeadline(null)
      openArchive('deadlines')
    }

    return saved
  }

  const formPanelRight = isCreateOnly ? null : (
    <Pressable onPress={() => openArchive(activeList)} style={styles.closeFormButton}>
      <Text style={styles.closeFormText}>Chiudi</Text>
    </Pressable>
  )

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{mode === 'create' ? 'Anagrafiche' : 'Archivio'}</Text>
        <Text style={styles.heroMeta}>
          {mode === 'create' ? 'Aggiungi autisti, persone, mezzi e scadenze' : 'Consulta persone, flotta e scadenze'}
        </Text>
        <View style={styles.summaryGrid}>
          <SummaryCard icon="people-outline" label="Persone" value={allPeople.length} />
          <SummaryCard icon="briefcase-outline" label="Ufficio" value={officePeople.length} />
          <SummaryCard icon="cube-outline" label="Magazzino" value={warehousePeople.length + warehouseAssets.length} />
        </View>
      </View>

      {!workforceSchemaReady ? (
        <View style={styles.schemaNotice}>
          <Ionicons color={colors.warning} name="alert-circle-outline" size={18} />
          <Text style={styles.schemaNoticeText}>
            Reparti, ufficio, magazzino e attrezzature si attivano eseguendo in Supabase il file SQL 31.
          </Text>
        </View>
      ) : null}

      {mode === 'create' ? (
        <View style={styles.createTypePanel}>
          <WheelPickerField
            label="Cosa vuoi aggiungere"
            onPress={() => openWheelPicker({
              onSelect: setActiveForm,
              options: createFormOptions,
              title: 'Cosa vuoi aggiungere',
              value: activeForm,
            })}
            value={getWheelOptionLabel(createFormOptions, activeForm)}
          />
        </View>
      ) : null}

      {mode === 'create' && activeForm === 'driver' ? (
        <Panel
          kicker="Nuovo"
          right={formPanelRight}
          title="Crea autista"
        >
          <TextField label="Nome e cognome" onChangeText={(value) => updateDriverForm('name', value)} placeholder="Marco Bianchi" value={driverForm.name} />
          <TextField label="Telefono" keyboardType="phone-pad" onChangeText={(value) => updateDriverForm('phone', value)} placeholder="+39..." value={driverForm.phone} />
          <TextField label="Username app" onChangeText={(value) => updateDriverForm('username', value)} placeholder="marco.bianchi" value={driverForm.username} />
          <TextField label="Password temporanea" onChangeText={(value) => updateDriverForm('password', value)} placeholder="minimo 8 caratteri" secureTextEntry value={driverForm.password} />
          <TextField label="Ruolo" onChangeText={(value) => updateDriverForm('role', value)} placeholder="Autista" value={driverForm.role} />
          <TextField label="Deposito" onChangeText={(value) => updateDriverForm('depot', value)} placeholder="Sede o reparto" value={driverForm.depot} />
          <Text style={styles.groupTitle}>Scadenze iniziali</Text>
          <DateField label="Patente" language={language} onChange={(value) => updateDriverForm('licenseDueDate', value)} value={driverForm.licenseDueDate} />
          <DateField label="CQC" language={language} onChange={(value) => updateDriverForm('cqcDueDate', value)} value={driverForm.cqcDueDate} />
          <DateField label="ADR" language={language} onChange={(value) => updateDriverForm('adrDueDate', value)} value={driverForm.adrDueDate} />
          <DateField label="Tessera tachigrafica" language={language} onChange={(value) => updateDriverForm('tachographCardDueDate', value)} value={driverForm.tachographCardDueDate} />
          <DateField label="Visita medica" language={language} onChange={(value) => updateDriverForm('medicalDueDate', value)} value={driverForm.medicalDueDate} />
          <PrimaryButton loading={isSaving} onPress={submitDriver} title="Crea autista" />
        </Panel>
      ) : null}

      {mode === 'create' && activeForm === 'person' ? (
        <Panel
          kicker="Nuova"
          right={formPanelRight}
          title="Aggiungi persona"
        >
          <TextField label="Nome e cognome" onChangeText={(value) => updatePersonForm('name', value)} placeholder="Paola Rossi" value={personForm.name} />
          <WheelPickerField
            label="Reparto"
            onPress={() => openWheelPicker({
              onSelect: (value) => updatePersonForm('department', value),
              options: departmentOptions,
              title: 'Reparto',
              value: personForm.department,
            })}
            value={getWheelOptionLabel(departmentOptions, personForm.department)}
          />
          <WheelPickerField
            label="Ruolo"
            onPress={() => openWheelPicker({
              onSelect: (value) => updatePersonForm('personType', value),
              options: personTypeOptions[personForm.department] ?? [],
              title: 'Ruolo persona',
              value: personForm.personType,
            })}
            value={getWheelOptionLabel(personTypeOptions[personForm.department] ?? [], personForm.personType)}
          />
          <TextField label="Mansione libera" onChangeText={(value) => updatePersonForm('jobTitle', value)} placeholder="Es. ufficio traffico, carrellista..." value={personForm.jobTitle} />
          <TextField label="Telefono" keyboardType="phone-pad" onChangeText={(value) => updatePersonForm('phone', value)} placeholder="+39..." value={personForm.phone} />
          <TextField label="Email" keyboardType="email-address" onChangeText={(value) => updatePersonForm('email', value)} placeholder="nome@azienda.it" value={personForm.email} />
          <TextField label="Username app" onChangeText={(value) => updatePersonForm('username', value)} placeholder="paola.rossi" value={personForm.username} />
          <TextField label="Password temporanea" onChangeText={(value) => updatePersonForm('password', value)} placeholder="minimo 8 caratteri" secureTextEntry value={personForm.password} />
          <TextField label="Sede o reparto" onChangeText={(value) => updatePersonForm('depot', value)} placeholder="Ufficio Verona, Magazzino 1..." value={personForm.depot} />
          <Text style={styles.groupTitle}>Scadenze iniziali</Text>
          <DateField label="Visita medica" language={language} onChange={(value) => updatePersonForm('medicalDueDate', value)} value={personForm.medicalDueDate} />
          <DateField label="Formazione sicurezza" language={language} onChange={(value) => updatePersonForm('safetyTrainingDueDate', value)} value={personForm.safetyTrainingDueDate} />
          {personForm.personType === 'forklift_operator' ? (
            <DateField label="Patentino carrello" language={language} onChange={(value) => updatePersonForm('forkliftLicenseDueDate', value)} value={personForm.forkliftLicenseDueDate} />
          ) : null}
          <PrimaryButton loading={isSaving} onPress={submitPerson} title="Aggiungi persona" />
        </Panel>
      ) : null}

      {mode === 'create' && activeForm === 'asset' ? (
        <Panel
          kicker="Nuova"
          right={formPanelRight}
          title="Aggiungi attrezzatura"
        >
          <WheelPickerField
            label="Tipo"
            onPress={() => openWheelPicker({
              onSelect: (value) => updateAssetForm('assetType', value),
              options: assetTypes,
              title: 'Tipo attrezzatura',
              value: assetForm.assetType,
            })}
            value={getWheelOptionLabel(assetTypes, assetForm.assetType)}
          />
          <TextField label="Codice interno" onChangeText={(value) => updateAssetForm('code', value)} placeholder="MUL-01" value={assetForm.code} />
          <TextField label="Modello" onChangeText={(value) => updateAssetForm('model', value)} placeholder="Still, Toyota..." value={assetForm.model} />
          <TextField label="Matricola" onChangeText={(value) => updateAssetForm('serialNumber', value)} placeholder="Opzionale" value={assetForm.serialNumber} />
          <TextField label="Posizione" onChangeText={(value) => updateAssetForm('location', value)} placeholder="Magazzino 1, ribalta..." value={assetForm.location} />
          <Text style={styles.groupTitle}>Scadenze iniziali</Text>
          <DateField label="Manutenzione programmata" language={language} onChange={(value) => updateAssetForm('maintenanceDueDate', value)} value={assetForm.maintenanceDueDate} />
          <PrimaryButton loading={isSaving} onPress={submitWarehouseAsset} title="Aggiungi attrezzatura" />
        </Panel>
      ) : null}

      {mode === 'create' && activeForm === 'vehicle' ? (
        <Panel
          kicker="Nuovo"
          right={formPanelRight}
          title="Aggiungi mezzo"
        >
          <TextField label="Targa" onChangeText={(value) => updateVehicleForm('plate', value)} placeholder="AB123CD" value={vehicleForm.plate} />
          <WheelPickerField
            label="Tipo flotta"
            onPress={() => openWheelPicker({
              onSelect: (value) => updateVehicleForm('fleetType', value),
              options: fleetTypes,
              title: 'Tipo flotta',
              value: vehicleForm.fleetType,
            })}
            value={getWheelOptionLabel(fleetTypes, vehicleForm.fleetType)}
          />
          <TextField label="Modello" onChangeText={(value) => updateVehicleForm('model', value)} placeholder="Iveco, Volvo..." value={vehicleForm.model} />
          <TextField label="Allestimento" onChangeText={(value) => updateVehicleForm('type', value)} placeholder="Centinato, frigo..." value={vehicleForm.type} />
          <TextField label="Km" keyboardType="number-pad" onChangeText={(value) => updateVehicleForm('km', value)} placeholder="0" value={vehicleForm.km} />
          <Text style={styles.groupTitle}>Scadenze iniziali mezzo</Text>
          <DateField label="Assicurazione" language={language} onChange={(value) => updateVehicleForm('insuranceDueDate', value)} value={vehicleForm.insuranceDueDate} />
          <AttachmentButton
            file={vehicleForm.insuranceFile}
            label="Allega assicurazione"
            onPress={() => pickAttachment((file) => updateVehicleForm('insuranceFile', file))}
            onRemove={() => updateVehicleForm('insuranceFile', null)}
          />
          <DateField label="Revisione" language={language} onChange={(value) => updateVehicleForm('revisionDueDate', value)} value={vehicleForm.revisionDueDate} />
          <AttachmentButton
            file={vehicleForm.revisionFile}
            label="Allega revisione"
            onPress={() => pickAttachment((file) => updateVehicleForm('revisionFile', file))}
            onRemove={() => updateVehicleForm('revisionFile', null)}
          />
          <DateField label="Tachigrafo" language={language} onChange={(value) => updateVehicleForm('tachographDueDate', value)} value={vehicleForm.tachographDueDate} />
          <AttachmentButton
            file={vehicleForm.tachographFile}
            label="Allega documento tachigrafo"
            onPress={() => pickAttachment((file) => updateVehicleForm('tachographFile', file))}
            onRemove={() => updateVehicleForm('tachographFile', null)}
          />
          <DateField label="Libretto mezzo" language={language} onChange={(value) => updateVehicleForm('bookletDueDate', value)} value={vehicleForm.bookletDueDate} />
          <AttachmentButton
            file={vehicleForm.bookletFile}
            label="Allega libretto"
            onPress={() => pickAttachment((file) => updateVehicleForm('bookletFile', file))}
            onRemove={() => updateVehicleForm('bookletFile', null)}
          />
          <PrimaryButton loading={isSaving} onPress={submitVehicle} title="Aggiungi mezzo" />
        </Panel>
      ) : null}

      {mode === 'create' && activeForm === 'deadline' ? (
        <Panel
          kicker="Nuova"
          right={formPanelRight}
          title="Aggiungi scadenza"
        >
          <TextField label="Tipo scadenza" onChangeText={(value) => updateDeadlineForm('type', value)} placeholder="Revisione, assicurazione, CQC..." value={deadlineForm.type} />
          <WheelPickerField
            label="Categoria"
            onPress={() => openWheelPicker({
              onSelect: (value) => setDeadlineForm((currentForm) => ({ ...currentForm, assigneeId: '', scope: value })),
              options: currentScopes,
              title: 'Categoria scadenza',
              value: deadlineForm.scope,
            })}
            value={getWheelOptionLabel(currentScopes, deadlineForm.scope)}
          />
          {deadlineForm.scope !== 'company' ? (
            <>
              {deadlineAssigneeOptions.length ? (
                <WheelPickerField
                  label="Soggetto"
                  onPress={() => openWheelPicker({
                    onSelect: (value) => updateDeadlineForm('assigneeId', value),
                    options: deadlineAssigneeOptions,
                    title: 'Soggetto scadenza',
                    value: deadlineForm.assigneeId,
                  })}
                  value={getWheelOptionLabel(deadlineAssigneeOptions, deadlineForm.assigneeId)}
                />
              ) : (
                <Text style={styles.emptyText}>
                  Aggiungi prima {deadlineForm.scope === 'driver'
                    ? 'un autista'
                    : deadlineForm.scope === 'vehicle'
                      ? 'un mezzo'
                      : deadlineForm.scope === 'asset'
                        ? "un'attrezzatura"
                        : 'una persona'}.
                </Text>
              )}
            </>
          ) : null}
          <DateField label="Data scadenza" language={language} onChange={(value) => updateDeadlineForm('dueDate', value)} value={deadlineForm.dueDate} />
          <TextField label="Numero documento" onChangeText={(value) => updateDeadlineForm('documentNumber', value)} placeholder="Opzionale" value={deadlineForm.documentNumber} />
          <TextField label="Responsabile" onChangeText={(value) => updateDeadlineForm('owner', value)} placeholder="Opzionale" value={deadlineForm.owner} />
          <AttachmentButton
            file={deadlineForm.file}
            label="Allega PDF o foto"
            onPress={() => pickAttachment((file) => updateDeadlineForm('file', file))}
            onRemove={() => updateDeadlineForm('file', null)}
          />
          <PrimaryButton loading={isSaving} onPress={submitDeadline} title="Aggiungi scadenza" />
        </Panel>
      ) : null}

      {mode === 'archive' ? (
        <Panel kicker="Archivio" title="Dati azienda">
          <WheelPickerField
            label="Sezione archivio"
            onPress={() => openWheelPicker({
              onSelect: setActiveList,
              options: archiveListOptions,
              title: 'Sezione archivio',
              value: activeList,
            })}
            value={getWheelOptionLabel(archiveListOptions, activeList)}
          />

        {activeList === 'people' ? (
          <View style={styles.archiveList}>
            {allPeople.map((person) => (
              <View key={person.id} style={styles.registryCard}>
                <View style={styles.registryHeader}>
                  <View style={styles.listIcon}>
                    <Ionicons color={colors.cyanDark} name="people-outline" size={18} />
                  </View>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{person.name}</Text>
                    <Text style={styles.listMeta}>
                      {getDepartmentLabel(person.department)} · {person.jobTitle || getPersonTypeLabel(person.personType)}
                    </Text>
                    <Text style={styles.listMeta}>{person.phone || person.email || person.username || 'contatto mancante'}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => resetAccess(person.linkedDriverId ? 'driver' : 'person', person.linkedDriverId || person.id, person.name)}
                  style={styles.smallButton}
                >
                  <Text style={styles.smallButtonText}>Reimposta password</Text>
                </Pressable>
                <RelatedDeadlines deadlines={deadlines.filter((item) => item.personId === person.id || item.driverId === person.linkedDriverId)} language={language} />
              </View>
            ))}
            {!allPeople.length ? <Text style={styles.emptyText}>Nessuna persona presente.</Text> : null}
          </View>
        ) : null}

        {activeList === 'office' ? (
          <View style={styles.archiveList}>
            {officePeople.map((person) => (
              <View key={person.id} style={styles.registryCard}>
                <View style={styles.registryHeader}>
                  <View style={styles.listIcon}>
                    <Ionicons color={colors.cyanDark} name="briefcase-outline" size={18} />
                  </View>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{person.name}</Text>
                    <Text style={styles.listMeta}>{person.jobTitle || 'Ufficio'} · {person.phone || person.email || 'contatto mancante'}</Text>
                  </View>
                </View>
                <Pressable onPress={() => resetAccess('person', person.id, person.name)} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Reimposta password</Text>
                </Pressable>
                <RelatedDeadlines deadlines={deadlines.filter((item) => item.personId === person.id)} language={language} />
              </View>
            ))}
            {!officePeople.length ? <Text style={styles.emptyText}>Nessuna persona ufficio presente.</Text> : null}
          </View>
        ) : null}

        {activeList === 'warehouse' ? (
          <View style={styles.archiveList}>
            {warehousePeople.map((person) => (
              <View key={person.id} style={styles.registryCard}>
                <View style={styles.registryHeader}>
                  <View style={styles.listIcon}>
                    <Ionicons color={colors.cyanDark} name="person-outline" size={18} />
                  </View>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{person.name}</Text>
                    <Text style={styles.listMeta}>{person.jobTitle || getPersonTypeLabel(person.personType)} · {person.phone || 'contatto mancante'}</Text>
                  </View>
                </View>
                <Pressable onPress={() => resetAccess('person', person.id, person.name)} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Reimposta password</Text>
                </Pressable>
                <RelatedDeadlines deadlines={deadlines.filter((item) => item.personId === person.id)} language={language} />
              </View>
            ))}
            {warehouseAssets.map((asset) => (
              <View key={asset.id} style={styles.registryCard}>
                <View style={styles.registryHeader}>
                  <View style={styles.listIcon}>
                    <Ionicons color={colors.cyanDark} name="cube-outline" size={18} />
                  </View>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{asset.code}</Text>
                    <Text style={styles.listMeta}>
                      {getAssetTypeLabel(asset.assetType)} · {asset.model || 'modello non indicato'} · {asset.location || 'posizione non indicata'}
                    </Text>
                    {asset.serialNumber ? <Text style={styles.listMeta}>Matricola {asset.serialNumber}</Text> : null}
                  </View>
                </View>
                <RelatedDeadlines deadlines={deadlines.filter((item) => item.assetId === asset.id)} language={language} />
              </View>
            ))}
            {!warehousePeople.length && !warehouseAssets.length ? <Text style={styles.emptyText}>Nessun dato magazzino presente.</Text> : null}
          </View>
        ) : null}

        {activeList === 'drivers' ? (
          <View style={styles.archiveList}>
            {drivers.map((driver) => (
              <View key={driver.id} style={styles.registryCard}>
                <View style={styles.registryHeader}>
                  <View style={styles.listIcon}>
                    <Ionicons color={colors.cyanDark} name="person-outline" size={18} />
                  </View>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{driver.name}</Text>
                    <Text style={styles.listMeta}>{driver.username} · {driver.phone || 'telefono mancante'}</Text>
                  </View>
                </View>
                <Pressable onPress={() => resetAccess('driver', driver.id, driver.name)} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Reimposta password</Text>
                </Pressable>
                <RelatedDeadlines deadlines={deadlines.filter((item) => item.driverId === driver.id)} language={language} />
              </View>
            ))}
            {!drivers.length ? <Text style={styles.emptyText}>Nessun autista presente.</Text> : null}
          </View>
        ) : null}

        {activeList === 'vehicles' ? (
          <View style={styles.archiveList}>
            {activeVehicles.map((vehicle) => (
              <View key={vehicle.id} style={styles.registryCard}>
                <View style={styles.registryHeader}>
                  <View style={styles.listIcon}>
                    <Ionicons color={colors.cyanDark} name="bus-outline" size={18} />
                  </View>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{vehicle.plate}</Text>
                    <Text style={styles.listMeta}>{vehicle.model || 'Modello mancante'} · {vehicle.fleetType || 'mezzo'}</Text>
                  </View>
                </View>
                <RelatedDeadlines deadlines={deadlines.filter((item) => item.vehicleId === vehicle.id)} language={language} />
              </View>
            ))}
            {!activeVehicles.length ? <Text style={styles.emptyText}>Nessun mezzo presente.</Text> : null}
          </View>
        ) : null}

        {activeList === 'faults' ? (
          <View style={styles.archiveList}>
            {archivedFaults.map((fault) => (
              <Pressable key={fault.id} onPress={() => setSelectedFault(fault)} style={styles.registryCard}>
                <View style={styles.registryHeader}>
                  <View style={styles.listIconMuted}>
                    <Ionicons color={colors.muted} name="construct-outline" size={18} />
                  </View>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{fault.title}</Text>
                    <Text style={styles.listMeta}>
                      {getDriverName(drivers, fault.driverId)} · {getVehiclePlate(vehicles, fault.vehicleId)} · {formatDateTime(fault.createdAt, language)}
                    </Text>
                    <Text style={styles.listMeta}>
                      {fault.description || 'Nessuna descrizione'} · {fault.repairCostCents ? formatMoneyCents(fault.repairCostCents, fault.repairCostCurrency || defaultCurrency) : 'costo non inserito'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
            {!archivedFaults.length ? <Text style={styles.emptyText}>Nessun guasto archiviato.</Text> : null}
          </View>
        ) : null}

        {activeList === 'checks' ? (
          <View style={styles.archiveList}>
            {archivedChecks.map((check) => {
              const issues = getCheckIssues(check)

              return (
                <View key={check.id} style={styles.registryCard}>
                  <View style={styles.registryHeader}>
                    <View style={issues.length ? styles.listIconWarning : styles.listIconMuted}>
                      <Ionicons color={issues.length ? colors.warning : colors.muted} name="checkbox-outline" size={18} />
                    </View>
                    <View style={styles.listCopy}>
                      <Text style={styles.listTitle}>
                        {issues.length ? 'Check risolto' : 'Check ok'} · {getVehiclePlate(vehicles, check.tractorId)}
                      </Text>
                      <Text style={styles.listMeta}>
                        {getDriverName(drivers, check.driverId)} · {formatDateTime(check.createdAt, language)}
                      </Text>
                      <Text style={styles.listMeta}>
                        {issues.length ? `Anomalie: ${issues.join(', ')}` : 'Nessuna anomalia'} · archiviato
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
            {!archivedChecks.length ? <Text style={styles.emptyText}>Nessun check archiviato.</Text> : null}
          </View>
        ) : null}

        {activeList === 'deadlines' ? (
          <View style={styles.archiveList}>
            <View style={styles.deadlineListHeader}>
              <View style={styles.listCopy}>
                <Text style={styles.listTitle}>{showAllDeadlines ? 'Tutte le scadenze' : 'Scadenze da lavorare'}</Text>
                <Text style={styles.listMeta}>
                  {showAllDeadlines
                    ? `${allDeadlineRows.length} pratiche totali · ${deadlinesToWork.length} da lavorare`
                    : `${deadlinesToWork.length} pratiche scadute o entro 30 giorni`}
                </Text>
              </View>
              <Pressable onPress={() => setShowAllDeadlines((currentValue) => !currentValue)} style={styles.deadlineToggleButton}>
                <Text style={styles.deadlineToggleText}>{showAllDeadlines ? 'Solo da lavorare' : 'Mostra tutto'}</Text>
              </Pressable>
            </View>
            {nextDeadlines.map((item) => {
              const tone = getDeadlineTone(item)
              return (
                <Pressable key={item.id} onPress={() => setSelectedDeadline(item)} style={styles.deadlineRow}>
                  <View style={[styles.deadlineStatusDot, styles[`${tone}Dot`]]} />
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{item.type}</Text>
                    <Text style={styles.listMeta}>
                      {getDeadlineSubject(item, drivers, activeVehicles, allPeople, warehouseAssets)} · {formatDate(item.dueDate, language)} · {getDeadlineStatusLabel(item)}
                    </Text>
                    {item.filePath ? <Text style={styles.fileMeta}>Allegato presente</Text> : null}
                  </View>
                  <Text style={styles.archiveOpenText}>Apri</Text>
                </Pressable>
              )
            })}
            {!nextDeadlines.length ? (
              <Text style={styles.emptyText}>
                {showAllDeadlines ? 'Nessuna scadenza caricata.' : 'Nessuna scadenza urgente da lavorare.'}
              </Text>
            ) : null}
          </View>
        ) : null}

        {activeList === 'costs' ? (
          <View style={styles.archiveList}>
            <View style={styles.costReportCard}>
              <View style={styles.registryHeader}>
                <View style={styles.listIcon}>
                  <Ionicons color={colors.cyanDark} name="cash-outline" size={18} />
                </View>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>Centro costi</Text>
                  <Text style={styles.listMeta}>Guasti, manutenzioni e spese libere per targa o attrezzatura.</Text>
                  {costForm.id ? <Text style={styles.fileMeta}>Stai modificando una spesa già registrata.</Text> : null}
                </View>
              </View>
              <View style={styles.costEntryIntro}>
                <Text style={styles.costEntryIntroTitle}>{costForm.id ? 'Modifica spesa libera' : 'Nuova spesa libera'}</Text>
                <Text style={styles.costEntryIntroText}>Inserisci costi senza guasto: tagliandi, gomme, assicurazioni, revisioni, muletti o spese aziendali.</Text>
              </View>
              <TextField label="Titolo spesa" onChangeText={(value) => updateCostForm('title', value)} placeholder="Tagliando, gomme, assicurazione..." value={costForm.title} />
              <TextField keyboardType="decimal-pad" label="Importo + IVA" onChangeText={(value) => updateCostForm('amount', value)} placeholder="2000,00" value={costForm.amount} />
              <WheelPickerField
                helper="Tocca per aprire la ruota"
                label="Categoria"
                onPress={() => openWheelPicker({
                  onSelect: (value) => updateCostForm('category', value),
                  options: costCategoryOptions,
                  title: 'Categoria spesa',
                  value: costForm.category,
                })}
                value={getWheelOptionLabel(costCategoryOptions, costForm.category)}
              />
              {costForm.category === 'fine' ? (
                <>
                  <WheelPickerField
                    label="Autista responsabile"
                    onPress={() => openWheelPicker({
                      onSelect: (value) => updateCostForm('driverId', value),
                      options: costDriverOptions,
                      title: 'Autista responsabile',
                      value: costForm.driverId,
                    })}
                    value={getWheelOptionLabel(costDriverOptions, costForm.driverId)}
                  />
                  <WheelPickerField
                    label="Targa collegata"
                    onPress={() => openWheelPicker({
                      onSelect: (value) => updateCostForm('vehicleId', value),
                      options: costVehicleOptions,
                      title: 'Targa collegata',
                      value: costForm.vehicleId,
                    })}
                    value={getWheelOptionLabel(costVehicleOptions, costForm.vehicleId)}
                  />
                </>
              ) : (
                <>
                  <WheelPickerField
                    label="Collegata a"
                    onPress={() => openWheelPicker({
                      onSelect: (value) => updateCostForm('targetType', value),
                      options: costTargetTypeOptions,
                      title: 'Collega spesa a',
                      value: costForm.targetType,
                    })}
                    value={getWheelOptionLabel(costTargetTypeOptions, costForm.targetType)}
                  />
                  {costForm.targetType === 'vehicle' ? (
                    <WheelPickerField
                      label="Targa"
                      onPress={() => openWheelPicker({
                        onSelect: (value) => updateCostForm('vehicleId', value),
                        options: costVehicleOptions,
                        title: 'Scegli targa',
                        value: costForm.vehicleId,
                      })}
                      value={getWheelOptionLabel(costVehicleOptions, costForm.vehicleId)}
                    />
                  ) : null}
                  {costForm.targetType === 'asset' ? (
                    <WheelPickerField
                      label="Attrezzatura"
                      onPress={() => openWheelPicker({
                        onSelect: (value) => updateCostForm('assetId', value),
                        options: costAssetOptions,
                        title: 'Scegli attrezzatura',
                        value: costForm.assetId,
                      })}
                      value={getWheelOptionLabel(costAssetOptions, costForm.assetId)}
                    />
                  ) : null}
                  {costForm.targetType === 'driver' ? (
                    <WheelPickerField
                      label="Autista"
                      onPress={() => openWheelPicker({
                        onSelect: (value) => updateCostForm('driverId', value),
                        options: costDriverOptions,
                        title: 'Scegli autista',
                        value: costForm.driverId,
                      })}
                      value={getWheelOptionLabel(costDriverOptions, costForm.driverId)}
                    />
                  ) : null}
                </>
              )}
              <DateField label="Data spesa" language={language} onChange={(value) => updateCostForm('spentAt', value)} value={costForm.spentAt} />
              <TextField label="Fornitore" onChangeText={(value) => updateCostForm('supplier', value)} placeholder="Officina, gommista..." value={costForm.supplier} />
              <TextField keyboardType="numeric" label="Km" onChangeText={(value) => updateCostForm('odometerKm', value)} placeholder="Opzionale" value={costForm.odometerKm} />
              <TextField label="Note" multiline onChangeText={(value) => updateCostForm('notes', value)} placeholder="Numero fattura, dettagli intervento..." value={costForm.notes} />
              <AttachmentButton file={costForm.file} label="Allega fattura o foto" onPress={() => pickAttachment((file) => updateCostForm('file', file))} onRemove={() => updateCostForm('file', null)} />
              <PrimaryButton loading={isSavingCost} onPress={submitCostEntry} title={costForm.id ? 'Aggiorna spesa' : 'Salva spesa libera'} />
              {costForm.id ? (
                <Pressable onPress={resetCostForm} style={styles.secondaryInlineButton}>
                  <Text style={styles.secondaryInlineButtonText}>Annulla modifica</Text>
                </Pressable>
              ) : null}
              <WheelPickerField
                label="Periodo"
                onPress={() => openWheelPicker({
                  onSelect: setCostPeriod,
                  options: costPeriodOptions,
                  title: 'Periodo report',
                  value: costPeriod,
                })}
                value={getWheelOptionLabel(costPeriodOptions, costPeriod)}
              />
              <WheelPickerField
                label="Filtro report"
                onPress={() => openWheelPicker({
                  onSelect: setCostTargetFilter,
                  options: costReportFilterOptions,
                  title: 'Filtro report',
                  value: costTargetFilter,
                })}
                value={getWheelOptionLabel(costReportFilterOptions, costTargetFilter)}
              />
              <Text style={styles.costTotal}>{formatMoneyCents(repairCostTotalCents, defaultCurrency)}</Text>
              <View style={styles.costMetricRow}>
                <View style={styles.costMetricCard}>
                  <Text style={styles.summaryLabel}>Voci costo</Text>
                  <Text style={styles.summaryValue}>{costRows.length}</Text>
                </View>
                <View style={styles.costMetricCard}>
                  <Text style={styles.summaryLabel}>Media</Text>
                  <Text style={styles.summaryValue}>{formatMoneyCents(repairCostAverageCents, defaultCurrency)}</Text>
                </View>
              </View>
              <View style={styles.costInsightGrid}>
                <View style={styles.costInsightCard}>
                  <Text style={styles.summaryLabel}>Soggetto più costoso</Text>
                  <Text numberOfLines={1} style={styles.costInsightTitle}>{topTargetCost?.name ?? 'Nessun dato'}</Text>
                  <Text style={styles.costInsightValue}>{topTargetCost ? formatMoneyCents(topTargetCost.totalCents, defaultCurrency) : formatMoneyCents(0, defaultCurrency)}</Text>
                </View>
                <View style={styles.costInsightCard}>
                  <Text style={styles.summaryLabel}>Categoria più cara</Text>
                  <Text numberOfLines={1} style={styles.costInsightTitle}>{topCategoryCost?.name ?? 'Nessun dato'}</Text>
                  <Text style={styles.costInsightValue}>{topCategoryCost ? formatMoneyCents(topCategoryCost.totalCents, defaultCurrency) : formatMoneyCents(0, defaultCurrency)}</Text>
                </View>
                <View style={[styles.costInsightCard, unlinkedCostRows.length ? styles.costInsightWarning : null]}>
                  <Text style={styles.summaryLabel}>Senza collegamento</Text>
                  <Text style={styles.costInsightTitle}>{unlinkedCostRows.length}</Text>
                  <Text style={styles.costInsightValue}>da assegnare</Text>
                </View>
              </View>
              <View style={styles.monthlyPremiumCard}>
                <View style={styles.monthlyPremiumHeader}>
                  <View style={styles.listCopy}>
                    <Text style={styles.monthlyPremiumTitle}>Report mensile Premium</Text>
                    <Text style={styles.listMeta}>{monthlyRange.label} · archivio automatico titolare</Text>
                  </View>
                  <Ionicons color={colors.cyanDark} name="document-text-outline" size={22} />
                </View>
                <WheelPickerField
                  label="Mese archivio"
                  onPress={() => openWheelPicker({
                    onSelect: setSelectedArchiveMonthKey,
                    options: monthlyArchiveOptions,
                    title: 'Mese report',
                    value: selectedArchiveMonthKey,
                  })}
                  value={getWheelOptionLabel(monthlyArchiveOptions, selectedArchiveMonthKey, monthlyRange.label)}
                />
                <View style={styles.monthlyPremiumGrid}>
                  <View style={styles.monthlyPremiumMetric}>
                    <Text style={styles.summaryLabel}>Costi mese</Text>
                    <Text style={styles.monthlyPremiumValue}>{formatMoneyCents(monthlyTotalCents, defaultCurrency)}</Text>
                    <Text style={styles.listMeta}>{monthlyCostRows.length} voci</Text>
                  </View>
                  <View style={[styles.monthlyPremiumMetric, monthlyOpenFaultRows.length ? styles.monthlyPremiumDanger : null]}>
                    <Text style={styles.summaryLabel}>Guasti aperti</Text>
                    <Text style={styles.monthlyPremiumValue}>{monthlyOpenFaultRows.length}</Text>
                    <Text style={styles.listMeta}>{monthlyFaultRows.length} ricevuti</Text>
                  </View>
                  <View style={[styles.monthlyPremiumMetric, monthlyCriticalCheckRows.length ? styles.monthlyPremiumWarning : null]}>
                    <Text style={styles.summaryLabel}>Check critici</Text>
                    <Text style={styles.monthlyPremiumValue}>{monthlyCriticalCheckRows.length}</Text>
                    <Text style={styles.listMeta}>{monthlyOkCheckRows.length} ok</Text>
                  </View>
                  <View style={[styles.monthlyPremiumMetric, deadlinesToWork.length ? styles.monthlyPremiumDanger : null]}>
                    <Text style={styles.summaryLabel}>Scadenze</Text>
                    <Text style={styles.monthlyPremiumValue}>{deadlinesToWork.length}</Text>
                    <Text style={styles.listMeta}>{monthlyDeadlineRows.length} nel mese</Text>
                  </View>
                </View>
                <View style={styles.monthlyPremiumInsight}>
                  <Text style={styles.summaryLabel}>Più pesante questo mese</Text>
                  <Text numberOfLines={1} style={styles.monthlyPremiumInsightText}>
                    {monthlyTopTargetCost?.name ?? 'Nessun soggetto'} · {monthlyTopCategoryCost?.name ?? 'nessuna categoria'}
                  </Text>
                  <Text style={styles.costInsightValue}>
                    {monthlyTopTargetCost ? formatMoneyCents(monthlyTopTargetCost.totalCents, defaultCurrency) : formatMoneyCents(0, defaultCurrency)}
                  </Text>
                </View>
                <View style={styles.monthlyActionList}>
                  {monthlyActionRows.map((action) => (
                    <View key={action.title} style={[styles.monthlyActionRow, action.tone === 'danger' ? styles.monthlyPremiumDanger : styles.monthlyPremiumWarning]}>
                      <Ionicons color={action.tone === 'danger' ? colors.danger : '#9a3412'} name={action.icon} size={16} />
                      <Text style={styles.monthlyActionTitle}>{action.title}</Text>
                      <Text style={styles.monthlyActionValue}>{action.value}</Text>
                    </View>
                  ))}
                  {!monthlyActionRows.length ? <Text style={styles.emptyText}>Nessuna urgenza mensile aperta.</Text> : null}
                </View>
                <Text style={styles.listMeta}>CSV e stampa A4 del report mensile sono disponibili dal desktop azienda.</Text>
              </View>
              <View style={styles.fineReportCard}>
                <View style={styles.fineReportHeader}>
                  <View style={styles.fineReportHeadingCopy}>
                    <Text style={styles.fineReportTitle}>Sanzioni</Text>
                    <Text style={styles.listMeta}>Totale multe pagate e classifica autisti</Text>
                  </View>
                  <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={styles.fineReportAmount}>
                    {formatMoneyCents(fineCostTotalCents, defaultCurrency)}
                  </Text>
                </View>
                {fineRanking.map((row, index) => (
                  <View key={row.driverId || 'unassigned'} style={styles.fineRankingRow}>
                    <Text style={styles.fineRankingIndex}>#{index + 1}</Text>
                    <View style={styles.listCopy}>
                      <Text style={styles.listTitle}>{row.name}</Text>
                      <Text style={styles.listMeta}>{row.count} multe</Text>
                    </View>
                    <Text style={styles.costRowAmount}>{formatMoneyCents(row.totalCents, defaultCurrency)}</Text>
                  </View>
                ))}
                {!fineRanking.length ? <Text style={styles.emptyText}>Nessuna sanzione registrata con questi filtri.</Text> : null}
              </View>
            </View>

            {costRows.map((row) => (
              <Pressable key={row.id} onPress={() => row.kind === 'fault' && setSelectedFault(row.fault)} style={styles.registryCard}>
                <View style={styles.registryHeader}>
                  <View style={styles.listIconMuted}>
                    <Ionicons color={colors.muted} name={row.kind === 'fault' ? 'construct-outline' : 'receipt-outline'} size={18} />
                  </View>
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{row.title}</Text>
                    <Text style={styles.listMeta}>
                      {getCostTargetLabel(row)} · {getCostCategoryLabel(row.category)} · {formatDateTime(row.date, language)}
                    </Text>
                    <Text style={styles.listMeta}>{row.description || 'Nessuna descrizione'}</Text>
                  </View>
                  <Text style={styles.costRowAmount}>{formatMoneyCents(row.amountCents, row.currency || defaultCurrency)}</Text>
                </View>
                {row.kind === 'entry' ? (
                  <View style={styles.rowActionBar}>
                    <Pressable onPress={() => startEditCostEntry(row.entry)} style={styles.rowActionButton}>
                      <Ionicons color={colors.cyanDark} name="create-outline" size={16} />
                      <Text style={styles.rowActionText}>Modifica</Text>
                    </Pressable>
                    <Pressable onPress={() => deleteCostEntry(row.entry)} style={styles.rowActionButtonDanger}>
                      <Ionicons color={colors.danger} name="trash-outline" size={16} />
                      <Text style={styles.rowActionDangerText}>Elimina</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.rowActionBar}>
                    <Pressable onPress={() => setSelectedFault(row.fault)} style={styles.rowActionButton}>
                      <Ionicons color={colors.cyanDark} name="create-outline" size={16} />
                      <Text style={styles.rowActionText}>Modifica costo</Text>
                    </Pressable>
                    <Pressable onPress={() => deleteFaultRepair(row.fault)} style={styles.rowActionButtonDanger}>
                      <Ionicons color={colors.danger} name="trash-outline" size={16} />
                      <Text style={styles.rowActionDangerText}>Elimina costo</Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            ))}
            {!costRows.length ? <Text style={styles.emptyText}>Nessun costo trovato per questo filtro.</Text> : null}
          </View>
        ) : null}
      </Panel>
      ) : null}
      <SelectionWheelModal
        onClose={closeWheelPicker}
        onConfirm={confirmWheelPicker}
        options={wheelPicker?.options ?? []}
        title={wheelPicker?.title ?? 'Seleziona'}
        value={wheelPicker?.value ?? ''}
        visible={Boolean(wheelPicker)}
      />
      <DeadlineRenewModal
        assets={warehouseAssets}
        drivers={drivers}
        item={selectedDeadline}
        language={language}
        onClose={() => setSelectedDeadline(null)}
        onMarkDone={onCloseDeadline}
        onSave={renewDeadline}
        onSendReminder={onSendDeadlineReminder}
        people={allPeople}
        vehicles={activeVehicles}
      />
      <FaultRepairModal
        fault={selectedFault}
        language={language}
        onClose={() => setSelectedFault(null)}
        onSave={onUpdateFaultRepair}
        vehicles={activeVehicles}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  attachmentButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderColor: colors.line,
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 12,
  },
  attachmentRemove: {
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  attachmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  attachmentText: {
    color: colors.ink,
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
  },
  archiveList: {
    gap: 10,
  },
  archiveTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  archiveOpenText: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
  },
  deadlineListHeader: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    padding: 12,
  },
  deadlineToggleButton: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 999,
    minHeight: 36,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  deadlineToggleText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  costFilterLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
    marginTop: 14,
  },
  costChoiceChip: {
    alignSelf: 'stretch',
    borderRadius: 14,
    flexGrow: 1,
    minHeight: 44,
    minWidth: '47%',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  costChoiceGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  costEntryIntro: {
    backgroundColor: '#ffffff',
    borderColor: '#a5f3fc',
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    marginTop: 12,
    padding: 12,
  },
  costEntryIntroText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  costEntryIntroTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  costMetricCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    flex: 1,
    padding: 12,
  },
  costMetricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  costInsightCard: {
    backgroundColor: colors.white,
    borderColor: '#bae6fd',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minWidth: '30%',
    padding: 10,
  },
  costInsightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  costInsightTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },
  costInsightValue: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },
  costInsightWarning: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  costReportCard: {
    backgroundColor: '#ecfeff',
    borderColor: colors.cyan,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  monthlyActionList: {
    gap: 8,
  },
  monthlyActionRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#d6eef5',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 10,
  },
  monthlyActionTitle: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  monthlyActionValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  monthlyPremiumCard: {
    backgroundColor: '#f8fdff',
    borderColor: colors.cyan,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginTop: 12,
    padding: 12,
  },
  monthlyArchiveChip: {
    backgroundColor: colors.white,
    borderColor: '#d6eef5',
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 86,
    padding: 10,
    width: 168,
  },
  monthlyArchiveChipActive: {
    backgroundColor: '#ecfeff',
    borderColor: colors.cyanDark,
  },
  monthlyArchiveChipMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 4,
  },
  monthlyArchiveChipTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  monthlyArchiveChipValue: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },
  monthlyArchiveRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 2,
  },
  monthlyArchiveScroller: {
    marginHorizontal: -2,
  },
  monthlyPremiumDanger: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecaca',
  },
  monthlyPremiumGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthlyPremiumHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  monthlyPremiumInsight: {
    backgroundColor: colors.white,
    borderColor: '#bdeaf3',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },
  monthlyPremiumInsightText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },
  monthlyPremiumMetric: {
    backgroundColor: colors.white,
    borderColor: '#bdeaf3',
    borderRadius: 14,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: '46%',
    padding: 10,
  },
  monthlyPremiumTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  monthlyPremiumValue: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },
  monthlyPremiumWarning: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  costRowAmount: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  fineRankingIndex: {
    color: '#9a3412',
    fontSize: 12,
    fontWeight: '900',
  },
  fineRankingRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#fed7aa',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  fineReportAmount: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
  },
  fineReportCard: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginTop: 10,
    padding: 12,
  },
  fineReportHeader: {
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  fineReportHeadingCopy: {
    alignItems: 'center',
    width: '100%',
  },
  fineReportTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  costTotal: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 4,
  },
  attachmentRenewBox: {
    alignItems: 'center',
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    padding: 12,
  },
  attachmentRenewMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  attachmentRenewTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  chip: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  inlineChipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 12,
  },
  inlineScroller: {
    marginBottom: 10,
  },
  chipText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  chipTextActive: {
    color: colors.white,
  },
  closeFormButton: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeFormText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  closeDeadlineButton: {
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    borderColor: '#fecaca',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 14,
  },
  closeDeadlineButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '900',
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  createTypeArrow: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderColor: '#a5f3fc',
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  createTypeIcon: {
    alignItems: 'center',
    backgroundColor: '#ecfeff',
    borderRadius: 13,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  createTypeLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  createTypePanel: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  createTypePicker: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  createTypeSelected: {
    alignItems: 'center',
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  createTypeSelectedText: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  dangerChip: {
    backgroundColor: '#fee2e2',
  },
  dangerDot: {
    backgroundColor: colors.danger,
  },
  dangerText: {
    color: colors.danger,
  },
  deadlineChip: {
    borderRadius: 12,
    minWidth: '46%',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  deadlineChipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  deadlineChipMeta: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },
  deadlineChipTitle: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  deadlineRow: {
    alignItems: 'center',
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  deadlineStatusDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  detailCloseButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  detailCloseText: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },
  detailContent: {
    padding: layout.screenPadding,
    paddingBottom: 36,
  },
  detailHeader: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 48,
  },
  detailHeaderTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  detailKicker: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  detailScreen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  detailTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 10,
    marginTop: 5,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  field: {
    marginBottom: 10,
  },
  fileMeta: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 5,
  },
  groupTitle: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  hero: {
    backgroundColor: colors.ink,
    borderColor: '#123047',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  heroMeta: {
    color: '#cffafe',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
  },
  input: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  textAreaInput: {
    minHeight: 82,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
  },
  listCopy: {
    flex: 1,
  },
  listIcon: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  listIconMuted: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  listIconWarning: {
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  listMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  listRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  listTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  infoChip: {
    backgroundColor: '#e0f2fe',
  },
  infoDot: {
    backgroundColor: colors.cyan,
  },
  infoText: {
    color: colors.cyanDark,
  },
  noDeadlinesText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
  },
  registryCard: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  registryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  renewSummaryBox: {
    backgroundColor: '#ecfeff',
    borderColor: colors.cyan,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  renewSummaryMeta: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  renewSummaryTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  reminderButton: {
    alignItems: 'center',
    backgroundColor: '#cffafe',
    borderColor: colors.cyanDark,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 10,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  reminderButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  repairTotalText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  repairDeleteButton: {
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 46,
  },
  rowActionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  rowActionButton: {
    alignItems: 'center',
    backgroundColor: '#ecfeff',
    borderColor: '#b7ecf7',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  rowActionButtonDanger: {
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  rowActionDangerText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '900',
  },
  rowActionText: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
  },
  selectorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  schemaNotice: {
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    padding: 12,
  },
  schemaNoticeText: {
    color: colors.ink,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  smallButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
  },
  smallButtonDisabled: {
    opacity: 0.45,
  },
  smallButtonText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  secondaryInlineButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 14,
  },
  secondaryInlineButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    flex: 1,
    minHeight: 86,
    padding: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    marginBottom: 7,
    width: 34,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  summaryValue: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  warningChip: {
    backgroundColor: '#fef3c7',
  },
  warningDot: {
    backgroundColor: colors.warning,
  },
  warningText: {
    color: colors.warning,
  },
})
