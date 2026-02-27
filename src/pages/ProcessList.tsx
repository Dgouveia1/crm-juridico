import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Search, Filter, Download, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const ITEMS_PER_PAGE = 10;

const ProcessList = () => {
  const { processes, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Filters
  const [filterClass, setFilterClass] = useState('');
  const [filterForo, setFilterForo] = useState('');

  const uniqueClasses = useMemo(() => Array.from(new Set(processes.map(p => p.Classe))).sort(), [processes]);
  const uniqueForos = useMemo(() => Array.from(new Set(processes.map(p => p.Foro))).sort(), [processes]);

  const filteredAndSortedProcesses = useMemo(() => {
    let result = [...processes];

    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.Numero_Processo.toLowerCase().includes(lowerSearch) ||
        p.Assunto.toLowerCase().includes(lowerSearch) ||
        p.Partes_Envolvidas.some(party => party.toLowerCase().includes(lowerSearch))
      );
    }

    // Filters
    if (filterClass) {
      result = result.filter(p => p.Classe === filterClass);
    }
    if (filterForo) {
      result = result.filter(p => p.Foro === filterForo);
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof typeof a];
        let bValue: any = b[sortConfig.key as keyof typeof b];

        if (sortConfig.key === 'Valor_Acao') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [processes, searchTerm, filterClass, filterForo, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedProcesses.length / ITEMS_PER_PAGE);
  const paginatedProcesses = filteredAndSortedProcesses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportCSV = () => {
    const data = filteredAndSortedProcesses.map(p => ({
      'Número': p.Numero_Processo,
      'Classe': p.Classe,
      'Assunto': p.Assunto,
      'Foro': p.Foro,
      'Vara': p.Vara,
      'Valor': p.Valor_Acao,
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
      head: [['Número', 'Classe', 'Foro', 'Valor', 'Partes']],
      body: filteredAndSortedProcesses.map(p => [
        p.Numero_Processo,
        p.Classe,
        p.Foro,
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.Valor_Acao),
        p.Partes_Envolvidas.join(', ')
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] }
    });
    doc.save('processos.pdf');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Processos</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            CSV
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por número, assunto ou parte..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filterClass}
            onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700"
          >
            <option value="">Todas as Classes</option>
            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterForo}
            onChange={(e) => { setFilterForo(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700"
          >
            <option value="">Todos os Foros</option>
            {uniqueForos.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('Numero_Processo')}>
                  <div className="flex items-center gap-1">Número <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('Classe')}>
                  <div className="flex items-center gap-1">Classe / Assunto <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('Foro')}>
                  <div className="flex items-center gap-1">Foro / Vara <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('Valor_Acao')}>
                  <div className="flex items-center gap-1">Valor <ArrowUpDown size={14} /></div>
                </th>
                <th className="p-4 font-semibold">Partes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProcesses.map((process, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <Link 
                      to={`/processos/${encodeURIComponent(process.Numero_Processo)}`}
                      className="text-emerald-600 font-medium hover:underline"
                    >
                      {process.Numero_Processo}
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{process.Classe}</div>
                    <div className="text-sm text-slate-500 truncate max-w-xs" title={process.Assunto}>{process.Assunto}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-slate-900">{process.Foro}</div>
                    <div className="text-sm text-slate-500">{process.Vara}</div>
                  </td>
                  <td className="p-4 font-medium text-slate-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(process.Valor_Acao)}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {process.Partes_Envolvidas.slice(0, 2).map((party, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                          {party}
                        </span>
                      ))}
                      {process.Partes_Envolvidas.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-500">
                          +{process.Partes_Envolvidas.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProcesses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhum processo encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Mostrando <span className="font-medium text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="font-medium text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedProcesses.length)}</span> de <span className="font-medium text-slate-900">{filteredAndSortedProcesses.length}</span> processos
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessList;
