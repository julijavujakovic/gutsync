export function getDailyCheckinRecommendation(answers) {
  const { gutFeeling = 3, stress = 3, botheredFood = 'no' } = answers || {}

  if (Number(stress) >= 4 || Number(gutFeeling) <= 2 || botheredFood === 'yes') {
    return {
      module: 'breathe',
      message: 'Your body is asking for a slower start. Begin with the breathe module for a gentle reset.',
    }
  }

  return {
    module: 'eat',
    message: 'A steady, curious approach feels right today. Try the Eat module to look at your meals with kindness.',
  }
}

export function getQuizProfile(answers) {
  const { triggerFood = 'no', constipation = 'no', stress = 'no', symptoms = 'mild', pace = 'steady' } = answers || {}

  const isFoodSensitive = triggerFood === 'yes' || symptoms === 'food'
  const isStressSensitive = stress === 'yes' || symptoms === 'stress'
  const isConstipationSensitive = constipation === 'yes'

  if (isFoodSensitive) {
    return {
      type: 'Food-sensitive',
      summary: 'Your rhythm seems most affected by what you eat and how your body responds to it.',
      focusAreas: ['Eat: explore ingredients that feel more triggering', 'Reset: create a gentle evening ritual'],
    }
  }

  if (isStressSensitive || isConstipationSensitive) {
    return {
      type: 'Stress-sensitive',
      summary: 'Your system may be holding extra tension, so a softer pace matters most.',
      focusAreas: ['Breathe: start with a short grounding routine', 'Reset: protect a little quiet space each day'],
    }
  }

  return {
    type: pace === 'slow' ? 'Gentle reset' : 'Balanced starter',
    summary: 'You are looking for a steady, supportive place to begin.',
    focusAreas: ['Eat: keep meals simple and comforting', 'Breathe: add one calming pause before dinner'],
  }
}
