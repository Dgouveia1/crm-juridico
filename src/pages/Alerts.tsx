import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Bell, Calendar, AlertTriangle, Clock } from 'lucide-react';

const Alerts = () => {
  const { alerts, loading } = useAppContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Bell className="text-emerald-600" />
          Alertas e Prazos
        </h1>
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
          {alerts.length} prazos próximos
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-600">
            Prazos extraídos automaticamente das movimentações processuais para os próximos 7 dias.
          </p>
        </div>
        
        <div className="divide-y divide-slate-100">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-slate-50 transition-colors group">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  alert.daysUntil <= 2 
                    ? 'bg-red-50 text-red-600' 
                    : alert.daysUntil <= 5 
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-blue-50 text-blue-600'
                }`}>
                  {alert.daysUntil <= 2 ? <AlertTriangle size={24} /> : <Clock size={24} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <Link 
                      to={`/processos/${encodeURIComponent(alert.processId)}`}
                      className="text-lg font-semibold text-emerald-600 hover:underline truncate"
                    >
                      {alert.processId}
                    </Link>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-slate-700">{alert.date}</span>
                      <span className={`px-2 py-0.5 rounded-md text-xs ${
                        alert.daysUntil === 0 ? 'bg-red-100 text-red-700' :
                        alert.daysUntil === 1 ? 'bg-red-50 text-red-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {alert.daysUntil === 0 ? 'Hoje' : 
                         alert.daysUntil === 1 ? 'Amanhã' : 
                         `Em ${alert.daysUntil} dias`}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum prazo próximo</h3>
              <p className="text-slate-500">Você não tem prazos para os próximos 7 dias.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
