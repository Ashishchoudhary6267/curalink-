import { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import './App.css'

function App() {
  // Medical Context State
  const [patientName, setPatientName] = useState('')
  const [disease, setDisease] = useState('')
  const [location, setLocation] = useState('')

  // Chat State
  const [query, setQuery] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!query.trim() || !disease.trim()) {
      alert("Please enter both a disease context and a query.")
      return
    }

    // Add user message to UI immediately
    const newChat = [...chatHistory, { role: 'user', content: query }]
    setChatHistory(newChat)
    setQuery('')
    setIsLoading(true)

    try {
      // Send data to your Python AI microservice
      const response = await axios.post('http://127.0.0.1:8000/api/research', {
        query: query,
        disease: disease,
        location: location || null
      })

      // Add AI response to UI
      setChatHistory([...newChat, {
        role: 'assistant',
        content: response.data.structured_response,
        sources: response.data.sources_used
      }])
    } catch (error) {
      console.error("API Error:", error)
      setChatHistory([...newChat, {
        role: 'assistant',
        content: "Error: Could not connect to the Curalink AI Engine. Please check your backend."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-container">
      {/* SIDEBAR: Medical Context */}
      <aside className="sidebar">
        <h2>Curalink Engine</h2>
        <p className="subtitle">AI Medical Research Assistant</p>
        
        <div className="context-form">
          <label>Patient Name</label>
          <input 
            type="text" 
            placeholder="e.g., John Smith" 
            value={patientName} 
            onChange={(e) => setPatientName(e.target.value)} 
          />

          <label>Disease Context (Required) *</label>
          <input 
            type="text" 
            placeholder="e.g., Parkinson's disease" 
            value={disease} 
            onChange={(e) => setDisease(e.target.value)} 
          />

          <label>Location (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g., Toronto, Canada" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
          />
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="chat-area">
        <div className="messages-container">
          {chatHistory.length === 0 ? (
            <div className="empty-state">
              <h3>Welcome to Curalink</h3>
              <p>Set the patient context on the left, then ask a medical question.</p>
              <p><em>Example: "Latest treatment for lung cancer"</em></p>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div className="message-bubble">
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="assistant-content">
                      {/* ReactMarkdown converts the LLM's ### into actual HTML headers */}
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble loading">
                Curalink is researching APIs... (This takes 10-15 seconds)
              </div>
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <form className="input-form" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            placeholder="Ask about treatments, side effects, or clinical trials..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !query.trim()}>
            {isLoading ? 'Researching...' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default App