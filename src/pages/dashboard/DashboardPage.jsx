import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useClientData } from '../../hooks/useClientData';
import SplashScreen from './SplashScreen';

ChartJS.register(BarController, LineController, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

// ─── Formatters ────────────────────────────────────────────────────────────

function formatCurrency(v) {
  if (v == null) return '—';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(v);
}

function formatCurrencyShort(v) {
  if (v == null || v === 0) return '$0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${Math.round(v)}`;
}

function formatNumber(v) {
  if (v == null) return '—';
  return new Intl.NumberFormat('es-AR').format(v);
}

function formatRoas(v) {
  if (v == null) return '—';
  return Number(v).toFixed(2) + 'x';
}

function formatPeriodo(mes, anio) {
  if (mes == null || anio == null) return '—';
  const nombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${nombres[(mes - 1) % 12]} ${anio}`;
}

function calcPct(current, prev) {
  if (current == null || prev == null || prev === 0) return null;
  return ((current - prev) / Math.abs(prev)) * 100;
}

// ─── Variation badge ───────────────────────────────────────────────────────

function VariationBadge({ pct }) {
  if (pct == null) return <span style={{ color: '#ccc', fontSize: '11px' }}>—</span>;
  const pos = pct >= 0;
  return (
    <span style={{ fontSize: '11px', color: pos ? '#16a34a' : '#dc2626' }}>
      {pos ? '▲' : '▼'} {pos ? '+' : ''}{pct.toFixed(1)}%
    </span>
  );
}

// ─── Period filter pill ───────────────────────────────────────────────────

function Pill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        border: active ? '1px solid #DC5F1E' : '1px solid #e8e6e0',
        borderRadius: '20px',
        background: active ? '#fff5f0' : '#fff',
        color: active ? '#DC5F1E' : '#666',
        fontSize: '13px',
        fontWeight: active ? '600' : '400',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {label}
    </button>
  );
}

// ─── Chart event badge plugin ─────────────────────────────────────────────

const eventBadgePlugin = {
  id: 'eventBadge',
  afterDatasetsDraw(chart) {
    const eventData = chart.options.plugins?.eventBadge?.data || {};
    if (!Object.keys(eventData).length) return;
    const { ctx, data, scales, chartArea } = chart;
    data.labels.forEach((label, i) => {
      if (!eventData[label]) return;
      const x = scales.x.getPixelForValue(i);
      const y = chartArea.top + 10;
      ctx.save();
      ctx.fillStyle = '#DC5F1E';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x, y);
      ctx.restore();
    });
  },
};

// ─── Quarter helper ───────────────────────────────────────────────────────

const getQuarter = (mes) => Math.ceil(mes / 3);

const QUARTER_LABELS = {
  1: 'Q1 (Ene–Mar)',
  2: 'Q2 (Abr–Jun)',
  3: 'Q3 (Jul–Sep)',
  4: 'Q4 (Oct–Dic)',
};

// ─── Main Component ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { client, records, loading, error } = useClientData();

  // Splash: show once per session
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('eje_splash_shown'),
  );
  const [splashExiting, setSplashExiting] = useState(false);

  useEffect(() => {
    if (!showSplash) return;
    sessionStorage.setItem('eje_splash_shown', '1');
    const exitTimer = setTimeout(() => setSplashExiting(true), 2500);
    const hideTimer = setTimeout(() => setShowSplash(false), 3100);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [showSplash]);

  // Period filter
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedQuarter, setSelectedQuarter] = useState('all');

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setSelectedQuarter('all');
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('eje_splash_shown');
    await supabase.auth.signOut();
  };

  const isEcommerce = client?.tipo_cliente === 'E-commerce conversión';

  // Available years from all records
  const availableYears = [...new Set(records.map((r) => r.anio))].sort((a, b) => b - a);

  // Filtered records (newest first)
  const filteredRecords = records.filter((r) => {
    if (selectedYear === 'all') return true;
    if (r.anio !== Number(selectedYear)) return false;
    if (selectedQuarter === 'all') return true;
    return getQuarter(r.mes) === selectedQuarter;
  });

  // Cards: latest in filtered set, variation vs previous in full set
  const currentRecord = filteredRecords[0] || null;
  const currentIdxInAll = currentRecord
    ? records.findIndex((r) => r.id === currentRecord.id)
    : -1;
  const prevRecord = currentIdxInAll >= 0 ? records[currentIdxInAll + 1] || null : null;

  const periodoDesc = currentRecord
    ? formatPeriodo(currentRecord.mes, currentRecord.anio)
    : null;

  // Cards config per tipo_cliente
  const cards = client && currentRecord
    ? isEcommerce
      ? [
          {
            label: 'Inversión Meta',
            value: formatCurrency(currentRecord.inversion_meta),
            pct: calcPct(currentRecord.inversion_meta, prevRecord?.inversion_meta),
          },
          {
            label: 'Facturación Atribuida Meta',
            value: formatCurrency(currentRecord.facturacion_atribuida_meta),
            pct: calcPct(
              currentRecord.facturacion_atribuida_meta,
              prevRecord?.facturacion_atribuida_meta,
            ),
          },
          {
            label: 'Facturación Total Sitio',
            value: formatCurrency(currentRecord.facturacion_total_sitio),
            pct: calcPct(
              currentRecord.facturacion_total_sitio,
              prevRecord?.facturacion_total_sitio,
            ),
          },
          {
            label: 'ROAS',
            value: formatRoas(currentRecord.roas),
            pct: calcPct(currentRecord.roas, prevRecord?.roas),
          },
        ]
      : [
          {
            label: 'Inversión Meta',
            value: formatCurrency(currentRecord.inversion_meta),
            pct: calcPct(currentRecord.inversion_meta, prevRecord?.inversion_meta),
          },
          {
            label: 'Alcance',
            value: formatNumber(currentRecord.alcance),
            pct: calcPct(currentRecord.alcance, prevRecord?.alcance),
          },
          {
            label: 'Impresiones',
            value: formatNumber(currentRecord.impresiones),
            pct: calcPct(currentRecord.impresiones, prevRecord?.impresiones),
          },
          {
            label: 'Consultas WhatsApp',
            value: formatNumber(currentRecord.consultas_wpp),
            pct: calcPct(currentRecord.consultas_wpp, prevRecord?.consultas_wpp),
          },
        ]
    : [];

  // Chart data (chronological order)
  const chartRecords = [...filteredRecords].reverse();
  const chartLabels = chartRecords.map((r) => formatPeriodo(r.mes, r.anio));

  const eventMap = {};
  chartRecords.forEach((r, i) => {
    if (r.evento_especial) eventMap[chartLabels[i]] = r.evento_especial;
  });

  const chartData = {
    labels: chartLabels,
    datasets: isEcommerce
      ? [
          {
            type: 'bar',
            label: 'Facturación Atribuida',
            data: chartRecords.map((r) => r.facturacion_atribuida_meta),
            backgroundColor: '#DC5F1E',
            borderRadius: 4,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'ROAS',
            data: chartRecords.map((r) => r.roas),
            borderColor: '#2d6a1f',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointBackgroundColor: '#2d6a1f',
            pointRadius: 4,
            yAxisID: 'y1',
            tension: 0.3,
            order: 1,
          },
        ]
      : [
          {
            type: 'bar',
            label: 'Inversión Meta',
            data: chartRecords.map((r) => r.inversion_meta),
            backgroundColor: '#DC5F1E',
            borderRadius: 4,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'Consultas WPP',
            data: chartRecords.map((r) => r.consultas_wpp),
            borderColor: '#2d6a1f',
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointBackgroundColor: '#2d6a1f',
            pointRadius: 4,
            yAxisID: 'y1',
            tension: 0.3,
            order: 1,
          },
        ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(ctx) {
            if (ctx.datasetIndex === 0) {
              return ` ${ctx.dataset.label}: ${isEcommerce ? formatCurrency(ctx.raw) : formatCurrency(ctx.raw)}`;
            }
            return ` ${ctx.dataset.label}: ${isEcommerce ? formatRoas(ctx.raw) : formatNumber(ctx.raw)}`;
          },
          afterBody(items) {
            const label = items[0]?.label;
            if (label && eventMap[label]) {
              return [``, `★ ${eventMap[label]}`];
            }
            return [];
          },
        },
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: '#333',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
      eventBadge: { data: eventMap },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Inter, sans-serif', size: 11 },
          color: '#999',
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: '#f0ede8' },
        ticks: {
          callback: (v) => formatCurrencyShort(v),
          font: { family: 'Inter, sans-serif', size: 11 },
          color: '#999',
        },
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (v) =>
            isEcommerce ? `${Number(v).toFixed(1)}x` : formatNumber(v),
          font: { family: 'Inter, sans-serif', size: 11 },
          color: '#2d6a1f',
        },
      },
    },
  };

  // ─── Period label for section header ────────────────────────────────────

  const getPeriodLabel = () => {
    if (selectedYear === 'all') return 'Todos los períodos';
    if (selectedQuarter === 'all') return `Año ${selectedYear}`;
    return `${QUARTER_LABELS[selectedQuarter]} ${selectedYear}`;
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F7F6F2',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {showSplash && (
        <SplashScreen clientName={client?.nombre} exiting={splashExiting} />
      )}

      {/* Header */}
      <div
        style={{
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '3px',
                height: '20px',
                background: '#DC5F1E',
                borderRadius: '2px',
              }}
            />
            <span style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>
              EJE
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#999',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginLeft: '4px',
              }}
            >
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
                style={{
                  background: path === '/dashboard' ? '#fff5f0' : 'transparent',
                  border: 'none', borderRadius: '6px', padding: '6px 12px',
                  fontSize: '13px', fontWeight: path === '/dashboard' ? '600' : '400',
                  color: path === '/dashboard' ? '#DC5F1E' : '#666',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#666' }}>
            {session?.user?.email}
          </span>
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
      <div style={{ padding: '40px 32px', maxWidth: '1280px', margin: '0 auto' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 4px 0',
            }}
          >
            {loading
              ? 'Bienvenido'
              : client
              ? `Bienvenido, ${client.nombre}`
              : 'Bienvenido'}
          </h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Tu panel de performance y gestión.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  border: '1px solid #e8e6e0',
                  borderRadius: '12px',
                  padding: '24px',
                  opacity: 0.5,
                }}
              >
                <div
                  style={{
                    height: '10px',
                    background: '#e8e6e0',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    width: '60%',
                  }}
                />
                <div
                  style={{
                    height: '28px',
                    background: '#e8e6e0',
                    borderRadius: '4px',
                    marginBottom: '8px',
                  }}
                />
                <div
                  style={{
                    height: '10px',
                    background: '#f0ede8',
                    borderRadius: '4px',
                    width: '40%',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              background: '#fff',
              border: '1px solid #f5c6cb',
              borderRadius: '12px',
              padding: '24px',
              color: '#721c24',
              fontSize: '14px',
            }}
          >
            Error al cargar los datos: {error}
          </div>
        )}

        {/* No client */}
        {!loading && !error && !client && (
          <div
            style={{
              background: '#fff',
              border: '1px solid #e8e6e0',
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center',
              color: '#999',
              fontSize: '14px',
            }}
          >
            No se encontró un cliente asociado a tu cuenta.
          </div>
        )}

        {/* Dashboard content */}
        {!loading && !error && client && (
          <>
            {/* ── 4 Cards ─────────────────────────────────────────────── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              {cards.length === 0
                ? [0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        background: '#fff',
                        border: '1px solid #e8e6e0',
                        borderRadius: '12px',
                        padding: '24px',
                      }}
                    >
                      <div style={{ color: '#ccc', fontSize: '13px' }}>Sin datos</div>
                    </div>
                  ))
                : cards.map((card, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#fff',
                        border: '1px solid #e8e6e0',
                        borderRadius: '12px',
                        padding: '24px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#DC5F1E',
                          marginBottom: '10px',
                        }}
                      >
                        {card.label}
                      </div>
                      <div
                        style={{
                          fontSize: '26px',
                          fontWeight: '700',
                          color: '#1a1a1a',
                          marginBottom: '6px',
                          letterSpacing: '-0.5px',
                        }}
                      >
                        {card.value}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#bbb' }}>
                          {periodoDesc}
                        </span>
                        {prevRecord && <VariationBadge pct={card.pct} />}
                      </div>
                    </div>
                  ))}
            </div>

            {/* ── Period filter + Chart ────────────────────────────────── */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e8e6e0',
                borderRadius: '12px',
                padding: '28px 28px 24px',
                marginBottom: '20px',
              }}
            >
              {/* Filter header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                  Evolución de performance
                </div>
                <div style={{ fontSize: '11px', color: '#bbb' }}>
                  {getPeriodLabel()}
                </div>
              </div>

              {/* Year pills */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: selectedYear !== 'all' ? '10px' : '20px',
                }}
              >
                <Pill
                  label="Todo"
                  active={selectedYear === 'all'}
                  onClick={() => handleYearSelect('all')}
                />
                {availableYears.map((y) => (
                  <Pill
                    key={y}
                    label={String(y)}
                    active={selectedYear === String(y)}
                    onClick={() => handleYearSelect(String(y))}
                  />
                ))}
              </div>

              {/* Quarter pills (only when a year is selected) */}
              {selectedYear !== 'all' && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    marginBottom: '20px',
                    paddingLeft: '2px',
                  }}
                >
                  <Pill
                    label="Año completo"
                    active={selectedQuarter === 'all'}
                    onClick={() => setSelectedQuarter('all')}
                  />
                  {[1, 2, 3, 4].map((q) => (
                    <Pill
                      key={q}
                      label={`Q${q}`}
                      active={selectedQuarter === q}
                      onClick={() => setSelectedQuarter(q)}
                    />
                  ))}
                </div>
              )}

              {/* Chart */}
              {filteredRecords.length === 0 ? (
                <div
                  style={{
                    height: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ccc',
                    fontSize: '13px',
                  }}
                >
                  Sin datos para el período seleccionado
                </div>
              ) : (
                <>
                  {/* Chart legend */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '20px',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '2px',
                          background: '#DC5F1E',
                        }}
                      />
                      <span style={{ fontSize: '11px', color: '#888' }}>
                        {isEcommerce ? 'Facturación Atribuida' : 'Inversión Meta'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '20px',
                          height: '2px',
                          background: '#2d6a1f',
                          borderRadius: '1px',
                        }}
                      />
                      <span style={{ fontSize: '11px', color: '#888' }}>
                        {isEcommerce ? 'ROAS' : 'Consultas WPP'}
                      </span>
                    </div>
                  </div>

                  <div style={{ height: '260px', position: 'relative' }}>
                    <Chart
                      type="bar"
                      data={chartData}
                      options={chartOptions}
                      plugins={[eventBadgePlugin]}
                    />
                  </div>
                </>
              )}
            </div>

            {/* ── Historial ────────────────────────────────────────────── */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e8e6e0',
                borderRadius: '12px',
                padding: '28px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1a1a1a',
                  marginBottom: '20px',
                }}
              >
                Historial · {getPeriodLabel()}
              </div>

              {filteredRecords.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#ccc', fontSize: '13px', padding: '32px 0' }}>
                  Sin registros para el período seleccionado.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <Th align="left">Período</Th>
                      <Th>Inversión Meta</Th>
                      {isEcommerce ? (
                        <>
                          <Th>Facturación Atribuida</Th>
                          <Th>Facturación Total Sitio</Th>
                          <Th>ROAS</Th>
                        </>
                      ) : (
                        <>
                          <Th>Alcance</Th>
                          <Th>Impresiones</Th>
                          <Th>Consultas WPP</Th>
                        </>
                      )}
                      <Th>Evento</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((r, i) => (
                      <tr
                        key={r.id || i}
                        style={{ borderBottom: '1px solid #f0ede8' }}
                      >
                        <td style={{ padding: '10px 12px', color: '#1a1a1a', fontWeight: '500' }}>
                          {formatPeriodo(r.mes, r.anio)}
                        </td>
                        <Td>{formatCurrency(r.inversion_meta)}</Td>
                        {isEcommerce ? (
                          <>
                            <Td>{formatCurrency(r.facturacion_atribuida_meta)}</Td>
                            <Td>{formatCurrency(r.facturacion_total_sitio)}</Td>
                            <Td>{formatRoas(r.roas)}</Td>
                          </>
                        ) : (
                          <>
                            <Td>{formatNumber(r.alcance)}</Td>
                            <Td>{formatNumber(r.impresiones)}</Td>
                            <Td>{formatNumber(r.consultas_wpp)}</Td>
                          </>
                        )}
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          {r.evento_especial ? (
                            <span
                              style={{
                                fontSize: '11px',
                                color: '#DC5F1E',
                                background: '#fff5f0',
                                border: '1px solid #fcd5bd',
                                borderRadius: '12px',
                                padding: '2px 8px',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              ★ {r.evento_especial}
                            </span>
                          ) : (
                            <span style={{ color: '#ddd' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}

// ─── Table cell helpers ─────────────────────────────────────────────────────

function Th({ children, align = 'right' }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: '8px 12px',
        borderBottom: '1px solid #e8e6e0',
        color: '#999',
        fontWeight: '600',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1a1a1a' }}>
      {children}
    </td>
  );
}
