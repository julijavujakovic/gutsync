import { useEffect, useState } from 'react'
import './Reset.css'

const scriptLines = [
  'Let your shoulders soften. Feel the chair or bed holding you gently.',
  'Bring your attention to your belly. Imagine a warm light resting there, steady and kind.',
  'With each slow breath, let the muscles around your belly soften a little more.',
  'Picture a calm tide moving through your body, easing tension and inviting rest.',
  'You do not need to fix anything right now. You only need to be here for a moment.',
]

function Reset() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeLineIndex, setActiveLineIndex] = useState(0)

  useEffect(() => {
    if (!isPlaying) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setActiveLineIndex((current) => (current + 1) % scriptLines.length)
    }, 4200)

    return () => window.clearInterval(interval)
  }, [isPlaying])

  return (
    <section className="reset-module">
      <h2>Gut Reset</h2>
      <p className="helper-copy">A guided, eyes-closed relaxation session designed for calm listening and gentle reset.</p>

      <div className="reset-screen">
        <div className={`soft-orb ${isPlaying ? 'playing' : ''}`} />
        <button type="button" className="play-button" onClick={() => setIsPlaying((current) => !current)}>
          {isPlaying ? 'Pause session' : 'Play session'}
        </button>
      </div>

      <div className="script-card">
        <h3>Gentle voiceover script</h3>
        <p key={activeLineIndex} className="affirmation-line">
          {scriptLines[activeLineIndex]}
        </p>
      </div>
    </section>
  )
}

export default Reset
