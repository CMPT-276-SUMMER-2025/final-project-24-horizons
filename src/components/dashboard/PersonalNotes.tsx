function PersonalNotes() {
  return (
    <>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '12px' }}>📝 Personal Notes</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="widget-row">This is a note ...</div>
        <div className="widget-row">This is another note ...</div>
        <div className="widget-row">Wow! A third note?! ...</div>
      </div>
    </>
  );
}

export default PersonalNotes;