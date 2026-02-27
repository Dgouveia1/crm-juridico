import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import {
  ArrowLeft, FileText, Calendar, MessageSquare, CheckSquare,
  Building2, Gavel, DollarSign, User, Phone, Mail,
  Save, Plus, Trash2, Check, Clock, AlertTriangle,
  Scale, ScrollText, Hammer, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProcessStage } from '../types';

type Tab = 'dados' | 'movimentacoes' | 'anotacoes' | 'tarefas';

const STAGE_COLORS: Record<ProcessStage, string> = {
  'Petição Inicial': '#3b82f6',
  'Instrução': '#8b5cf6',
  'Sentença': '#f59e0b',
  'Recurso': '#ef4444',
  'Execução': '#10b981',
  'Arquivado': '#6b7280',
};

// Get icon based on movement description
const getMovIcon = (desc: string) => {
  const lower = desc.toLowerCase();
  if (lower.includes('sentença') || lower.includes('julgad') || lower.includes('decisão') || lower.includes('despacho')) return Hammer;
  if (lower.includes('intimação') || lower.includes('intime-se') || lower.includes('portal') || lower.includes('ato ordinatório')) return Bell;
  if (lower.includes('petição') || lower.includes('juntada') || lower.includes('documento')) return ScrollText;
  if (lower.includes('audiência') || lower.includes('conciliação')) return Scale;
  return Calendar;
};

const getMovColor = (desc: string): string => {
  const lower = desc.toLowerCase();
  if (lower.includes('sentença') || lower.includes('julgad')) return '#f59e0b';
  if (lower.includes('intimação') || lower.includes('intime-se')) return '#8b5cf6';
  if (lower.includes('petição') || lower.includes('juntada')) return '#3b82f6';
  if (lower.includes('audiência')) return '#10b981';
  if (lower.includes('prazo') || lower.includes('urgente')) return '#ef4444';
  return '#6b7280';
};

const ProcessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { processes, notes, addNote, tasks, addTask, toggleTask, deleteTask } = useAppContext();

  const [activeTab, setActiveTab] = useState<Tab>('dados');
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', priority: 'media' as 'alta' | 'media' | 'baixa' });

  const decodedId = decodeURIComponent(id || '');
  const process = processes.find(p => p.Numero_Processo === decodedId);
  const processNotes = notes.filter(n => n.processId === decodedId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const processTasks = tasks.filter(t => t.processId === decodedId).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  if (!process) {
    return (
      <div className="pdetail-notfound">
        <h2>Processo não encontrado</h2>
        <button onClick={() => navigate('/processos')}>Voltar para a lista</button>
      </div>
    );
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote({ processId: decodedId, content: newNote, date: new Date().toISOString() });
    setNewNote('');
    toast.success('Anotação salva!');
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    addTask({ processId: decodedId, title: newTask.title, dueDate: newTask.dueDate, completed: false, priority: newTask.priority });
    setNewTask({ title: '', dueDate: '', priority: 'media' });
    toast.success('Tarefa adicionada!');
  };

  const clientName = process.Partes_Envolvidas[0] || 'N/A';
  const stageColor = STAGE_COLORS[process.stage] || '#6b7280';
  const pendingTasks = processTasks.filter(t => !t.completed).length;

  const tabs: { id: Tab; label: string; icon: React.ComponentType<any>; badge?: number }[] = [
    { id: 'dados', label: 'Dados Básicos', icon: FileText },
    { id: 'movimentacoes', label: 'Movimentações', icon: Calendar },
    { id: 'anotacoes', label: 'Anotações', icon: MessageSquare, badge: processNotes.length },
    { id: 'tarefas', label: 'Tarefas', icon: CheckSquare, badge: pendingTasks },
  ];

  return (
    <div className="pdetail">
      {/* Back + Header */}
      <div className="pdetail-header">
        <button onClick={() => navigate('/processos')} className="pdetail-back">
          <ArrowLeft size={18} />
        </button>
        <div className="pdetail-title-block">
          <div className="pdetail-num">{process.Numero_Processo}</div>
          <div className="pdetail-meta">
            <span className="pdetail-classe">{process.Classe}</span>
            <span className="pdetail-stage-pill" style={{ background: stageColor + '22', color: stageColor }}>
              {process.stage}
            </span>
          </div>
        </div>
      </div>

      <div className="pdetail-body">
        {/* ── Client Widget Sidebar ────────────────────── */}
        <aside className="pdetail-sidebar">
          <div className="pdetail-client-card">
            <div className="pdetail-client-avatar">
              {clientName.charAt(0).toUpperCase()}
            </div>
            <div className="pdetail-client-name">{clientName}</div>
            <div className="pdetail-client-label">Cliente Principal</div>
            <div className="pdetail-client-actions">
              <a href={`tel:+55`} className="pdetail-client-btn" title="Ligar">
                <Phone size={15} />
              </a>
              <a href={`mailto:`} className="pdetail-client-btn" title="E-mail">
                <Mail size={15} />
              </a>
            </div>
          </div>

          {/* Process info mini */}
          <div className="pdetail-info-card">
            <div className="pdetail-info-row">
              <Building2 size={14} className="pdetail-info-icon" />
              <div>
                <div className="pdetail-info-label">Foro</div>
                <div className="pdetail-info-val">{process.Foro}</div>
              </div>
            </div>
            <div className="pdetail-info-row">
              <Gavel size={14} className="pdetail-info-icon" />
              <div>
                <div className="pdetail-info-label">Juiz(a)</div>
                <div className="pdetail-info-val">{process.Juiz}</div>
              </div>
            </div>
            <div className="pdetail-info-row">
              <DollarSign size={14} className="pdetail-info-icon" />
              <div>
                <div className="pdetail-info-label">Valor da Ação</div>
                <div className="pdetail-info-val pdetail-info-val--green">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(process.Valor_Acao)}
                </div>
              </div>
            </div>
          </div>

          {/* All parties */}
          <div className="pdetail-parties-card">
            <h4 className="pdetail-parties-title">
              <User size={14} /> Partes Envolvidas
            </h4>
            {process.Partes_Envolvidas.map((p, i) => (
              <div key={i} className="pdetail-party-item">{p}</div>
            ))}
            {process.Partes_Envolvidas.length === 0 && (
              <div className="pdetail-party-empty">Nenhuma parte cadastrada</div>
            )}
          </div>
        </aside>

        {/* ── Main Tabs ───────────────────────────────── */}
        <div className="pdetail-main">
          {/* Tab navigation */}
          <div className="pdetail-tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pdetail-tab ${activeTab === tab.id ? 'pdetail-tab--active' : ''}`}
                >
                  <Icon size={15} />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="pdetail-tab-badge">{tab.badge}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── TAB: Dados Básicos ──────────────────── */}
          {activeTab === 'dados' && (
            <div className="pdetail-tab-content pdetail-dados">
              <div className="pdetail-dados-grid">
                <div className="pdetail-dado">
                  <span className="pdetail-dado-label">Classe</span>
                  <span className="pdetail-dado-val">{process.Classe}</span>
                </div>
                <div className="pdetail-dado">
                  <span className="pdetail-dado-label">Assunto</span>
                  <span className="pdetail-dado-val">{process.Assunto}</span>
                </div>
                <div className="pdetail-dado">
                  <span className="pdetail-dado-label">Vara</span>
                  <span className="pdetail-dado-val">{process.Vara}</span>
                </div>
                <div className="pdetail-dado">
                  <span className="pdetail-dado-label">Etapa Atual</span>
                  <span className="pdetail-dado-val" style={{ color: stageColor, fontWeight: 700 }}>{process.stage}</span>
                </div>
                <div className="pdetail-dado">
                  <span className="pdetail-dado-label">Total Movimentações</span>
                  <span className="pdetail-dado-val">{process.Movimentacoes.length} registros</span>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Movimentações ──────────────────── */}
          {activeTab === 'movimentacoes' && (
            <div className="pdetail-tab-content pdetail-timeline">
              <div className="timeline">
                {process.Movimentacoes.map((mov, idx) => {
                  const Icon = getMovIcon(mov.description);
                  const color = getMovColor(mov.description);
                  return (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-line" />
                      <div className="timeline-icon" style={{ background: color + '20', color }}>
                        <Icon size={15} />
                      </div>
                      <div className="timeline-card">
                        <div className="timeline-card-header">
                          <span className="timeline-date">{mov.date}</span>
                        </div>
                        <p className="timeline-desc">{mov.description}</p>
                      </div>
                    </div>
                  );
                })}
                {process.Movimentacoes.length === 0 && (
                  <p className="pdetail-empty">Nenhuma movimentação registrada.</p>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: Anotações ──────────────────────── */}
          {activeTab === 'anotacoes' && (
            <div className="pdetail-tab-content pdetail-notes">
              <div className="notes-list">
                {processNotes.map(note => (
                  <div key={note.id} className="note-card">
                    <p className="note-content">{note.content}</p>
                    <span className="note-date">
                      {new Date(note.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                {processNotes.length === 0 && (
                  <div className="pdetail-empty">Nenhuma anotação. Adicione a primeira!</div>
                )}
              </div>
              <div className="notes-add">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Nova anotação interna..."
                  className="notes-textarea"
                  rows={4}
                />
                <button onClick={handleAddNote} disabled={!newNote.trim()} className="notes-save-btn">
                  <Save size={15} /> Salvar Anotação
                </button>
              </div>
            </div>
          )}

          {/* ── TAB: Tarefas ────────────────────────── */}
          {activeTab === 'tarefas' && (
            <div className="pdetail-tab-content pdetail-tasks">
              {/* Add task form */}
              <div className="tasks-add">
                <input
                  type="text"
                  placeholder="Nova tarefa para este processo..."
                  value={newTask.title}
                  onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))}
                  className="tasks-input"
                />
                <div className="tasks-add-row">
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask(t => ({ ...t, dueDate: e.target.value }))}
                    className="tasks-date"
                  />
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask(t => ({ ...t, priority: e.target.value as any }))}
                    className="tasks-priority-sel"
                  >
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Média</option>
                    <option value="baixa">🟢 Baixa</option>
                  </select>
                  <button onClick={handleAddTask} disabled={!newTask.title.trim()} className="tasks-add-btn">
                    <Plus size={15} /> Adicionar
                  </button>
                </div>
              </div>

              {/* Task list */}
              <div className="tasks-list">
                {processTasks.map(task => {
                  const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date();
                  return (
                    <div key={task.id} className={`task-item ${task.completed ? 'task-item--done' : ''} ${isOverdue ? 'task-item--overdue' : ''}`}>
                      <button onClick={() => toggleTask(task.id)} className="task-check">
                        {task.completed ? <Check size={14} /> : <div className="task-check-empty" />}
                      </button>
                      <div className="task-body">
                        <span className="task-title">{task.title}</span>
                        {task.dueDate && (
                          <span className={`task-due ${isOverdue ? 'task-due--overdue' : ''}`}>
                            {isOverdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                            {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <span className={`task-priority task-priority--${task.priority || 'media'}`}>
                        {task.priority === 'alta' ? '🔴' : task.priority === 'baixa' ? '🟢' : '🟡'}
                      </span>
                      <button onClick={() => deleteTask(task.id)} className="task-delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
                {processTasks.length === 0 && (
                  <div className="pdetail-empty">Nenhuma tarefa criada. Adicione acima!</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessDetail;
