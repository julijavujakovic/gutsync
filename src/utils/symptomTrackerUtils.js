export function loadStoredSymptoms() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const saved = window.localStorage.getItem('gutsync-symptoms')

    if (!saved) {
      return []
    }

    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStoredSymptoms(entries) {
  if (typeof window === 'undefined') {
    return entries
  }

  window.localStorage.setItem('gutsync-symptoms', JSON.stringify(entries))
  return entries
}

export function buildWeeklyChartData(entries) {
  const sortedEntries = [...(entries || [])]
    .filter((entry) => entry?.date)
    .sort((left, right) => left.date.localeCompare(right.date))

  return sortedEntries.slice(-7).map((entry) => ({
    date: entry.date,
    stoolScale: Number(entry.stoolScale) || 0,
    bloating: Number(entry.bloating) || 0,
    gas: Number(entry.gas) || 0,
    stress: Number(entry.stress) || 0,
    pain: Number(entry.pain) || 0,
  }))
}
