export function createFuelLiterOptions(movementType = 'dispense') {
  const isTankLoad = movementType !== 'dispense'
  const start = isTankLoad ? 100 : 1
  const max = isTankLoad ? 30000 : 1000
  const step = isTankLoad ? 100 : 1
  const count = Math.floor((max - start) / step) + 1

  return Array.from({ length: count }, (_, index) => {
    const liters = start + index * step
    const label = `${new Intl.NumberFormat('it-IT').format(liters)} L`

    return {
      id: String(liters),
      label,
      subtitle: isTankLoad ? 'Carico cisterna' : 'Rifornimento mezzo',
    }
  })
}

export function getFuelLiterLabel(value = '', fallback = 'Scegli litri') {
  const liters = Number.parseFloat(String(value ?? '').replace(/\s/g, '').replace(',', '.'))
  if (!Number.isFinite(liters) || liters <= 0) return fallback

  return `${new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 }).format(liters)} L`
}
