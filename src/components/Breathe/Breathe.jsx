import { useEffect, useMemo, useState } from 'react'
import './Breathe.css'

const exerciseData = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'A steady rhythm that can help settle the body and support a calmer nervous system.',
    phases: [
      { name: 'Inhale', seconds: 4 },
      { name: 'Hold', seconds: 4 },
      { name: 'Exhale', seconds: 4 },
      { name: 'Hold', seconds: 4 },
    ],
  },
  {
    id: 'diaphragmatic',
    name: 'Diaphragmatic Breathing',
    description: 'Slow belly breaths can feel grounding and may support a more relaxed gut-brain response.',
    phases: [
      { name: 'Inhale', seconds: 4 },
      { name: 'Exhale', seconds: 6 },
    ],
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    description: 'This gentle pattern can help turn down the pace when stress is high.',
    phases: [
      { name: 'Inhale', seconds: 4 },
      { name: 'Hold', seconds: 7 },
      { name: 'Exhale', seconds: 8 },
    ],
  },
  {
    id: 'pursed',
    name: 'Pursed-Lip Breathing',
    description: 'A soft exhale can feel soothing and supportive for a steady, calm rhythm.',
    phases: [
      { name: 'Inhale', seconds: 3 },
      { name: 'Exhale', seconds: 5 },
    ],
  },
  {
    id: 'resonance',
    name: 'Resonance Breathing',
    description: 'An easy five-breaths-per-minute cadence may help the body settle into a softer pace.',
    phases: [
      { name: 'Inhale', seconds: 5 },
      { name: 'Exhale', seconds: 5 },
    ],
  },
  {
    id: 'alternate',
    name: 'Alternate Nostril Breathing',
    description: 'A balanced rhythm that can feel centering and reflective.',
    phases: [
      { name: 'Inhale', seconds: 4 },
      { name: 'Switch', seconds: 2 },
      { name: 'Exhale', seconds: 4 },
    ],
  },
  {
    id: 'extended',
    name: 'Extended Exhale Breathing',
    description: 'Lengthening the exhale can encourage the body to soften and reset.',
    phases: [
      { name: 'Inhale', seconds: 4 },
      { name: 'Exhale', seconds: 8 },
    ],
  },
]

function Breathe() {
  const [activeExerciseId, setActiveExerciseId] = useState(exerciseData[0].id)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(exerciseData[0].phases[0].seconds)
  const [isPlaying, setIsPlaying] = useState(false)

  const activeExercise = useMemo(
    () => exerciseData.find((exercise) => exercise.id === activeExerciseId) || exerciseData[0],
    [activeExerciseId],
  )

  useEffect(() => {
    if (!isPlaying) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setPhaseSecondsLeft((current) => {
        if (current > 1) {
          return current - 1
        }

        const nextPhaseIndex = (phaseIndex + 1) % activeExercise.phases.length
        setPhaseIndex(nextPhaseIndex)
        return activeExercise.phases[nextPhaseIndex].seconds
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [activeExercise, isPlaying, phaseIndex])

  const handleStart = () => {
    setIsPlaying((current) => !current)
  }

  const handleExerciseSelect = (exerciseId) => {
    setActiveExerciseId(exerciseId)
    const selectedExercise = exerciseData.find((exercise) => exercise.id === exerciseId)
    setPhaseIndex(0)
    setPhaseSecondsLeft(selectedExercise?.phases[0].seconds || 4)
    setIsPlaying(false)
  }

  const currentPhase = activeExercise.phases[phaseIndex]
  const phaseClass = currentPhase.name.toLowerCase().includes('inhale') ? 'inhale' : currentPhase.name.toLowerCase().includes('exhale') ? 'exhale' : 'hold'

  return (
    <section className="breathe-module">
      <h2>Breathe</h2>
      <p className="helper-copy">A calm collection of guided breathing rhythms for gut stress and vagus nerve support.</p>

      <div className="exercise-list">
        {exerciseData.map((exercise) => (
          <article key={exercise.id} className={`exercise-card ${activeExercise.id === exercise.id ? 'active' : ''}`}>
            <div className="exercise-name">
              <h3>{exercise.name}</h3>
              <button type="button" onClick={() => handleExerciseSelect(exercise.id)}>
                {activeExercise.id === exercise.id ? 'Selected' : 'View'}
              </button>
            </div>
            <p className="helper-copy">{exercise.description}</p>
            {activeExercise.id === exercise.id ? (
              <>
                <div className="phase-visual">
                  <div className={`phase-orb ${phaseClass} ${isPlaying ? 'playing-state' : ''}`} />
                </div>
                <p className="phase-label">{currentPhase.name}</p>
                <p className="timer-pill">{phaseSecondsLeft}s</p>
                <button type="button" className="play-button" onClick={handleStart}>
                  {isPlaying ? 'Pause' : 'Start'}
                </button>
              </>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export default Breathe
