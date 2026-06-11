import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const frases = [
  'El crecimiento necesita dirección.',
  'EJE no acelera. Alinea.',
  'Ordenar es una decisión estratégica.',
  'Antes de crecer, hay que alinearse.',
  'Crecemos con estructura, no por suerte.',
];

const metricas = [
  { valor: '4.2x', label: 'ROAS promedio' },
  { valor: '$1.2M', label: 'Bajo gestión' },
  { valor: '8', label: 'Campañas activas' },
  { valor: '3', label: 'Clientes activos' },
];

const clientes = [
  'La Torres · E-commerce',
  'Palma y Marroquín · Inmobiliaria',
  'Tecnolibres · Tech',
  'La Torres · E-commerce',
  'Palma y Marroquín · Inmobiliaria',
  'Tecnolibres · Tech',
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fraseIdx, setFraseIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFraseIdx(i => (i + 1) % frases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Email o contraseña incorrectos.');
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      background: '#F7F6F2',
    }}>
      <div style={{
        flex: 1,
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
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
        }}>EJE</div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC5F1E' }} />
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
              EJE Marketing Studio
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
            El crecimiento necesita dirección.
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '48px' }}>
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
            fontSize: '13px',
            color: '#888',
            fontStyle: 'italic',
            borderLeft: '2px solid #DC5F1E',
            paddingLeft: '12px',
            minHeight: '20px',
          }}>
            — {frases[fraseIdx]}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
            {metricas.map((m, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid #e8e6e0',
                borderRadius: '12px',
                padding: '16px 14px',
              }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a1a' }}>{m.valor}</div>
                <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#DC5F1E' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ overflow: 'hidden', borderTop: '1px solid #e8e6e0', paddingTop: '14px', marginTop: '32px' }}>
          <div style={{ display: 'flex', gap: '48px', animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
            {clientes.map((c, i) => (
              <span key={i} style={{ fontSize: '14px', color: '#999', letterSpacing: '0.06em' }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

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
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '3px', height: '24px', background: '#DC5F1E', borderRadius: '2px' }} />
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>EJE</span>
        </div>
        <div style={{ fontSize: '11px', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '32px' }}>
          Portal de clientes
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0' }}>
          Ingresá a tu portal
        </h2>
        <p style={{ fontSize: '13px', color: '#888', margin: '0 0 32px 0' }}>
          Acceso exclusivo para clientes
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" required
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e8e6e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fafaf9' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '6px' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #e8e6e0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fafaf9' }} />
          </div>

          {error && (
            <div style={{ fontSize: '13px', color: '#c0392b', background: '#fdf0ef', padding: '10px 14px', borderRadius: '8px' }}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            style={{ background: '#DC5F1E', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '11px', color: '#bbb' }}>
          • Portal seguro · EJE Marketing Studio
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
