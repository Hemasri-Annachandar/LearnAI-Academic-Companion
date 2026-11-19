function WelcomeBanner({ onGoToHome, onExploreTextbooks }) {
  return (
    <div className="welcome-overlay">
      
      {/* Centered Ambient Radial Glow */}
      <div className="welcome-glow"></div>

      {/* Floating Centered Pill Navigation */}
      <header className="welcome-nav-container">
        <div className="welcome-nav-pill">
          
          <div className="welcome-brand">
            <div className="welcome-brand-dot"></div>
            <span>LearnAI</span>
            <span className="welcome-brand-badge">Workspace</span>
          </div>

          <button 
            type="button"
            onClick={onGoToHome}
            className="welcome-nav-btn"
          >
            Go to Home Page →
          </button>

        </div>
      </header>

      {/* Perfectly Centered Hero */}
      <main className="welcome-hero">
        
        <div className="welcome-announcement">
          <span className="welcome-badge-pill">
            <span className="welcome-badge-dot"></span>
            Welcome
          </span>
          <span className="welcome-announcement-text">Intelligent Learning Assistant</span>
        </div>

        <h1 className="welcome-title">
          Learn smarter <br /> with AI.
        </h1>

        <p className="welcome-subtitle">
          Your personal intelligent learning workspace. Explore textbooks, understand complex concepts, and create personalized learning experiences.
        </p>

        <div className="welcome-cta-group">
          <button
            type="button"
            onClick={onGoToHome}
            className="welcome-btn-primary"
          >
            <span>Go to Home Page</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={onExploreTextbooks}
            className="welcome-btn-secondary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Explore Textbooks</span>
          </button>
        </div>

      </main>

      {/* Centered Footer */}
      <footer className="welcome-footer">
        <p>LearnAI · Intelligent Learning Workspace</p>
      </footer>

    </div>
  )
}

export default WelcomeBanner

