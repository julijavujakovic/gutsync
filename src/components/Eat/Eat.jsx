import { useEffect, useState } from 'react'
import {
  analyzeIngredients,
  extractIngredientLines,
  extractTextFromImage,
  loadSavedDiary,
  loadSavedRestaurants,
  saveDiaryEntry,
  saveRestaurantMemory,
} from '../../api/claude'
import './Eat.css'

const DEFAULT_TEXT = '2 eggs\n1 onion\n1 cup oats\n1 apple'

function Eat() {
  const [mode, setMode] = useState('text')
  const [textInput, setTextInput] = useState(DEFAULT_TEXT)
  const [extractedText, setExtractedText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [analysisResults, setAnalysisResults] = useState([])
  const [savedIngredients, setSavedIngredients] = useState([])
  const [restaurantName, setRestaurantName] = useState('')
  const [savedRestaurants, setSavedRestaurants] = useState([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    setSavedIngredients(loadSavedDiary())
    setSavedRestaurants(loadSavedRestaurants())
  }, [])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setStatus('Image ready. Extract the text first, then review and edit it before analyzing.')
  }

  const handleExtractText = async () => {
    if (!selectedFile) {
      setError('Please choose an image first.')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const text = await extractTextFromImage(selectedFile)
      setExtractedText(text)
      setTextInput(text)
      setStatus('Text extracted from the image. You can edit it and then analyze the ingredients.')
    } catch (analysisError) {
      setError(analysisError.message || 'We could not extract the text from that image.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAnalyze = async () => {
    const activeText = mode === 'photo' ? extractedText : textInput
    const ingredients = extractIngredientLines(activeText)

    if (!ingredients.length) {
      setError('Add at least one ingredient or line of text to analyze.')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const results = await analyzeIngredients(ingredients)
      setAnalysisResults(results)
      setStatus('Analysis ready. Low is green, moderate is yellow, and high is red.')
    } catch (analysisError) {
      setError(analysisError.message || 'We could not analyze these ingredients right now.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveIngredient = (ingredient) => {
    const entry = {
      ingredient: ingredient.ingredient,
      rating: ingredient.rating,
      note: ingredient.note,
      servingNote: ingredient.servingNote,
      swap: ingredient.swap,
      savedAt: new Date().toISOString(),
    }

    const nextItems = saveDiaryEntry(entry)
    setSavedIngredients(nextItems)
    setStatus(`${ingredient.ingredient} saved to your diary.`)
  }

  const saveRestaurant = () => {
    if (!restaurantName.trim() || !analysisResults.length) {
      setError('Add a restaurant name and analyze at least one ingredient first.')
      return
    }

    const entry = {
      name: restaurantName.trim(),
      items: analysisResults,
      savedAt: new Date().toISOString(),
    }

    const nextItems = saveRestaurantMemory(entry)
    setSavedRestaurants(nextItems)
    setStatus(`Saved ${restaurantName.trim()} to your restaurant memory.`)
  }

  return (
    <section className="eat-module">
      <div className="eat-intro">
        <h2>Eat</h2>
        <p>Paste a recipe, ingredient list, or upload a label, recipe card, or menu photo.</p>
      </div>

      <p className="disclaimer">
        This is not medical advice. Use these notes as a gentle guide and talk with a clinician if you need personal care.
      </p>

      <div className="toggle-row">
        <button
          className={mode === 'text' ? 'active' : 'secondary-button'}
          type="button"
          onClick={() => setMode('text')}
        >
          Type or paste ingredients
        </button>
        <button
          className={mode === 'photo' ? 'active' : 'secondary-button'}
          type="button"
          onClick={() => setMode('photo')}
        >
          Upload a photo
        </button>
      </div>

      {mode === 'text' ? (
        <textarea
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          placeholder="Paste a recipe, ingredients, or menu items here."
        />
      ) : (
        <>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {previewUrl ? <img className="preview-image" src={previewUrl} alt="Uploaded preview" /> : null}
          <textarea
            value={extractedText}
            onChange={(event) => setExtractedText(event.target.value)}
            placeholder="The extracted text will appear here. You can edit it before analyzing."
          />
        </>
      )}

      <div className="button-row">
        {mode === 'photo' ? (
          <button className="primary" type="button" onClick={handleExtractText} disabled={isAnalyzing}>
            {isAnalyzing ? 'Working…' : 'Extract text from photo'}
          </button>
        ) : null}
        <button className="primary" type="button" onClick={handleAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing…' : 'Analyze ingredients'}
        </button>
      </div>

      {status ? <p className="status">{status}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {analysisResults.length ? (
        <div className="result-list">
          <h3>Ingredient results</h3>
          {analysisResults.map((result, index) => (
            <article className="result-card" key={`${result.ingredient}-${result.rating}`} style={{ animationDelay: `${index * 120}ms` }}>
              <span className={`badge ${result.rating}`}>{result.rating}</span>
              <h4>{result.ingredient}</h4>
              <p className="small-note">{result.note}</p>
              <p className="small-note">Serving note: {result.servingNote}</p>
              <p className="small-note">Swap: {result.swap}</p>
              <button className="save-button" type="button" onClick={() => saveIngredient(result)}>
                Save to diary
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {analysisResults.length ? (
        <div className="restaurant-card">
          <h3>Restaurant memory</h3>
          <p className="small-note">Save your results under a restaurant name so you can revisit them later.</p>
          <input
            type="text"
            value={restaurantName}
            onChange={(event) => setRestaurantName(event.target.value)}
            placeholder="Restaurant name"
          />
          <button className="secondary-button" type="button" onClick={saveRestaurant}>
            Save restaurant memory
          </button>
        </div>
      ) : null}

      <div className="saved-card">
        <h3>Your saved diary</h3>
        {savedIngredients.length ? (
          <div className="saved-list">
            {savedIngredients.map((item) => (
              <div key={`${item.ingredient}-${item.savedAt}`}>
                <strong>{item.ingredient}</strong>
                <p className="small-note">{item.rating} · {item.swap}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="small-note">No saved ingredients yet.</p>
        )}
      </div>

      <div className="saved-card">
        <h3>Saved restaurants</h3>
        {savedRestaurants.length ? (
          <div className="restaurant-list">
            {savedRestaurants.map((restaurant) => (
              <div className="restaurant-card" key={`${restaurant.name}-${restaurant.savedAt}`}>
                <strong>{restaurant.name}</strong>
                <ul>
                  {restaurant.items.map((item) => (
                    <li key={`${restaurant.name}-${item.ingredient}`}>
                      {item.ingredient} — <span className={`badge ${item.rating}`}>{item.rating}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="small-note">No saved restaurants yet.</p>
        )}
      </div>
    </section>
  )
}

export default Eat
