import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import Settings from './components/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar with QuantaFolio Logo */}
        <nav className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 shadow-xl border-b-2 border-cyan-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              
              {/* Logo Section */}
              <Link to="/" className="flex items-center space-x-4 group">
                <img 
                  src="/quantafolio-logo.png" 
                  alt="QuantaFolio Logo" 
                  className="h-14 w-14 object-contain transition-transform group-hover:scale-110"
                />
                <div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    QuantaFolio
                  </h1>
                  <p className="text-xs text-cyan-300 tracking-[0.3em] font-light">
                    NAVIGATOR
                  </p>
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="flex space-x-6">
                <Link 
                  to="/dashboard" 
                  className="text-white hover:text-cyan-400 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium flex items-center gap-2"
                >
                  <span className="text-lg">📊</span>
                  Dashboard
                </Link>
                <Link 
                  to="/chatbot" 
                  className="text-white hover:text-cyan-400 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium flex items-center gap-2"
                >
                  <span className="text-lg">💬</span>
                  Chatbot
                </Link>
                <Link 
                  to="/settings" 
                  className="text-white hover:text-cyan-400 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium flex items-center gap-2"
                >
                  <span className="text-lg">⚙️</span>
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-6 mt-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm">
              © 2025 QuantaFolio Navigator - Quantum Portfolio Optimization
            </p>
            <p className="text-xs mt-2 text-cyan-500">
              Powered by Quantum Computing & AI
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;