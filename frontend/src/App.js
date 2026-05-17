import { useState, useRef } from "react";
import "./App.css";

const suggestions = [
  "What is Agentic AI and how does it work?",
  "Latest breakthroughs in AI 2026",
  "How does LangGraph differ from LangChain?",
  "Future of large language models",
];

function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const abortRef = useRef(null);

  const handleResearch = async (q) => {
    const finalQuery = q || query;
    if (!finalQuery.trim()) return;
    setQuery(finalQuery);
    setLoading(true);
    setError("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("http://127.0.0.1:8000/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: finalQuery }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (data.status === "success") {
        setHistory((prev) => [
          { query: finalQuery, result: data.result, time: new Date().toLocaleTimeString() },
          ...prev,
        ]);
        setQuery("");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Search stopped.");
      } else {
        setError("Cannot connect to backend. Make sure it is running.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleResearch();
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <div className="logo-dot"></div>
          <span>ResearchAI</span>
        </div>
        <div className="nav-links">
          <a href="https://github.com/preethamurs" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/preethamurs" target="_blank" rel="noreferrer" className="nav-cta">Connect</a>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">
            {darkMode ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">Powered by LangChain · LangGraph · Groq</div>
        <h1 className="hero-title">
          Research anything.<br />
          <span className="gradient-text">Instantly.</span>
        </h1>
        <p className="hero-subtitle">
          An autonomous AI agent that searches the web, reasons through information,
          and delivers clear answers — in seconds.
        </p>

        {/* Search */}
        <div className="search-wrapper">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            {loading ? (
              <button className="stop-btn" onClick={handleStop}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
                Stop
              </button>
            ) : (
              <button className="search-btn" onClick={() => handleResearch()} disabled={!query.trim()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            )}
          </div>

          {/* Suggestions */}
          {history.length === 0 && !loading && (
            <div className="suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => handleResearch(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="loading-section">
          <div className="loading-card">
            <div className="pulse-ring"></div>
            <div className="loading-text">
              <p className="loading-title">Agent is thinking...</p>
              <p className="loading-sub">Searching the web and reasoning through results</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-section">
          <div className="error-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Chat History */}
      {history.length > 0 && (
        <section className="history-section">
          <div className="history-header">
            <span className="history-label">Research History</span>
            <button className="clear-btn" onClick={clearHistory}>Clear all</button>
          </div>
          {history.map((item, i) => (
            <div key={i} className="result-card">
              <div className="result-header">
                <div className="result-meta">
                  <div className="result-badge">Research Result</div>
                  <p className="result-query">"{item.query}"</p>
                </div>
                <span className="result-time">{item.time}</span>
              </div>
              <div className="result-divider"></div>
              <p className="result-text">{item.result}</p>
            </div>
          ))}
        </section>
      )}

      {/* Features */}
      {history.length === 0 && !loading && (
        <section className="features">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Web Search</h3>
            <p>Agent searches the live internet using Tavily to find the most current information</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Autonomous Reasoning</h3>
            <p>LangGraph orchestrates multi-step reasoning to synthesize accurate answers</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Frontier Models</h3>
            <p>Powered by LLaMA 3.1 via Groq — one of the fastest LLMs available</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Built by <a href="https://linkedin.com/in/preethamurs" target="_blank" rel="noreferrer">Preetham Urs</a></p>
      </footer>
    </div>
  );
}

export default App;