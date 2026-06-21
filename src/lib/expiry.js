const DAY = 1000 * 60 * 60 * 24

export function daysUntil(date, now = new Date()) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const due = new Date(`${date}T00:00:00`)
  return Math.ceil((Date.UTC(due.getFullYear(), due.getMonth(), due.getDate()) - today) / DAY)
}

export function getUrgency(item, now = new Date()) {
  const days = daysUntil(item.dueDate, now)

  if (days < 0) {
    return { key: 'expired', label: 'Scaduta', tone: 'danger', days }
  }

  if (days <= 7) {
    return { key: 'critical', label: 'Critica', tone: 'danger', days }
  }

  if (days <= 30) {
    return { key: 'soon', label: 'In scadenza', tone: 'warning', days }
  }

  if (days <= 60) {
    return { key: 'watch', label: 'Da monitorare', tone: 'info', days }
  }

  return { key: 'ok', label: 'Regolare', tone: 'success', days }
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getVehicleFleetLabel(value = '') {
  const labels = {
    furgone: 'Furgone',
    motrice: 'Motrice',
    semirimorchio: 'Semirimorchio',
    trattore: 'Trattore',
  }

  return labels[value] ?? 'Mezzo'
}

export function decorateCompliance(items, drivers, vehicles, now = new Date()) {
  return decorateComplianceWithWorkforce(items, drivers, vehicles, [], [], now)
}

export function decorateComplianceWithWorkforce(items, drivers, vehicles, people = [], assets = [], now = new Date()) {
  return items
    .map((item) => {
      const driver = drivers.find((entry) => entry.id === item.driverId)
      const vehicle = vehicles.find((entry) => entry.id === item.vehicleId)
      const person = people.find((entry) => entry.id === item.personId || entry.linkedDriverId === item.driverId)
      const asset = assets.find((entry) => entry.id === item.assetId)
      const urgency = getUrgency(item, now)
      const vehicleLabel = getVehicleFleetLabel(vehicle?.fleetType)
      const personDepartment = person?.department === 'warehouse'
        ? 'Magazzino'
        : person?.department === 'office'
          ? 'Ufficio'
          : 'Persona'
      const assetLabel = asset?.assetType === 'forklift'
        ? 'Muletto'
        : asset?.assetType === 'pallet_truck'
          ? 'Transpallet'
          : 'Attrezzatura'

      return {
        ...item,
        asset,
        driver,
        person,
        vehicle,
        assignee: driver
          ? `Autista · ${driver.name}`
          : vehicle
            ? `${vehicleLabel} · ${vehicle.plate}`
            : person
              ? `${personDepartment} · ${person.name}`
              : asset
                ? `${assetLabel} · ${asset.code}`
                : 'Azienda',
        detail: driver
          ? driver.role || 'Autista'
          : vehicle
            ? [vehicle.model, vehicle.type].filter(Boolean).join(' · ') || 'Dettaglio mezzo non indicato'
            : person
              ? [person.jobTitle, person.depot].filter(Boolean).join(' · ') || personDepartment
              : asset
                ? [asset.model, asset.location].filter(Boolean).join(' · ') || assetLabel
                : 'Documento aziendale',
        subjectKind: driver ? 'Autista' : vehicle ? vehicleLabel : person ? personDepartment : asset ? assetLabel : 'Azienda',
        urgency,
      }
    })
    .sort((a, b) => a.urgency.days - b.urgency.days)
}

export function getSummary(items) {
  return items.reduce(
    (summary, item) => {
      if (item.urgency.key === 'expired' || item.urgency.key === 'critical') {
        summary.critical += 1
      }
      if (item.urgency.days <= 30) {
        summary.next30 += 1
      }
      if (item.scope === 'driver') {
        summary.driverDocs += 1
      }
      if (item.scope === 'vehicle') {
        summary.vehicleDocs += 1
      }
      return summary
    },
    { critical: 0, next30: 0, driverDocs: 0, vehicleDocs: 0 },
  )
}
