import React from 'react';

function Sidebar({ context, setContext }) {
  return (
    <div className="sidebar">
      <h1>Curalink Engine</h1>
      <p>AI Medical Research Assistant</p>

      <div className="input-group">
        <label>Patient Name</label>
        <input
          type="text"
          placeholder="e.g., John Smith"
          value={context.name}
          onChange={(e) => setContext({ ...context, name: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label>Disease Context (Required) *</label>
        <input
          type="text"
          placeholder="e.g., Parkinson's disease"
          value={context.disease}
          onChange={(e) => setContext({ ...context, disease: e.target.value })}
        />
      </div>

      <div className="input-group">
        <label>Location (Optional)</label>
        <input
          type="text"
          placeholder="e.g., Toronto, Canada"
          value={context.location}
          onChange={(e) => setContext({ ...context, location: e.target.value })}
        />
      </div>
    </div>
  );
}

export default Sidebar;