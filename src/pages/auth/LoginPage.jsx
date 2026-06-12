import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const METRICS = [
  { valor: '4.2x', label: 'ROAS PROMEDIO' },
  { valor: '$1.2M', label: 'BAJO GESTIÓN' },
  { valor: '8',    label: 'CAMPAÑAS ACTIVAS' },
  { valor: '3',    label: 'CLIENTES ACTIVOS' },
];

const CLIENTS = [
  'La Torres · E-commerce',
  'Palma y Marroquín · Inmobiliaria',
  'Tecnolibres · Tech',
  'Cliente EJE · Branding',
  'La Torres · E-commerce',
  'Palma y Marroquín · Inmobiliaria',
  'Tecnolibres · Tech',
  'Cliente EJE · Branding',
];

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError('Email o contraseña incorrectos.');
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '100vh',
      padding: '40px',
      background: '#F5F3EE',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>

      {/* Watermark */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        left: '-10px',
        fontSize: '200px',
        fontWeight: '800',
        color: '#000',
        opacity: 0.04,
        lineHeight: 1,
        letterSpacing: '-8px',
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        EJE
      </div>

      {/* ── Parte superior ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '24px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Columna izquierda */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '11px',
            color: '#888',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#DC5F1E', display: 'inline-block', flexShrink: 0 }} />
            EJE MARKETING STUDIO · Portal clientes
          </div>

          <h1 style={{
            fontSize: '56px',
            fontWeight: '800',
            lineHeight: 1.05,
            letterSpacing: '-2px',
            color: '#1a1a1a',
            margin: '0 0 24px 0',
          }}>
            Donde el<br />crecimiento<br />encuentra<br />
            <span style={{ color: '#DC5F1E' }}>dirección.</span>
          </h1>

          <div style={{
            borderLeft: '3px solid #DC5F1E',
            paddingLeft: '10px',
            fontSize: '13px',
            color: '#888',
            fontStyle: 'italic',
          }}>
            — El crecimiento necesita dirección.
          </div>
        </div>

        {/* Columna derecha — card formulario */}
        <div style={{
          width: '240px',
          flexShrink: 0,
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #ebe8e2',
          padding: '28px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
        }}>

          {/* Ícono usuario */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: '#fff0e8',
              borderRadius: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3" stroke="#DC5F1E" strokeWidth="1.5" />
                <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#DC5F1E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '15px', fontWeight: '800', color: '#1a1a1a', marginBottom: '4px' }}>
            EJE
          </div>
          <div style={{ textAlign: 'center', fontSize: '10px', color: '#aaa', marginBottom: '20px', lineHeight: 1.5 }}>
            Ingresá a tu portal · Acceso exclusivo para clientes
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ fontSize: '11px', color: '#c0392b', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', padding: '8px 10px', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#e8956a' : '#DC5F1E',
                color: '#fff',
                border: 'none',
                borderRadius: '7px',
                padding: '11px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                marginTop: '4px',
                transition: 'background 0.12s ease',
              }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '9px', color: '#ccc', marginTop: '14px', letterSpacing: '0.04em' }}>
            Portal seguro · EJE Marketing Studio
          </div>
        </div>
      </div>

      {/* ── Parte inferior ── */}
      <div style={{ marginTop: 'auto', paddingTop: '48px', position: 'relative', zIndex: 1 }}>

        {/* Métricas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {METRICS.map((m, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1px solid #ebe8e2',
              borderRadius: '12px',
              padding: '16px 14px',
            }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a' }}>{m.valor}</div>
              <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#DC5F1E', marginTop: '2px' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Ticker */}
        <div style={{ borderTop: '1px solid #e8e6e0', paddingTop: '14px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '48px', animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
            {CLIENTS.map((c, i) => (
              <span key={i} style={{ fontSize: '14px', color: '#999', letterSpacing: '0.04em' }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '9px',
  fontWeight: '600',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#aaa',
  marginBottom: '4px',
  fontFamily: 'Inter, sans-serif',
};

const inputStyle = {
  width: '100%',
  padding: '9px 11px',
  border: '1px solid #e8e6e0',
  borderRadius: '7px',
  fontSize: '12px',
  outline: 'none',
  background: '#fafaf9',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
  color: '#1a1a1a',
};
