import { useMemo, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { getWheelOptionLabel, SelectionWheelModal, WheelPickerField } from '../components/WheelPicker'
import { colors, layout } from '../theme'
import { createFuelLiterOptions, getFuelLiterLabel } from '../utils/fuelLiters'

function getVehicleLabel(vehicle = {}) {
  return [vehicle.plate, vehicle.model].filter(Boolean).join(' · ') || 'Mezzo'
}

function getDefaultVehicleId({ selectedVehicleId = '', vehicles = [] }) {
  if (vehicles.some((vehicle) => vehicle.id === selectedVehicleId)) return selectedVehicleId
  return vehicles.find((vehicle) => vehicle.fleetType !== 'semirimorchio')?.id ?? vehicles[0]?.id ?? ''
}

function parseDecimalInput(value = '') {
  const parsed = Number.parseFloat(String(value).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

export function FuelMovementScreen({
  context,
  currentPerson,
  driver,
  onBackHome,
  onSubmit,
  selectedVehicleId = '',
}) {
  const tanks = context?.fuelTanks ?? []
  const vehicles = context?.vehicles ?? []
  const vehicleOptions = useMemo(
    () => vehicles
      .filter((vehicle) => vehicle.fleetType !== 'semirimorchio')
      .map((vehicle) => ({
        id: vehicle.id,
        label: vehicle.plate || 'Targa mancante',
        subtitle: [vehicle.model, vehicle.fleetType].filter(Boolean).join(' · '),
      })),
    [vehicles],
  )
  const tankOptions = useMemo(
    () => tanks.map((tank) => ({
      id: tank.id,
      label: tank.name,
      subtitle: tank.location || 'Deposito',
    })),
    [tanks],
  )
  const literOptions = useMemo(() => createFuelLiterOptions('dispense'), [])
  const [form, setForm] = useState({
    liters: '',
    notes: '',
    odometerKm: '',
    tankId: tankOptions[0]?.id ?? '',
    vehicleId: getDefaultVehicleId({ selectedVehicleId, vehicles }),
  })
  const [isSaving, setIsSaving] = useState(false)
  const [wheelPicker, setWheelPicker] = useState(null)
  const activeTankId = tanks.some((tank) => tank.id === form.tankId) ? form.tankId : tankOptions[0]?.id ?? ''
  const activeVehicleId = vehicles.some((vehicle) => vehicle.id === form.vehicleId)
    ? form.vehicleId
    : getDefaultVehicleId({ selectedVehicleId, vehicles })
  const activeVehicle = vehicles.find((vehicle) => vehicle.id === activeVehicleId)

  function updateForm(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  async function submitFuelMovement() {
    const liters = parseDecimalInput(form.liters)

    if (!activeTankId || !activeVehicleId || liters <= 0) {
      Alert.alert('Dati mancanti', 'Seleziona cisterna, mezzo e litri riforniti.')
      return
    }

    setIsSaving(true)
    const result = await onSubmit?.({
      driverId: driver?.id ?? currentPerson?.linkedDriverId ?? '',
      liters,
      movementType: 'dispense',
      notes: form.notes,
      odometerKm: form.odometerKm,
      personId: currentPerson?.id ?? '',
      tankId: activeTankId,
      vehicleId: activeVehicleId,
    })
    setIsSaving(false)

    if (!result) return

    setForm((currentForm) => ({
      ...currentForm,
      liters: '',
      notes: '',
      odometerKm: '',
    }))
    Alert.alert('Rifornimento salvato', 'Vygo ha registrato litri, targa e chilometri.')
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons color={colors.ink} name="speedometer-outline" size={28} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>Gasolio</Text>
            <Text style={styles.heroTitle}>Registra rifornimento</Text>
            <Text style={styles.heroText}>Inserisci litri, km e targa. Vygo usera questi dati per consumi, anomalie e controllo cisterna.</Text>
          </View>
        </View>

        {!tanks.length ? (
          <Panel kicker="Cisterna mancante" title="Prima crea una cisterna">
            <Text style={styles.bodyText}>L azienda deve creare almeno una cisterna gasolio dal controllo gestione prima di registrare rifornimenti.</Text>
            <PrimaryButton tone="light" onPress={onBackHome} title="Torna alla Home" />
          </Panel>
        ) : (
          <Panel kicker="Rifornimento" title={activeVehicle ? getVehicleLabel(activeVehicle) : 'Scegli mezzo'}>
            <WheelPickerField
              label="Cisterna"
              onPress={() => setWheelPicker({
                onSelect: (value) => updateForm('tankId', value),
                options: tankOptions,
                title: 'Scegli cisterna',
                value: activeTankId,
              })}
              value={getWheelOptionLabel(tankOptions, activeTankId, 'Scegli cisterna')}
            />
            <WheelPickerField
              label="Mezzo"
              onPress={() => setWheelPicker({
                onSelect: (value) => updateForm('vehicleId', value),
                options: vehicleOptions,
                title: 'Scegli mezzo',
                value: activeVehicleId,
              })}
              value={getWheelOptionLabel(vehicleOptions, activeVehicleId, 'Scegli mezzo')}
            />
            <WheelPickerField
              helper="Scorri la rotella e conferma: niente virgole da digitare."
              label="Litri riforniti"
              onPress={() => setWheelPicker({
                onSelect: (value) => updateForm('liters', value),
                options: literOptions,
                title: 'Litri riforniti',
                value: form.liters || '100',
              })}
              value={getFuelLiterLabel(form.liters)}
            />
            <TextInput
              keyboardType="number-pad"
              onChangeText={(value) => updateForm('odometerKm', value)}
              placeholder="Km mezzo"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={form.odometerKm}
            />
            <TextInput
              multiline
              onChangeText={(value) => updateForm('notes', value)}
              placeholder="Note opzionali"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.textarea]}
              value={form.notes}
            />
            <PrimaryButton loading={isSaving} onPress={submitFuelMovement} title="Salva rifornimento" />
          </Panel>
        )}
      </ScrollView>
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
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 12,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
    padding: 18,
  },
  heroCopy: {
    flex: 1,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  heroKicker: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  heroText: {
    color: '#cffafe',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  textarea: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  wrapper: {
    flex: 1,
  },
})
