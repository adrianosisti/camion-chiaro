import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { colors, layout } from '../theme'

const languages = [
  { id: 'it', label: 'Italiano' },
  { id: 'en', label: 'English' },
  { id: 'ro', label: 'Romana' },
  { id: 'pl', label: 'Polski' },
  { id: 'es', label: 'Espanol' },
  { id: 'fr', label: 'Francais' },
  { id: 'de', label: 'Deutsch' },
]

export function SettingsScreen({
  accountType = 'driver',
  chatSoundEnabled = true,
  chatDiagnostics = null,
  language = 'it',
  onChatSoundChange,
  onLanguageChange,
  onRefresh,
  onResetChatBadge,
  onSignOut,
}) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Panel kicker="App" title="Impostazioni">
        <Text style={styles.helper}>
          {accountType === 'company'
            ? 'Preferenze del pannello azienda su telefono.'
            : 'Preferenze dell app autista su questo telefono.'}
        </Text>
      </Panel>

      <Panel kicker="Lingua" title="Lingua app">
        <View style={styles.languageGrid}>
          {languages.map((item) => {
            const selected = item.id === language
            return (
              <Pressable
                key={item.id}
                onPress={() => onLanguageChange?.(item.id)}
                style={[styles.languageButton, selected && styles.languageButtonActive]}
              >
                <Text style={[styles.languageText, selected && styles.languageTextActive]}>{item.label}</Text>
              </Pressable>
            )
          })}
        </View>
      </Panel>

      <Panel kicker="Chat" title="Suoni e messaggi">
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>Suono chat</Text>
            <Text style={styles.settingMeta}>Riproduci un tono quando invii o ricevi messaggi.</Text>
          </View>
          <Switch
            onValueChange={onChatSoundChange}
            thumbColor={chatSoundEnabled ? colors.cyan : '#cbd5e1'}
            trackColor={{ false: '#e2e8f0', true: '#a7f3ff' }}
            value={chatSoundEnabled}
          />
        </View>
      </Panel>

      {accountType === 'driver' ? (
        <Panel kicker="Chat" title="Diagnostica badge">
          <Text style={styles.helper}>
            Badge: {chatDiagnostics?.badgeCount ?? 0} | Non letti raw: {chatDiagnostics?.rawUnreadCount ?? 0} | Messaggi: {chatDiagnostics?.messageCount ?? 0}
          </Text>
          <Text style={styles.diagnosticLine}>Ultimo azienda: {chatDiagnostics?.latestCompanyAt || 'nessuno'}</Text>
          <Text style={styles.diagnosticLine}>Letto fino a: {chatDiagnostics?.readWatermark || 'mai'}</Text>
          <Text style={styles.diagnosticLine}>Ultimo letto server: {chatDiagnostics?.latestCompanyReadAt || 'vuoto'}</Text>
          <View style={styles.buttonGap} />
          <PrimaryButton onPress={onResetChatBadge} title="Reset badge chat" tone="light" />
        </Panel>
      ) : null}

      <Panel kicker="Sessione" title="Account">
        <PrimaryButton onPress={onRefresh} title="Aggiorna dati" tone="light" />
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onSignOut} title="Esci dall account" />
      </Panel>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  buttonGap: {
    height: 10,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  helper: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  diagnosticLine: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 4,
  },
  languageButton: {
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  languageButtonActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  languageTextActive: {
    color: colors.white,
  },
  settingCopy: {
    flex: 1,
    paddingRight: 12,
  },
  settingMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 3,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  settingTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
})
