import { describe, expect, it } from 'vitest'
import { analyzeIngredientWithFallback, extractIngredientLines } from './claude.js'

describe('Eat module helpers', () => {
  it('extracts ingredient lines from pasted text', () => {
    const text = '2 eggs\n1 onion\n1 cup oats\n'

    expect(extractIngredientLines(text)).toEqual(['2 eggs', '1 onion', '1 cup oats'])
  })

  it('flags common high-FODMAP ingredients with a swap', () => {
    const result = analyzeIngredientWithFallback('onion')

    expect(result.rating).toBe('high')
    expect(result.swap).toContain('green tops')
  })
})
