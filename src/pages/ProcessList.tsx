import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Search, Download, ChevronLeft, ChevronRight, ArrowUpDown, LayoutGrid, List, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { ProcessStage } from '../types';

const ITEMS_PER_PAGE = 12;

const STAGE_COLORS: Record<ProcessStage, string> = {
  'Petição Inicial': '#3b82f6',
  'Instrução': '#8b5cf6',
  'Sentença': '#f59e0b',
  'Recurso': '#ef4444',
  'Execução': '#10b981',
  'Arquivado': '#6b7280',
};

const STAGE_ORDER: ProcessStage[] = ['Petição Inicial', 'Instrução', 'Sentença', 'Recurso', 'Execução', 'Arquivado'];

type ViewMode = 'table' | 'kanban';

const ProcessList = () => {
  const { processes, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterClass, setFilterClass] = useState('');
  const [filterForo, setFilterForo] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const uniqueClasses = useMemo(() => Array.from(new Set(processes.map(p => p.Classe))).sort(), [processes]);
  const uniqueForos = useMemo(() => Array.from(new Set(processes.map(p => p.Foro))).sort(), [processes]);

  const filteredAndSortedProcesses = useMemo(() => {
    let result = [...processes];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.Numero_Processo.toLowerCase().includes(lower) ||
        p.Assunto.toLowerCase().includes(lower) ||
        p.Classe.toLowerCase().includes(lower) ||
        p.Foro.toLowerCase().includes(lower) ||
        p.Partes_Envolvidas.some(party => party.toLowerCase().includes(lower))
      );
    }
    if (filterClass) result = result.filter(p => p.Classe === filterClass);
    if (filterForo) result = result.filter(p => p.Foro === filterForo);
    if (filterStage) result = result.filter(p => p.stage === filterStage);

    if (sortConfig) {
      result.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof typeof a];
        let bVal: any = b[sortConfig.key as keyof typeof b];
        if (sortConfig.key === 'Valor_Acao') { aVal = Number(aVal); bVal = Number(bVal); }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [processes, searchTerm, filterClass, filterForo, filterStage, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedProcesses.length / ITEMS_PER_PAGE);
  const paginatedProcesses = filteredAndSortedProcesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key: string) => {
    setSortConfig(prev =>
      prev && prev.key === key && prev.direction === 'asc'
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    );
  };

  const exportCSV = () => {
    const data = filteredAndSortedProcesses.map(p => ({
      'Número': p.Numero_Processo, 'Classe': p.Classe, 'Assunto': p.Assunto,
      'Etapa': p.stage, 'Foro': p.Foro, 'Vara': p.Vara, 'Valor': p.Valor_Acao,
      'Partes': p.Partes_Envolvidas.join('; ')
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'processos.csv';
    link.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    autoTable(doc, {
      head: [['Número', 'Classe', 'Etapa', 'Foro', 'Valor', 'Partes']],
      body: filteredAndSortedProcesses.map(p => [
        p.Numero_Processo, p.Classe, p.stage, p.Foro,
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.Valor_Acao),
        p.Partes_Envolvidas.join(', ')
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    });
    doc.save('processos.pdf');
  };

  if (loading) return null;

  return (
    <div className="plist">
      {/* Header */}
      <div className="plist-header">
        <div>
          <h1 className="plist-title">Processos</h1>
          <p className="plist-subtitle">{filteredAndSortedProcesses.length} de {processes.length} processos</p>
        </div>
        <div className="plist-actions">
          <button onClick={exportCSV} className="plist-btn-export">
            <Download size={15} /> CSV
          </button>
          <button onClick={exportPDF} className="plist-btn-export plist-btn-export--pdf">
            <Download size={15} /> PDF
          </button>
          {/* View toggle */}
          <div className="plist-view-toggle">
            <button
              className={`plist-view-btn ${viewMode === 'table' ? 'plist-view-btn--active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Tabela"
            >
              <List size={16} />
            </button>
            <button
              className={`plist-view-btn ${viewMode === 'kanban' ? 'plist-view-btn--active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="plist-filters">
        <div className="plist-search-wrap">
          <Search size={16} className="plist-search-icon" />
          <input
            type="text"
            placeholder="Buscar por número, parte, assunto, foro..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="plist-search"
          />
        </div>
        <div className="plist-filter-row">
          <Filter size={14} className="plist-filter-icon" />
          <select value={filterStage} onChange={e => { setFilterStage(e.target.value); setCurrentPage(1); }} className="plist-select">
            <option value="">Todas as Etapas</option>
            {STAGE_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setCurrentPage(1); }} className="plist-select">
            <option value="">Todas as Classes</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterForo} onChange={e => { setFilterForo(e.target.value); setCurrentPage(1); }} className="plist-select">
            <option value="">Todos os Foros</option>
            {uniqueForos.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      {/* ── TABLE VIEW ─────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="plist-table-wrap">
          <table className="plist-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('Numero_Processo')}>
                  <div className="plist-th">Número <ArrowUpDown size={13} /></div>
                </th>
                <th onClick={() => handleSort('stage')}>
                  <div className="plist-th">Etapa <ArrowUpDown size={13} /></div>
                </th>
                <th onClick={() => handleSort('Classe')}>
                  <div className="plist-th">Classe / Assunto <ArrowUpDown size={13} /></div>
                </th>
                <th onClick={() => handleSort('Foro')}>
                  <div className="plist-th">Foro / Vara <ArrowUpDown size={13} /></div>
                </th>
                <th onClick={() => handleSort('Valor_Acao')}>
                  <div className="plist-th">Valor <ArrowUpDown size={13} /></div>
                </th>
                <th><div className="plist-th">Partes</div></th>
              </tr>
            </thead>
            <tbody>
              {paginatedProcesses.map((proc, idx) => (
                <tr key={idx} className="plist-row">
                  <td>
                    <Link to={`/processos/${encodeURIComponent(proc.Numero_Processo)}`} className="plist-proc-link">
                      {proc.Numero_Processo}
                    </Link>
                  </td>
                  <td>
                    <span
                      className="plist-stage-badge"
                      style={{
                        background: STAGE_COLORS[proc.stage] + '22',
                        color: STAGE_COLORS[proc.stage],
                        borderColor: STAGE_COLORS[proc.stage] + '44'
                      }}
                    >
                      {proc.stage}
                    </span>
                  </td>
                  <td>
                    <div className="plist-cell-main">{proc.Classe}</div>
                    <div className="plist-cell-sub">{proc.Assunto}</div>
                  </td>
                  <td>
                    <div className="plist-cell-main">{proc.Foro}</div>
                    <div className="plist-cell-sub">{proc.Vara}</div>
                  </td>
                  <td className="plist-val">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.Valor_Acao)}
                  </td>
                  <td>
                    <div className="plist-parties">
                      {proc.Partes_Envolvidas.slice(0, 1).map((p, i) => (
                        <span key={i} className="plist-party-tag">{p}</span>
                      ))}
                      {proc.Partes_Envolvidas.length > 1 && (
                        <span className="plist-party-more">+{proc.Partes_Envolvidas.length - 1}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProcesses.length === 0 && (
                <tr>
                  <td colSpan={6} className="plist-empty">Nenhum processo encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="plist-pagination">
              <span className="plist-pagination-info">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedProcesses.length)} de {filteredAndSortedProcesses.length}
              </span>
              <div className="plist-pagination-btns">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="plist-pg-btn">
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pn = currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                  if (pn > 0 && pn <= totalPages) return (
                    <button key={pn} onClick={() => setCurrentPage(pn)} className={`plist-pg-btn ${currentPage === pn ? 'plist-pg-btn--active' : ''}`}>{pn}</button>
                  );
                  return null;
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="plist-pg-btn">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── KANBAN VIEW ────────────────────────────────────── */}
      {viewMode === 'kanban' && (
        <div className="plist-kanban">
          {STAGE_ORDER.map(stage => {
            const stageProcs = filteredAndSortedProcesses.filter(p => p.stage === stage);
            if (stageProcs.length === 0) return null;
            const totalVal = stageProcs.reduce((s, p) => s + p.Valor_Acao, 0);
            return (
              <div key={stage} className="kanban-col">
                <div className="kanban-col-header" style={{ borderTopColor: STAGE_COLORS[stage] }}>
                  <div className="kanban-col-title">
                    <span className="kanban-col-dot" style={{ background: STAGE_COLORS[stage] }} />
                    {stage}
                  </div>
                  <span className="kanban-col-count">{stageProcs.length}</span>
                </div>
                <div className="kanban-col-sub">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalVal)}
                </div>
                <div className="kanban-cards">
                  {stageProcs.slice(0, 8).map((proc, i) => (
                    <Link key={i} to={`/processos/${encodeURIComponent(proc.Numero_Processo)}`} className="kanban-card">
                      <div className="kanban-card-num">{proc.Numero_Processo}</div>
                      <div className="kanban-card-classe">{proc.Classe}</div>
                      {proc.Partes_Envolvidas[0] && (
                        <div className="kanban-card-party">{proc.Partes_Envolvidas[0]}</div>
                      )}
                      <div className="kanban-card-val">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(proc.Valor_Acao)}
                      </div>
                    </Link>
                  ))}
                  {stageProcs.length > 8 && (
                    <div className="kanban-more">+{stageProcs.length - 8} processos</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProcessList;
