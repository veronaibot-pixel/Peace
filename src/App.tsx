import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import MyWords from './pages/MyWords'
import Session from './pages/Session'
import Settings from './pages/Settings'
import Statistics from './pages/Statistics'
import PetOverlay from './pages/PetOverlay'
import Sidebar from './components/layout/Sidebar'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pet overlay window - separate route */}
        <Route path="/pet" element={<PetOverlay />} />

        {/* Main app window */}
        <Route
          path="/*"
          element={
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/my-words" element={<MyWords />} />
                  <Route path="/session" element={<Session />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/statistics" element={<Statistics />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
