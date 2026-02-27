import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { LayoutGrid, DollarSign, Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { ProcessStage } from '../types';

const STAGES: ProcessStage[] = [
    'Petição Inicial',
    'Instrução',
    'Sentença',
    'Recurso',
    'Execução',
    'Arquivado',
];

const STAGE_COLORS: Record<ProcessStage, { bg: string; border: string; dot: string; text: string }> = {
    'Petição Inicial': { bg: '#eff6ff', border: '#3b82f6', dot: '#3b82f6', text: '#1d4ed8' },
    'Instrução': { bg: '#faf5ff', border: '#8b5cf6', dot: '#8b5cf6', text: '#6d28d9' },
    'Sentença': { bg: '#fffbeb', border: '#f59e0b', dot: '#f59e0b', text: '#b45309' },
    'Recurso': { bg: '#fff5f5', border: '#ef4444', dot: '#ef4444', text: '#b91c1c' },
    'Execução': { bg: '#f0fdf4', border: '#10b981', dot: '#10b981', text: '#065f46' },
    'Arquivado': { bg: '#f8fafc', border: '#94a3b8', dot: '#94a3b8', text: '#475569' },
};

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 0 }).format(v);

const KanbanView = () => {
    const { processes } = useAppContext();
    const [collapsed, setCollapsed] = useState<Partial<Record<ProcessStage, boolean>>>({});

    const byStage = useMemo(() => {
        const map: Record<ProcessStage, typeof processes> = {
            'Petição Inicial': [], 'Instrução': [], 'Sentença': [],
            'Recurso': [], 'Execução': [], 'Arquivado': [],
        };
        processes.forEach(p => { map[p.stage]?.push(p); });
        return map;
    }, [processes]);

    const totalValue = processes.reduce((s, p) => s + p.Valor_Acao, 0);

    const toggleCollapse = (stage: ProcessStage) => {
        setCollapsed(c => ({ ...c, [stage]: !c[stage] }));
    };

    return (
        <div className="kanban-page">
            {/* Header */}
            <div className="kanban-page-header">
                <div>
                    <h1 className="kanban-page-title">
                        <LayoutGrid size={22} className="kanban-page-icon" />
                        Funil / Kanban
                    </h1>
                    <p className="kanban-page-sub">
                        {processes.length} processos · Valor total {fmt(totalValue)}
                    </p>
                </div>
                <div className="kanban-page-stats">
                    {STAGES.filter(s => byStage[s].length > 0).map(stage => {
                        const c = STAGE_COLORS[stage];
                        return (
                            <span key={stage} className="kanban-stat-pill"
                                style={{ background: c.bg, color: c.text, borderColor: c.border + '55' }}>
                                <span className="kanban-stat-dot" style={{ background: c.dot }} />
                                {stage}: {byStage[stage].length}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Board */}
            <div className="kanban-board">
                {STAGES.map(stage => {
                    const cards = byStage[stage];
                    const stageTotal = cards.reduce((s, p) => s + p.Valor_Acao, 0);
                    const c = STAGE_COLORS[stage];
                    const isCollapsed = collapsed[stage];

                    return (
                        <div
                            key={stage}
                            className="kanban-col-full"
                            style={{ borderTopColor: c.border }}
                        >
                            {/* Column Header */}
                            <div className="kanban-col-header-full" style={{ background: c.bg }}>
                                <div className="kanban-col-left">
                                    <span className="kanban-col-dot-full" style={{ background: c.dot }} />
                                    <span className="kanban-col-stage" style={{ color: c.text }}>{stage}</span>
                                    <span className="kanban-col-count-full" style={{ background: c.border + '20', color: c.text }}>
                                        {cards.length}
                                    </span>
                                </div>
                                <div className="kanban-col-right">
                                    <span className="kanban-col-val" style={{ color: c.text }}>
                                        <DollarSign size={12} />
                                        {fmt(stageTotal)}
                                    </span>
                                    <button
                                        className="kanban-collapse-btn"
                                        onClick={() => toggleCollapse(stage)}
                                        title={isCollapsed ? 'Expandir' : 'Recolher'}
                                    >
                                        {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                                    </button>
                                </div>
                            </div>

                            {/* Cards */}
                            {!isCollapsed && (
                                <div className="kanban-cards-full">
                                    {cards.length === 0 && (
                                        <div className="kanban-empty">Nenhum processo nesta etapa</div>
                                    )}
                                    {cards.map(proc => {
                                        const topParty = proc.Partes_Envolvidas[0] || '–';
                                        const lastMov = proc.Movimentacoes[0];
                                        return (
                                            <Link
                                                key={proc.Numero_Processo}
                                                to={`/processos/${encodeURIComponent(proc.Numero_Processo)}`}
                                                className="kanban-card-full"
                                            >
                                                <div className="kanban-card-top">
                                                    <span className="kanban-card-num-full"
                                                        style={{ color: c.border }}>
                                                        {proc.Numero_Processo}
                                                    </span>
                                                </div>

                                                <div className="kanban-card-classe-full">{proc.Classe}</div>
                                                <div className="kanban-card-assunto">{proc.Assunto}</div>

                                                <div className="kanban-card-divider" />

                                                <div className="kanban-card-party-full">
                                                    <Scale size={11} className="kanban-card-party-icon" />
                                                    {topParty}
                                                </div>

                                                <div className="kanban-card-footer">
                                                    <span className="kanban-card-val-full">
                                                        {fmt(proc.Valor_Acao)}
                                                    </span>
                                                    {lastMov && (
                                                        <span className="kanban-card-date">{lastMov.date}</span>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KanbanView;
