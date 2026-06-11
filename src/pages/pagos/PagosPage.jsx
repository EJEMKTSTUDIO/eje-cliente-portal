import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBilling } from '../../hooks/useBilling';
import { supabase } from '../../lib/supabase';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatPeriodo(mes, anio) {
  if (mes == null || anio == null) return '—';
  return `${MESES[(mes - 1) % 12]} ${anio}`;
}

function formatCurrency(v) {
  if (v == null) return '—';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(v);
}

const ESTADO_CONFIG = {
  pendiente:            { label: 'Pendiente',            bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  vencido:              { label: 'Vencido',              bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  comprobante_recibido: { label: 'Comprobante recibido', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  facturado:            { label: 'Facturado',            bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
};

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { label: estado, bg: '#f5f5f5', color: '#666', border: '#e0e0e0' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  );
}

export default function PagosPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { billing, loading, error, uploadComprobante } = useBilling();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleLogout = async () => {
    sessionStorage.removeItem('eje_splash_shown');
    await supabase.auth.signOut();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    try {
      await uploadComprobante(file);
      setUploadSuccess(true);
    } catch (err) {
      setUploadError(err.message || 'Error al subir el comprobante.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const canUpload = billing && (billing.estado === 'pendiente' || billing.estado === 'vencido');

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e8e6e0',
        padding: '0 32px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '3px', height: '20px', background: '#DC5F1E', borderRadius: '2px' }} />
            <span style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>EJE</span>
            <span style={{ fontSize: '11px', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: '4px' }}>
              Portal
            </span>
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
                style={navBtnStyle(path === '/pagos')}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#666' }}>{session?.user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid #e8e6e0',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              color: '#666',
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px 0' }}>
            Pagos
          </h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Tu cobro pendiente más reciente.
          </p>
        </div>

        {loading && (
          <div style={{
            background: '#fff',
            border: '1px solid #e8e6e0',
            borderRadius: '12px',
            padding: '48px',
            display: 'flex',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(220,95,30,0.2)',
              borderTopColor: '#DC5F1E',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          </div>
        )}

        {!loading && error && (
          <div style={{
            background: '#fff',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '24px',
            color: '#b91c1c',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && !billing && (
          <div style={{
            background: '#fff',
            border: '1px solid #e8e6e0',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
          }}>
            No hay cobros pendientes en este momento.
          </div>
        )}

        {!loading && !error && billing && (
          <div style={{
            background: '#fff',
            border: '1px solid #e8e6e0',
            borderRadius: '12px',
            padding: '32px',
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#DC5F1E',
              marginBottom: '12px',
            }}>
              Cobro · {formatPeriodo(billing.mes, billing.anio)}
            </div>

            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1a1a1a',
              letterSpacing: '-1px',
              marginBottom: '16px',
            }}>
              {formatCurrency(billing.monto_total)}
            </div>

            <div style={{ marginBottom: '32px' }}>
              <EstadoBadge estado={billing.estado} />
            </div>

            <div style={{ borderTop: '1px solid #f0ede8', marginBottom: '24px' }} />

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {canUpload && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    style={{
                      background: uploading ? '#f5b599' : '#DC5F1E',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'background 0.15s',
                    }}
                  >
                    {uploading ? 'Subiendo…' : 'Subir comprobante'}
                  </button>
                </>
              )}

              {billing.comprobante_url && (
                <a
                  href={billing.comprobante_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkBtnStyle}
                >
                  Ver comprobante
                </a>
              )}

              {billing.factura_url && (
                <a
                  href={billing.factura_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  style={linkBtnStyle}
                >
                  Descargar factura
                </a>
              )}
            </div>

            {uploadSuccess && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#15803d',
              }}>
                Comprobante subido correctamente. Nos pondremos en contacto a la brevedad.
              </div>
            )}

            {uploadError && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#b91c1c',
              }}>
                {uploadError}
              </div>
            )}

            {billing.notas && (
              <>
                <div style={{ borderTop: '1px solid #f0ede8', margin: '24px 0 16px' }} />
                <div style={{
                  fontSize: '12px',
                  color: '#999',
                  marginBottom: '6px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  Notas
                </div>
                <div style={{ fontSize: '13px', color: '#555' }}>{billing.notas}</div>
              </>
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

function navBtnStyle(active) {
  return {
    background: active ? '#fff5f0' : 'transparent',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: active ? '600' : '400',
    color: active ? '#DC5F1E' : '#666',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  };
}

const linkBtnStyle = {
  display: 'inline-block',
  background: '#fff',
  color: '#1a1a1a',
  border: '1px solid #e8e6e0',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '13px',
  fontWeight: '500',
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  textDecoration: 'none',
};
