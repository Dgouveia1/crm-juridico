import React, { useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import {
  FileText, DollarSign, Building2, Bell, TrendingUp,
  Clock, AlertTriangle, ChevronRight, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProcessStage } from '../types';

const STAGE_COLORS: Record<ProcessStage, string> = {
  'Petição Inicial': '#3b82f6',
  'Instrução': '#8b5cf6',
  'Sentença': '#f59e0b',
  'Recurso': '#ef4444',
  'Execução': '#10b981',
  'Arquivado': '#6b7280',
};

const STAGE_ORDER: ProcessStage[] = ['Petição Inicial', 'Instrução', 'Sentença', 'Recurso', 'Execução', 'Arquivado'];

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(v);

const fmtFull = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const Dashboard = () => {
  const { processes, alerts, loading } = useAppContext();

  const metrics = useMemo(() => {
    if (!processes.length) return null;

    const totalValue = processes.reduce((s, p) => s + p.Valor_Acao, 0);
    const honorariosEst = totalValue * 0.15;

    // Stage funnel
    const stageMap: Record<string, number> = {};
    processes.forEach(p => {
      stageMap[p.stage] = (stageMap[p.stage] || 0) + 1;
    });
    const stageFunnel = STAGE_ORDER.map(s => ({
      name: s,
      count: stageMap[s] || 0,
      color: STAGE_COLORS[s],
    })).filter(s => s.count > 0);

    // Foro ranking by total value
    const foroValues: Record<string, number> = {};
    processes.forEach(p => {
      const shortForo = p.Foro.replace('Foro de ', '').replace('Foro ', '').slice(0, 20);
      foroValues[shortForo] = (foroValues[shortForo] || 0) + p.Valor_Acao;
    });
    const foroRanking = Object.entries(foroValues)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Success probability distribution
    const probBuckets = [
      { label: '< 30%', min: 0, max: 30, count: 0, color: '#ef4444' },
      { label: '30–50%', min: 30, max: 50, count: 0, color: '#f59e0b' },
      { label: '50–70%', min: 50, max: 70, count: 0, color: '#3b82f6' },
      { label: '70–85%', min: 70, max: 85, count: 0, color: '#10b981' },
      { label: '> 85%', min: 85, max: 100, count: 0, color: '#059669' },
    ];
    processes.forEach(p => {
      const bucket = probBuckets.find(b => p.successProbability >= b.min && p.successProbability < b.max);
      if (bucket) bucket.count++;
    });

    // Recent critical movements (last 8)
    const allMovements = processes.flatMap(p =>
      p.Movimentacoes.slice(0, 1).map(m => ({
        ...m, processId: p.Numero_Processo, classe: p.Classe, stage: p.stage
      }))
    ).filter(m => m.date).sort((a, b) => {
      const [d1, mo1, y1] = a.date.split('/');
      const [d2, mo2, y2] = b.date.split('/');
      return new Date(`${y2}-${mo2}-${d2}`).getTime() - new Date(`${y1}-${mo1}-${d1}`).getTime();
    }).slice(0, 8);

    // Week alerts
    const weekAlerts = alerts.filter(a => a.daysUntil <= 7 && a.daysUntil >= -1).length;

    return {
      totalProcesses: processes.length,
      totalValue,
      honorariosEst,
      stageFunnel,
      foroRanking,
      probBuckets,
      recentMovements: allMovements,
      weekAlerts,
    };
  }, [processes, alerts]);

  if (loading || !metrics) return null;

  return (
    <div className="dashboard">
      {/* ── Urgency Banner ─────────────────────────────────── */}
      {metrics.weekAlerts > 0 && (
        <div className="dash-urgency-banner">
          <Zap size={18} className="dash-urgency-icon" />
          <span>
            <strong>{metrics.weekAlerts} prazo{metrics.weekAlerts > 1 ? 's' : ''}</strong> vencem nos próximos 7 dias!
          </span>
          <Link to="/alertas" className="dash-urgency-link">
            Ver alertas <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Metric Cards ───────────────────────────────────── */}
      <div className="dash-cards">
        <div className="dash-card dash-card--blue">
          <div className="dash-card-icon"><FileText size={22} /></div>
          <div>
            <p className="dash-card-label">Total de Processos</p>
            <h3 className="dash-card-value">{metrics.totalProcesses}</h3>
          </div>
        </div>

        <div className="dash-card dash-card--green">
          <div className="dash-card-icon"><DollarSign size={22} /></div>
          <div>
            <p className="dash-card-label">Valor da Causa</p>
            <h3 className="dash-card-value">{fmt(metrics.totalValue)}</h3>
            <p className="dash-card-sub-label">{fmtFull(metrics.totalValue)}</p>
          </div>
        </div>

        <div className="dash-card dash-card--purple">
          <div className="dash-card-icon"><TrendingUp size={22} /></div>
          <div>
            <p className="dash-card-label">Honorários Est. (15%)</p>
            <h3 className="dash-card-value">{fmt(metrics.honorariosEst)}</h3>
            <p className="dash-card-sub-label">Estimativa sobre valor total</p>
          </div>
        </div>

        <div className="dash-card dash-card--amber">
          <div className="dash-card-icon"><Bell size={22} /></div>
          <div>
            <p className="dash-card-label">Alertas Ativos</p>
            <h3 className="dash-card-value">{alerts.length}</h3>
            <p className="dash-card-sub-label">{metrics.weekAlerts} urgentes esta semana</p>
          </div>
        </div>
      </div>

      {/* ── Process Funnel ─────────────────────────────────── */}
      <div className="dash-section-title">
        <AlertTriangle size={16} />
        Funil Processual por Etapa
      </div>
      <div className="dash-funnel">
        {STAGE_ORDER.map(stage => {
          const item = metrics.stageFunnel.find(s => s.name === stage);
          const count = item?.count || 0;
          const max = Math.max(...metrics.stageFunnel.map(s => s.count), 1);
          const pct = Math.round((count / metrics.totalProcesses) * 100);
          return (
            <div key={stage} className="dash-funnel-item">
              <div className="dash-funnel-label">
                <span className="dash-funnel-stage">{stage}</span>
                <span className="dash-funnel-count">{count}</span>
              </div>
              <div className="dash-funnel-bar-bg">
                <div
                  className="dash-funnel-bar"
                  style={{ width: `${(count / max) * 100}%`, background: STAGE_COLORS[stage] }}
                />
              </div>
              <span className="dash-funnel-pct">{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* ── Charts row ─────────────────────────────────────── */}
      <div className="dash-charts-row">
        {/* Foro ranking by value */}
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">
            <Building2 size={16} />
            Ranking de Foros por Valor
          </h3>
          <div className="dash-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.foroRanking} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,.15)" />
                <XAxis
                  type="number"
                  tickFormatter={v => fmt(v)}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tick={{ fontSize: 11, fill: '#cbd5e1' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => [fmtFull(v), 'Valor Total']}
                  contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e293b', color: '#f1f5f9', fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {metrics.foroRanking.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#10b981' : i === 1 ? '#3b82f6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Probabilidade de Êxito */}
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">
            <TrendingUp size={16} />
            Probabilidade de Êxito
          </h3>
          <div className="dash-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.probBuckets.filter(b => b.count > 0)} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,.15)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => [v + ' processos', 'Quantidade']}
                  contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e293b', color: '#f1f5f9', fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {metrics.probBuckets.filter(b => b.count > 0).map((b, i) => (
                    <Cell key={i} fill={b.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Recent Movements ───────────────────────────────── */}
      <div className="dash-recent">
        <div className="dash-recent-header">
          <h3 className="dash-chart-title">
            <Clock size={16} />
            Últimas Movimentações Críticas
          </h3>
          <Link to="/processos" className="dash-recent-link">
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>
        <div className="dash-recent-list">
          {metrics.recentMovements.map((mov, idx) => (
            <div key={idx} className="dash-recent-item">
              <div className="dash-recent-stage-dot" style={{ background: STAGE_COLORS[mov.stage as ProcessStage] || '#6b7280' }} />
              <div className="dash-recent-body">
                <div className="dash-recent-meta">
                  <Link
                    to={`/processos/${encodeURIComponent(mov.processId)}`}
                    className="dash-recent-proc"
                  >
                    {mov.processId}
                  </Link>
                  <span className="dash-recent-date">{mov.date}</span>
                  <span className="dash-recent-badge" style={{ background: STAGE_COLORS[mov.stage as ProcessStage] + '33', color: STAGE_COLORS[mov.stage as ProcessStage] }}>
                    {mov.stage}
                  </span>
                </div>
                <p className="dash-recent-desc">{mov.description.slice(0, 120)}{mov.description.length > 120 ? '...' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
