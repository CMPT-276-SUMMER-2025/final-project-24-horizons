function AISuggestions() {
  return (
    <>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '12px' }}>🤖 AI Suggestions</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="widget-row">Suggestion 1 ...</div>
        <div className="widget-row">Suggestion 2 ...</div>
        <div className="widget-row">Suggestion 3 ...</div>
      </div>
    </>
  );
}

export default AISuggestions;