import { useEffect, useMemo, useState } from 'react'
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

function VehicleSelector({ emptyLabel, onSelect, selectedId, vehicles }) {
  if (!vehicles.length) {
    return <Text style={styles.helper}>{emptyLabel}</Text>
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
      <View style={styles.selectorRow}>
        {vehicles.map((vehicle) => {
          const selected = vehicle.id === selectedId
          return (
            <Pressable
              key={vehicle.id}
              onPress={() => onSelect(vehicle.id)}
              style={[styles.vehicleChip, selected && styles.vehicleChipActive]}
            >
              <Text style={[styles.vehiclePlate, selected && styles.vehiclePlateActive]}>{vehicle.plate}</Text>
              <Text style={[styles.vehicleType, selected && styles.vehicleTypeActive]}>
                {vehicle.fleetType || vehicle.type || 'Mezzo'}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
}

export function OperationsScreen({
  checks = [],
  faults = [],
  onSubmitCheck,
  onSubmitFault,
  vehicles = [],
}) {
  const driveableVehicles = vehicles.filter((vehicle) => vehicle.fleetType !== 'semirimorchio')
  const trailers = vehicles.filter((vehicle) => vehicle.fleetType === 'semirimorchio')
  const firstVehicle = driveableVehicles[0] ?? null
  const [checkForm, setCheckForm] = useState({
    documentsOnBoard: true,
    lightsOk: true,
    notes: '',
    odometerKm: '',
    semitrailerId: '',
    tiresOk: true,
    tractorId: firstVehicle?.id ?? '',
  })
  const [faultForm, setFaultForm] = useState({
    description: '',
    photo: null,
    semitrailerId: '',
    severity: 'medium',
    title: '',
    vehicleId: firstVehicle?.id ?? '',
  })
  const [isSendingCheck, setIsSendingCheck] = useState(false)
  const [isSendingFault, setIsSendingFault] = useState(false)

  const currentVehicle = useMemo(
    () => driveableVehicles.find((vehicle) => vehicle.id === checkForm.tractorId) ?? firstVehicle,
    [checkForm.tractorId, driveableVehicles, firstVehicle],
  )
  const faultVehicle = useMemo(
    () => driveableVehicles.find((vehicle) => vehicle.id === faultForm.vehicleId) ?? firstVehicle,
    [faultForm.vehicleId, driveableVehicles, firstVehicle],
  )

  useEffect(() => {
    if (!firstVehicle?.id) return
    setCheckForm((currentForm) => ({
      ...currentForm,
      tractorId: currentForm.tractorId || firstVehicle.id,
    }))
    setFaultForm((currentForm) => ({
      ...currentForm,
      vehicleId: currentForm.vehicleId || firstVehicle.id,
    }))
  }, [firstVehicle?.id])

  async function submitCheck() {
    if (!currentVehicle) {
      Alert.alert('Mezzo mancante', 'L azienda deve inserire almeno un mezzo.')
      return
    }

    setIsSendingCheck(true)
    const sent = await onSubmitCheck?.({
      ...checkForm,
      tractorId: currentVehicle.id,
    })
    setIsSendingCheck(false)

    if (sent) {
      Alert.alert('Check inviato', 'Il check mattutino e arrivato in azienda.')
      setCheckForm((currentForm) => ({ ...currentForm, notes: '', odometerKm: '' }))
    }
  }

  async function pickFaultPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
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
    if (!faultVehicle || !faultForm.title.trim()) {
      Alert.alert('Dati mancanti', 'Inserisci titolo guasto e mezzo.')
      return
    }

    setIsSendingFault(true)
    const sent = await onSubmitFault?.({
      ...faultForm,
      vehicleId: faultVehicle.id,
    })
    setIsSendingFault(false)

    if (sent) {
      Alert.alert('Guasto inviato', 'La segnalazione e arrivata in azienda.')
      setFaultForm((currentForm) => ({ ...currentForm, description: '', photo: null, title: '' }))
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Panel kicker="Check mattutino" title={getVehicleLabel(currentVehicle)}>
        <Text style={styles.sectionLabel}>Mezzo</Text>
        <VehicleSelector
          emptyLabel="L azienda deve aggiungere furgoni, motrici o trattori."
          onSelect={(tractorId) => setCheckForm((currentForm) => ({ ...currentForm, tractorId }))}
          selectedId={checkForm.tractorId}
          vehicles={driveableVehicles}
        />
        <Text style={styles.sectionLabel}>Semirimorchio opzionale</Text>
        <VehicleSelector
          emptyLabel="Nessun semirimorchio in flotta."
          onSelect={(semitrailerId) => setCheckForm((currentForm) => ({ ...currentForm, semitrailerId }))}
          selectedId={checkForm.semitrailerId}
          vehicles={trailers}
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

      <Panel kicker="Guasto" title="Segnala all azienda">
        <Text style={styles.sectionLabel}>Mezzo guasto</Text>
        <VehicleSelector
          emptyLabel="L azienda deve aggiungere almeno un mezzo."
          onSelect={(vehicleId) => setFaultForm((currentForm) => ({ ...currentForm, vehicleId }))}
          selectedId={faultForm.vehicleId}
          vehicles={driveableVehicles}
        />
        <Text style={styles.sectionLabel}>Semirimorchio agganciato</Text>
        <VehicleSelector
          emptyLabel="Nessun semirimorchio in flotta."
          onSelect={(semitrailerId) => setFaultForm((currentForm) => ({ ...currentForm, semitrailerId }))}
          selectedId={faultForm.semitrailerId}
          vehicles={trailers}
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
        <View style={styles.severityRow}>
          {['low', 'medium', 'high'].map((severity) => (
            <Pressable
              key={severity}
              onPress={() => setFaultForm((currentForm) => ({ ...currentForm, severity }))}
              style={[styles.severityButton, faultForm.severity === severity && styles.severityButtonActive]}
            >
              <Text style={[styles.severityText, faultForm.severity === severity && styles.severityTextActive]}>
                {severity === 'low' ? 'Bassa' : severity === 'high' ? 'Alta' : 'Media'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={pickFaultPhoto} style={styles.photoButton}>
          <Text style={styles.photoButtonText}>{faultForm.photo ? 'Cambia foto guasto' : 'Aggiungi foto guasto'}</Text>
        </Pressable>
        {faultForm.photo?.uri ? <Image source={{ uri: faultForm.photo.uri }} style={styles.faultPhoto} /> : null}
        <PrimaryButton loading={isSendingFault} onPress={submitFault} title="Invia guasto" />
      </Panel>

      <Panel kicker="Storico" title="Ultime operazioni">
        <Text style={styles.helper}>Check inviati: {checks.length}</Text>
        <Text style={styles.helper}>Guasti segnalati: {faults.length}</Text>
      </Panel>
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
    marginBottom: 10,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
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
