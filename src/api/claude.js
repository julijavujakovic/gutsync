import fodmapDatabase from '../data/fodmap-database.json'

const DEFAULT_MODEL = 'claude-3-5-sonnet-latest'
const DIARY_STORAGE_KEY = 'gutsync-diary'
const RESTAURANT_STORAGE_KEY = 'gutsync-restaurants'

export function extractIngredientLines(text = '') {
  return text
    .split(/\n|,|;/)
    .map((item) => item.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

export function normalizeIngredientName(raw = '') {
  return raw
    .toLowerCase()
    .replace(/\b\d+(?:\.\d+)?\s*(?:g|kg|ml|l|cup|cups|tbsp|tsp|oz|lb|clove|cloves|slice|slices|packet|packets|pinch|pinches)\b/gi, '')
    .replace(/[()]/g, '')
    .replace(/^[^a-z]+|[^a-z]+$/g, '')
    .trim()
}

export function analyzeIngredientWithFallback(ingredient = '') {
  const normalized = normalizeIngredientName(ingredient)
  const entry = fodmapDatabase[normalized]

  if (entry) {
    return {
      ingredient,
      rating: entry.rating,
      note: entry.note,
      servingNote: entry.servingNote,
      swap: entry.swap,
      source: 'fallback',
    }
  }

  if (normalized.includes('onion') || normalized.includes('garlic')) {
    return {
      ingredient,
      rating: 'high',
      note: 'This ingredient is commonly high FODMAP in larger servings.',
      servingNote: 'Try a very small amount and see how you feel.',
      swap: 'Use chives or green tops instead.',
      source: 'fallback',
    }
  }

  if (normalized.includes('apple') || normalized.includes('watermelon')) {
    return {
      ingredient,
      rating: 'high',
      note: 'This ingredient is commonly high FODMAP.',
      servingNote: 'A smaller portion may be better tolerated.',
      swap: 'Try berries or a banana instead.',
      source: 'fallback',
    }
  }

  if (normalized.includes('milk') || normalized.includes('cream')) {
    return {
      ingredient,
      rating: 'moderate',
      note: 'Lactose can make dairy feel moderate for some people.',
      servingNote: 'Lactose-free versions are often easier to tolerate.',
      swap: 'Try lactose-free milk or a plant-based option.',
      source: 'fallback',
    }
  }

  return {
    ingredient,
    rating: 'moderate',
    note: 'This ingredient may vary by serving size and personal tolerance.',
    servingNote: 'Keep portions moderate and notice how you feel.',
    swap: 'Choose a simpler ingredient with a gentler profile if needed.',
    source: 'fallback',
  }
}

export async function analyzeIngredients(ingredients = []) {
  const items = ingredients.filter(Boolean)

  if (!items.length) {
    return []
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY

  if (apiKey) {
    try {
      const response = await fetch('/api/claude/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          max_tokens: 1200,
          temperature: 0.2,
          system: 'You are a calm nutrition assistant. Return valid JSON only. Analyze ingredients for likely FODMAP tolerance using general guidance. Include low, moderate, or high. Provide a brief serving note and a swap suggestion. Do not provide medical advice.',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze these ingredients for likely FODMAP tolerance. Return a JSON array of objects with fields: ingredient, rating, note, servingNote, swap. Each object should correspond to one ingredient. Ingredients:\n${items.join('\n')}`,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('Claude request failed')
      }

      const payload = await response.json()
      const text = payload.content?.[0]?.text || ''
      const parsed = parseClaudeJson(text)

      if (Array.isArray(parsed)) {
        return parsed.map((entry) => ({
          ingredient: entry.ingredient || '',
          rating: entry.rating || 'moderate',
          note: entry.note || '',
          servingNote: entry.servingNote || '',
          swap: entry.swap || '',
          source: 'claude',
        }))
      }
    } catch (error) {
      console.warn('Claude analysis failed, using fallback:', error)
    }
  }

  return items.map((ingredient) => analyzeIngredientWithFallback(ingredient))
}

export async function extractTextFromImage(file) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('Claude API key is not configured. Please paste the text manually for now.')
  }

  const base64 = await readFileAsBase64(file)
  const response = await fetch('/api/claude/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 600,
      temperature: 0.2,
      system: 'You are an OCR assistant that extracts readable text from food labels, menus, and recipe cards. Return only the text seen in the image, keeping ingredient lines separate.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: file.type || 'image/png',
                data: base64,
              },
            },
            {
              type: 'text',
              text: 'Extract the visible text from this image. Preserve the line breaks and ingredient list structure. If there is a menu, preserve the item names on separate lines.',
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error('Unable to read the image with Claude right now.')
  }

  const payload = await response.json()
  return payload.content?.[0]?.text?.trim() || ''
}

function parseClaudeJson(text = '') {
  const cleaned = text.trim()
  const fenced = cleaned.match(/```json\s*([\s\S]*?)```/i)
  const jsonText = fenced ? fenced[1] : cleaned

  try {
    return JSON.parse(jsonText)
  } catch {
    return []
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        const base64 = result.split(',')[1]
        resolve(base64)
      } else {
        reject(new Error('Image could not be read.'))
      }
    }
    reader.onerror = () => reject(new Error('Image could not be read.'))
    reader.readAsDataURL(file)
  })
}

export function loadSavedDiary() {
  if (typeof window === 'undefined') {
    return []
  }

  const stored = window.localStorage.getItem(DIARY_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveDiaryEntry(entry) {
  const existing = loadSavedDiary()
  const next = [entry, ...existing.filter((item) => item.ingredient !== entry.ingredient)]
  window.localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function loadSavedRestaurants() {
  if (typeof window === 'undefined') {
    return []
  }

  const stored = window.localStorage.getItem(RESTAURANT_STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveRestaurantMemory(entry) {
  const existing = loadSavedRestaurants()
  const next = [entry, ...existing.filter((item) => item.name !== entry.name)]
  window.localStorage.setItem(RESTAURANT_STORAGE_KEY, JSON.stringify(next))
  return next
}
