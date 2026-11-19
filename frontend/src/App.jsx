
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { AnimatePresence } from 'framer-motion'

import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'

import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import Textbooks from './pages/Textbooks'
import Settings from './pages/Settings'
import Search from './pages/Search'
import TextbookWorkspace from './pages/TextbookWorkspace'

import './App.css'

function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition type="welcome">
              <Welcome />
            </PageTransition>
          }
        />

        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <PageTransition type="dashboard">
                <Dashboard />
              </PageTransition>
            }
          />

          <Route
            path="/library"
            element={
              <PageTransition>
                <Textbooks />
              </PageTransition>
            }
          />

          <Route
            path="/search"
            element={
              <PageTransition>
                <Search />
              </PageTransition>
            }
          />

          <Route
            path="/settings"
            element={
              <PageTransition>
                <Settings />
              </PageTransition>
            }
          />

          <Route
            path="/textbook/:fileId"
            element={
              <PageTransition>
                <TextbookWorkspace />
              </PageTransition>
            }
          />

          <Route
            path="/collection/:collectionId"
            element={
              <PageTransition>
                <TextbookWorkspace />
              </PageTransition>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
