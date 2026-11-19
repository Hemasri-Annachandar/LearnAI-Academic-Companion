import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const PDF_API = 'http://127.0.0.1:8000/api/pdfs'
const CHAT_API = 'http://127.0.0.1:8000/api/chat/'

const tabs = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'guide', label: 'Study Guide', icon: '📖' },
  { id: 'flashcards', label: 'Flashcards', icon: '🗂️' },
  { id: 'quiz', label: 'Quiz', icon: '✍️' },
  { id: 'lesson', label: 'Lesson Plan', icon: '📅' },
]

const prompts = {
  guide:
    'Create a detailed, structured study guide from this textbook. Include important topics, key concepts, definitions, and revision points.',
  flashcards:
    'Create useful question-and-answer flashcards from this textbook. Organize them by topic.',
  quiz:
    'Create 10 multiple-choice questions from this textbook. Include four options and identify the correct answer with a short explanation.',
  lesson:
    'Create a structured lesson plan based on this textbook. Include learning objectives, topics, teaching activities, and assessment.',
}

const initialMessage = {
  id: 1,
  role: 'assistant',
  content:
    "Hello! I'm LearnAI. Ask me anything about this textbook, and I'll use its content to help you learn.",
  sources: [],
}

function TextbookWorkspace() {
  const { fileId, collectionId } = useParams()
  const navigate = useNavigate()

  const [document, setDocument] = useState(null)
  const [documents, setDocuments] = useState([])
  const [selectedFileIds, setSelectedFileIds] = useState([])
  const [collection, setCollection] = useState(null)
  const [deletingFileId, setDeletingFileId] = useState(null)
  const [isSourcesOpen, setIsSourcesOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')

  const [messages, setMessages] = useState([initialMessage])
  const [input, setInput] = useState('')
  const [generatedContent, setGeneratedContent] = useState({})

  const [isLoadingDocument, setIsLoadingDocument] = useState(true)
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)

  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // Load one PDF or all PDFs assigned to a collection.
  useEffect(() => {
    async function loadWorkspace() {
      try {
        setIsLoadingDocument(true)
        setError('')

        const response = await fetch(`${PDF_API}/`)
        if (!response.ok) throw new Error('Unable to load your textbooks.')

        const data = await response.json()
        const allDocuments = data.documents || []

        if (collectionId) {
          const savedCollections = JSON.parse(
            localStorage.getItem('learnai.collections') || '[]'
          )
          const foundCollection = savedCollections.find(
            (item) => item.id === collectionId
          )

          if (!foundCollection) {
            throw new Error('This collection could not be found.')
          }

          const collectionFileIds = foundCollection.fileIds || []
          const collectionDocuments = allDocuments.filter((item) =>
            collectionFileIds.includes(item.file_id)
          )

          if (collectionDocuments.length === 0) {
            throw new Error('This collection has no available PDF sources.')
          }

          setCollection(foundCollection)
          setDocuments(collectionDocuments)
          setSelectedFileIds(
            collectionDocuments.map((item) => item.file_id)
          )
          setDocument({
            filename: foundCollection.name,
            total_pages: collectionDocuments.reduce(
              (sum, item) => sum + (item.total_pages || 0), 0
            ),
            total_chunks: collectionDocuments.reduce(
              (sum, item) => sum + (item.total_chunks || 0), 0
            ),
          })
        } else {
          const foundDocument = allDocuments.find(
            (item) => item.file_id === fileId
          )

          if (!foundDocument) {
            throw new Error('This textbook could not be found.')
          }

          setCollection(null)
          setDocuments([foundDocument])
          setSelectedFileIds([foundDocument.file_id])
          setDocument(foundDocument)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoadingDocument(false)
      }
    }

    loadWorkspace()
  }, [fileId, collectionId])

  function toggleSource(sourceFileId) {
    setSelectedFileIds((current) =>
      current.includes(sourceFileId)
        ? current.filter((id) => id !== sourceFileId)
        : [...current, sourceFileId]
    )
  }

  // Upload one or more PDFs and attach them to the current collection.
  async function handleAddPdfs(event) {
    const inputElement = event.currentTarget
    const files = Array.from(inputElement.files || [])

    if (!files.length) return

    if (!collectionId || !collection) {
      setUploadError('PDFs can only be added from a collection workspace.')
      inputElement.value = ''
      return
    }

    const invalidFiles = files.filter(
      (file) => file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')
    )

    if (invalidFiles.length > 0) {
      setUploadError('Please select PDF files only.')
      inputElement.value = ''
      return
    }

    setIsUploading(true)
    setUploadError('')

    const uploadedDocuments = []
    const failedFiles = []

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        try {
          const response = await fetch(`${PDF_API}/upload`, {
            method: 'POST',
            body: formData,
          })

          const result = await response.json()

          if (!response.ok || !result.success || !result.file_id) {
            throw new Error(result.detail || result.message || 'Upload failed.')
          }

          uploadedDocuments.push({
            file_id: result.file_id,
            filename: result.filename || file.name,
            total_pages: result.total_pages || 0,
            total_chunks: result.total_chunks || 0,
            file_size: result.file_size || file.size,
          })
        } catch (err) {
          failedFiles.push(`${file.name}: ${err.message}`)
        }
      }

      if (uploadedDocuments.length > 0) {
        const newFileIds = uploadedDocuments.map((pdf) => pdf.file_id)
        const savedCollections = JSON.parse(
          localStorage.getItem('learnai.collections') || '[]'
        )

        const collectionExists = savedCollections.some(
          (item) => item.id === collectionId
        )

        if (!collectionExists) {
          throw new Error('The collection could not be found in local storage.')
        }

        const updatedCollections = savedCollections.map((item) =>
          item.id === collectionId
            ? {
                ...item,
                fileIds: [...new Set([...(item.fileIds || []), ...newFileIds])],
              }
            : item
        )

        localStorage.setItem(
          'learnai.collections',
          JSON.stringify(updatedCollections)
        )

        const updatedCollection = updatedCollections.find(
          (item) => item.id === collectionId
        )

        setCollection(updatedCollection)
        setDocuments((current) => [
          ...current,
          ...uploadedDocuments.filter(
            (pdf) => !current.some((existing) => existing.file_id === pdf.file_id)
          ),
        ])
        setSelectedFileIds((current) => [
          ...new Set([...current, ...newFileIds]),
        ])
        setDocument((current) => ({
          ...current,
          filename: updatedCollection.name,
          total_pages:
            (current?.total_pages || 0) +
            uploadedDocuments.reduce((sum, pdf) => sum + pdf.total_pages, 0),
          total_chunks:
            (current?.total_chunks || 0) +
            uploadedDocuments.reduce((sum, pdf) => sum + pdf.total_chunks, 0),
        }))
      }

      if (failedFiles.length > 0) {
        setUploadError(`Some files could not be uploaded:
${failedFiles.join('\\n')}`)
      }
    } catch (err) {
      setUploadError(err.message || 'Unable to upload PDFs.')
    } finally {
      setIsUploading(false)
      inputElement.value = ''
    }
  }

  async function deletePdf(pdf) {
    const confirmed = window.confirm(
      `Permanently delete "${pdf.filename}"? This removes the PDF from LearnAI and every collection that contains it.`
    )
    if (!confirmed) return

    setDeletingFileId(pdf.file_id)
    setError('')

    try {
      const response = await fetch(
        `${PDF_API}/${encodeURIComponent(pdf.file_id)}`,
        { method: 'DELETE' }
      )

      let result = {}
      try {
        result = await response.json()
      } catch {
        // DELETE endpoints may return an empty body.
      }

      if (!response.ok) {
        throw new Error(result.detail || 'Unable to delete this PDF.')
      }

      const savedCollections = JSON.parse(
        localStorage.getItem('learnai.collections') || '[]'
      )
      const updatedCollections = savedCollections.map((item) => ({
        ...item,
        fileIds: (item.fileIds || []).filter(
          (id) => id !== pdf.file_id
        ),
      }))

      localStorage.setItem(
        'learnai.collections',
        JSON.stringify(updatedCollections)
      )

      const remainingDocuments = documents.filter(
        (item) => item.file_id !== pdf.file_id
      )

      setDocuments(remainingDocuments)
      setSelectedFileIds((current) =>
        current.filter((id) => id !== pdf.file_id)
      )

      if (!collectionId) {
        navigate('/library')
        return
      }

      const updatedCollection = updatedCollections.find(
        (item) => item.id === collectionId
      )
      setCollection(updatedCollection || null)

      if (remainingDocuments.length === 0) {
        window.alert('There are no PDFs left in this collection.')
        navigate('/library')
        return
      }

      setDocument({
        filename: updatedCollection?.name || collection?.name || 'Collection',
        total_pages: remainingDocuments.reduce(
          (sum, item) => sum + (item.total_pages || 0), 0
        ),
        total_chunks: remainingDocuments.reduce(
          (sum, item) => sum + (item.total_chunks || 0), 0
        ),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingFileId(null)
    }
  }

  // Send questions to the AI backend
  async function sendPrompt(prompt, targetTab = 'chat') {
    const question = prompt.trim()

    if (!question || isLoadingAnswer) return
    if (selectedFileIds.length === 0) {
      window.alert('Select at least one PDF source before asking LearnAI.')
      return
    }

    // Send previous chat messages so LearnAI can understand follow-up questions.
    // Exclude the initial welcome message because it is not part of the conversation.
    const conversationHistory =
      targetTab === 'chat'
        ? messages
            .filter(
              (message) =>
                message.id !== initialMessage.id &&
                ['user', 'assistant'].includes(message.role)
            )
            .slice(-10)
            .map((message) => ({
              role: message.role,
              content: message.content,
            }))
        : []

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
      sources: [],
    }

    if (targetTab === 'chat') {
      setMessages((current) => [...current, userMessage])
      setInput('')
    }

    setIsLoadingAnswer(true)

    try {
      const response = await fetch(CHAT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          message: question,
          context: '',
          file_ids: selectedFileIds,
          conversation_history: conversationHistory,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Unable to generate an answer.')
      }

      const answer = data.answer || 'The AI returned an empty response.'
      const sources = Array.isArray(data.sources) ? data.sources : []

      if (targetTab === 'chat') {
        setMessages((current) => [
          ...current,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: answer,
            sources,
          },
        ])
      } else {
        setGeneratedContent((current) => ({
          ...current,
          [targetTab]: answer,
        }))
      }
    } catch (err) {
      if (targetTab === 'chat') {
        setMessages((current) => [
          ...current,
          {
            id: Date.now() + 1,
            role: 'assistant',
            content: `Something went wrong: ${err.message}`,
            sources: [],
          },
        ])
      } else {
        setGeneratedContent((current) => ({
          ...current,
          [targetTab]: `Something went wrong: ${err.message}`,
        }))
      }
    } finally {
      setIsLoadingAnswer(false)
    }
  }

  function handleChatSubmit(event) {
    event.preventDefault()
    sendPrompt(input, 'chat')
  }

  function handleDiscardGenerated(tabId) {
    const confirmed = window.confirm(
      `Discard the generated ${tabs.find((tab) => tab.id === tabId)?.label || 'content'}?`
    )

    if (!confirmed) return

    setGeneratedContent((current) => {
      const updated = { ...current }
      delete updated[tabId]
      return updated
    })
  }

  function handleGenerate(tabId) {
    setActiveTab(tabId)
    sendPrompt(prompts[tabId], tabId)
  }

  // Loading state
  if (isLoadingDocument) {
    return (
      <section className="textbook-workspace-page">
        <p>Loading textbook...</p>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="textbook-workspace-page">
        <button
          type="button"
          onClick={() => navigate('/library')}
        >
          ← Back to Library
        </button>

        <p className="workspace-error">{error}</p>
      </section>
    )
  }

  return (
    <section className="textbook-workspace-page">

      {/* Textbook header */}
      <header className="textbook-workspace-header">
        <button
          type="button"
          className="workspace-back-button"
          onClick={() => navigate('/library')}
        >
          ← My Library
        </button>

        <div className="textbook-workspace-title">
          <span className="workspace-eyebrow">
            {collectionId ? 'COLLECTION WORKSPACE' : 'TEXTBOOK WORKSPACE'}
          </span>

          <h1>{collectionId ? collection?.name : document.filename}</h1>

          <p>
            {documents.length} {documents.length === 1 ? 'PDF source' : 'PDF sources'} · {selectedFileIds.length} selected · {document.total_pages} pages
          </p>
        </div>
      </header>

      {/* Workspace layout */}
      <div className="textbook-workspace-layout">

        {/* LEFT SIDE: Uploaded PDF sources */}
        <aside
          className={`textbook-sources-sidebar ${
            isSourcesOpen ? 'open' : ''
          }`}
        >
          <button
            type="button"
            className={`textbook-sources-tab ${isSourcesOpen ? 'active' : ''}`}
            onClick={() => setIsSourcesOpen((open) => !open)}
            aria-expanded={isSourcesOpen}
            aria-label={isSourcesOpen ? 'Close sources panel' : 'Open sources panel'}
          >
            <span>📚</span>
            {isSourcesOpen && <strong>Sources</strong>}
            {isSourcesOpen && <span className="sources-panel-count">{documents.length}</span>}
            {isSourcesOpen && <span className="sources-panel-close">×</span>}
          </button>

          {isSourcesOpen && (
            <div className="textbook-sources-panel">
              <div
                className="textbook-sources-heading-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <h3>Uploaded PDFs</h3>

                {collectionId && (
                  <>
                    <button
                      type="button"
                      className="textbook-add-pdf-button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      title="Add PDF sources"
                      aria-label="Add PDF sources"
                      style={{
                        width: '34px',
                        height: '34px',
                        flexShrink: 0,
                        border: 'none',
                        borderRadius: '9px',
                        background: '#5267f5',
                        color: '#ffffff',
                        fontSize: '24px',
                        fontWeight: 600,
                        lineHeight: 1,
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        opacity: isUploading ? 0.6 : 1,
                      }}
                    >
                      {isUploading ? '…' : '+'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      multiple
                      hidden
                      onChange={handleAddPdfs}
                    />
                  </>
                )}
              </div>

              <p>{documents.length} {documents.length === 1 ? 'source' : 'sources'} in your library</p>

              {isUploading && (
                <p className="workspace-loading">Uploading and processing PDFs...</p>
              )}

              {uploadError && (
                <p className="workspace-error" role="alert" style={{ whiteSpace: 'pre-line' }}>
                  {uploadError}
                </p>
              )}

              <div className="textbook-uploaded-pdf-list">
                {documents.length === 0 ? (
                  <p className="workspace-empty-sources">No uploaded PDFs found.</p>
                ) : (
                  documents.map((pdf) => (
                    <div
                      key={pdf.file_id}
                      className={`textbook-uploaded-pdf ${
                        selectedFileIds.includes(pdf.file_id) ? 'selected' : ''
                      }`}
                      title={pdf.filename}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(pdf.file_id)}
                        onChange={() => toggleSource(pdf.file_id)}
                        aria-label={`Use ${pdf.filename} as an AI source`}
                      />
                      <span className="uploaded-pdf-icon">PDF</span>
                      <span className="uploaded-pdf-details">
                        <strong>{pdf.filename}</strong>
                        <small>
                          {pdf.total_pages ?? 0} pages · {pdf.total_chunks ?? 0} chunks
                        </small>
                      </span>
                      <button
                        type="button"
                        className="uploaded-pdf-delete"
                        title={`Delete ${pdf.filename}`}
                        aria-label={`Delete ${pdf.filename}`}
                        disabled={deletingFileId === pdf.file_id}
                        onClick={() => deletePdf(pdf)}
                      >
                        {deletingFileId === pdf.file_id ? '…' : '🗑'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT SIDE: Other workspace tabs */}
        <div className="textbook-workspace-main">

          {/* Top navigation */}
          <nav
            className="textbook-workspace-tabs"
            aria-label="Textbook workspace"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`textbook-workspace-tab ${
                  activeTab === tab.id ? 'active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Main content */}
          <main className="textbook-workspace-content">

            {/* CHAT TAB */}
            {activeTab === 'chat' && (
              <section className="textbook-chat-section">

                <div className="workspace-section-heading">
                  <div>
                    <h2>Chat with your textbook</h2>
                    <p>
                      Ask questions and explore the concepts in this PDF.
                    </p>
                  </div>

                  <span className="chat-mode-badge">
                    RAG MODE
                  </span>
                </div>

                <div
                  className="textbook-chat-messages"
                  aria-live="polite"
                >
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={`workspace-message workspace-message-${message.role}`}
                    >
                      <div className="message-avatar">
                        {message.role === 'assistant' ? 'AI' : 'You'}
                      </div>

                      <div className="message-body">
                        <strong>
                          {message.role === 'assistant'
                            ? 'LearnAI'
                            : 'You'}
                        </strong>

                        <p className={`message-text ${message.role === "assistant" ? "ai-response-text" : ""}`}>
                          {message.content}
                        </p>

                        {message.sources?.length > 0 && (
                          <div className="message-sources">
                            <strong>
                              Sources ({message.sources.length})
                            </strong>

                            {message.sources.map((source, index) => (
                              <div
                                className="citation-card"
                                key={`${source.file_id}-${source.chunk_id}-${index}`}
                              >
                                <span>PDF</span>

                                <div>
                                  <strong>{source.filename}</strong>

                                  <small>
                                    Page {source.page} · Chunk {source.chunk_id}
                                  </small>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}

                  {isLoadingAnswer && (
                    <p className="workspace-loading">
                      LearnAI is searching this textbook...
                    </p>
                  )}
                </div>

                <form
                  className="textbook-chat-composer"
                  onSubmit={handleChatSubmit}
                >
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask something about this textbook..."
                    rows={3}
                    disabled={isLoadingAnswer}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        event.currentTarget.form.requestSubmit()
                      }
                    }}
                  />

                  <div className="composer-footer">
                    <span>
                      Enter to send · Shift + Enter for new line
                    </span>

                    <button
                      type="submit"
                      disabled={!input.trim() || isLoadingAnswer}
                    >
                      {isLoadingAnswer ? 'Sending...' : 'Send ➤'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* GENERATION TABS */}
            {['guide', 'flashcards', 'quiz', 'lesson'].includes(activeTab) && (
              <section className="textbook-generation-section">

                <div className="workspace-section-heading">
                  <div>
                    <h2>
                      {tabs.find((tab) => tab.id === activeTab)?.label}
                    </h2>

                    <p>
                      Generate learning material using this textbook as the source.
                    </p>
                  </div>
                </div>

                {!generatedContent[activeTab] && (
                  <div className="textbook-generation-empty">
                    <div className="generation-icon">
                      {tabs.find((tab) => tab.id === activeTab)?.icon}
                    </div>

                    <h3>
                      Create your{' '}
                      {tabs.find((tab) => tab.id === activeTab)?.label}
                    </h3>

                    <p>
                      LearnAI will use the content of this textbook to prepare
                      your learning material.
                    </p>

                    <button
                      type="button"
                      onClick={() => handleGenerate(activeTab)}
                      disabled={isLoadingAnswer}
                    >
                      {isLoadingAnswer ? 'Generating...' : 'Generate now'}
                    </button>
                  </div>
                )}

                {generatedContent[activeTab] && (
                  <div className="generated-content-card">
                    <div className="generated-content-heading">
                      <h3>Generated material</h3>

                      <div className="generated-content-actions">
                        <button
                          type="button"
                          className="generated-discard-button"
                          onClick={() => handleDiscardGenerated(activeTab)}
                          disabled={isLoadingAnswer}
                        >
                          Discard
                        </button>

                        <button
                          type="button"
                          className="generated-regenerate-button"
                          onClick={() => handleGenerate(activeTab)}
                          disabled={isLoadingAnswer}
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>

                    <div className="generated-content-text ai-generated-response">
                      {generatedContent[activeTab]}
                    </div>
                  </div>
                )}

                {isLoadingAnswer && (
                  <p className="workspace-loading">
                    LearnAI is generating your material...
                  </p>
                )}
              </section>
            )}

          </main>
        </div>
      </div>
    </section>
  )
}

export default TextbookWorkspace
