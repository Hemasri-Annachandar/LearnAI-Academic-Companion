
import { useEffect, useState } from 'react'

function Settings() {
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('learnai.profile') ||
        '{"name":"Student","email":""}'
      )
    } catch {
      return { name: 'Student', email: '' }
    }
  })

  const [preferences, setPreferences] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('learnai.preferences') ||
        '{"theme":"light","responseStyle":"balanced","answerLength":"medium"}'
      )
    } catch {
      return {
        theme: 'light',
        responseStyle: 'balanced',
        answerLength: 'medium',
      }
    }
  })

  const [saveMessage, setSaveMessage] = useState('')

  // Save profile
  useEffect(() => {
    localStorage.setItem('learnai.profile', JSON.stringify(profile))
  }, [profile])

  // Save preferences
  useEffect(() => {
    localStorage.setItem(
      'learnai.preferences',
      JSON.stringify(preferences)
    )
  }, [preferences])

  // Apply theme across the entire application
  useEffect(() => {
    const root = document.documentElement
    const systemTheme = window.matchMedia(
      '(prefers-color-scheme: dark)'
    )

    function applyTheme() {
      const selectedTheme =
        preferences.theme === 'system'
          ? systemTheme.matches
            ? 'dark'
            : 'light'
          : preferences.theme

      root.setAttribute('data-theme', selectedTheme)
    }

    applyTheme()

    if (preferences.theme === 'system') {
      systemTheme.addEventListener('change', applyTheme)

      return () => {
        systemTheme.removeEventListener('change', applyTheme)
      }
    }
  }, [preferences.theme])

  function updatePreference(key, value) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function clearCollections() {
    const confirmed = window.confirm(
      'Are you sure you want to delete all your collections? Your uploaded PDF textbooks will remain safe.'
    )

    if (!confirmed) return

    localStorage.removeItem('learnai.collections')
    setSaveMessage('All collections have been cleared.')
  }

  function resetPreferences() {
    const confirmed = window.confirm(
      'Reset your appearance and learning preferences?'
    )

    if (!confirmed) return

    setPreferences({
      theme: 'light',
      responseStyle: 'balanced',
      answerLength: 'medium',
    })

    setSaveMessage('Preferences have been reset.')
  }

  return (
    <div className="settings-page">
      <header className="settings-page-heading">
        <span className="settings-eyebrow">
          PERSONALIZE YOUR EXPERIENCE
        </span>
        <h1>Settings</h1>
        <p>Manage your profile, appearance and learning preferences.</p>
      </header>

      {saveMessage && (
        <div className="settings-message">
          {saveMessage}
          <button
            type="button"
            onClick={() => setSaveMessage('')}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Profile */}
      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">♙</div>
          <div>
            <h2>Profile</h2>
            <p>Manage your personal information.</p>
          </div>
        </div>

        <div className="settings-fields">
          <label className="settings-field">
            <span>Display name</span>
            <input
              type="text"
              value={profile.name}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Enter your name"
            />
          </label>

          <label className="settings-field">
            <span>Email address</span>
            <input
              type="email"
              value={profile.email}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="Enter your email"
            />
          </label>
        </div>
      </section>

      {/* Appearance */}
      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">◐</div>
          <div>
            <h2>Appearance</h2>
            <p>Choose how LearnAI looks on your device.</p>
          </div>
        </div>

        <div className="settings-option">
          <div>
            <strong>Interface theme</strong>
            <p>Select your preferred application theme.</p>
          </div>

          <select
            value={preferences.theme}
            onChange={(event) =>
              updatePreference('theme', event.target.value)
            }
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System default</option>
          </select>
        </div>
      </section>

      {/* Learning preferences */}
      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">✦</div>
          <div>
            <h2>Learning preferences</h2>
            <p>Customize how your AI learning assistant responds.</p>
          </div>
        </div>

        <div className="settings-option">
          <div>
            <strong>Response style</strong>
            <p>Choose the explanation style you prefer.</p>
          </div>

          <select
            value={preferences.responseStyle}
            onChange={(event) =>
              updatePreference('responseStyle', event.target.value)
            }
          >
            <option value="simple">Simple and beginner-friendly</option>
            <option value="balanced">Balanced explanations</option>
            <option value="detailed">Detailed and technical</option>
          </select>
        </div>

        <div className="settings-option">
          <div>
            <strong>Answer length</strong>
            <p>Choose the usual length of AI answers.</p>
          </div>

          <select
            value={preferences.answerLength}
            onChange={(event) =>
              updatePreference('answerLength', event.target.value)
            }
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>
      </section>

      {/* Library and data */}
      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-section-icon">▤</div>
          <div>
            <h2>Library and data</h2>
            <p>Manage your locally saved learning information.</p>
          </div>
        </div>

        <div className="settings-option">
          <div>
            <strong>Clear all collections</strong>
            <p>
              Delete your collections without deleting uploaded textbooks.
            </p>
          </div>

          <button
            type="button"
            className="settings-danger-button"
            onClick={clearCollections}
          >
            Clear collections
          </button>
        </div>

        <div className="settings-option">
          <div>
            <strong>Reset preferences</strong>
            <p>Restore appearance and learning settings to defaults.</p>
          </div>

          <button
            type="button"
            className="settings-secondary-button"
            onClick={resetPreferences}
          >
            Reset
          </button>
        </div>
      </section>

      {/* About */}
      <section className="settings-section settings-about">
        <div className="settings-section-heading">
          <div className="settings-section-icon">ⓘ</div>
          <div>
            <h2>About LearnAI</h2>
            <p>Information about your learning platform.</p>
          </div>
        </div>

        <div className="settings-about-details">
          <div>
            <span>Application</span>
            <strong>LearnAI</strong>
          </div>
          <div>
            <span>Version</span>
            <strong>1.0.0</strong>
          </div>
          <div>
            <span>Platform</span>
            <strong>AI-powered learning assistant</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Settings
