export function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(45, 55, 72, 0.95)',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid var(--color-accent)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid var(--color-primary)',
        borderTop: '3px solid var(--color-accent)',
        borderRadius: '50%',
        animation: 'studysync-spin 1s linear infinite'
      }} />
      <span style={{
        color: 'var(--color-primary)',
        fontWeight: 600,
        fontSize: '1em',
        letterSpacing: '0.04em'
      }}>
        Loading...
      </span>
      <style>
        {`
          @keyframes studysync-spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}