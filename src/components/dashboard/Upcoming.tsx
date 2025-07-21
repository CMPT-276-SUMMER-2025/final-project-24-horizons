function Upcoming() {
  return (
    <>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '12px' }}>⏳ Upcoming</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="widget-row">Dentist appointment</div>
        <div className="widget-row">Math final</div>
        <div className="widget-row">Mother's day</div>
        <div className="widget-row">Renew insurance</div>
      </div>
    </>
  );
}

export default Upcoming;