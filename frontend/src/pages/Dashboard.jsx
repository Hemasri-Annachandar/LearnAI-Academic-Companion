
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="home-dashboard">

      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">
            YOUR PERSONAL LEARNING SPACE
          </span>

          <h1>
            Learn something
            <br />
            <span>new every day.</span>
          </h1>

          <p>
            Bring your textbooks together, explore ideas with AI,
            and turn your study materials into meaningful knowledge.
          </p>

          <button
            type="button"
            className="home-primary-button"
            onClick={() => navigate('/library')}
          >
            Open my library
            <span>→</span>
          </button>
        </div>

        <div className="home-hero-art">
          <div className="home-book-shape">
            <span>✦</span>
          </div>
        </div>
      </section>

      <section className="home-start-section">
        <div className="home-section-heading">
          <div>
            <h2>Start your learning journey</h2>
            <p>Organize your learning materials in one place.</p>
          </div>
        </div>

        <div className="home-action-grid">

          <button
            type="button"
            className="home-action-card"
            onClick={() => navigate('/library')}
          >
            <span className="home-action-icon blue">
              <span>＋</span>
            </span>

            <span className="home-action-text">
              <strong>Add a textbook</strong>
              <small>Upload a PDF and start exploring it.</small>
            </span>

            <span className="home-action-arrow">→</span>
          </button>

          <button
            type="button"
            className="home-action-card"
            onClick={() => navigate('/library')}
          >
            <span className="home-action-icon purple">
              <span>▤</span>
            </span>

            <span className="home-action-text">
              <strong>Explore my library</strong>
              <small>Browse your textbooks and study materials.</small>
            </span>

            <span className="home-action-arrow">→</span>
          </button>

        </div>
      </section>

      <section className="home-recent-section">
        <div className="home-section-heading">
          <div>
            <h2>Continue learning</h2>
            <p>Return to your textbooks and learning workspaces.</p>
          </div>

          <button
            type="button"
            className="home-text-button"
            onClick={() => navigate('/library')}
          >
            View library →
          </button>
        </div>

        <div className="home-empty-state">
          <div className="home-empty-icon">📚</div>
          <h3>Your learning space starts here</h3>
          <p>
            Add your first textbook to begin asking questions,
            generating summaries and creating study materials.
          </p>

          <button
            type="button"
            onClick={() => navigate('/library')}
          >
            Add your first textbook
          </button>
        </div>
      </section>

    </div>
  )
}

export default Dashboard
