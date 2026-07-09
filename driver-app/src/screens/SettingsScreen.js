import { useState } from 'react'
import { ImageBackground, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { PrimaryButton } from '../components/PrimaryButton'
import { getWheelOptionLabel, SelectionWheelModal, WheelPickerField } from '../components/WheelPicker'
import { t } from '../i18n/native'
import { colors, layout } from '../theme'

const panelGradient = require('../../assets/brand/panel-gradient.png')

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
    steps: ['Apri Anagrafiche.', 'Scegli Persone o Autisti.', 'Compila nome, telefono, ruolo e password.', 'Fai fare il primo accesso e attivare notifiche.'],
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
    body: 'Chat singole, gruppi, reparti, foto, video e audio.',
    icon: 'chatbubbles-outline',
    id: 'chat',
    title: 'Chat',
  },
  {
    body: 'Costi, sanzioni, carburante e andamento aziendale da controllare.',
    icon: 'stats-chart-outline',
    id: 'reports',
    title: 'Report e costi',
  },
  {
    body: 'Carico cisterna, rifornimenti, giacenza e ultimi movimenti.',
    icon: 'water-outline',
    id: 'fuel',
    title: 'Gasolio',
  },
  {
    body: 'News operative, norme, viabilita e fermi ministeriali mezzi pesanti.',
    icon: 'newspaper-outline',
    id: 'news',
    title: 'News e fermi',
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
  const [isTrainingOpen, setIsTrainingOpen] = useState(false)
  const activeTrainingGuide = companyTrainingGuides[activeTrainingIndex] ?? companyTrainingGuides[0]
  const SettingsSection = accountType === 'company' ? ImageBackground : View
  const settingsSectionProps = accountType === 'company'
    ? { imageStyle: styles.darkGradientImage, resizeMode: 'cover', source: panelGradient }
    : {}

  function handleCompanyMenuPress(item) {
    if (item.id === 'guide') {
      setIsTrainingOpen(true)
      setActiveTrainingIndex(0)
      return
    }

    onNavigateCompanyMenu?.(item.id)
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {accountType === 'company' ? (
        <ImageBackground imageStyle={styles.darkGradientImage} resizeMode="cover" source={panelGradient} style={styles.companyMenuShell}>
          <View style={styles.companyMenuHeader}>
            <View style={styles.companyMenuHeaderIcon}>
              <Ionicons color={colors.cyan} name="menu" size={24} />
            </View>
            <View style={styles.companyMenuHeaderCopy}>
              <Text style={styles.companyMenuOverline}>Menu aziendale</Text>
              <Text style={styles.companyMenuHeading}>Vygo</Text>
              <Text style={styles.companyMenuSubtitle}>Solo le sezioni utili quando lavori da telefono.</Text>
            </View>
          </View>
          <Pressable onPress={() => onNavigateCompanyMenu?.('dashboard')} style={styles.companyMenuCloseButton}>
            <Ionicons color={colors.ink} name="arrow-back" size={17} />
            <Text style={styles.companyMenuCloseText}>Torna alla dashboard</Text>
          </Pressable>
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
        </ImageBackground>
      ) : null}

      {accountType === 'company' && isTrainingOpen ? (
        <ImageBackground imageStyle={styles.darkGradientImage} resizeMode="cover" source={panelGradient} style={styles.darkSection}>
          <View style={styles.darkSectionHeader}>
            <View>
              <Text style={styles.darkSectionKicker}>Formazione</Text>
              <Text style={styles.darkSectionTitle}>Guide operative Vygo</Text>
            </View>
            <Pressable onPress={() => setIsTrainingOpen(false)} style={styles.darkCloseButton}>
              <Ionicons color={colors.ink} name="close" size={17} />
            </Pressable>
          </View>
          <Text style={styles.darkHelper}>
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
        </ImageBackground>
      ) : null}

      {accountType === 'company' ? (
        <ImageBackground imageStyle={styles.darkGradientImage} resizeMode="cover" source={panelGradient} style={styles.settingsDivider}>
          <Text style={styles.settingsDividerKicker}>Impostazioni</Text>
          <Text style={styles.settingsDividerTitle}>App, notifiche e account</Text>
        </ImageBackground>
      ) : null}

      <SettingsSection {...settingsSectionProps} style={accountType === 'company' ? styles.darkSection : styles.lightSection}>
        <Text style={accountType === 'company' ? styles.darkSectionKicker : styles.lightSectionKicker}>App</Text>
        <Text style={accountType === 'company' ? styles.darkSectionTitle : styles.lightSectionTitle}>{t(language, 'appSettings')}</Text>
        <Text style={accountType === 'company' ? styles.darkHelper : styles.helper}>
          {accountType === 'company'
            ? t(language, 'appSettingsCompanyHelp')
            : t(language, 'appSettingsDriverHelp')}
        </Text>
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onCheckAppUpdate} title={t(language, 'appUpdatesButton')} tone="light" />
        {appUpdateStatus ? <Text style={styles.diagnosticLine}>{appUpdateStatus}</Text> : null}
      </SettingsSection>

      <SettingsSection {...settingsSectionProps} style={accountType === 'company' ? styles.darkSection : styles.lightSection}>
        <Text style={accountType === 'company' ? styles.darkSectionKicker : styles.lightSectionKicker}>{t(language, 'language')}</Text>
        <Text style={accountType === 'company' ? styles.darkSectionTitle : styles.lightSectionTitle}>{t(language, 'languageApp')}</Text>
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
      </SettingsSection>

      <SettingsSection {...settingsSectionProps} style={accountType === 'company' ? styles.darkSection : styles.lightSection}>
        <Text style={accountType === 'company' ? styles.darkSectionKicker : styles.lightSectionKicker}>{t(language, 'phone')}</Text>
        <Text style={accountType === 'company' ? styles.darkSectionTitle : styles.lightSectionTitle}>{t(language, 'nativeNotifications')}</Text>
        <Text style={accountType === 'company' ? styles.darkHelper : styles.helper}>
          {t(language, 'nativeNotificationsHelp')}
        </Text>
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onEnableNativeNotifications} title={t(language, 'enableNativeNotifications')} tone="light" />
        {nativePushStatus ? <Text style={styles.diagnosticLine}>{nativePushStatus}</Text> : null}
      </SettingsSection>

      <SettingsSection {...settingsSectionProps} style={accountType === 'company' ? styles.darkSection : styles.lightSection}>
        <Text style={accountType === 'company' ? styles.darkSectionKicker : styles.lightSectionKicker}>{t(language, 'support')}</Text>
        <Text style={accountType === 'company' ? styles.darkSectionTitle : styles.lightSectionTitle}>{t(language, 'assistantTitle')}</Text>
        <Text style={accountType === 'company' ? styles.darkHelper : styles.helper}>
          {t(language, 'assistantHelp')}
        </Text>
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onOpenAssistant} title={t(language, 'openAssistant')} tone="light" />
      </SettingsSection>

      <SettingsSection {...settingsSectionProps} style={accountType === 'company' ? styles.darkSection : styles.lightSection}>
        <Text style={accountType === 'company' ? styles.darkSectionKicker : styles.lightSectionKicker}>Chat</Text>
        <Text style={accountType === 'company' ? styles.darkSectionTitle : styles.lightSectionTitle}>{t(language, 'chatSettings')}</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={accountType === 'company' ? styles.darkSettingTitle : styles.settingTitle}>{t(language, 'chatSound')}</Text>
            <Text style={accountType === 'company' ? styles.darkSettingMeta : styles.settingMeta}>{t(language, 'chatSoundHelp')}</Text>
          </View>
          <Switch
            onValueChange={onChatSoundChange}
            thumbColor={chatSoundEnabled ? colors.cyan : '#cbd5e1'}
            trackColor={{ false: '#e2e8f0', true: '#a7f3ff' }}
            value={chatSoundEnabled}
          />
        </View>
      </SettingsSection>

      <SettingsSection {...settingsSectionProps} style={accountType === 'company' ? styles.darkSection : styles.lightSection}>
        <Text style={accountType === 'company' ? styles.darkSectionKicker : styles.lightSectionKicker}>{t(language, 'session')}</Text>
        <Text style={accountType === 'company' ? styles.darkSectionTitle : styles.lightSectionTitle}>{t(language, 'account')}</Text>
        <PrimaryButton onPress={onRefresh} title={t(language, 'refreshData')} tone="light" />
        <View style={styles.buttonGap} />
        <PrimaryButton onPress={onSignOut} title={t(language, 'signOut')} />
      </SettingsSection>
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
  companyMenuCloseButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.cyan,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  companyMenuCloseText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
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
    backgroundColor: colors.night,
    borderColor: 'rgba(18, 198, 223, 0.38)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 2,
    overflow: 'hidden',
    padding: 14,
    shadowColor: colors.night,
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
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 4,
  },
  darkCloseButton: {
    alignItems: 'center',
    backgroundColor: colors.cyan,
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  darkHelper: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '750',
    lineHeight: 19,
    marginTop: 8,
  },
  darkSection: {
    backgroundColor: colors.night,
    borderColor: 'rgba(18, 198, 223, 0.34)',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 14,
    shadowColor: colors.night,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  darkSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  darkSectionKicker: {
    color: '#67e8f9',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  darkSectionTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },
  darkSettingMeta: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginTop: 3,
  },
  darkSettingTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  darkGradientImage: {
    borderRadius: 22,
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
  lightSection: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  lightSectionKicker: {
    color: colors.cyanDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  lightSectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 2,
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
    backgroundColor: colors.nightSoft,
    borderColor: 'rgba(103, 232, 249, 0.26)',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  settingsDividerKicker: {
    color: '#67e8f9',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  settingsDividerTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  trainingBadge: {
    backgroundColor: 'rgba(18, 198, 223, 0.14)',
    borderColor: 'rgba(103, 232, 249, 0.28)',
    borderRadius: 999,
    borderWidth: 1,
    color: '#67e8f9',
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
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 2,
  },
  trainingCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: 'rgba(148, 163, 184, 0.22)',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    padding: 10,
  },
  trainingCardActive: {
    backgroundColor: 'rgba(18, 198, 223, 0.16)',
    borderColor: colors.cyan,
  },
  trainingCopy: {
    flex: 1,
    minWidth: 0,
  },
  trainingDetail: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: 'rgba(103, 232, 249, 0.28)',
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 10,
    padding: 12,
  },
  trainingDetailKicker: {
    color: '#67e8f9',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  trainingDetailTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  trainingList: {
    gap: 8,
    marginTop: 12,
  },
  trainingNumber: {
    backgroundColor: 'rgba(18, 198, 223, 0.14)',
    borderRadius: 10,
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  trainingNumberActive: {
    backgroundColor: colors.cyan,
    color: colors.ink,
  },
  trainingStep: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  trainingStepNumber: {
    backgroundColor: colors.cyan,
    borderRadius: 999,
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
    minWidth: 22,
    overflow: 'hidden',
    paddingVertical: 3,
    textAlign: 'center',
  },
  trainingStepText: {
    color: '#e2e8f0',
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  trainingTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
})
