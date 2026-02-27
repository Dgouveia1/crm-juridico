import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import { Search, User, Phone, Mail, MapPin } from 'lucide-react';

const CrmParties = () => {
  const { parties } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Partes (CRM)</h1>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParties.map(party => (
          <Link 
            key={party.id} 
            to={`/crm/${party.id}`}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <User size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 truncate" title={party.name}>
                  {party.name}
                </h3>
                <div className="mt-3 space-y-2">
                  {party.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span className="truncate">{party.phone}</span>
                    </div>
                  )}
                  {party.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{party.email}</span>
                    </div>
                  )}
                  {party.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{party.address}</span>
                    </div>
                  )}
                  {!party.phone && !party.email && !party.address && (
                    <span className="text-sm text-slate-400 italic">Sem dados de contato</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filteredParties.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-500">
            Nenhuma parte encontrada.
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmParties;
