export default function SplashScreen({ clientName, exiting }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#F7F6F2',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        animation: exiting ? 'splashOut 0.5s ease forwards' : 'splashIn 0.4s ease forwards',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '52px',
            fontWeight: '900',
            letterSpacing: '-2px',
            lineHeight: 1,
            animation: 'splashContentIn 0.7s ease 0.1s both',
          }}
        >
          <span style={{ color: '#1a1a1a' }}>EJE</span>
          <span style={{ color: '#d0cdc8', margin: '0 16px' }}>×</span>
          <span style={{ color: '#DC5F1E' }}>{clientName || '      '}</span>
        </div>
        <div
          style={{
            marginTop: '20px',
            fontSize: '14px',
            color: '#aaa',
            fontStyle: 'italic',
            letterSpacing: '0.02em',
            animation: 'splashContentIn 0.7s ease 0.25s both',
          }}
        >
          — El crecimiento necesita dirección.
        </div>
      </div>

      <style>{`
        @keyframes splashIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes splashOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes splashContentIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
