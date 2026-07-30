import { describe, expect, it } from 'vitest'
import { getDailyCheckinRecommendation, getQuizProfile } from './gutSyncRecommendations'

describe('GutSync recommendation helpers', () => {
  it('recommends breathe first for high stress and discomfort', () => {
    const result = getDailyCheckinRecommendation({ gutFeeling: 2, stress: 5, botheredFood: 'yes' })

    expect(result.module).toBe('breathe')
    expect(result.message).toContain('breathe')
  })

  it('returns a food-sensitive profile for trigger-focused answers', () => {
    const profile = getQuizProfile({
      triggerFood: 'yes',
      constipation: 'no',
      stress: 'yes',
      symptoms: 'food',
      pace: 'slow',
    })

    expect(profile.type).toBe('Food-sensitive')
    expect(profile.focusAreas[0]).toContain('Eat')
  })
})
