import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function formatFecha(fecha) {
  if (!fecha) return '—';
  const d = new Date(fecha + 'T00:00:00');
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export default function ContratoPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) { setLoading(false); return; }
    supabase
      .from('clients')
      .select('nombre, tipo_cliente, modelo_cobro, fecha_inicio, contrato_url')
      .eq('auth_user_id', session.user.id)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setClient(data);
        setLoading(false);
      });
  }, [session?.user?.id]);

  const handleLogout = async () => {
    sessionStorage.removeItem('eje_splash_shown');
    await supabase.auth.signOut();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e8e6e0',
        padding: '0 32px', height: '56px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '20px', background: '#DC5F1E', borderRadius: '2px' }} />
            <span style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>EJE</span>
            <span style={{ fontSize: '11px', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: '4px' }}>Portal</span>
          </div>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Pagos',     path: '/pagos' },
              { label: 'Contrato',  path: '/contrato' },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={navBtnStyle(path === '/contrato')}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#666' }}>{session?.user?.email}</span>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: '1px solid #e8e6e0', borderRadius: '6px',
            padding: '6px 12px', fontSize: '12px', color: '#666', cursor: 'pointer',
          }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0' }}>Mi contrato</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Condiciones y documentación de tu servicio.</p>
        </div>

        {loading && (
          <div style={{ background: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px', padding: '48px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid rgba(220,95,30,0.2)', borderTopColor: '#DC5F1E', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        )}

        {!loading && error && (
          <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px', color: '#b91c1c', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {!loading && !error && client && (
          <div style={{ background: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px', padding: '32px' }}>
            {/* Client name */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#DC5F1E', marginBottom: '6px' }}>
                Cliente
              </div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a' }}>{client.nombre}</div>
            </div>

            <div style={{ borderTop: '1px solid #f0ede8', marginBottom: '24px' }} />

            {/* Fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px 32px', marginBottom: '32px' }}>
              <Field label="Tipo de servicio"  value={client.tipo_cliente} />
              <Field label="Modelo de cobro"   value={client.modelo_cobro} />
              <Field label="Fecha de inicio"   value={formatFecha(client.fecha_inicio)} />
            </div>

            <div style={{ borderTop: '1px solid #f0ede8', marginBottom: '24px' }} />

            {/* Contrato document */}
            <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#999', marginBottom: '12px' }}>
              Documento
            </div>
            {client.contrato_url ? (
              <a
                href={client.contrato_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#DC5F1E', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
                  fontWeight: '600', textDecoration: 'none', fontFamily: 'Inter, sans-serif',
                }}
              >
                <PdfIcon /> Descargar contrato
              </a>
            ) : (
              <div style={{
                padding: '16px 20px', background: '#f9f8f6', border: '1px dashed #d4d0c8',
                borderRadius: '8px', fontSize: '13px', color: '#999',
              }}>
                Tu contrato estará disponible próximamente.
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: value ? '#1a1a1a' : '#ccc' }}>{value || '—'}</div>
    </div>
  );
}

function PdfIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 1v5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function navBtnStyle(active) {
  return {
    background: active ? '#fff5f0' : 'transparent', border: 'none',
    borderRadius: '6px', padding: '6px 12px', fontSize: '13px',
    fontWeight: active ? '600' : '400', color: active ? '#DC5F1E' : '#666',
    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  };
}
