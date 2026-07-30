import { useEffect, useState } from 'react'
import Eat from './components/Eat/Eat'
import Breathe from './components/Breathe/Breathe'
import Reset from './components/Reset/Reset'
import SymptomTracker from './components/Symptoms/SymptomTracker'
import FoodDiary from './components/FoodDiary/FoodDiary'
import { getDailyCheckinRecommendation, getQuizProfile } from './utils/gutSyncRecommendations'
import './App.css'

const modules = [
  {
    title: 'Eat',
    description: 'Check recipes, labels, and menus with gentle FODMAP guidance and a personal diary for ingredients you want to remember.',
  },
  {
    title: 'Breathe',
    description: 'Try soothing breath patterns that help your body slow down and feel more grounded when stress rises.',
  },
  {
    title: 'Reset',
    description: 'Settle into a warm, guided relaxation space designed for a calm gut-brain reset.',
  },
]

const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'eat', label: 'Eat' },
  { id: 'food-diary', label: 'Food Diary' },
  { id: 'symptoms', label: 'Symptoms' },
  { id: 'insights', label: 'Insights' },
  { id: 'breathe', label: 'Breathe' },
  { id: 'reset', label: 'Reset' },
  { id: 'reminders', label: 'Reminders' },
]

const defaultCheckin = {
  gutFeeling: '3',
  stress: '3',
  botheredFood: 'no',
}

const defaultQuiz = {
  triggerFood: 'no',
  constipation: 'no',
  stress: 'no',
  symptoms: 'mild',
  pace: 'steady',
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [checkinAnswers, setCheckinAnswers] = useState(defaultCheckin)
  const [checkinResult, setCheckinResult] = useState(null)
  const [checkinSubmitted, setCheckinSubmitted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState(defaultQuiz)
  const [quizProfile, setQuizProfile] = useState(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const savedCheckin = window.localStorage.getItem('gutsync-checkin')
    const savedQuiz = window.localStorage.getItem('gutsync-quiz')

    if (savedCheckin) {
      try {
        setCheckinAnswers(JSON.parse(savedCheckin))
      } catch {
        window.localStorage.removeItem('gutsync-checkin')
      }
    }

    if (savedQuiz) {
      try {
        setQuizAnswers(JSON.parse(savedQuiz))
      } catch {
        window.localStorage.removeItem('gutsync-quiz')
      }
    }
  }, [])

  const handleCheckinSubmit = (event) => {
    event.preventDefault()

    const nextResult = getDailyCheckinRecommendation({
      gutFeeling: Number(checkinAnswers.gutFeeling),
      stress: Number(checkinAnswers.stress),
      botheredFood: checkinAnswers.botheredFood,
    })

    setCheckinResult(nextResult)
    setCheckinSubmitted(true)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gutsync-checkin', JSON.stringify(checkinAnswers))
    }
  }

  const handleQuizSubmit = (event) => {
    event.preventDefault()

    const nextProfile = getQuizProfile(quizAnswers)
    setQuizProfile(nextProfile)
    setQuizSubmitted(true)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gutsync-quiz', JSON.stringify(quizAnswers))
    }
  }

  const renderPlaceholder = (title, description) => (
    <section className="placeholder-card">
      <p className="eyebrow">{title}</p>
      <h2>{description}</h2>
      <p className="helper-copy">We are shaping this space next so it can grow into a richer ritual companion.</p>
    </section>
  )

  const renderHomeView = () => (
    <>
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">GutSync</p>
          <h1>A gentler way to support your gut and your nervous system.</h1>
          <p className="app-copy">
            GutSync brings together food insight, calming breathwork, and a soft reset ritual so you can feel more supported in everyday moments.
          </p>
          <div className="hero-actions">
            <button className="primary-link" type="button" onClick={() => setActiveTab('symptoms')}>
              Start with symptoms
            </button>
            <button className="secondary-link" type="button" onClick={() => setActiveTab('eat')}>
              Explore the Eat tab
            </button>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orb one" />
          <div className="hero-orb two" />
          <div className="hero-orb three" />
        </div>
      </section>

      <section className="interactive-panel">
        <form className="panel-card" onSubmit={handleCheckinSubmit}>
          <div className="panel-heading">
            <p className="eyebrow">Daily check-in</p>
            <h2>Pick the rhythm that feels right today.</h2>
          </div>

          <label className="input-stack">
            <span>How does your belly feel today?</span>
            <select value={checkinAnswers.gutFeeling} onChange={(event) => setCheckinAnswers({ ...checkinAnswers, gutFeeling: event.target.value })}>
              <option value="1">Very unsettled</option>
              <option value="2">A little unsettled</option>
              <option value="3">Steady</option>
              <option value="4">Comfortable</option>
              <option value="5">Really calm</option>
            </select>
          </label>

          <label className="input-stack">
            <span>How activated is your stress today?</span>
            <select value={checkinAnswers.stress} onChange={(event) => setCheckinAnswers({ ...checkinAnswers, stress: event.target.value })}>
              <option value="1">Very low</option>
              <option value="2">Low</option>
              <option value="3">Medium</option>
              <option value="4">High</option>
              <option value="5">Very high</option>
            </select>
          </label>

          <label className="input-stack">
            <span>Do certain foods feel like a trigger right now?</span>
            <select value={checkinAnswers.botheredFood} onChange={(event) => setCheckinAnswers({ ...checkinAnswers, botheredFood: event.target.value })}>
              <option value="yes">Yes</option>
              <option value="no">Not today</option>
            </select>
          </label>

          <button className="primary-link submit-button" type="submit">See my starting point</button>

          {checkinSubmitted && checkinResult ? (
            <div className="insight-card">
              <p>{checkinResult.message}</p>
            </div>
          ) : null}
        </form>

        <form className="panel-card" onSubmit={handleQuizSubmit}>
          <div className="panel-heading">
            <p className="eyebrow">Find your starting point</p>
            <h2>Choose the answers that feel most true this week.</h2>
          </div>

          <label className="input-stack">
            <span>Do food triggers feel common?</span>
            <select value={quizAnswers.triggerFood} onChange={(event) => setQuizAnswers({ ...quizAnswers, triggerFood: event.target.value })}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label className="input-stack">
            <span>Are constipation or bloating a frequent theme?</span>
            <select value={quizAnswers.constipation} onChange={(event) => setQuizAnswers({ ...quizAnswers, constipation: event.target.value })}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label className="input-stack">
            <span>Is stress a regular part of your day?</span>
            <select value={quizAnswers.stress} onChange={(event) => setQuizAnswers({ ...quizAnswers, stress: event.target.value })}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label className="input-stack">
            <span>What best describes your current symptoms?</span>
            <select value={quizAnswers.symptoms} onChange={(event) => setQuizAnswers({ ...quizAnswers, symptoms: event.target.value })}>
              <option value="food">Food-related</option>
              <option value="stress">Stress-related</option>
              <option value="energy">Low energy</option>
              <option value="mild">Mild and mixed</option>
            </select>
          </label>

          <label className="input-stack">
            <span>How would you describe your pace right now?</span>
            <select value={quizAnswers.pace} onChange={(event) => setQuizAnswers({ ...quizAnswers, pace: event.target.value })}>
              <option value="slow">Slow and tender</option>
              <option value="steady">Steady</option>
              <option value="busy">Busy and full</option>
            </select>
          </label>

          <button className="secondary-link submit-button" type="submit">Build my profile</button>

          {quizSubmitted && quizProfile ? (
            <div className="insight-card">
              <h3>{quizProfile.type}</h3>
              <p>{quizProfile.summary}</p>
              <ul>
                {quizProfile.focusAreas.map((focus) => (
                  <li key={focus}>{focus}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>
      </section>

      <section id="modules" className="module-showcase">
        <div className="section-heading">
          <p className="eyebrow">Three gentle tools</p>
          <h2>Designed to feel calm, clear, and kind.</h2>
        </div>
        <div className="module-grid">
          {modules.map((module) => (
            <article className="module-card" key={module.title}>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card-grid">
        <Eat />
        <Breathe />
        <Reset />
      </section>

      <footer id="footer" className="app-footer">
        <div>
          <h3>Stay connected</h3>
          <p>hello@gutsync.co</p>
        </div>
        <div>
          <h3>From the journal</h3>
          <a href="https://substack.com" target="_blank" rel="noreferrer">
            Subscribe on Substack
          </a>
        </div>
        <div>
          <h3>Follow along</h3>
          <div className="footer-links">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://www.pinterest.com" target="_blank" rel="noreferrer">
              Pinterest
            </a>
          </div>
        </div>
      </footer>
    </>
  )

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <button className="brand-link" type="button" onClick={() => setActiveTab('home')}>
          GutSync
        </button>
        <div className="nav-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeTab === item.id ? 'nav-link active' : 'nav-link'}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="app-shell">
        {activeTab === 'home' ? renderHomeView() : null}
        {activeTab === 'eat' ? (
          <section className="tab-content-card">
            <Eat />
          </section>
        ) : null}
        {activeTab === 'food-diary' ? (
          <section className="tab-content-card">
            <FoodDiary />
          </section>
        ) : null}
        {activeTab === 'symptoms' ? (
          <section className="tab-content-card">
            <SymptomTracker />
          </section>
        ) : null}
        {activeTab === 'insights' ? renderPlaceholder('Insights', 'Coming soon') : null}
        {activeTab === 'breathe' ? (
          <section className="tab-content-card">
            <Breathe />
          </section>
        ) : null}
        {activeTab === 'reset' ? (
          <section className="tab-content-card">
            <Reset />
          </section>
        ) : null}
        {activeTab === 'reminders' ? renderPlaceholder('Reminders', 'Coming soon') : null}
      </main>
    </div>
  )
}

export default App
