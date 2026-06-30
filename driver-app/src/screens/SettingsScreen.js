import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { t } from '../i18n/native'
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
  nativePushStatus = '',
  onChatSoundChange,
  onEnableNativeNotifications,
  onLanguageChange,
  onOpenAssistant,
  onRefresh,
  onResetChatBadge,
  onSignOut,
}) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Panel kicker="App" title={t(language, 'appSettings')}>
        <Text style={styles.helper}>
          {accountType === 'company'
            ? t(language, 'appSettingsCompanyHelp')
            : t(language, 'appSettingsDriverHelp')}
        </Text>
      </Panel>

      <Panel kicker={t(language, 'language')} title={t(language, 'languageApp')}>
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

      <Panel kicker="Telefono" title="Notifiche app">
        <Text style={styles.helper}>
          Attiva questo telefono per ricevere chat, guasti e check anche quando Movigo non e aperta.
        </Text>
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onEnableNativeNotifications} title="Abilita notifiche app" tone="light" />
        {nativePushStatus ? <Text style={styles.diagnosticLine}>{nativePushStatus}</Text> : null}
      </Panel>

      <Panel kicker="Supporto" title="Assistente Movigo">
        <Text style={styles.helper}>
          Apri una chat guidata per scadenze, guasti, documenti, chat e notifiche. Se non basta, prepara un ticket email per l assistenza.
        </Text>
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onOpenAssistant} title="Apri assistente" tone="light" />
      </Panel>

      <Panel kicker="Chat" title={t(language, 'chatSettings')}>
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>{t(language, 'chatSound')}</Text>
            <Text style={styles.settingMeta}>{t(language, 'chatSoundHelp')}</Text>
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
        <Panel kicker="Chat" title={t(language, 'chatDiagnostics')}>
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

      <Panel kicker={t(language, 'session')} title="Account">
        <PrimaryButton onPress={onRefresh} title={t(language, 'refreshData')} tone="light" />
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onSignOut} title={t(language, 'signOut')} />
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
