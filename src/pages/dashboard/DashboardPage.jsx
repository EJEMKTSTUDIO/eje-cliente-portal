import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useClientData } from '../../hooks/useClientData';

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('es-AR').format(value);
}

function formatRoas(value) {
  if (value == null) return '—';
  return Number(value).toFixed(2) + 'x';
}

function getEcommerceCards(records) {
  const latest = records[0] || {};
  return [
    { label: 'Inversión Meta', valor: formatCurrency(latest.inversion_meta), desc: latest.periodo || 'Último período' },
    { label: 'Facturación atribuida Meta', valor: formatCurrency(latest.facturacion_atribuida_meta), desc: latest.periodo || 'Último período' },
    { label: 'Facturación total sitio', valor: formatCurrency(latest.facturacion_total_sitio), desc: latest.periodo || 'Último período' },
    { label: 'ROAS', valor: formatRoas(latest.roas), desc: latest.periodo || 'Último período' },
  ];
}

function getLeadGenCards(records) {
  const latest = records[0] || {};
  return [
    { label: 'Inversión Meta', valor: formatCurrency(latest.inversion_meta), desc: latest.periodo || 'Último período' },
    { label: 'Alcance', valor: formatNumber(latest.alcance), desc: latest.periodo || 'Último período' },
    { label: 'Impresiones', valor: formatNumber(latest.impresiones), desc: latest.periodo || 'Último período' },
    { label: 'Consultas WhatsApp', valor: formatNumber(latest.consultas_wpp), desc: latest.periodo || 'Último período' },
  ];
}

export default function DashboardPage() {
  const { session } = useAuth();
  const { client, records, loading, error } = useClientData();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const isEcommerce = client?.tipo_cliente === 'E-commerce conversión';
  const cards = client
    ? (isEcommerce ? getEcommerceCards(records) : getLeadGenCards(records))
    : [];

  const latestRecord = records[0] || null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F6F2',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e8e6e0',
        padding: '0 32px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '3px', height: '20px', background: '#DC5F1E', borderRadius: '2px' }} />
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>EJE</span>
          <span style={{ fontSize: '11px', color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: '4px' }}>Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#666' }}>{session?.user?.email}</span>
          <button onClick={handleLogout} style={{
            background: 'transparent',
            border: '1px solid #e8e6e0',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            color: '#666',
            cursor: 'pointer',
          }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: '48px 32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
          {loading ? 'Bienvenido' : client ? `Bienvenido, ${client.nombre}` : 'Bienvenido'}
        </h1>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '48px' }}>
          Tu panel de performance y gestión.
        </p>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid #e8e6e0',
                borderRadius: '12px',
                padding: '24px',
                opacity: 0.5,
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#DC5F1E', marginBottom: '8px' }}>
                  &nbsp;
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#e8e6e0', marginBottom: '4px' }}>
                  ···
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>&nbsp;</div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div style={{
            background: '#fff',
            border: '1px solid #f5c6cb',
            borderRadius: '12px',
            padding: '24px',
            color: '#721c24',
            fontSize: '14px',
          }}>
            Error al cargar los datos: {error}
          </div>
        )}

        {/* Cards */}
        {!loading && !error && client && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {cards.map((card, i) => (
                <div key={i} style={{
                  background: '#fff',
                  border: '1px solid #e8e6e0',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#DC5F1E', marginBottom: '8px' }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
                    {card.valor}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{card.desc}</div>
                </div>
              ))}
            </div>

            {/* Evento especial banner */}
            {latestRecord?.evento_especial && (
              <div style={{
                marginTop: '24px',
                background: '#fff',
                border: '1px solid #DC5F1E',
                borderRadius: '12px',
                padding: '16px 24px',
                fontSize: '13px',
                color: '#1a1a1a',
              }}>
                <span style={{ fontWeight: '600', color: '#DC5F1E', marginRight: '8px' }}>Evento especial:</span>
                {latestRecord.evento_especial}
              </div>
            )}

            {/* Historial table */}
            <div style={{
              marginTop: '32px',
              background: '#fff',
              border: '1px solid #e8e6e0',
              borderRadius: '12px',
              padding: '32px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                Historial de performance
              </div>
              {records.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>
                  Sin registros disponibles aún.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #e8e6e0', color: '#999', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Período</th>
                      <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #e8e6e0', color: '#999', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Inversión Meta</th>
                      {isEcommerce ? (
                        <>
                          <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #e8e6e0', color: '#999', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Facturación atribuida</th>
                          <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #e8e6e0', color: '#999', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Facturación total sitio</th>
                          <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #e8e6e0', color: '#999', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ROAS</th>
                        </>
                      ) : (
                        <>
                          <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #e8e6e0', color: '#999', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alcance</th>
                          <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #e8e6e0', color: '#999', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Impresiones</th>
                          <th style={{ textAlign: 'right', padding: '8px 12px', borderBottom: '1px solid #e8e6e0', color: '#999', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Consultas WPP</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f0ede8' }}>
                        <td style={{ padding: '10px 12px', color: '#1a1a1a' }}>{r.periodo}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1a1a1a' }}>{formatCurrency(r.inversion_meta)}</td>
                        {isEcommerce ? (
                          <>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1a1a1a' }}>{formatCurrency(r.facturacion_atribuida_meta)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1a1a1a' }}>{formatCurrency(r.facturacion_total_sitio)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1a1a1a' }}>{formatRoas(r.roas)}</td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1a1a1a' }}>{formatNumber(r.alcance)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1a1a1a' }}>{formatNumber(r.impresiones)}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1a1a1a' }}>{formatNumber(r.consultas_wpp)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* No client found */}
        {!loading && !error && !client && (
          <div style={{
            marginTop: '32px',
            background: '#fff',
            border: '1px solid #e8e6e0',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
          }}>
            No se encontró un cliente asociado a tu cuenta.
          </div>
        )}
      </div>
    </div>
  );
}
