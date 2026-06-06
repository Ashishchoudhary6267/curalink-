import React from 'react';

function ContextPanel({ context, setContext, sources }) {
  return (
    <div className="context-panel">
      <div className="context-header">
        <h3>📋 Patient Profile</h3>
      </div>

      <div className="patient-card">
        <div className="patient-card-header">
          <span>Patient Context</span>
        </div>
        <div className="patient-fields">
          <div>
            <label className="patient-field-label">Patient Name</label>
            <input
              type="text"
              className="patient-input-interactive"
              placeholder="e.g., John Smith"
              value={context.name}
              onChange={(e) => setContext({ ...context, name: e.target.value })}
            />
          </div>
          <div>
            <label className="patient-field-label">Disease Context *</label>
            <input
              type="text"
              className="patient-input-interactive"
              placeholder="e.g., Parkinson's disease"
              value={context.disease}
              onChange={(e) => setContext({ ...context, disease: e.target.value })}
            />
          </div>
          <div>
            <label className="patient-field-label">Location (Optional)</label>
            <input
              type="text"
              className="patient-input-interactive"
              placeholder="e.g., Toronto, Canada"
              value={context.location}
              onChange={(e) => setContext({ ...context, location: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="sources-panel-section">
        <h4 className="sources-section-title">🔍 Sources Used ({sources.length})</h4>
        <div className="sources-scroll-list">
          {sources.length === 0 ? (
            <p className="no-sources-placeholder">
              No sources retrieved yet. Submit a research query to view citations.
            </p>
          ) : (
            sources.map((src, index) => {
              const sourceClass = src.source?.toLowerCase().replace(/\s+/g, '') || '';
              return (
                <a
                  key={index}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-card-interactive"
                >
                  <div className="source-badge-row">
                    <span className={`source-badge ${sourceClass}`}>
                      {src.source || 'Reference'}
                    </span>
                    <span className="source-year">{src.year || 'N/A'}</span>
                  </div>
                  <h5 className="source-card-title">{src.title}</h5>
                  {src.authors && src.authors.length > 0 && (
                    <span className="source-card-author">
                      👤 {src.authors.slice(0, 2).join(', ')}
                      {src.authors.length > 2 ? ' et al.' : ''}
                    </span>
                  )}
                  {src.status && (
                    <span className="source-card-author">
                      🟢 Status: {src.status}
                    </span>
                  )}
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default ContextPanel;
