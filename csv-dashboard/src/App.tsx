import React from "react";
import { Routes, Route, Link, NavLink } from "react-router-dom";
import Home from "./pages/home";
import Upload from "./pages/upload";
import Dashboard from "./pages/dashboard";
import { FileText } from "lucide-react";

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo/Branding */}
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-400 mr-2" />
              <Link to="/" className="text-xl font-bold tracking-tight">
                CSV Dashboard
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-300 hover:text-white"
                  }`
                }
                aria-label="Home page"
              >
                Home
              </NavLink>
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-300 hover:text-white"
                  }`
                }
                aria-label="Upload page"
              >
                Upload
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-blue-400 border-b-2 border-blue-400"
                      : "text-gray-300 hover:text-white"
                  }`
                }
                aria-label="Dashboard page"
              >
                Dashboard
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} CSV Dashboard. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Built with <span className="text-red-400">&hearts;</span> by Akshaya
        </p>
      </footer>
    </div>
  );
};

export default App;