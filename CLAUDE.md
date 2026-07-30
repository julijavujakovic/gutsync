# GutSync

A gut-brain wellness app with 3 pillars: FODMAP food analysis, guided breathing, and mindset reset phrases. Built for people managing IBS, IBD, Crohn's, or stress-related gut issues.

## Stack
- React (frontend)
- Claude API (claude-sonnet-4-6) for FODMAP analysis and content generation
- JSON-based FODMAP reference data (Monash-inspired)
- Hosted on Vercel

## App Modules

### 1. Eat
- User pastes a recipe or ingredient list
- Agent parses each ingredient and checks against FODMAP database
- Returns green / yellow / red rating per ingredient
- Accounts for serving size thresholds (not just ingredient presence)
- Suggests low FODMAP swaps for any flagged ingredients
- Rewrites full recipe in low FODMAP version on request
- Restaurant menu analyzer
- Grocery list builder from weekly meal plan

### 2. Breathe
- Guided breathing exercises targeting vagus nerve activation
- Techniques: box breathing, diaphragmatic breathing, 4-7-8
- Animated breathing UI with timer
- Suggest breathing before/after meals or during flare

### 3. Reset
- Gut-brain affirmations and manifestation phrases
- Daily phrase generator
- User can save favorites

## Key Rules
- FODMAP ratings must always account for serving size, not just ingredient name
- Never give medical advice, always include a disclaimer
- Keep language warm, accessible, non-clinical
- All 3 modules should feel cohesive

## Folder Structure
src/components/Eat
src/components/Breathe
src/components/Reset
src/data/fodmap-database.json
src/api/claude.js

## Portfolio Notes
- Connects to the ibd-stress-gut-brain NHANES research project
- Target audience: people with IBS, IBD, Crohn's, ulcerative colitis
- Intended as a Substack article companion piece