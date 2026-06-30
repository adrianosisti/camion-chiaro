const closedStatuses = new Set(['archived', 'closed', 'done', 'resolved'])

export function getDaysUntilDate(value) {
  if (!value) return 9999

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(value)
  dueDate.setHours(0, 0, 0, 0)

  return Math.ceil((dueDate - today) / 86400000)
}

export function isClosedStatus(status) {
  return closedStatuses.has(String(status ?? '').toLowerCase())
}

export function isComplianceActionRequired(item = {}) {
  if (!item.dueDate || isClosedStatus(item.status)) return false

  return getDaysUntilDate(item.dueDate) <= 30
}

export function sortByDueDate(items = []) {
  return items
    .slice()
    .sort((first, second) => new Date(first.dueDate || '9999-12-31') - new Date(second.dueDate || '9999-12-31'))
}
