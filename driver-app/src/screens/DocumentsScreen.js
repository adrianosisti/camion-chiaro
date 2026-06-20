import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Panel } from '../components/Panel'
import { colors, layout } from '../theme'

function formatDocumentDate(value) {
  if (!value) return 'Scadenza non indicata'
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

export function DocumentsScreen({ documents = [] }) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Panel kicker="Documenti" title="Da mostrare">
        <Text style={styles.helper}>
          Qui l autista trova i documenti caricati dall azienda o dall app.
        </Text>
      </Panel>

      {documents.map((document) => (
        <View key={document.id} style={styles.documentRow}>
          <View style={styles.documentIcon}>
            <Text style={styles.documentIconText}>DOC</Text>
          </View>
          <View style={styles.documentCopy}>
            <Text style={styles.documentTitle}>{document.type}</Text>
            <Text style={styles.documentMeta}>{formatDocumentDate(document.expiresAt)}</Text>
            <Text style={styles.documentStatus}>
              {document.filePath ? 'File disponibile' : 'File da caricare'}
            </Text>
          </View>
        </View>
      ))}

      {documents.length === 0 ? (
        <Text style={styles.emptyText}>Nessun documento visibile al momento.</Text>
      ) : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: layout.screenPadding,
    paddingBottom: 28,
  },
  documentCopy: {
    flex: 1,
  },
  documentIcon: {
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  documentIconText: {
    color: colors.cyanDark,
    fontSize: 11,
    fontWeight: '900',
  },
  documentMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  documentRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  documentStatus: {
    color: colors.cyanDark,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 6,
  },
  documentTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  helper: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
})
