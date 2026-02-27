import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Process, Party, Note, Task, Alert, AlertType } from '../types';
import { loadProcessesData, inferAlertType } from '../services/csvService';
import { parse, differenceInDays, isAfter, isBefore, addDays } from 'date-fns';

interface AppState {
  processes: Process[];
  parties: Party[];
  notes: Note[];
  tasks: Task[];
  alerts: Alert[];
  loading: boolean;
  addNote: (note: Omit<Note, 'id'>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  updateParty: (party: Party) => void;
  dismissAlert: (id: string) => void;
  deleteTask: (id: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

// Parse brazilian date format dd/mm/yyyy
const parseBRDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    try {
      return parse(`${d}/${m}/${y}`, 'dd/MM/yyyy', new Date());
    } catch {
      return null;
    }
  }
  return null;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const data = await loadProcessesData();
      setProcesses(data);

      // Extract unique parties from all processes & inject fake CRM data on first run
      const savedParties: Party[] = JSON.parse(localStorage.getItem('parties') || '[]');
      const hasFakeData = savedParties.some(p => p.email);

      const FAKE_CRM_PARTIES: Party[] = hasFakeData ? [] : [
        { id: 'f1', name: 'Ricardo Alves Moreira', phone: '(17) 99812-3344', email: 'ricardo.moreira@gmail.com', address: 'Rua das Acácias, 234 – São José do Rio Preto/SP', cpfCnpj: '321.654.987-00', tipo: 'PF', status: 'ativo', processCount: 3, notes: 'Cliente desde 2021. Trabalhista.' },
        { id: 'f2', name: 'Maria Fernanda Costa', phone: '(11) 98765-2211', email: 'mfcosta@outlook.com', address: 'Av. Paulista, 1000 – São Paulo/SP', cpfCnpj: '456.789.123-11', tipo: 'PF', status: 'ativo', processCount: 2, notes: 'Caso de execução fiscal em andamento.' },
        { id: 'f3', name: 'Construtora Horizonte Ltda.', phone: '(14) 3333-9900', email: 'juridico@horizonteltda.com.br', address: 'Rua XV de Novembro, 500 – Bauru/SP', cpfCnpj: '12.345.678/0001-99', tipo: 'PJ', status: 'ativo', processCount: 5, notes: 'Múltiplos contratos de obra questionados.' },
        { id: 'f4', name: 'Jorge Henrique Souza', phone: '(17) 99100-4455', email: 'jorge.souza@hotmail.com', address: 'Rua Flores, 87 – Catanduva/SP', cpfCnpj: '789.000.111-22', tipo: 'PF', status: 'prospecto', processCount: 0, notes: 'Primeira consulta agendada para março.' },
        { id: 'f5', name: 'Posto Bela Vista ME', phone: '(16) 3212-5588', email: 'posto.belavista@gmail.com', address: 'Rodovia SP-330, Km 201 – Ribeirão Preto/SP', cpfCnpj: '98.765.432/0001-55', tipo: 'PJ', status: 'ativo', processCount: 1, notes: 'Ação de indenização por acidente.' },
        { id: 'f6', name: 'Ana Lucia Brandão', phone: '(11) 97654-3322', email: 'ana.brandao@yahoo.com.br', address: 'Rua Ipiranga, 321 – Campinas/SP', cpfCnpj: '234.567.890-33', tipo: 'PF', status: 'inativo', processCount: 1, notes: 'Processo encerrado em 2023.' },
        { id: 'f7', name: 'Transportadora RS S.A.', phone: '(51) 3099-7788', email: 'contato@transportadorars.com.br', address: 'Av. Industrial, 2500 – Porto Alegre/RS', cpfCnpj: '11.222.333/0001-44', tipo: 'PJ', status: 'ativo', processCount: 4, notes: 'Defesa em ação coletiva de consumidores.' },
        { id: 'f8', name: 'Luís Eduardo Carvalho', phone: '(17) 98812-7700', email: 'leducarvalho@gmail.com', address: 'Rua Duque de Caxias, 45 – Jales/SP', cpfCnpj: '345.678.901-55', tipo: 'PF', status: 'ativo', processCount: 2, notes: 'Divórcio litigioso. Urgente.' },
        { id: 'f9', name: 'TechFarm Agronegócios Ltda.', phone: '(17) 3621-8800', email: 'legal@techfarm.agr.br', address: 'Rod. Euclides da Cunha, Km 12 – Mirassol/SP', cpfCnpj: '65.432.100/0001-77', tipo: 'PJ', status: 'prospecto', processCount: 0, notes: 'Interesse em regularização de contratos rurais.' },
        { id: 'f10', name: 'Claudia Ramos Pinto', phone: '(14) 99234-5566', email: 'claudia.r.pinto@outlook.com', address: 'Rua Antônio de Pádua, 78 – Jaú/SP', cpfCnpj: '567.890.234-66', tipo: 'PF', status: 'ativo', processCount: 1, notes: 'Previdenciário – revisão de benefício.' },
        { id: 'f11', name: 'Supermercado Mineiro Ltda.', phone: '(31) 3344-6600', email: 'adm@mercadomineiro.com.br', address: 'Av. Brasil, 800 – Belo Horizonte/MG', cpfCnpj: '44.333.222/0001-11', tipo: 'PJ', status: 'ativo', processCount: 3, notes: 'Questão trabalhista plural.' },
        { id: 'f12', name: 'Roberta Lima Figueiredo', phone: '(19) 99877-1234', email: 'roberta.lima@gmail.com', address: 'Av. Anhanguera, 560 – Goiânia/GO', cpfCnpj: '678.901.234-77', tipo: 'PF', status: 'inativo', processCount: 0, notes: 'Cliente encerrou contrato por acordo.' },
      ];

      const partyMap = new Map<string, Party>(
        (hasFakeData ? savedParties : FAKE_CRM_PARTIES).map((p: Party) => [p.name, p])
      );

      data.forEach(proc => {
        proc.Partes_Envolvidas.forEach(partyName => {
          if (!partyMap.has(partyName)) {
            partyMap.set(partyName, { id: crypto.randomUUID(), name: partyName, tipo: 'PF', status: 'ativo' });
          }
        });
      });

      const uniqueParties = Array.from(partyMap.values());
      setParties(uniqueParties);
      localStorage.setItem('parties', JSON.stringify(uniqueParties));

      // Load notes and tasks from localStorage
      setNotes(JSON.parse(localStorage.getItem('notes') || '[]'));
      setTasks(JSON.parse(localStorage.getItem('tasks') || '[]'));

      // Load dismissed alerts
      const dismissed: string[] = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');

      // ─── SMART ALERT ENGINE ───────────────────────────────────────────────
      // Strategy: scan the LAST movement of each process.
      // If it contains keywords (Prazo, Intimação, Publicado) AND the movement
      // date is within the last 15 days → generate an alert (the lawyer needs to act).
      // Also do deep scan for explicit future dates in descriptions.
      const newAlerts: Alert[] = [];
      const today = new Date();
      const fifteenDaysAgo = addDays(today, -15);
      const nextThirtyDays = addDays(today, 30);
      const seenIds = new Set<string>();

      data.forEach(proc => {
        if (!proc.Movimentacoes.length) return;
        const lastMov = proc.Movimentacoes[0]; // movements are newest-first

        // ── Check last movement date is within 15 days ──
        if (lastMov.date) {
          const movDate = parseBRDate(lastMov.date);
          if (movDate && isAfter(movDate, fifteenDaysAgo)) {
            const alertId = `${proc.Numero_Processo}-last`;
            if (!seenIds.has(alertId) && !dismissed.includes(alertId)) {
              const daysAgo = differenceInDays(today, movDate);
              const alertType: AlertType = inferAlertType(lastMov.description);
              // Only alert if it's a "action required" keyword
              const desc = lastMov.description.toLowerCase();
              const isActionable =
                desc.includes('prazo') ||
                desc.includes('manifestar') ||
                desc.includes('intime-se') ||
                desc.includes('intimação') ||
                desc.includes('publicad') ||
                desc.includes('prosseguimento') ||
                desc.includes('ato ordinatório');

              if (isActionable) {
                seenIds.add(alertId);
                newAlerts.push({
                  id: alertId,
                  processId: proc.Numero_Processo,
                  date: lastMov.date,
                  description: `[${proc.Classe}] ${lastMov.description.slice(0, 200)}${lastMov.description.length > 200 ? '...' : ''}`,
                  daysUntil: -daysAgo, // negative means it was X days ago, 0 = today
                  type: alertType,
                });
              }
            }
          }
        }

        // ── Deep scan for explicit future dates in all movements ──
        proc.Movimentacoes.slice(0, 5).forEach(mov => {
          const dateRegex = /(\d{2}\/\d{2}\/\d{4})/g;
          let match;
          while ((match = dateRegex.exec(mov.description)) !== null) {
            const dateStr = match[1];
            try {
              const parsedDate = parseBRDate(dateStr);
              if (parsedDate && isAfter(parsedDate, today) && isBefore(parsedDate, nextThirtyDays)) {
                const alertId = `${proc.Numero_Processo}-${dateStr}`;
                if (!seenIds.has(alertId) && !dismissed.includes(alertId)) {
                  seenIds.add(alertId);
                  newAlerts.push({
                    id: alertId,
                    processId: proc.Numero_Processo,
                    date: dateStr,
                    description: mov.description.slice(0, 250),
                    daysUntil: differenceInDays(parsedDate, today),
                    type: inferAlertType(mov.description),
                  });
                }
              }
            } catch {
              // ignore parse errors
            }
          }
        });
      });

      setAlerts(newAlerts.sort((a, b) => a.daysUntil - b.daysUntil));
      setLoading(false);
    };

    initData();
  }, []);

  const addNote = (note: Omit<Note, 'id'>) => {
    const newNote = { ...note, id: crypto.randomUUID() };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: crypto.randomUUID() };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const updateParty = (party: Party) => {
    const updatedParties = parties.map(p => p.id === party.id ? party : p);
    setParties(updatedParties);
    localStorage.setItem('parties', JSON.stringify(updatedParties));
  };

  const dismissAlert = (id: string) => {
    const dismissed: string[] = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
    dismissed.push(id);
    localStorage.setItem('dismissedAlerts', JSON.stringify(dismissed));
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AppContext.Provider value={{
      processes, parties, notes, tasks, alerts, loading,
      addNote, addTask, toggleTask, updateParty, dismissAlert, deleteTask
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
