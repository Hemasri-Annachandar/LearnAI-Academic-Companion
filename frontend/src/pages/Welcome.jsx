
import { Link } from 'react-router-dom'

function Welcome() {
  return (
    <div className="welcome-overlay welcome-entrance">
      <div className="welcome-glow"></div>

      <header className="welcome-nav-container welcome-nav-enter">
        <div className="welcome-nav-pill">
          <Link to="/" className="welcome-brand">
            <span className="welcome-brand-dot">✦</span>
            <span>LearnAI</span>
            <span className="welcome-brand-badge">AI</span>
          </Link>

          <Link to="/dashboard" className="welcome-nav-btn">
            Get Started
          </Link>
        </div>
      </header>

      <main className="welcome-hero">
        <div className="welcome-announcement welcome-item-enter">
          <span className="welcome-badge-dot"></span>
          <span className="welcome-announcement-text">
            Your personal AI-powered learning assistant
          </span>
        </div>

        <h1 className="welcome-title welcome-title-enter">
          Learn smarter.
          <br />
          Learn with confidence.
        </h1>

        <p className="welcome-subtitle welcome-subtitle-enter">
          Transform your textbooks into an interactive learning experience.
          Ask questions, understand difficult concepts, and create personalized
          lesson plans with AI.
        </p>

        <div className="welcome-cta-group welcome-button-enter">
          <Link to="/dashboard" className="welcome-btn-primary">
            Get Started <span>→</span>
          </Link>
        </div>
      </main>

      <footer className="welcome-footer welcome-footer-enter">
        <p>LearnAI — Intelligent Learning Assistant</p>
      </footer>
    </div>
  )
}

export default Welcome
