import React from 'react';
import ReactMarkdown from 'react-markdown';

function ChatHistory({ chatHistory, isLoading }) {
  return (
    <div className="chat-history">
      {chatHistory.length === 0 ? (
        <div className="message ai">
          <h3>Welcome to Curalink</h3>
          <p>Set the patient context on the left, then ask a medical question.</p>
          <p><em>Example: "Latest treatment for lung cancer"</em></p>
        </div>
      ) : (
        chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
            {msg.role === 'user' ? (
              msg.content
            ) : (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            )}
          </div>
        ))
      )}

      {isLoading && (
        <div className="message ai">
          <em>Curalink is researching APIs... (This takes 10-15 seconds)</em>
        </div>
      )}
    </div>
  );
}

export default ChatHistory;