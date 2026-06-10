import React, { useState, useEffect } from 'react';
import axios from 'axios';

function InputArea({
  context,
  chatHistory,
  setChatHistory,
  setIsLoading,
  isLoading,
  setPipelineSteps,
  activeSearchId,
  setActiveSearchId,
  setSearchHistory,
  query,
  setQuery,
}) {
  const [useRemote, setUseRemote] = useState(() => {
    const saved = localStorage.getItem('useRemoteBackend');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('useRemoteBackend', useRemote);
  }, [useRemote]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!query.trim() || !context.disease.trim()) {
      alert('Please enter both a disease context and a query.');
      return;
    }

    const currentQuery = query.trim();
    setQuery('');
    setIsLoading(true);

    // Reset pipeline steps
    setPipelineSteps({
      queryExpansion: 'active',
      clinicalTrials: 'pending',
      pubmed: 'pending',
      openalex: 'pending',
      synthesis: 'pending',
    });

    // Add user message to UI
    const newUserMessage = { role: 'user', content: currentQuery };
    const updatedChat = [...chatHistory, newUserMessage];
    setChatHistory(updatedChat);

    // Simulate step progress milestones
    const stepTimer1 = setTimeout(() => {
      setPipelineSteps((prev) => ({
        ...prev,
        queryExpansion: 'completed',
        clinicalTrials: 'active',
        pubmed: 'active',
        openalex: 'active',
      }));
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setPipelineSteps((prev) => ({
        ...prev,
        clinicalTrials: 'completed',
        pubmed: 'completed',
        openalex: 'completed',
        synthesis: 'active',
      }));
    }, 5500);

    try {
      const apiBase = useRemote
        ? 'https://curalink-kg7p.onrender.com'
        : (import.meta.env.VITE_API_BASE || 'http://localhost:8000');
      const endpoint = `${apiBase}/api/research`;

      console.log(`Sending query to ${endpoint}:`, {
        query: currentQuery,
        disease: context.disease,
        location: context.location,
      });

      const response = await axios.post(endpoint, {
        query: currentQuery,
        disease: context.disease.trim(),
        location: context.location ? context.location.trim() : null,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      // Set all steps to completed
      setPipelineSteps({
        queryExpansion: 'completed',
        clinicalTrials: 'completed',
        pubmed: 'completed',
        openalex: 'completed',
        synthesis: 'completed',
      });

      const newAssistantMessage = {
        role: 'assistant',
        content: response.data.structured_response,
        sources: response.data.sources_used || [],
      };

      const finalChat = [...updatedChat, newAssistantMessage];
      setChatHistory(finalChat);

      // Save or update search history session
      if (activeSearchId) {
        setSearchHistory((prev) =>
          prev.map((item) =>
            item.id === activeSearchId
              ? { ...item, context: { ...context }, chatHistory: finalChat }
              : item
          )
        );
      } else {
        const newId = Date.now();
        const newSession = {
          id: newId,
          context: { ...context },
          chatHistory: finalChat,
        };
        setSearchHistory((prev) => [newSession, ...prev]);
        setActiveSearchId(newId);
      }
    } catch (error) {
      console.error('API Error details:', error);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setPipelineSteps({
        queryExpansion: 'completed',
        clinicalTrials: 'completed',
        pubmed: 'completed',
        openalex: 'completed',
        synthesis: 'completed',
      });

      const errorMsg =
        error.code === 'ERR_NETWORK'
          ? `Could not connect to the backend at ${useRemote ? 'Render' : 'localhost:8000'}. Make sure your Python backend is running (run.bat) or toggle 'Remote Backend'.`
          : 'Error: Could not retrieve research from medical APIs. Please try again.';

      setChatHistory([
        ...updatedChat,
        {
          role: 'assistant',
          content: `❌ **Connection Failure**\n\n${errorMsg}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="input-area-wrapper">
      <form className="input-area" onSubmit={handleSendMessage}>
        <button
          type="button"
          onClick={() => setUseRemote(!useRemote)}
          className="theme-toggle-btn"
          style={{
            flex: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            border: '1px solid var(--border-color)',
            background: useRemote ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
            color: useRemote ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
          }}
          title={useRemote ? 'Using Remote Server (Slow)' : 'Using Local Server (Fast)'}
        >
          {useRemote ? '🌐 Remote' : '🔌 Local'}
        </button>

        <input
          type="text"
          placeholder={
            !context.disease.trim()
              ? '⚠️ Set Disease Context on the right first...'
              : 'Ask about treatments, side effects, or clinical trials...'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading || !context.disease.trim()}
        />

        <button
          type="submit"
          className="send-button"
          disabled={isLoading || !query.trim() || !context.disease.trim()}
          title="Send Query"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default InputArea;