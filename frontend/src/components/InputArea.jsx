import React, { useState } from 'react';
import axios from 'axios';

function InputArea({ context, chatHistory, setChatHistory, setIsLoading, isLoading }) {
  const [query, setQuery] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!query.trim() || !context.disease.trim()) {
      alert("Please enter both a disease context and a query.");
      return;
    }

    // Instantly add user message to the UI
    const newChat = [...chatHistory, { role: 'user', content: query }];
    setChatHistory(newChat);
    setQuery('');
    setIsLoading(true);

    try {
      // Log the data to your browser console so you can see what is being sent
      console.log("Sending to Backend:", { query, disease: context.disease });

      const response = await axios.post('http://127.0.0.1:8000/api/research', {
        query: query.trim(),
        disease: context.disease.trim(), 
        location: context.location ? context.location.trim() : null
      });

      // Add the AI's response to the UI
      setChatHistory([...newChat, {
        role: 'assistant',
        content: response.data.structured_response,
        sources: response.data.sources_used
      }]);
    } catch (error) {
      console.error("API Error:", error);
      setChatHistory([...newChat, {
        role: 'assistant',
        content: "Error: Could not connect to the Curalink AI Engine. Please check your backend."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="input-area" onSubmit={handleSendMessage}>
      <input
        type="text"
        placeholder="Ask about treatments, side effects, or clinical trials..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading || !query.trim()}>
        {isLoading ? 'Wait...' : 'Send'}
      </button>
    </form>
  );
}

export default InputArea;