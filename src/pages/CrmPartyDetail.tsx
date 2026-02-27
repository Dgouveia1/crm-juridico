import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { ArrowLeft, User, Phone, Mail, MapPin, Save, FileText, MessageSquare, CheckSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const CrmPartyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { parties, updateParty, processes, notes, addNote, tasks, addTask, toggleTask } = useAppContext();

  const party = parties.find(p => p.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(party || { id: '', name: '' });
  const [newNote, setNewNote] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  if (!party) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900">Parte não encontrada</h2>
        <button onClick={() => navigate('/crm')} className="mt-4 text-amber-600 hover:underline">
          Voltar para CRM
        </button>
      </div>
    );
  }

  const relatedProcesses = processes.filter(p => p.Partes_Envolvidas.includes(party.name));
  const partyNotes = notes.filter(n => n.partyId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const partyTasks = tasks.filter(t => t.partyId === id).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleSaveContact = () => {
    updateParty(editForm);
    setIsEditing(false);
    toast.success('Dados de contato atualizados!');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote({
      partyId: party.id,
      content: newNote,
      date: new Date().toISOString()
    });
    setNewNote('');
    toast.success('Interação registrada!');
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskDate) return;
    addTask({
      partyId: party.id,
      title: newTaskTitle,
      dueDate: newTaskDate,
      completed: false
    });
    setNewTaskTitle('');
    setNewTaskDate('');
    toast.success('Tarefa adicionada!');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/crm')}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{party.name}</h1>
          <p className="text-sm text-slate-500 mt-1">Detalhes e Histórico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Processes */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <User size={20} className="text-amber-600" />
                Contato
              </h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-amber-600 font-medium hover:underline"
                >
                  Editar
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Endereço</label>
                  <textarea
                    value={editForm.address || ''}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveContact}
                    className="flex-1 bg-amber-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => { setIsEditing(false); setEditForm(party); }}
                    className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-slate-400 mt-0.5" />
                  <span className="text-sm text-slate-700">{party.phone || 'Não informado'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-slate-400 mt-0.5" />
                  <span className="text-sm text-slate-700 break-all">{party.email || 'Não informado'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-slate-400 mt-0.5" />
                  <span className="text-sm text-slate-700">{party.address || 'Não informado'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Related Processes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-amber-600" />
              Processos Relacionados ({relatedProcesses.length})
            </h3>
            <div className="space-y-3">
              {relatedProcesses.map(proc => (
                <Link
                  key={proc.Numero_Processo}
                  to={`/processos/${encodeURIComponent(proc.Numero_Processo)}`}
                  className="block p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-colors"
                >
                  <div className="font-medium text-amber-600 text-sm">{proc.Numero_Processo}</div>
                  <div className="text-xs text-slate-500 mt-1 truncate">{proc.Classe}</div>
                </Link>
              ))}
              {relatedProcesses.length === 0 && (
                <p className="text-sm text-slate-500">Nenhum processo encontrado.</p>
              )}
            </div>
          </div>
        </div>

        {/* Middle Column: Interactions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
            <MessageSquare size={20} className="text-amber-600" />
            Histórico de Interações
          </h3>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
            {partyNotes.map(note => (
              <div key={note.id} className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.content}</p>
                <span className="text-xs text-slate-400 mt-2 block">
                  {new Date(note.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {partyNotes.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center">
                Nenhuma interação registrada.
              </div>
            )}
          </div>

          <div className="shrink-0 mt-auto pt-4 border-t border-slate-100">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Registrar ligação, reunião, e-mail..."
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-sm"
              rows={3}
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Salvar Registro
            </button>
          </div>
        </div>

        {/* Right Column: Tasks */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
            <CheckSquare size={20} className="text-amber-600" />
            Tarefas e Lembretes
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar">
            {partyTasks.map(task => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition-all ${task.completed
                    ? 'bg-slate-50 border-slate-100 opacity-60'
                    : 'bg-white border-slate-200 shadow-sm'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <Clock size={12} />
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {partyTasks.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center">
                Nenhuma tarefa pendente.
              </div>
            )}
          </div>

          <div className="shrink-0 mt-auto pt-4 border-t border-slate-100 space-y-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Título da tarefa..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <input
              type="date"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-600"
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || !newTaskDate}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Adicionar Tarefa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrmPartyDetail;
