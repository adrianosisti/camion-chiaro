import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { PrimaryButton } from '../components/PrimaryButton'
import { signInCompany, signInDriver } from '../services/driverApi'
import { colors, layout } from '../theme'

export function AuthScreen({ onAuthenticated }) {
  const [accountType, setAccountType] = useState('driver')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const isCompany = accountType === 'company'

  async function handleLogin() {
    if ((!isCompany && !username.trim()) || (isCompany && !email.trim()) || !password) {
      Alert.alert('Dati mancanti', isCompany ? 'Inserisci email azienda e password.' : 'Inserisci username autista e password.')
      return
    }

    setIsLoading(true)
    const result = isCompany
      ? await signInCompany({ email, password })
      : await signInDriver({ password, username })
    setIsLoading(false)

    if (result.error || !result.data) {
      Alert.alert('Accesso non riuscito', result.error?.message ?? 'Controlla credenziali e password.')
      return
    }

    onAuthenticated?.(result.data, accountType)
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
      <Text style={styles.subtitle}>{isCompany ? 'Area azienda' : 'Area autisti'}</Text>

      <View style={styles.form}>
        <View style={styles.modeSwitch}>
          <Pressable
            onPress={() => setAccountType('driver')}
            style={[styles.modeButton, !isCompany && styles.modeButtonActive]}
          >
            <Text style={[styles.modeText, !isCompany && styles.modeTextActive]}>Autista</Text>
          </Pressable>
          <Pressable
            onPress={() => setAccountType('company')}
            style={[styles.modeButton, isCompany && styles.modeButtonActive]}
          >
            <Text style={[styles.modeText, isCompany && styles.modeTextActive]}>Azienda</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>{isCompany ? 'Email azienda' : 'Username'}</Text>
        {isCompany ? (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="azienda@email.it"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={email}
          />
        ) : (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setUsername}
            placeholder="es. marco"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={username}
          />
        )}

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
        {isCompany
          ? 'Accedi con l account azienda usato sul sito Camion Chiaro.'
          : 'Le credenziali vengono create dall azienda nel pannello Camion Chiaro.'}
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
  modeButton: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.ink,
  },
  modeSwitch: {
    backgroundColor: '#e0f2fe',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
    padding: 4,
  },
  modeText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  modeTextActive: {
    color: colors.white,
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
