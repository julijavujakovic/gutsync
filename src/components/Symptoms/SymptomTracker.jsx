import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { buildWeeklyChartData, loadStoredSymptoms, saveStoredSymptoms } from '../../utils/symptomTrackerUtils'
import './SymptomTracker.css'

const stoolDescriptions = {
  1: 'Separate hard lumps',
  2: 'Lumpy and sausage-like',
  3: 'A sausage with cracks',
  4: 'Smooth and soft sausage',
  5: 'Soft blobs with clear edges',
  6: 'Mushy with ragged edges',
  7: 'Watery with no solid pieces',
}

const initialFormState = {
  stoolScale: '4',
  bloating: '3',
  gas: '2',
  stress: '3',
  pain: '2',
  notes: '',
}

function getTodayLabel() {
  return new Date().toISOString().slice(0, 10)
}

function SymptomTracker() {
  const [view, setView] = useState('daily')
  const [formValues, setFormValues] = useState(initialFormState)
  const [entries, setEntries] = useState([])
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    setEntries(loadStoredSymptoms())
  }, [])

  const chartData = useMemo(() => buildWeeklyChartData(entries), [entries])

  const handleSubmit = (event) => {
    event.preventDefault()

    const today = getTodayLabel()
    const nextEntry = {
      date: today,
      stoolScale: Number(formValues.stoolScale),
      bloating: Number(formValues.bloating),
      gas: Number(formValues.gas),
      stress: Number(formValues.stress),
      pain: Number(formValues.pain),
      notes: formValues.notes.trim(),
    }

    const nextEntries = [...entries.filter((entry) => entry.date !== today), nextEntry]
      .sort((left, right) => left.date.localeCompare(right.date))

    setEntries(nextEntries)
    saveStoredSymptoms(nextEntries)
    setStatusMessage(`Saved today's entry for ${today}.`)
    setFormValues(initialFormState)
  }

  return (
    <section className="tracker-shell">
      <div className="tracker-intro">
        <p className="eyebrow">Symptom tracker</p>
        <h2>Notice patterns with compassion.</h2>
        <p className="helper-copy">
          Track bowel habits, bloating, gas, stress, and discomfort in one calm place.
        </p>
      </div>

      <div className="view-toggle">
        <button type="button" className={view === 'daily' ? 'active' : ''} onClick={() => setView('daily')}>
          Daily view
        </button>
        <button type="button" className={view === 'weekly' ? 'active' : ''} onClick={() => setView('weekly')}>
          Weekly view
        </button>
      </div>

      {view === 'daily' ? (
        <form className="tracker-card" onSubmit={handleSubmit}>
          <label className="input-stack">
            <span>Bristol Stool Scale</span>
            <select
              value={formValues.stoolScale}
              onChange={(event) => setFormValues({ ...formValues, stoolScale: event.target.value })}
            >
              {Object.entries(stoolDescriptions).map(([value, description]) => (
                <option key={value} value={value}>
                  {value} — {description}
                </option>
              ))}
            </select>
          </label>

          <label className="input-stack">
            <span>Bloating level</span>
            <input
              type="range"
              min="1"
              max="5"
              value={formValues.bloating}
              onChange={(event) => setFormValues({ ...formValues, bloating: event.target.value })}
            />
            <small>{formValues.bloating}/5</small>
          </label>

          <label className="input-stack">
            <span>Gas level</span>
            <input
              type="range"
              min="1"
              max="5"
              value={formValues.gas}
              onChange={(event) => setFormValues({ ...formValues, gas: event.target.value })}
            />
            <small>{formValues.gas}/5</small>
          </label>

          <label className="input-stack">
            <span>Stress level</span>
            <input
              type="range"
              min="1"
              max="5"
              value={formValues.stress}
              onChange={(event) => setFormValues({ ...formValues, stress: event.target.value })}
            />
            <small>{formValues.stress}/5</small>
          </label>

          <label className="input-stack">
            <span>Pain or discomfort level</span>
            <input
              type="range"
              min="1"
              max="5"
              value={formValues.pain}
              onChange={(event) => setFormValues({ ...formValues, pain: event.target.value })}
            />
            <small>{formValues.pain}/5</small>
          </label>

          <label className="input-stack">
            <span>Notes</span>
            <textarea
              value={formValues.notes}
              onChange={(event) => setFormValues({ ...formValues, notes: event.target.value })}
              placeholder="Anything else you want to remember?"
            />
          </label>

          <button className="primary-link submit-button" type="submit">
            Save symptom entry
          </button>

          {statusMessage ? <p className="status-pill">{statusMessage}</p> : null}
        </form>
      ) : (
        <div className="tracker-card chart-card">
          {chartData.length ? (
            <>
              <div className="chart-legend">Weekly snapshot</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#f3dfe1" strokeDasharray="4 4" />
                  <XAxis dataKey="date" tick={{ fill: '#7a4f4a', fontSize: 12 }} />
                  <YAxis domain={[1, 7]} tick={{ fill: '#7a4f4a', fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="stoolScale" stroke="#d4847a" strokeWidth={2} name="Stool" />
                  <Line type="monotone" dataKey="bloating" stroke="#b79ec5" strokeWidth={2} name="Bloating" />
                  <Line type="monotone" dataKey="gas" stroke="#8b4c44" strokeWidth={2} name="Gas" />
                  <Line type="monotone" dataKey="stress" stroke="#ca8a8a" strokeWidth={2} name="Stress" />
                  <Line type="monotone" dataKey="pain" stroke="#7e5f83" strokeWidth={2} name="Pain" />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="helper-copy">No symptom entries yet. Start with today’s log to build a gentle weekly view.</p>
          )}
        </div>
      )}
    </section>
  )
}

export default SymptomTracker
