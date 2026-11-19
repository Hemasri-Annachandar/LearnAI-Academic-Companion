import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = 'http://127.0.0.1:8000/api/pdfs'
const STORAGE_KEY = 'learnai.collections'

function Textbooks() {
  const navigate = useNavigate()

  const [documents, setDocuments] = useState([])
  const [collections, setCollections] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [collectionName, setCollectionName] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [message, setMessage] = useState({ text: '', type: '' })
  const [backendOnline, setBackendOnline] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections))
  }, [collections])

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/`)
      if (!response.ok) throw new Error('Unable to connect to the PDF service.')

      const data = await response.json()
      setDocuments(data.documents || [])
      setBackendOnline(true)
    } catch (error) {
      setBackendOnline(false)
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

 function openCollection(collection) {
  const fileIds = collection.fileIds || []

  if (fileIds.length === 0) {
    window.alert('This collection has no PDF sources.')
    return
  }

  navigate(`/collection/${encodeURIComponent(collection.id)}`)
}

  function openCreateModal() {
    setCollectionName('')
    setSelectedFiles([])
    setMessage({ text: '', type: '' })
    setShowCreateModal(true)
  }

  function handleFileSelection(event) {
    const files = Array.from(event.target.files || [])
    const invalid = files.filter(
      (file) =>
        file.type !== 'application/pdf' &&
        !file.name.toLowerCase().endsWith('.pdf')
    )

    if (invalid.length) {
      setMessage({
        text: 'Please select PDF files only.',
        type: 'error',
      })
      event.target.value = ''
      return
    }

    setSelectedFiles(files)
  }

  async function uploadPdf(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.detail || `Could not upload ${file.name}.`)
    }

    // Support common response shapes from the upload endpoint.
    const returnedId =
      result.file_id ||
      result.document?.file_id ||
      result.pdf?.file_id ||
      result.data?.file_id

    if (returnedId) return returnedId

    // Fallback: find the newly uploaded document by its filename.
    const listResponse = await fetch(`${API_BASE}/`)
    if (!listResponse.ok) {
      throw new Error(`Uploaded ${file.name}, but could not retrieve its file ID.`)
    }

    const listData = await listResponse.json()
    const matches = (listData.documents || []).filter(
      (doc) => doc.filename === file.name
    )

    if (!matches.length) {
      throw new Error(`Uploaded ${file.name}, but its file ID was not returned by the API.`)
    }

    return matches[matches.length - 1].file_id
  }

  async function createCollection(event) {
    event.preventDefault()

    const name = collectionName.trim()

    if (!name) {
      setMessage({ text: 'Enter a collection name.', type: 'error' })
      return
    }

    if (!selectedFiles.length) {
      setMessage({
        text: 'Select at least one PDF to create your collection.',
        type: 'error',
      })
      return
    }

    const duplicate = collections.some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    )

    if (duplicate) {
      setMessage({
        text: 'A collection with this name already exists.',
        type: 'error',
      })
      return
    }

    setIsCreating(true)
    setMessage({ text: 'Uploading PDFs and creating your collection...', type: '' })

    try {
      const uploadedFileIds = []

      for (const file of selectedFiles) {
        const fileId = await uploadPdf(file)
        uploadedFileIds.push(fileId)
      }

      const newCollection = {
        id: crypto.randomUUID(),
        name,
        fileIds: uploadedFileIds,
        createdAt: new Date().toISOString(),
      }

      setCollections((current) => [newCollection, ...current])
      await loadDocuments()

      setShowCreateModal(false)
      setCollectionName('')
      setSelectedFiles([])
      setMessage({
        text: `Collection "${name}" created with ${uploadedFileIds.length} PDF(s).`,
        type: 'success',
      })
    } catch (error) {
      // Keep the modal open so the user can see the error and retry.
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setIsCreating(false)
    }
  }

  function deleteCollection(collectionId) {
    const confirmed = window.confirm(
      'Delete this collection? The uploaded PDF files will remain in the backend.'
    )

    if (!confirmed) return

    setCollections((current) =>
      current.filter((collection) => collection.id !== collectionId)
    )
  }

  function getCollectionDocuments(collection) {
    const ids = collection.fileIds || []
    return documents.filter((doc) => ids.includes(doc.file_id))
  }

  function formatDate(dateValue) {
    if (!dateValue) return 'Recently created'

    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return 'Recently created'

    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="library-page">
      <header className="library-page-heading">
        <div>
          <h1>My Library</h1>
          <p>Your collections, sources and learning workspaces.</p>
        </div>

        <div className="library-status">
          <span className={backendOnline ? 'status-online' : 'status-offline'} />
          {backendOnline ? 'Connected' : 'Backend unavailable'}
        </div>
      </header>

      <div className="library-section-heading">
        <div>
          <h2>My collections</h2>
          <p>
            {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
          </p>
        </div>

        <button
          type="button"
          className="library-create-button"
          onClick={openCreateModal}
        >
          + Create collection
        </button>
      </div>

      {message.text && !showCreateModal && (
        <div className={`library-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="library-empty-state">Loading collections...</div>
      ) : collections.length === 0 ? (
        <div className="library-empty-state">
          <div className="library-empty-icon">▱</div>
          <h3>No collections yet</h3>
          <p>Create a collection and upload the PDFs you want to study together.</p>
          <button
            type="button"
            className="library-create-button"
            onClick={openCreateModal}
          >
            + Create your first collection
          </button>
        </div>
      ) : (
        <div className="library-collection-grid">
          {collections.map((collection) => {
            const collectionDocs = getCollectionDocuments(collection)

            return (
              <article
                className="library-collection-card"
                key={collection.id}
                onClick={() => openCollection(collection)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openCollection(collection)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open ${collection.name} collection`}
              >
                <div className="library-collection-top">
                  <span className="library-collection-icon">▤</span>
                  <button
                    type="button"
                    aria-label={`Delete ${collection.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      deleteCollection(collection.id)
                    }}
                  >
                    ⋮
                  </button>
                </div>

                <h3 title={collection.name}>{collection.name}</h3>

                <p>
                  {formatDate(collection.createdAt)} · {collectionDocs.length} sources
                </p>

                <div className="library-collection-preview">
                  {collectionDocs.slice(0, 3).map((doc) => (
                    <span key={doc.file_id} title={doc.filename}>
                      {doc.filename}
                    </span>
                  ))}
                  {collectionDocs.length > 3 && (
                    <span>+{collectionDocs.length - 3} more</span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <div
          className="library-modal-backdrop"
          onClick={() => !isCreating && setShowCreateModal(false)}
        >
          <section
            className="library-chunks-modal library-create-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <h2>Create a collection</h2>
                <p>Name your collection and add the PDF sources for it.</p>
              </div>

              <button
                type="button"
                aria-label="Close"
                disabled={isCreating}
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </header>

            <form onSubmit={createCollection}>
              <div className="library-chunks-body">
                <label className="library-form-label">
                  Collection name
                  <input
                    type="text"
                    value={collectionName}
                    onChange={(event) => setCollectionName(event.target.value)}
                    placeholder="Example: Operating Systems"
                    maxLength={60}
                    required
                    disabled={isCreating}
                  />
                </label>

                <label className="library-form-label">
                  Upload PDF sources
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    multiple
                    onChange={handleFileSelection}
                    disabled={isCreating}
                    required
                  />
                </label>

                <p className="library-selected-count">
                  {selectedFiles.length
                    ? `${selectedFiles.length} PDF(s) selected`
                    : 'You can select multiple PDF files.'}
                </p>

                {selectedFiles.length > 0 && (
                  <ul className="library-selected-files">
                    {selectedFiles.map((file, index) => (
                      <li key={`${file.name}-${file.lastModified}-${index}`}>
                        {file.name}
                      </li>
                    ))}
                  </ul>
                )}

                {message.text && (
                  <div className={`library-message ${message.type}`}>
                    {message.text}
                  </div>
                )}
              </div>

              <footer className="library-collection-footer">
                <button
                  type="button"
                  className="library-cancel-button"
                  disabled={isCreating}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" disabled={isCreating}>
                  {isCreating ? 'Uploading...' : 'Create collection'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default Textbooks
