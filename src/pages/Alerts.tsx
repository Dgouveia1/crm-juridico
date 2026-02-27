import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Bell, Calendar, AlertTriangle, Clock, X, Filter, Zap } from 'lucide-react';
import { AlertType } from '../types';

const TYPE_LABELS: Record<AlertType, string> = {
  prazo: 'Prazo',
  intimacao: 'Intimação',
  publicacao: 'Publicação',
  decisao: 'Decisão',
  geral: 'Geral',
};

const TYPE_COLORS: Record<AlertType, string> = {
  prazo: '#ef4444',
  intimacao: '#8b5cf6',
  publicacao: '#3b82f6',
  decisao: '#f59e0b',
  geral: '#6b7280',
};

const Alerts = () => {
  const { alerts, loading, dismissAlert } = useAppContext();
  const [filter, setFilter] = useState<AlertType | 'all'>('all');

  if (loading) return null;

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.type === filter);

  const urgent = filtered.filter(a => a.daysUntil <= 2);
  const soon = filtered.filter(a => a.daysUntil > 2 && a.daysUntil <= 7);
  const informative = filtered.filter(a => a.daysUntil > 7 || a.daysUntil < -1);

  const renderAlert = (alert: (typeof alerts)[0]) => (
    <div key={alert.id} className="alert-item">
      <div className="alert-item-left">
        <div
          className="alert-type-icon"
          style={{ background: TYPE_COLORS[alert.type] + '20', color: TYPE_COLORS[alert.type] }}
        >
          {alert.daysUntil <= 2 ? <Zap size={18} /> : alert.daysUntil <= 7 ? <AlertTriangle size={18} /> : <Clock size={18} />}
        </div>
        <div className="alert-body">
          <div className="alert-meta">
            <Link to={`/processos/${encodeURIComponent(alert.processId)}`} className="alert-proc-link">
              {alert.processId}
            </Link>
            <span
              className="alert-type-badge"
              style={{ background: TYPE_COLORS[alert.type] + '20', color: TYPE_COLORS[alert.type] }}
            >
              {TYPE_LABELS[alert.type]}
            </span>
            <span className="alert-date">
              <Calendar size={12} />
              {alert.date}
            </span>
            <span className={`alert-when ${alert.daysUntil <= 0 ? 'alert-when--red' :
                alert.daysUntil <= 2 ? 'alert-when--red' :
                  alert.daysUntil <= 7 ? 'alert-when--amber' :
                    'alert-when--blue'
              }`}>
              {alert.daysUntil < 0
                ? `Há ${Math.abs(alert.daysUntil)} dias`
                : alert.daysUntil === 0 ? 'Hoje'
                  : alert.daysUntil === 1 ? 'Amanhã'
                    : `Em ${alert.daysUntil} dias`}
            </span>
          </div>
          <p className="alert-desc">{alert.description}</p>
        </div>
      </div>
      <button className="alert-dismiss" onClick={() => dismissAlert(alert.id)} title="Dispensar">
        <X size={15} />
      </button>
    </div>
  );

  const Section = ({ title, items, color }: { title: string; items: typeof alerts; color: string }) => {
    if (!items.length) return null;
    return (
      <div className="alert-section">
        <div className="alert-section-header" style={{ borderLeftColor: color }}>
          <span style={{ color }}>{title}</span>
          <span className="alert-section-count" style={{ background: color + '20', color }}>{items.length}</span>
        </div>
        <div className="alert-list">{items.map(renderAlert)}</div>
      </div>
    );
  };

  return (
    <div className="alerts-page">
      {/* Header */}
      <div className="alerts-header">
        <div>
          <h1 className="alerts-title">
            <Bell size={22} className="alerts-title-icon" />
            Alertas & Prazos
          </h1>
          <p className="alerts-subtitle">Motor de alertas automático — {alerts.length} alertas ativos</p>
        </div>
        <span className={`alerts-total-badge ${alerts.length > 5 ? 'alerts-total-badge--red' : 'alerts-total-badge--green'}`}>
          {alerts.length} alertas
        </span>
      </div>

      {/* Filter bar */}
      <div className="alerts-filters">
        <Filter size={14} className="alerts-filter-icon" />
        {(['all', 'prazo', 'intimacao', 'publicacao', 'decisao', 'geral'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`alerts-filter-btn ${filter === f ? 'alerts-filter-btn--active' : ''}`}
            style={filter === f && f !== 'all' ? { background: TYPE_COLORS[f] + '20', color: TYPE_COLORS[f], borderColor: TYPE_COLORS[f] + '44' } : {}}
          >
            {f === 'all' ? 'Todos' : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Grouped sections */}
      {filtered.length === 0 ? (
        <div className="alerts-empty">
          <Bell size={40} className="alerts-empty-icon" />
          <h3>Nenhum alerta</h3>
          <p>Sem prazos ou intimações pendentes no momento.</p>
        </div>
      ) : (
        <div className="alerts-sections">
          <Section title="🔴 Urgente (≤ 2 dias)" items={urgent} color="#ef4444" />
          <Section title="🟡 Atenção (3–7 dias)" items={soon} color="#f59e0b" />
          <Section title="🔵 Informativo" items={informative} color="#3b82f6" />
        </div>
      )}
    </div>
  );
};

export default Alerts;
