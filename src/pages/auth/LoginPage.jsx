import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const PHRASES = [
  'El crecimiento necesita dirección.',
  'Antes de crecer, hay que alinearse.',
  'EJE no acelera. Alinea.',
  'Ordenar es una decisión estratégica.',
  'Crecemos con estructura, no por inercia.',
];

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
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % PHRASES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError('Email o contraseña incorrectos.');
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
    }}>

      {/* ── Panel izquierdo ── */}
      <div style={{
        flex: 1,
        background: '#F7F6F2',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Watermark */}
        <div style={{
          position: 'absolute',
          bottom: '-40px',
          left: '-20px',
          fontSize: '220px',
          fontWeight: '800',
          color: 'rgba(0,0,0,0.04)',
          letterSpacing: '-10px',
          userSelect: 'none',
          lineHeight: 1,
          pointerEvents: 'none',
        }}>
          EJE
        </div>

        {/* Marca */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC5F1E' }} />
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
              EJE Marketing Studio · Portal clientes
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
            Tu espacio exclusivo para seguir el crecimiento de tu marca.
          </div>
        </div>

        {/* Título */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{
            fontSize: '72px',
            fontWeight: '800',
            lineHeight: 1.05,
            letterSpacing: '-3px',
            color: '#1a1a1a',
            margin: '0 0 24px 0',
          }}>
            Donde el<br />crecimiento<br />encuentra<br />
            <span style={{ color: '#DC5F1E' }}>dirección.</span>
          </h1>

          {/* Frase rotativa */}
          <div style={{
            fontSize: '13px',
            color: '#888',
            fontStyle: 'italic',
            borderLeft: '2px solid #DC5F1E',
            paddingLeft: '12px',
            minHeight: '20px',
          }}>
            — {PHRASES[phraseIdx]}
          </div>

          {/* Métricas */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
            {METRICS.map((m, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid #e8e6e0',
                borderRadius: '12px',
                padding: '12px 16px',
              }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>{m.valor}</div>
                <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#DC5F1E' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticker */}
        <div style={{ overflow: 'hidden', borderTop: '1px solid #e8e6e0', paddingTop: '16px', marginTop: '32px' }}>
          <div style={{ display: 'flex', gap: '48px', animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
            {CLIENTS.map((c, i) => (
              <span key={i} style={{ fontSize: '11px', color: '#999', letterSpacing: '0.06em' }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel derecho ── */}
      <div style={{
        width: '380px',
        minWidth: '340px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px',
        borderLeft: '1px solid #e8e6e0',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '3px', height: '24px', background: '#DC5F1E', borderRadius: '2px' }} />
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', letterSpacing: '0.1em' }}>EJE</span>
        </div>
        <div style={{ fontSize: '11px', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '32px' }}>
          Portal clientes
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0' }}>
          Ingresá a tu portal
        </h2>
        <p style={{ fontSize: '13px', color: '#888', margin: '0 0 32px 0' }}>
          Acceso exclusivo para clientes
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              required
              autoComplete="email"
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e8e6e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fafaf9', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '6px' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e8e6e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fafaf9', fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {error && (
            <div style={{ fontSize: '13px', color: '#c0392b', background: 'rgba(192,57,43,0.08)', border: '1px solid #C0392B', padding: '10px 14px', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? '#e8956a' : '#DC5F1E', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', fontFamily: 'Inter, sans-serif', transition: 'background 0.12s ease' }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '11px', color: '#bbb' }}>
          Portal seguro · EJE Marketing Studio
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
