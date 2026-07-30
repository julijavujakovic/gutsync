import { describe, expect, it } from 'vitest'
import { buildWeeklyChartData, loadStoredSymptoms } from './symptomTrackerUtils'

describe('symptom tracker helpers', () => {
  it('builds a weekly chart payload with the latest seven days', () => {
    const entries = [
      { date: '2026-07-22', bloating: 2, gas: 3, stress: 4, pain: 1, stoolScale: 4 },
      { date: '2026-07-23', bloating: 3, gas: 2, stress: 3, pain: 2, stoolScale: 5 },
      { date: '2026-07-24', bloating: 4, gas: 3, stress: 2, pain: 3, stoolScale: 3 },
    ]

    const chartData = buildWeeklyChartData(entries)

    expect(chartData).toHaveLength(3)
    expect(chartData[0]).toMatchObject({ date: '2026-07-22', bloating: 2, gas: 3 })
  })

  it('loads stored symptoms from localStorage when present', () => {
    window.localStorage.setItem('gutsync-symptoms', JSON.stringify([{ date: '2026-07-25', bloating: 1 }]))

    const stored = loadStoredSymptoms()

    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({ date: '2026-07-25', bloating: 1 })
  })
})
