import React, { useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { FileText, DollarSign, Building2, Gavel, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const { processes, loading } = useAppContext();

  const metrics = useMemo(() => {
    if (!processes.length) return null;

    const totalProcesses = processes.length;
    const totalValue = processes.reduce((sum, p) => sum + p.Valor_Acao, 0);
    
    // Processes by Class
    const classCount: Record<string, number> = {};
    processes.forEach(p => {
      classCount[p.Classe] = (classCount[p.Classe] || 0) + 1;
    });
    const classData = Object.entries(classCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Processes by Foro
    const foroCount: Record<string, number> = {};
    processes.forEach(p => {
      foroCount[p.Foro] = (foroCount[p.Foro] || 0) + 1;
    });
    const foroData = Object.entries(foroCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Recent movements
    const allMovements = processes.flatMap(p => 
      p.Movimentacoes.map(m => ({
        ...m,
        processId: p.Numero_Processo,
        processClass: p.Classe
      }))
    ).filter(m => m.date);

    // Sort by date descending (assuming dd/mm/yyyy format)
    const recentMovements = allMovements.sort((a, b) => {
      const [d1, m1, y1] = a.date.split('/');
      const [d2, m2, y2] = b.date.split('/');
      return new Date(`${y2}-${m2}-${d2}`).getTime() - new Date(`${y1}-${m1}-${d1}`).getTime();
    }).slice(0, 10);

    return {
      totalProcesses,
      totalValue,
      classData,
      foroData,
      recentMovements
    };
  }, [processes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total de Processos</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics.totalProcesses}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Valor Total das Ações</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalValue)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Gavel size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Classes Distintas</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics.classData.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Foros Ativos</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics.foroData.length}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Processos por Classe</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.classData} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Distribuição por Foro</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.foroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.foroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Movements */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-emerald-600" />
            Últimas Movimentações
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {metrics.recentMovements.map((mov, idx) => (
            <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {mov.date}
                    </span>
                    <Link 
                      to={`/processos/${encodeURIComponent(mov.processId)}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {mov.processId}
                    </Link>
                    <span className="text-xs text-slate-500 truncate max-w-[200px]">
                      {mov.processClass}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-2 line-clamp-2 leading-relaxed">
                    {mov.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
