import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

function ChatHistory({ chatHistory, isLoading, pipelineSteps, onSelectSuggestion }) {
  const messagesEndRef = useRef(null);

  // Automatically scroll to bottom when history updates or loading status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const suggestions = [
    {
      disease: "Parkinson's Disease",
      query: "Latest clinical trials and treatments for motor symptoms",
      title: "Parkinson's Trials",
      desc: "Search for active recruiting clinical trials on motor symptoms."
    },
    {
      disease: "Type 2 Diabetes",
      query: "Efficacy of GLP-1 agonists vs SGLT2 inhibitors",
      title: "Diabetes Care",
      desc: "Compare pharmacological efficacy in recent academic papers."
    },
    {
      disease: "Breast Cancer",
      query: "Immunotherapy combination protocols and survival rates",
      title: "Cancer Immunotherapy",
      desc: "Retrieve recent oncology research from PubMed & OpenAlex."
    },
    {
      disease: "Alzheimer's Disease",
      query: "Monoclonal antibodies side effects and cognitive decline rates",
      title: "Alzheimer's Research",
      desc: "Analyze cognitive decline outcomes and safety profiles."
    }
  ];

  // Helper to format citations in markdown e.g. [1] -> [1](#source-1)
  const preprocessMarkdown = (text) => {
    if (!text) return '';
    return text.replace(/\[([0-9]+)\]/g, '[$1](#source-$1)');
  };

  return (
    <div className="chat-history">
      {chatHistory.length === 0 ? (
        <div className="welcome-screen">
          <div className="welcome-logo">C</div>
          <h2>CuraLink Engine</h2>
          <p className="lead">
            An advanced AI workspace synthesizing real-time data from PubMed, ClinicalTrials.gov, and OpenAlex.
          </p>
          <div style={{ width: '100%' }}>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
              Select a Quick Investigation Template
            </p>
            <div className="suggestions-grid">
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="suggestion-card"
                  onClick={() => onSelectSuggestion(sug.disease, sug.query)}
                >
                  <h4>{sug.title}</h4>
                  <p>{sug.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`chat-message-row ${msg.role === 'user' ? 'user' : 'ai'}`}
          >
            <div className="chat-bubble">
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <ReactMarkdown
                  components={{
                    a: (props) => {
                      const isCitation = props.href?.startsWith('#source-');
                      if (isCitation) {
                        return (
                          <a
                            className="citation-capsule"
                            href={props.href}
                            title="Jump to reference"
                          >
                            {props.children}
                          </a>
                        );
                      }
                      const rest = { ...props };
                      delete rest.node;
                      return <a target="_blank" rel="noopener noreferrer" {...rest} />;
                    }
                  }}
                >
                  {preprocessMarkdown(msg.content)}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))
      )}

      {isLoading && (
        <div className="chat-message-row ai">
          <div className="pipeline-stepper">
            <div className="stepper-header">
              <span className="pulsing-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'pulseGlow 1.5s infinite' }}></span>
              <span>Retrieval & Analysis Pipeline</span>
            </div>
            <div className="stepper-list">
              <div className={`step-item ${pipelineSteps.queryExpansion}`}>
                <div className="step-indicator">1</div>
                <span>Query Expansion & Extraction</span>
              </div>
              <div className={`step-item ${pipelineSteps.clinicalTrials}`}>
                <div className="step-indicator">2</div>
                <span>ClinicalTrials.gov Studies</span>
              </div>
              <div className={`step-item ${pipelineSteps.pubmed}`}>
                <div className="step-indicator">3</div>
                <span>PubMed E-utilities Search</span>
              </div>
              <div className={`step-item ${pipelineSteps.openalex}`}>
                <div className="step-indicator">4</div>
                <span>OpenAlex Works Discovery</span>
              </div>
              <div className={`step-item ${pipelineSteps.synthesis}`}>
                <div className="step-indicator">5</div>
                <span>Medical LLM Synthesis (Groq)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="chat-spacer" ref={messagesEndRef} />
    </div>
  );
}

export default ChatHistory;