import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import HomePage from "./Home";
import AboutPage from "./About";
import CountdownPage from "./Countdown";
import "./App.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      {/* 漢堡按鈕 */}
      <button
        className={`hamburger-btn ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={sidebarOpen}
      >
        <span className="hamburger-line line1"></span>
        <span className="hamburger-line line2"></span>
        <span className="hamburger-line line3"></span>
      </button>

      {/* 側邊欄 */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
          <NavLink
            to="/countdown"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Countdown
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            About
          </NavLink>
        </nav>
      </aside>

      {/* 遮罩層 */}
      {sidebarOpen && (
        <div
          className="backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 主內容 */}
      <main className={`page-content ${sidebarOpen ? "shifted" : ""}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/countdown" element={<CountdownPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
