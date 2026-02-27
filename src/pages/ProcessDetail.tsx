import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { ArrowLeft, Building2, Gavel, FileText, DollarSign, Calendar, MessageSquare, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ProcessDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { processes, notes, addNote } = useAppContext();
  
  const [newNote, setNewNote] = useState('');
  
  const process = processes.find(p => p.Numero_Processo === id);
  const processNotes = notes.filter(n => n.processId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!process) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900">Processo não encontrado</h2>
        <button onClick={() => navigate('/processos')} className="mt-4 text-emerald-600 hover:underline">
          Voltar para a lista
        </button>
      </div>
    );
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote({
      processId: process.Numero_Processo,
      content: newNote,
      date: new Date().toISOString()
    });
    setNewNote('');
    toast.success('Anotação adicionada com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/processos')}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{process.Numero_Processo}</h1>
          <p className="text-sm text-slate-500 mt-1">{process.Classe}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-emerald-600" />
              Dados Cadastrais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Assunto</span>
                <span className="text-slate-900 font-medium">{process.Assunto}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Valor da Ação</span>
                <span className="text-slate-900 font-medium flex items-center gap-1">
                  <DollarSign size={14} className="text-emerald-600" />
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(process.Valor_Acao)}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Foro</span>
                <span className="text-slate-900 font-medium flex items-center gap-1">
                  <Building2 size={14} className="text-slate-400" />
                  {process.Foro}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Vara</span>
                <span className="text-slate-900 font-medium">{process.Vara}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Juiz(a)</span>
                <span className="text-slate-900 font-medium flex items-center gap-1">
                  <Gavel size={14} className="text-slate-400" />
                  {process.Juiz}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-emerald-600" />
              Histórico de Movimentações
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {process.Movimentacoes.map((mov, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-100 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Calendar size={16} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-emerald-600 text-sm">{mov.date}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {mov.description}
                    </p>
                  </div>
                </div>
              ))}
              {process.Movimentacoes.length === 0 && (
                <p className="text-slate-500 text-center py-4 relative z-10 bg-white">Nenhuma movimentação registrada.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Partes Envolvidas</h3>
            <div className="space-y-2">
              {process.Partes_Envolvidas.map((party, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-medium text-slate-800">{party}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[500px]">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2 shrink-0">
              <MessageSquare size={20} className="text-emerald-600" />
              Anotações Internas
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
              {processNotes.map(note => (
                <div key={note.id} className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl">
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.content}</p>
                  <span className="text-xs text-slate-400 mt-2 block">
                    {new Date(note.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {processNotes.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center">
                  Nenhuma anotação.<br/>Adicione uma abaixo.
                </div>
              )}
            </div>

            <div className="shrink-0 mt-auto pt-4 border-t border-slate-100">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Nova anotação..."
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                Salvar Anotação
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessDetail;
