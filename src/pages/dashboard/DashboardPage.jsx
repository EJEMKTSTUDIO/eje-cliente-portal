import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { session } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
          Bienvenido
        </h1>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '48px' }}>
          Tu panel de performance y gestión.
        </p>

        {/* Cards placeholder */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'ROAS promedio', valor: '—', desc: 'Últimos 30 días' },
            { label: 'Inversión total', valor: '—', desc: 'Mes actual' },
            { label: 'Consultas generadas', valor: '—', desc: 'Mes actual' },
          ].map((card, i) => (
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
          Historial de performance y comprobantes de pago — próximamente.
        </div>
      </div>
    </div>
  );
}
