import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Search, User, Building2, Phone, Mail, MapPin, Filter, FileText } from 'lucide-react';
import { PartyStatus } from '../types';

const STATUS_LABELS: Record<PartyStatus, string> = {
  ativo: 'Ativo', inativo: 'Inativo', prospecto: 'Prospecto',
};
const STATUS_COLORS: Record<PartyStatus, { bg: string; text: string }> = {
  ativo: { bg: 'rgba(212,160,23,.15)', text: '#b45309' },
  inativo: { bg: '#f1f5f9', text: '#64748b' },
  prospecto: { bg: 'rgba(99,102,241,.1)', text: '#6366f1' },
};

const CrmParties = () => {
  const { parties } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PartyStatus | 'all'>('all');

  const enriched = parties.filter(p => p.email || p.phone); // only show parties with at least some contact data

  const filtered = enriched.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm) ||
      p.cpfCnpj?.includes(searchTerm);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = enriched.length;
  const ativos = enriched.filter(p => p.status === 'ativo').length;
  const prospectos = enriched.filter(p => p.status === 'prospecto').length;

  return (
    <div className="crm-page">
      {/* Header */}
      <div className="crm-header">
        <div>
          <h1 className="crm-title">CRM — Gestão de Clientes</h1>
          <p className="crm-subtitle">{total} contatos · {ativos} ativos · {prospectos} prospectos</p>
        </div>
        <div className="crm-summary-pills">
          <span className="crm-summary-pill crm-summary-pill--gold">{ativos} Ativos</span>
          <span className="crm-summary-pill crm-summary-pill--indigo">{prospectos} Prospectos</span>
          <span className="crm-summary-pill crm-summary-pill--gray">{enriched.filter(p => p.status === 'inativo').length} Inativos</span>
        </div>
      </div>

      {/* Filters */}
      <div className="plist-filters">
        <div className="plist-search-wrap" style={{ flex: 1 }}>
          <Search size={16} className="plist-search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome, email, CPF/CNPJ ou telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="plist-search"
          />
        </div>
        <div className="plist-filter-row">
          <Filter size={14} className="plist-filter-icon" />
          {(['all', 'ativo', 'prospecto', 'inativo'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`alerts-filter-btn ${statusFilter === s ? 'alerts-filter-btn--active' : ''}`}
            >
              {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* List / Table */}
      <div className="plist-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="plist-table">
            <thead>
              <tr>
                <th>NOME DO CLIENTE</th>
                <th>TIPO / CPF / CNPJ</th>
                <th>CONTATO</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ textAlign: 'center' }}>MÉTRICAS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(party => {
                const status = party.status || 'ativo';
                const sc = STATUS_COLORS[status];
                const isCompany = party.tipo === 'PJ';
                const initials = party.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

                return (
                  <tr
                    key={party.id}
                    onClick={() => navigate(`/crm/${party.id}`)}
                    className="plist-row"
                    style={{ cursor: 'pointer' }}
                  >
                    {/* NOME E AVATAR */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 'bold', fontSize: '14px',
                          backgroundColor: isCompany ? '#f1f5f9' : '#fef9e7',
                          color: isCompany ? '#64748b' : '#d4a017'
                        }}>
                          {isCompany ? <Building2 size={18} /> : initials}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span className="plist-cell-main" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {party.name}
                          </span>
                          {party.address && (
                            <span className="plist-cell-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={party.address}>
                              <MapPin size={12} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{party.address}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* TIPO / DOC */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="plist-party-tag" style={{ width: 'max-content' }}>
                          {party.tipo || 'PF'}
                        </span>
                        {party.cpfCnpj && (
                          <span className="plist-cell-sub" style={{ fontFamily: 'monospace' }}>{party.cpfCnpj}</span>
                        )}
                      </div>
                    </td>

                    {/* CONTATO */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {party.email ? (
                          <div className="plist-cell-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={13} style={{ flexShrink: 0 }} /> <a href={`mailto:${party.email}`} style={{ color: 'inherit', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} onClick={e => e.stopPropagation()} title={party.email}>{party.email}</a>
                          </div>
                        ) : <span className="plist-cell-sub" style={{ fontStyle: 'italic' }}>Sem e-mail</span>}
                        {party.phone ? (
                          <div className="plist-cell-sub" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={13} style={{ flexShrink: 0 }} /> <a href={`tel:${party.phone}`} style={{ color: 'inherit', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{party.phone}</a>
                          </div>
                        ) : <span className="plist-cell-sub" style={{ fontStyle: 'italic' }}>Sem telefone</span>}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="plist-stage-badge" style={{ background: sc.bg, color: sc.text }}>
                        {STATUS_LABELS[status]}
                      </span>
                    </td>

                    {/* MÉTRICAS */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {party.processCount !== undefined && party.processCount > 0 ? (
                          <div className="plist-party-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={`${party.processCount} processos ativos`} onClick={e => e.stopPropagation()}>
                            <FileText size={14} style={{ color: '#d4a017' }} />
                            {party.processCount} proc.
                          </div>
                        ) : (
                          <span className="plist-cell-sub">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="plist-empty">
                      <User size={24} style={{ margin: '0 auto 10px', color: '#cbd5e1' }} />
                      <p>Nenhum cliente encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CrmParties;
