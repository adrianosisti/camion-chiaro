import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { PrimaryButton } from '../components/PrimaryButton'
import { signInDriver } from '../services/driverApi'
import { colors, layout } from '../theme'

export function AuthScreen({ onAuthenticated }) {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  async function handleLogin() {
    if (!username.trim() || !password) {
      Alert.alert('Dati mancanti', 'Inserisci username autista e password.')
      return
    }

    setIsLoading(true)
    const result = await signInDriver({ password, username })
    setIsLoading(false)

    if (result.error || !result.data) {
      Alert.alert('Accesso non riuscito', result.error?.message ?? 'Controlla username e password.')
      return
    }

    onAuthenticated?.(result.data)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <View style={styles.brandMark}>
        <Text style={styles.brandInitial}>CC</Text>
      </View>
      <Text style={styles.title}>Camion Chiaro</Text>
      <Text style={styles.subtitle}>Area autisti</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setUsername}
          placeholder="es. marco"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={username}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        <PrimaryButton loading={isLoading} onPress={handleLogin} title="Entra" />
      </View>

      <Text style={styles.footerText}>
        Le credenziali vengono create dall azienda nel pannello Camion Chiaro.
      </Text>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  brandInitial: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 20,
    height: 72,
    justifyContent: 'center',
    marginBottom: 18,
    width: 72,
  },
  footerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 18,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: layout.radius,
    borderWidth: 1,
    gap: 10,
    marginTop: 28,
    padding: 16,
    width: '100%',
  },
  input: {
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  screen: {
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
})
