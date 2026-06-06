import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatHistory from '../components/ChatHistory';
import InputArea from '../components/InputArea';
import ContextPanel from '../components/ContextPanel';
import '../App.css';

function Research() {
  // 1. Context & Chat Workspace States
  const [context, setContext] = useState({ name: '', disease: '', location: '' });
  const [chatHistory, setChatHistory] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Active Pipeline Steps for Visual Progress
  const [pipelineSteps, setPipelineSteps] = useState({
    queryExpansion: 'pending',
    clinicalTrials: 'pending',
    pubmed: 'pending',
    openalex: 'pending',
    synthesis: 'pending',
  });

  // 3. Search History Session States (Persisted in LocalStorage)
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('curalink_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSearchId, setActiveSearchId] = useState(null);

  // Sync Search History to LocalStorage
  useEffect(() => {
    localStorage.setItem('curalink_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  // 4. UI Theme States
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Synchronize document classes with theme state
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- Handlers ---

  // Initialize a fresh new search investigation
  const handleNewSearch = () => {
    setContext({ name: '', disease: '', location: '' });
    setChatHistory([]);
    setQuery('');
    setActiveSearchId(null);
    setPipelineSteps({
      queryExpansion: 'pending',
      clinicalTrials: 'pending',
      pubmed: 'pending',
      openalex: 'pending',
      synthesis: 'pending',
    });
  };

  // Load a saved search investigation session
  const handleLoadHistory = (id) => {
    const session = searchHistory.find((item) => item.id === id);
    if (session) {
      setContext(session.context);
      setChatHistory(session.chatHistory);
      setQuery('');
      setActiveSearchId(id);
    }
  };

  // Auto-complete fields when a suggestion card is selected
  const handleSelectSuggestion = (disease, suggestedQuery) => {
    setContext({
      name: 'Jane Doe',
      disease: disease,
      location: 'Boston, MA',
    });
    setQuery(suggestedQuery);
  };

  // Derive sources from the most recent assistant message in active session
  const activeSources =
    chatHistory
      .filter((msg) => msg.role === 'assistant' && msg.sources)
      .slice(-1)[0]?.sources || [];

  return (
    <div className="app-container">
      {/* Panel 1: Left Navigation & Session Logs */}
      <Sidebar
        theme={theme}
        setTheme={setTheme}
        searchHistory={searchHistory}
        activeSearchId={activeSearchId}
        onLoadHistory={handleLoadHistory}
        onNewSearch={handleNewSearch}
      />

      {/* Panel 2: Center Research Console */}
      <div className="chat-container">
        <ChatHistory
          chatHistory={chatHistory}
          isLoading={isLoading}
          pipelineSteps={pipelineSteps}
          onSelectSuggestion={handleSelectSuggestion}
        />

        <InputArea
          context={context}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
          setIsLoading={setIsLoading}
          isLoading={isLoading}
          setPipelineSteps={setPipelineSteps}
          activeSearchId={activeSearchId}
          setActiveSearchId={setActiveSearchId}
          searchHistory={searchHistory}
          setSearchHistory={setSearchHistory}
          query={query}
          setQuery={setQuery}
        />
      </div>

      {/* Panel 3: Right Patient & Source References Panel */}
      <ContextPanel
        context={context}
        setContext={setContext}
        sources={activeSources}
      />
    </div>
  );
}

export default Research;
