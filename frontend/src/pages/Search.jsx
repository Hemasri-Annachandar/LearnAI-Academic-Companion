
import { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000/api/pdfs'

function Search() {
  const [documents, setDocuments] = useState([])
  const [collections, setCollections] = useState([])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [contentResults, setContentResults] = useState([])
  const [isSearchingContent, setIsSearchingContent] = useState(false)
  const [hasSearchedContent, setHasSearchedContent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSearchData()
  }, [])

  async function loadSearchData() {
    try {
      const response = await fetch(`${API_BASE}/`)

      if (!response.ok) {
        throw new Error('Unable to load textbooks.')
      }

      const data = await response.json()
      setDocuments(data.documents || [])

      const savedCollections = JSON.parse(
        localStorage.getItem('learnai.collections') || '[]'
      )

      setCollections(savedCollections)
    } catch (err) {
      setError(err.message)
    }
  }

  const normalizedQuery = query.trim().toLowerCase()

  const textbookResults = useMemo(() => {
    if (!normalizedQuery) return []

    return documents.filter((doc) =>
      doc.filename.toLowerCase().includes(normalizedQuery)
    )
  }, [documents, normalizedQuery])

  const collectionResults = useMemo(() => {
    if (!normalizedQuery) return []

    return collections.filter((collection) =>
      collection.name.toLowerCase().includes(normalizedQuery)
    )
  }, [collections, normalizedQuery])

  async function searchPDFContent(event) {
    event.preventDefault()

    if (!normalizedQuery) {
      setError('Enter a word or topic to search.')
      return
    }

    if (normalizedQuery.length < 2) {
      setError('Enter at least 2 characters.')
      return
    }

    setError('')
    setContentResults([])
    setHasSearchedContent(false)
    setIsSearchingContent(true)

    try {
      const results = []

      for (const doc of documents) {
        const response = await fetch(
          `${API_BASE}/${doc.file_id}/chunks`
        )

        if (!response.ok) continue

        const data = await response.json()
        const chunks = data.chunks || []

        chunks.forEach((chunk) => {
          const text = chunk.text || ''

          if (text.toLowerCase().includes(normalizedQuery)) {
            results.push({
              fileId: doc.file_id,
              filename: doc.filename,
              chunkId: chunk.chunk_id,
              page: chunk.page,
              text,
            })
          }
        })
      }

      setContentResults(results)
      setHasSearchedContent(true)
    } catch {
      setError('Unable to search PDF contents. Check your backend.')
    } finally {
      setIsSearchingContent(false)
    }
  }

  function handleSearch(event) {
    event.preventDefault()

    if (!normalizedQuery) {
      setError('Enter something to search.')
      return
    }

    if (activeCategory === 'All' || activeCategory === 'PDF content') {
      searchPDFContent(event)
    }
  }

  const showTextbooks =
    activeCategory === 'All' || activeCategory === 'Textbooks'

  const showCollections =
    activeCategory === 'All' || activeCategory === 'Collections'

  const showContent =
    activeCategory === 'All' || activeCategory === 'PDF content'

  const hasTitleResults =
    (showTextbooks && textbookResults.length > 0) ||
    (showCollections && collectionResults.length > 0)

  const hasContentResults =
    showContent && contentResults.length > 0

  const showEmptyState =
    normalizedQuery &&
    !hasTitleResults &&
    (!showContent || (hasSearchedContent && !hasContentResults)) &&
    !isSearchingContent

  return (
    <div className="search-page">

      <header className="search-page-heading">
        <span className="search-eyebrow">DISCOVER YOUR KNOWLEDGE</span>
        <h1>Search your library</h1>
        <p>
          Find textbooks, collections and information inside your study materials.
        </p>
      </header>

      <section className="search-main">

        <form className="search-input-container" onSubmit={handleSearch}>
          <span className="search-input-icon">⌕</span>

          <input
            type="search"
            placeholder="Search textbooks, topics or keywords..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setError('')
              setContentResults([])
              setHasSearchedContent(false)
            }}
          />

          <button type="submit" disabled={isSearchingContent}>
            {isSearchingContent ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="search-category-tabs">
          {['All', 'Textbooks', 'Collections', 'PDF content'].map(
            (category) => (
              <button
                key={category}
                type="button"
                className={
                  activeCategory === category ? 'active' : ''
                }
                onClick={() => {
                  setActiveCategory(category)
                  setContentResults([])
                  setHasSearchedContent(false)
                  setError('')
                }}
              >
                {category}
              </button>
            )
          )}
        </div>

        {error && (
          <div className="search-error">
            {error}
          </div>
        )}

        {!normalizedQuery ? (
          <div className="search-welcome">
            <div className="search-welcome-icon">⌕</div>
            <h2>What are you looking for?</h2>
            <p>
              Search by textbook name, collection name or a topic
              mentioned inside your PDFs.
            </p>
          </div>
        ) : (
          <div className="search-results">

            {showTextbooks && textbookResults.length > 0 && (
              <section className="search-result-section">
                <div className="search-result-heading">
                  <h2>Textbooks</h2>
                  <span>{textbookResults.length} results</span>
                </div>

                {textbookResults.map((doc) => (
                  <article
                    className="search-result-card"
                    key={doc.file_id}
                  >
                    <div className="search-result-icon pdf">PDF</div>

                    <div className="search-result-info">
                      <h3>{doc.filename}</h3>
                      <p>
                        {doc.total_pages} pages · {doc.total_chunks} chunks
                      </p>
                    </div>
                  </article>
                ))}
              </section>
            )}

            {showCollections && collectionResults.length > 0 && (
              <section className="search-result-section">
                <div className="search-result-heading">
                  <h2>Collections</h2>
                  <span>{collectionResults.length} results</span>
                </div>

                {collectionResults.map((collection) => (
                  <article
                    className="search-result-card"
                    key={collection.id}
                  >
                    <div className="search-result-icon collection">
                      ▰
                    </div>

                    <div className="search-result-info">
                      <h3>{collection.name}</h3>
                      <p>
                        {(collection.fileIds || []).length} textbooks
                      </p>
                    </div>
                  </article>
                ))}
              </section>
            )}

            {showContent && (
              <section className="search-result-section">
                <div className="search-result-heading">
                  <h2>PDF content</h2>
                  <span>
                    {hasSearchedContent
                      ? `${contentResults.length} matches`
                      : 'Search inside your textbooks'}
                  </span>
                </div>

                {isSearchingContent ? (
                  <p className="search-loading">
                    Searching through your PDF textbooks...
                  </p>
                ) : hasSearchedContent && contentResults.length > 0 ? (
                  contentResults.map((result, index) => (
                    <article
                      className="search-content-card"
                      key={`${result.fileId}-${result.chunkId}-${index}`}
                    >
                      <div className="search-content-meta">
                        <strong>{result.filename}</strong>
                        <span>
                          Page {result.page ?? 'N/A'} · Chunk #{result.chunkId}
                        </span>
                      </div>

                      <p>{result.text}</p>
                    </article>
                  ))
                ) : hasSearchedContent ? (
                  <p className="search-no-content">
                    No matching content found in your PDFs.
                  </p>
                ) : (
                  <p className="search-hint">
                    Press Search to look for this topic inside your PDFs.
                  </p>
                )}
              </section>
            )}

            {showEmptyState && (
              <div className="search-empty-state">
                <div>⌕</div>
                <h2>No results found</h2>
                <p>Try another keyword or search term.</p>
              </div>
            )}

          </div>
        )}

      </section>
    </div>
  )
}

export default Search