import { useMemo, useState } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
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
    tiresOk: true,
    tractorId: firstVehicle?.id ?? '',
  })
  const [faultForm, setFaultForm] = useState({
    description: '',
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

  async function submitFault() {
    if (!currentVehicle || !faultForm.title.trim()) {
      Alert.alert('Dati mancanti', 'Inserisci titolo guasto e mezzo.')
      return
    }

    setIsSendingFault(true)
    const sent = await onSubmitFault?.({
      ...faultForm,
      vehicleId: currentVehicle.id,
    })
    setIsSendingFault(false)

    if (sent) {
      Alert.alert('Guasto inviato', 'La segnalazione e arrivata in azienda.')
      setFaultForm((currentForm) => ({ ...currentForm, description: '', title: '' }))
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Panel kicker="Check mattutino" title={getVehicleLabel(currentVehicle)}>
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
        {trailers.length ? <Text style={styles.helper}>Semirimorchio opzionale da aggiungere nella prossima iterazione.</Text> : null}
        <PrimaryButton loading={isSendingCheck} onPress={submitCheck} title="Invia check" />
      </Panel>

      <Panel kicker="Guasto" title="Segnala all azienda">
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
})
