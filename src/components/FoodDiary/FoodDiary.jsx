import { useEffect, useMemo, useState } from 'react'
import './FoodDiary.css'

const initialFormState = {
  mealName: '',
  timeOfDay: 'breakfast',
  foods: '',
  feeling: '3',
  notes: '',
}

function getTodayLabel() {
  return new Date().toISOString().slice(0, 10)
}

function FoodDiary() {
  const [formValues, setFormValues] = useState(initialFormState)
  const [entries, setEntries] = useState([])
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const saved = window.localStorage.getItem('gutsync-food-diary')
      if (saved) {
        const parsed = JSON.parse(saved)
        setEntries(Array.isArray(parsed) ? parsed : [])
      }
    } catch {
      setEntries([])
    }
  }, [])

  const sortedEntries = useMemo(() => {
    return [...entries].sort((left, right) => right.date.localeCompare(left.date))
  }, [entries])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!formValues.mealName.trim() || !formValues.foods.trim()) {
      setStatusMessage('Please add a meal name and a list of foods to save this entry.')
      return
    }

    const nextEntry = {
      id: `${getTodayLabel()}-${Date.now()}`,
      date: getTodayLabel(),
      mealName: formValues.mealName.trim(),
      timeOfDay: formValues.timeOfDay,
      foods: formValues.foods
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      feeling: Number(formValues.feeling),
      notes: formValues.notes.trim(),
    }

    const nextEntries = [nextEntry, ...entries]
    setEntries(nextEntries)
    setStatusMessage(`Saved ${nextEntry.mealName} for ${nextEntry.date}.`)
    setFormValues(initialFormState)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gutsync-food-diary', JSON.stringify(nextEntries))
    }
  }

  const handleDelete = (entryId) => {
    const nextEntries = entries.filter((entry) => entry.id !== entryId)
    setEntries(nextEntries)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gutsync-food-diary', JSON.stringify(nextEntries))
    }
  }

  return (
    <section className="food-diary-shell">
      <div className="tracker-intro">
        <p className="eyebrow">Food Diary</p>
        <h2>Keep a gentle record of meals and how they felt.</h2>
        <p className="helper-copy">Log a meal by name, time of day, foods, how you felt after, and any notes.</p>
      </div>

      <form className="tracker-card" onSubmit={handleSubmit}>
        <label className="input-stack">
          <span>Meal name</span>
          <input
            type="text"
            value={formValues.mealName}
            onChange={(event) => setFormValues({ ...formValues, mealName: event.target.value })}
            placeholder="e.g. Dinner at home"
          />
        </label>

        <label className="input-stack">
          <span>Time of day</span>
          <select value={formValues.timeOfDay} onChange={(event) => setFormValues({ ...formValues, timeOfDay: event.target.value })}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </label>

        <label className="input-stack">
          <span>What did you eat?</span>
          <textarea
            value={formValues.foods}
            onChange={(event) => setFormValues({ ...formValues, foods: event.target.value })}
            placeholder="List each food or ingredient on a new line"
          />
        </label>

        <label className="input-stack">
          <span>How did you feel after?</span>
          <input
            type="range"
            min="1"
            max="5"
            value={formValues.feeling}
            onChange={(event) => setFormValues({ ...formValues, feeling: event.target.value })}
          />
          <small>{formValues.feeling}/5</small>
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
          Save meal entry
        </button>
        {statusMessage ? <p className="status-pill">{statusMessage}</p> : null}
      </form>

      <div className="tracker-card">
        <h3>Recent meals</h3>
        {sortedEntries.length ? (
          <div className="timeline-list">
            {sortedEntries.map((entry) => (
              <article className="timeline-card" key={entry.id}>
                <div className="timeline-header">
                  <div>
                    <strong>{entry.mealName}</strong>
                    <p className="small-note">{entry.date} · {entry.timeOfDay}</p>
                  </div>
                  <button type="button" className="secondary-link delete-button" onClick={() => handleDelete(entry.id)}>
                    Delete
                  </button>
                </div>
                <ul className="food-list">
                  {entry.foods.map((food) => (
                    <li key={`${entry.id}-${food}`}>{food}</li>
                  ))}
                </ul>
                <p className="small-note">After-feeling: {entry.feeling}/5</p>
                {entry.notes ? <p className="small-note">Notes: {entry.notes}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="helper-copy">No meals logged yet. Start with your first entry.</p>
        )}
      </div>
    </section>
  )
}

export default FoodDiary
