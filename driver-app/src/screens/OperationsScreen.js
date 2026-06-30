import { useEffect, useState } from 'react'
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { getWheelOptionLabel, SelectionWheelModal, WheelPickerField } from '../components/WheelPicker'
import { t } from '../i18n/native'
import { colors, layout } from '../theme'

function getVehicleLabel(vehicle) {
  if (!vehicle) return 'Nessun mezzo'
  return [vehicle.plate, vehicle.model].filter(Boolean).join(' - ')
}

function ToggleRow({ label, onValueChange, value }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        onValueChange={onValueChange}
        thumbColor={value ? colors.cyan : '#cbd5e1'}
        trackColor={{ false: '#e2e8f0', true: '#a7f3ff' }}
        value={value}
      />
    </View>
  )
}

const severityOptions = [
  { id: 'low', label: 'Bassa' },
  { id: 'medium', label: 'Media' },
  { id: 'high', label: 'Alta' },
]

export function OperationsScreen({
  checks = [],
  faults = [],
  language = 'it',
  onOpenHome,
  onSubmitCheck,
  onSubmitFault,
  selectedVehicleId = '',
  vehicles = [],
}) {
  const driveableVehicles = vehicles.filter((vehicle) => vehicle.fleetType !== 'semirimorchio')
  const trailers = vehicles.filter((vehicle) => vehicle.fleetType === 'semirimorchio')
  const selectedVehicle = driveableVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null
  const trailerOptions = [
    { id: '', label: 'Nessun semirimorchio', subtitle: 'Non agganciato o non indicato' },
    ...trailers.map((vehicle) => ({
      id: vehicle.id,
      label: vehicle.plate,
      subtitle: vehicle.model || vehicle.type || 'Semirimorchio',
    })),
  ]
  const [checkForm, setCheckForm] = useState({
    documentsOnBoard: true,
    lightsOk: true,
    notes: '',
    odometerKm: '',
    semitrailerId: '',
    tiresOk: true,
    tractorId: selectedVehicle?.id ?? '',
  })
  const [faultForm, setFaultForm] = useState({
    description: '',
    photo: null,
    semitrailerId: '',
    severity: 'medium',
    title: '',
    vehicleId: selectedVehicle?.id ?? '',
  })
  const [isSendingCheck, setIsSendingCheck] = useState(false)
  const [isSendingFault, setIsSendingFault] = useState(false)
  const [wheelPicker, setWheelPicker] = useState(null)

  useEffect(() => {
    setCheckForm((currentForm) => ({
      ...currentForm,
      tractorId: selectedVehicle?.id ?? '',
    }))
    setFaultForm((currentForm) => ({
      ...currentForm,
      vehicleId: selectedVehicle?.id ?? '',
    }))
  }, [selectedVehicle?.id])

  async function submitCheck() {
    if (!selectedVehicle) {
      Alert.alert('Mezzo del turno mancante', 'Vai in Home e seleziona il mezzo che stai prendendo.')
      return
    }

    setIsSendingCheck(true)
    const sent = await onSubmitCheck?.({
      ...checkForm,
      tractorId: selectedVehicle.id,
    })
    setIsSendingCheck(false)

    if (sent) {
      Alert.alert('Check inviato', 'Il check mattutino e arrivato in azienda.')
      setCheckForm((currentForm) => ({ ...currentForm, notes: '', odometerKm: '' }))
    }
  }

  async function pickFaultPhotoFrom(source) {
    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) {
        Alert.alert('Fotocamera bloccata', 'Consenti la fotocamera per scattare la foto del guasto.')
        return
      }
    }

    const picker = source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync
    const result = await picker({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.72,
    })

    if (result.canceled || !result.assets?.[0]) return

    const asset = result.assets[0]
    setFaultForm((currentForm) => ({
      ...currentForm,
      photo: {
        name: asset.fileName || `guasto-${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
        uri: asset.uri,
      },
    }))
  }

  async function submitFault() {
    if (!selectedVehicle || !faultForm.title.trim()) {
      Alert.alert('Dati mancanti', 'Inserisci titolo guasto e scegli il mezzo del turno dalla Home.')
      return
    }

    setIsSendingFault(true)
    const sent = await onSubmitFault?.({
      ...faultForm,
      vehicleId: selectedVehicle.id,
    })
    setIsSendingFault(false)

    if (sent) {
      Alert.alert('Guasto inviato', 'La segnalazione e arrivata in azienda.')
      setFaultForm((currentForm) => ({ ...currentForm, description: '', photo: null, title: '' }))
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {!selectedVehicle ? (
        <Panel kicker="Mezzo del turno" title="Seleziona prima il mezzo">
          <Text style={styles.helper}>
            L autista non deve scegliere tutta la flotta ogni volta. Prima seleziona in Home il mezzo che sta prendendo oggi; se cambia mezzo durante il giorno, lo cambia da li.
          </Text>
          <PrimaryButton onPress={onOpenHome} title={t(language, 'backHome')} />
        </Panel>
      ) : null}

      <Panel kicker={t(language, 'checkMorning')} title={getVehicleLabel(selectedVehicle)}>
        <Text style={styles.sectionLabel}>Mezzo del turno</Text>
        <View style={styles.selectedVehicleCard}>
          <Text style={styles.selectedVehiclePlate}>{selectedVehicle?.plate ?? 'Non selezionato'}</Text>
          <Text style={styles.selectedVehicleMeta}>{selectedVehicle?.model || selectedVehicle?.fleetType || 'Mezzo flotta'}</Text>
        </View>
        <WheelPickerField
          label="Semirimorchio opzionale"
          onPress={() => setWheelPicker({
            onSelect: (semitrailerId) => setCheckForm((currentForm) => ({ ...currentForm, semitrailerId })),
            options: trailerOptions,
            title: 'Semirimorchio check',
            value: checkForm.semitrailerId,
          })}
          value={getWheelOptionLabel(trailerOptions, checkForm.semitrailerId)}
        />
        <ToggleRow
          label="Luci ok"
          onValueChange={(value) => setCheckForm((currentForm) => ({ ...currentForm, lightsOk: value }))}
          value={checkForm.lightsOk}
        />
        <ToggleRow
          label="Pneumatici ok"
          onValueChange={(value) => setCheckForm((currentForm) => ({ ...currentForm, tiresOk: value }))}
          value={checkForm.tiresOk}
        />
        <ToggleRow
          label="Documenti a bordo"
          onValueChange={(value) => setCheckForm((currentForm) => ({ ...currentForm, documentsOnBoard: value }))}
          value={checkForm.documentsOnBoard}
        />
        <TextInput
          keyboardType="number-pad"
          onChangeText={(value) => setCheckForm((currentForm) => ({ ...currentForm, odometerKm: value }))}
          placeholder="Km mezzo"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={checkForm.odometerKm}
        />
        <TextInput
          multiline
          onChangeText={(value) => setCheckForm((currentForm) => ({ ...currentForm, notes: value }))}
          placeholder="Note check"
          placeholderTextColor="#94a3b8"
          style={[styles.input, styles.textArea]}
          value={checkForm.notes}
        />
        <PrimaryButton loading={isSendingCheck} onPress={submitCheck} title="Invia check" />
      </Panel>

      <Panel kicker={t(language, 'fault')} title="Segnala all azienda">
        <Text style={styles.sectionLabel}>Mezzo guasto</Text>
        <View style={styles.selectedVehicleCard}>
          <Text style={styles.selectedVehiclePlate}>{selectedVehicle?.plate ?? 'Non selezionato'}</Text>
          <Text style={styles.selectedVehicleMeta}>{selectedVehicle?.model || selectedVehicle?.fleetType || 'Mezzo flotta'}</Text>
        </View>
        <WheelPickerField
          label="Semirimorchio agganciato"
          onPress={() => setWheelPicker({
            onSelect: (semitrailerId) => setFaultForm((currentForm) => ({ ...currentForm, semitrailerId })),
            options: trailerOptions,
            title: 'Semirimorchio guasto',
            value: faultForm.semitrailerId,
          })}
          value={getWheelOptionLabel(trailerOptions, faultForm.semitrailerId)}
        />
        <TextInput
          onChangeText={(value) => setFaultForm((currentForm) => ({ ...currentForm, title: value }))}
          placeholder="Titolo guasto"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={faultForm.title}
        />
        <TextInput
          multiline
          onChangeText={(value) => setFaultForm((currentForm) => ({ ...currentForm, description: value }))}
          placeholder="Descrizione"
          placeholderTextColor="#94a3b8"
          style={[styles.input, styles.textArea]}
          value={faultForm.description}
        />
        <WheelPickerField
          label="Gravità"
          onPress={() => setWheelPicker({
            onSelect: (severity) => setFaultForm((currentForm) => ({ ...currentForm, severity })),
            options: severityOptions,
            title: 'Gravità guasto',
            value: faultForm.severity,
          })}
          value={getWheelOptionLabel(severityOptions, faultForm.severity)}
        />
        <Text style={styles.sectionLabel}>Foto guasto</Text>
        <View style={styles.photoActions}>
          <Pressable onPress={() => pickFaultPhotoFrom('camera')} style={styles.photoButton}>
            <Text style={styles.photoButtonText}>Scatta foto</Text>
          </Pressable>
          <Pressable onPress={() => pickFaultPhotoFrom('gallery')} style={styles.photoButtonSecondary}>
            <Text style={styles.photoButtonSecondaryText}>{t(language, 'gallery')}</Text>
          </Pressable>
        </View>
        {faultForm.photo?.uri ? <Image source={{ uri: faultForm.photo.uri }} style={styles.faultPhoto} /> : null}
        <PrimaryButton loading={isSendingFault} onPress={submitFault} title="Invia guasto" />
      </Panel>

      <Panel kicker="Storico" title="Ultime operazioni">
        <Text style={styles.helper}>Check inviati: {checks.length}</Text>
        <Text style={styles.helper}>Guasti segnalati: {faults.length}</Text>
      </Panel>
      <SelectionWheelModal
        onClose={() => setWheelPicker(null)}
        onConfirm={(value) => {
          wheelPicker?.onSelect?.(value)
          setWheelPicker(null)
        }}
        options={wheelPicker?.options ?? []}
        title={wheelPicker?.title ?? 'Seleziona'}
        value={wheelPicker?.value ?? ''}
        visible={Boolean(wheelPicker)}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  helper: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 8,
  },
  faultPhoto: {
    aspectRatio: 1.4,
    borderRadius: 14,
    marginBottom: 12,
    width: '100%',
  },
  input: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    marginBottom: 10,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  severityButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
  },
  severityButtonActive: {
    backgroundColor: colors.ink,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  severityText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  severityTextActive: {
    color: colors.white,
  },
  photoButton: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  photoButtonSecondary: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 999,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  photoButtonSecondaryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  photoButtonText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  sectionLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
    marginTop: 4,
  },
  selectedVehicleCard: {
    backgroundColor: colors.ink,
    borderColor: colors.cyan,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  selectedVehicleMeta: {
    color: '#a7f3ff',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  selectedVehiclePlate: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 10,
  },
  selectorScroll: {
    marginBottom: 4,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  toggleLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  toggleRow: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  vehicleChip: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 104,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  vehicleChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  vehiclePlate: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  vehiclePlateActive: {
    color: colors.white,
  },
  vehicleType: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  vehicleTypeActive: {
    color: '#a7f3ff',
  },
})
