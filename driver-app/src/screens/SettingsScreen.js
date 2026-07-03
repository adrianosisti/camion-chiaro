import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Panel } from '../components/Panel'
import { PrimaryButton } from '../components/PrimaryButton'
import { getWheelOptionLabel, SelectionWheelModal, WheelPickerField } from '../components/WheelPicker'
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

const companyTrainingGuides = [
  {
    body: 'Leggi KPI, stato operativo, salute flotta e pratiche aperte appena entri.',
    steps: ['Controlla prima Stato operativo e Salute flotta.', 'Tocca Guasti, Check o Scadenze per aprire il dettaglio.', 'Chiudi, rinnova o archivia solo quando la pratica e gestita.'],
    title: 'Dashboard azienda',
  },
  {
    body: 'Crea autisti, ufficio e magazzino con credenziali e dati corretti.',
    steps: ['Apri Anagrafiche.', 'Scegli Persone o Autisti.', 'Compila nome, telefono, ruolo e password temporanea.', 'Fai fare il primo accesso e attivare notifiche.'],
    title: 'Persone e accessi',
  },
  {
    body: 'Registra mezzi, documenti, libretti, assicurazioni e scadenze.',
    steps: ['Apri Flotta.', 'Inserisci targa, tipo mezzo, modello e km.', 'Aggiungi documenti e date di scadenza.', 'Controlla che gli avvisi appaiano nella dashboard.'],
    title: 'Flotta e documenti',
  },
  {
    body: 'Gestisci check, guasti, foto, costi riparazione e storico.',
    steps: ['Apri Registro o Guasti.', 'Entra nella segnalazione.', 'Leggi foto, mezzo, autista e descrizione.', 'Salva costo se noto e archivia quando risolto.'],
    title: 'Check e guasti',
  },
  {
    body: 'Inserisci manutenzioni, sanzioni, spese libere e report operativi.',
    steps: ['Apri Centro costi.', 'Registra importo, data e categoria.', 'Collega targa, autista o attrezzatura.', 'Usa il desktop per CSV e stampa A4 filtrata.'],
    title: 'Centro costi',
  },
  {
    body: 'Usa chat singole e gruppi per comunicazioni ordinate.',
    steps: ['Apri Chat.', 'Scegli singola persona o gruppo reparto.', 'Usa foto, video e audio solo per comunicazioni utili.', 'Controlla sempre i badge rossi da leggere.'],
    title: 'Chat aziendale',
  },
]

const companyMenuItems = [
  {
    body: 'KPI, stato operativo, salute flotta e priorita del giorno.',
    icon: 'speedometer-outline',
    id: 'dashboard',
    title: 'Dashboard',
  },
  {
    body: 'Check, guasti, pratiche aperte e cose da lavorare.',
    icon: 'clipboard-outline',
    id: 'operations',
    title: 'Registro operativo',
  },
  {
    body: 'Documenti, revisioni, assicurazioni, visite e rinnovi.',
    icon: 'calendar-outline',
    id: 'deadlines',
    title: 'Scadenze',
  },
  {
    body: 'Spese libere, manutenzioni, sanzioni, costi per targa.',
    icon: 'cash-outline',
    id: 'costs',
    title: 'Centro costi',
  },
  {
    body: 'Riepiloghi, sanzioni, costi mese e report premium.',
    icon: 'stats-chart-outline',
    id: 'reports',
    title: 'Report',
  },
  {
    body: 'Autisti, persone, flotta, muletti e attrezzature.',
    icon: 'folder-open-outline',
    id: 'records',
    title: 'Anagrafiche',
  },
  {
    body: 'Storico guasti, check, scadenze e dati gia gestiti.',
    icon: 'albums-outline',
    id: 'archive',
    title: 'Archivio',
  },
  {
    body: 'Chat singole, gruppi, reparti, foto, video e audio.',
    icon: 'chatbubbles-outline',
    id: 'chat',
    title: 'Chat',
  },
  {
    body: 'Guide operative e assistente Vygo per usare l app.',
    icon: 'help-buoy-outline',
    id: 'guide',
    title: 'Guida e formazione',
  },
]

export function SettingsScreen({
  accountType = 'driver',
  appUpdateStatus = '',
  chatSoundEnabled = true,
  language = 'it',
  nativePushStatus = '',
  onChatSoundChange,
  onCheckAppUpdate,
  onEnableNativeNotifications,
  onLanguageChange,
  onNavigateCompanyMenu,
  onOpenAssistant,
  onRefresh,
  onSignOut,
}) {
  const [wheelPicker, setWheelPicker] = useState(null)
  const [activeTrainingIndex, setActiveTrainingIndex] = useState(0)
  const activeTrainingGuide = companyTrainingGuides[activeTrainingIndex] ?? companyTrainingGuides[0]

  function handleCompanyMenuPress(item) {
    if (item.id === 'guide') {
      setActiveTrainingIndex(0)
      return
    }

    onNavigateCompanyMenu?.(item.id)
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {accountType === 'company' ? (
        <View style={styles.companyMenuShell}>
          <View style={styles.companyMenuHeader}>
            <View style={styles.companyMenuHeaderIcon}>
              <Ionicons color={colors.cyan} name="menu" size={24} />
            </View>
            <View style={styles.companyMenuHeaderCopy}>
              <Text style={styles.companyMenuOverline}>Menu aziendale</Text>
              <Text style={styles.companyMenuHeading}>Vygo</Text>
              <Text style={styles.companyMenuSubtitle}>Tutte le sezioni operative in un posto solo.</Text>
            </View>
          </View>
          <View style={styles.companyMenuList}>
            {companyMenuItems.map((item) => (
              <Pressable key={item.id} onPress={() => handleCompanyMenuPress(item)} style={styles.companyMenuRow}>
                <View style={styles.companyMenuIcon}>
                  <Ionicons color={colors.cyan} name={item.icon} size={20} />
                </View>
                <View style={styles.companyMenuCopy}>
                  <Text numberOfLines={1} style={styles.companyMenuTitle}>{item.title}</Text>
                  <Text numberOfLines={2} style={styles.companyMenuBody}>{item.body}</Text>
                </View>
                <Ionicons color="#67e8f9" name="chevron-forward" size={18} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {accountType === 'company' ? (
        <Panel kicker="Formazione" title="Guide operative Vygo">
          <Text style={styles.helper}>
            Percorsi rapidi per usare dashboard, anagrafiche, flotta, costi e chat senza confusione.
          </Text>
          <View style={styles.trainingList}>
            {companyTrainingGuides.map((guide, index) => {
              const isActive = activeTrainingGuide.title === guide.title

              return (
                <Pressable
                  key={guide.title}
                  onPress={() => setActiveTrainingIndex(index)}
                  style={[styles.trainingCard, isActive && styles.trainingCardActive]}
                >
                  <Text style={[styles.trainingNumber, isActive && styles.trainingNumberActive]}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                  <View style={styles.trainingCopy}>
                    <Text numberOfLines={1} style={styles.trainingTitle}>{guide.title}</Text>
                    <Text numberOfLines={2} style={styles.trainingBody}>{guide.body}</Text>
                  </View>
                  <Text style={[styles.trainingBadge, isActive && styles.trainingBadgeActive]}>
                    {isActive ? 'Aperta' : 'Apri'}
                  </Text>
                </Pressable>
              )
            })}
          </View>
          <View style={styles.trainingDetail}>
            <Text style={styles.trainingDetailKicker}>Guida dettagliata</Text>
            <Text style={styles.trainingDetailTitle}>{activeTrainingGuide.title}</Text>
            {activeTrainingGuide.steps.map((step, index) => (
              <View key={step} style={styles.trainingStep}>
                <Text style={styles.trainingStepNumber}>{index + 1}</Text>
                <Text style={styles.trainingStepText}>{step}</Text>
              </View>
            ))}
          </View>
        </Panel>
      ) : null}

      {accountType === 'company' ? (
        <View style={styles.settingsDivider}>
          <Text style={styles.settingsDividerKicker}>Impostazioni</Text>
          <Text style={styles.settingsDividerTitle}>App, notifiche e account</Text>
        </View>
      ) : null}

      <Panel kicker="App" title={t(language, 'appSettings')}>
        <Text style={styles.helper}>
          {accountType === 'company'
            ? t(language, 'appSettingsCompanyHelp')
            : t(language, 'appSettingsDriverHelp')}
        </Text>
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onCheckAppUpdate} title={t(language, 'appUpdatesButton')} tone="light" />
        {appUpdateStatus ? <Text style={styles.diagnosticLine}>{appUpdateStatus}</Text> : null}
      </Panel>

      <Panel kicker={t(language, 'language')} title={t(language, 'languageApp')}>
        <WheelPickerField
          helper={t(language, 'languageHelp')}
          label={t(language, 'language')}
          onPress={() => setWheelPicker({
            onSelect: (nextLanguage) => onLanguageChange?.(nextLanguage),
            options: languages,
            title: t(language, 'languageApp'),
            value: language,
          })}
          value={getWheelOptionLabel(languages, language)}
        />
      </Panel>

      <Panel kicker={t(language, 'phone')} title={t(language, 'nativeNotifications')}>
        <Text style={styles.helper}>
          {t(language, 'nativeNotificationsHelp')}
        </Text>
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onEnableNativeNotifications} title={t(language, 'enableNativeNotifications')} tone="light" />
        {nativePushStatus ? <Text style={styles.diagnosticLine}>{nativePushStatus}</Text> : null}
      </Panel>

      <Panel kicker={t(language, 'support')} title={t(language, 'assistantTitle')}>
        <Text style={styles.helper}>
          {t(language, 'assistantHelp')}
        </Text>
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onOpenAssistant} title={t(language, 'openAssistant')} tone="light" />
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

      <Panel kicker={t(language, 'session')} title={t(language, 'account')}>
        <PrimaryButton onPress={onRefresh} title={t(language, 'refreshData')} tone="light" />
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onSignOut} title={t(language, 'signOut')} />
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
  buttonGap: {
    height: 10,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  companyMenuBody: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 2,
  },
  companyMenuCopy: {
    flex: 1,
    minWidth: 0,
  },
  companyMenuHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  companyMenuHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  companyMenuHeaderIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 198, 223, 0.12)',
    borderColor: 'rgba(103, 232, 249, 0.26)',
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  companyMenuHeading: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 26,
  },
  companyMenuIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 198, 223, 0.12)',
    borderColor: 'rgba(103, 232, 249, 0.22)',
    borderRadius: 12,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  companyMenuList: {
    gap: 7,
    marginTop: 14,
  },
  companyMenuOverline: {
    color: '#67e8f9',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  companyMenuRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: 'rgba(148, 163, 184, 0.22)',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 62,
    padding: 10,
  },
  companyMenuShell: {
    backgroundColor: '#07111f',
    borderColor: 'rgba(18, 198, 223, 0.38)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 2,
    padding: 14,
    shadowColor: '#020617',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 4,
  },
  companyMenuSubtitle: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '750',
    lineHeight: 16,
    marginTop: 3,
  },
  companyMenuTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
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
  settingsDivider: {
    backgroundColor: '#e8fbff',
    borderColor: '#bae6fd',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  settingsDividerKicker: {
    color: colors.cyanDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  settingsDividerTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  trainingBadge: {
    backgroundColor: '#f0fdff',
    borderColor: '#bae6fd',
    borderRadius: 999,
    borderWidth: 1,
    color: colors.cyanDark,
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  trainingBadgeActive: {
    backgroundColor: colors.cyan,
    borderColor: colors.cyan,
    color: colors.ink,
  },
  trainingBody: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 2,
  },
  trainingCard: {
    alignItems: 'center',
    backgroundColor: '#f8fbff',
    borderColor: colors.line,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    padding: 10,
  },
  trainingCardActive: {
    backgroundColor: '#ecfeff',
    borderColor: colors.cyan,
  },
  trainingCopy: {
    flex: 1,
    minWidth: 0,
  },
  trainingDetail: {
    backgroundColor: '#f8fbff',
    borderColor: '#bae6fd',
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 10,
    padding: 12,
  },
  trainingDetailKicker: {
    color: colors.cyanDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  trainingDetailTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  trainingList: {
    gap: 8,
    marginTop: 12,
  },
  trainingNumber: {
    backgroundColor: '#e0f2fe',
    borderRadius: 10,
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  trainingNumberActive: {
    backgroundColor: colors.ink,
    color: colors.white,
  },
  trainingStep: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  trainingStepNumber: {
    backgroundColor: colors.white,
    borderRadius: 999,
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
    minWidth: 22,
    overflow: 'hidden',
    paddingVertical: 3,
    textAlign: 'center',
  },
  trainingStepText: {
    color: colors.ink,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  trainingTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
})
