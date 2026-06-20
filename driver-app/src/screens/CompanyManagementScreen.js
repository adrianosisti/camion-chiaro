import { useEffect, useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { Ionicons } from '@expo/vector-icons'
import { DateField } from '../components/DateField'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { getLocale } from '../i18n/native'
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

function formatDate(value, language = 'it') {
  if (!value) return 'Senza data'
  return new Intl.DateTimeFormat(getLocale(language), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

function getDeadlineDays(value) {
  if (!value) return 9999
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(value) - today) / 86400000)
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

function getDeadlineSubject(item, drivers, vehicles) {
  if (item.scope === 'driver') {
    return drivers.find((driver) => driver.id === item.driverId)?.name ?? 'Autista'
  }

  if (item.scope === 'vehicle') {
    return vehicles.find((vehicle) => vehicle.id === item.vehicleId)?.plate ?? 'Mezzo'
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

function Chip({ active, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  )
}

function TextField({ keyboardType, label, onChangeText, placeholder, secureTextEntry = false, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        secureTextEntry={secureTextEntry}
        style={styles.input}
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

export function CompanyManagementScreen({
  context,
  initialSection = 'drivers',
  language = 'it',
  onCreateDeadline,
  onCreateDriver,
  onCreateVehicle,
}) {
  const drivers = context?.drivers ?? []
  const vehicles = context?.vehicles ?? []
  const deadlines = context?.complianceItems ?? []
  const activeVehicles = vehicles.filter((vehicle) => !['Archiviato', 'archived'].includes(vehicle.status))
  const [activeForm, setActiveForm] = useState('driver')
  const [activeList, setActiveList] = useState(initialSection)
  const [mode, setMode] = useState('archive')
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
  const [isSaving, setIsSaving] = useState(false)
  const deadlineAssignees = useMemo(() => {
    if (deadlineForm.scope === 'driver') return drivers
    if (deadlineForm.scope === 'vehicle') return activeVehicles
    return []
  }, [activeVehicles, deadlineForm.scope, drivers])
  const nextDeadlines = deadlines
    .filter((item) => item.dueDate)
    .slice()
    .sort((first, second) => new Date(first.dueDate) - new Date(second.dueDate))

  useEffect(() => {
    if (initialSection) {
      setActiveList(initialSection)
      setMode('archive')
    }
  }, [initialSection])

  function openCreateForm(formType) {
    setActiveForm(formType)
    setMode('create')
  }

  function openArchive(section = activeList) {
    setActiveList(section)
    setMode('archive')
  }

  function updateDriverForm(field, value) {
    setDriverForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updateVehicleForm(field, value) {
    setVehicleForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  function updateDeadlineForm(field, value) {
    setDeadlineForm((currentForm) => ({ ...currentForm, [field]: value }))
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
      Alert.alert('Data non valida', 'Scrivi la data nel formato YYYY-MM-DD.')
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

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Anagrafiche</Text>
        <Text style={styles.heroMeta}>Autisti, flotta e scadenze</Text>
        <View style={styles.summaryGrid}>
          <SummaryCard icon="people-outline" label="Autisti" value={drivers.length} />
          <SummaryCard icon="bus-outline" label="Mezzi" value={activeVehicles.length} />
          <SummaryCard icon="calendar-outline" label="Scadenze" value={deadlines.length} />
        </View>
      </View>

      <View style={styles.modeBar}>
        <Pressable onPress={() => openArchive(activeList)} style={[styles.modeButton, mode === 'archive' && styles.modeButtonActive]}>
          <Ionicons color={mode === 'archive' ? colors.white : colors.cyanDark} name="albums-outline" size={18} />
          <Text style={[styles.modeButtonText, mode === 'archive' && styles.modeButtonTextActive]}>Archivio</Text>
        </Pressable>
        <Pressable onPress={() => openCreateForm(activeForm)} style={[styles.modeButton, mode === 'create' && styles.modeButtonActive]}>
          <Ionicons color={mode === 'create' ? colors.white : colors.cyanDark} name="add-circle-outline" size={18} />
          <Text style={[styles.modeButtonText, mode === 'create' && styles.modeButtonTextActive]}>Nuovo</Text>
        </Pressable>
      </View>

      {mode === 'create' ? (
        <View style={styles.formTabs}>
          <Chip active={activeForm === 'driver'} label="Autista" onPress={() => setActiveForm('driver')} />
          <Chip active={activeForm === 'vehicle'} label="Mezzo" onPress={() => setActiveForm('vehicle')} />
          <Chip active={activeForm === 'deadline'} label="Scadenza" onPress={() => setActiveForm('deadline')} />
        </View>
      ) : null}

      {mode === 'create' && activeForm === 'driver' ? (
        <Panel
          kicker="Nuovo"
          right={
            <Pressable onPress={() => openArchive(activeList)} style={styles.closeFormButton}>
              <Text style={styles.closeFormText}>Chiudi</Text>
            </Pressable>
          }
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

      {mode === 'create' && activeForm === 'vehicle' ? (
        <Panel
          kicker="Nuovo"
          right={
            <Pressable onPress={() => openArchive(activeList)} style={styles.closeFormButton}>
              <Text style={styles.closeFormText}>Chiudi</Text>
            </Pressable>
          }
          title="Aggiungi mezzo"
        >
          <TextField label="Targa" onChangeText={(value) => updateVehicleForm('plate', value)} placeholder="AB123CD" value={vehicleForm.plate} />
          <Text style={styles.label}>Tipo flotta</Text>
          <View style={styles.chipGrid}>
            {fleetTypes.map((item) => (
              <Chip
                active={vehicleForm.fleetType === item.id}
                key={item.id}
                label={item.label}
                onPress={() => updateVehicleForm('fleetType', item.id)}
              />
            ))}
          </View>
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
          right={
            <Pressable onPress={() => openArchive(activeList)} style={styles.closeFormButton}>
              <Text style={styles.closeFormText}>Chiudi</Text>
            </Pressable>
          }
          title="Aggiungi scadenza"
        >
          <TextField label="Tipo scadenza" onChangeText={(value) => updateDeadlineForm('type', value)} placeholder="Revisione, assicurazione, CQC..." value={deadlineForm.type} />
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.chipGrid}>
            {scopes.map((item) => (
              <Chip
                active={deadlineForm.scope === item.id}
                key={item.id}
                label={item.label}
                onPress={() => setDeadlineForm((currentForm) => ({ ...currentForm, assigneeId: '', scope: item.id }))}
              />
            ))}
          </View>
          {deadlineForm.scope !== 'company' ? (
            <>
              <Text style={styles.label}>Soggetto</Text>
              <View style={styles.selectorList}>
                {deadlineAssignees.map((item) => (
                  <Chip
                    active={deadlineForm.assigneeId === item.id}
                    key={item.id}
                    label={deadlineForm.scope === 'driver' ? item.name : item.plate}
                    onPress={() => updateDeadlineForm('assigneeId', item.id)}
                  />
                ))}
                {!deadlineAssignees.length ? <Text style={styles.emptyText}>Aggiungi prima {deadlineForm.scope === 'driver' ? 'un autista' : 'un mezzo'}.</Text> : null}
              </View>
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

      <Panel kicker="Archivio" title="Dati azienda">
        <View style={styles.archiveTabs}>
          <Chip active={activeList === 'drivers'} label="Autisti" onPress={() => setActiveList('drivers')} />
          <Chip active={activeList === 'vehicles'} label="Flotta" onPress={() => setActiveList('vehicles')} />
          <Chip active={activeList === 'deadlines'} label="Scadenze" onPress={() => setActiveList('deadlines')} />
        </View>
        {mode === 'archive' ? (
          <View style={styles.quickCreateRow}>
            <Pressable onPress={() => openCreateForm('driver')} style={styles.quickCreateButton}>
              <Ionicons color={colors.ink} name="person-add-outline" size={17} />
              <Text style={styles.quickCreateText}>Autista</Text>
            </Pressable>
            <Pressable onPress={() => openCreateForm('vehicle')} style={styles.quickCreateButton}>
              <Ionicons color={colors.ink} name="bus-outline" size={17} />
              <Text style={styles.quickCreateText}>Mezzo</Text>
            </Pressable>
            <Pressable onPress={() => openCreateForm('deadline')} style={styles.quickCreateButton}>
              <Ionicons color={colors.ink} name="calendar-outline" size={17} />
              <Text style={styles.quickCreateText}>Scadenza</Text>
            </Pressable>
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

        {activeList === 'deadlines' ? (
          <View style={styles.archiveList}>
            {nextDeadlines.map((item) => {
              const tone = getDeadlineTone(item)
              return (
                <View key={item.id} style={styles.deadlineRow}>
                  <View style={[styles.deadlineStatusDot, styles[`${tone}Dot`]]} />
                  <View style={styles.listCopy}>
                    <Text style={styles.listTitle}>{item.type}</Text>
                    <Text style={styles.listMeta}>
                      {getDeadlineSubject(item, drivers, activeVehicles)} · {formatDate(item.dueDate, language)} · {getDeadlineStatusLabel(item)}
                    </Text>
                    {item.filePath ? <Text style={styles.fileMeta}>Allegato presente</Text> : null}
                  </View>
                </View>
              )
            })}
            {!nextDeadlines.length ? <Text style={styles.emptyText}>Nessuna scadenza caricata.</Text> : null}
          </View>
        ) : null}
      </Panel>
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
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
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
  formTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeBar: {
    backgroundColor: '#dff7fb',
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    padding: 5,
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    minHeight: 42,
  },
  modeButtonActive: {
    backgroundColor: colors.ink,
  },
  modeButtonText: {
    color: colors.cyanDark,
    fontSize: 13,
    fontWeight: '900',
  },
  modeButtonTextActive: {
    color: colors.white,
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
  quickCreateButton: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 14,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 8,
  },
  quickCreateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickCreateText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
  },
  selectorList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
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
