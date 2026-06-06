import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({
  theme,
  setTheme,
  searchHistory,
  activeSearchId,
  onLoadHistory,
  onNewSearch,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">C</div>
        <h1>CuraLink Workspace</h1>
      </div>

      <button onClick={onNewSearch} className="new-search-btn">
        ➕ New Research Chat
      </button>

      <div className="history-section">
        <h3>Recent Investigations</h3>
        {searchHistory.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '0.5rem', fontStyle: 'italic' }}>
            No recent history.
          </p>
        ) : (
          <ul className="history-list">
            {searchHistory.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onLoadHistory(item.id)}
                  className={`history-item ${activeSearchId === item.id ? 'active' : ''}`}
                >
                  <span className="history-disease">{item.context.disease || 'General Query'}</span>
                  <span className="history-query">{item.context.name || 'Unnamed Patient'}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {user && (
        <div className="user-panel">
          <div className="user-info-brief">
            <div className="user-avatar">
              {user.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div>
              <p style={{ fontWeight: 600, wordBreak: 'break-all' }}>{user.email}</p>
            </div>
          </div>

          <div className="sidebar-controls">
            <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button onClick={handleLogout} className="logout-action-btn" title="Sign Out">
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;