import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Process, Party, Note, Task, Alert } from '../types';
import { loadProcessesData } from '../services/csvService';
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
}

const AppContext = createContext<AppState | undefined>(undefined);

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

      // Extract unique parties
      const savedParties = JSON.parse(localStorage.getItem('parties') || '[]');
      const partyMap = new Map<string, Party>(savedParties.map((p: Party) => [p.name, p]));
      
      data.forEach(proc => {
        proc.Partes_Envolvidas.forEach(partyName => {
          if (!partyMap.has(partyName)) {
            partyMap.set(partyName, { id: crypto.randomUUID(), name: partyName });
          }
        });
      });
      
      const uniqueParties = Array.from(partyMap.values());
      setParties(uniqueParties);
      localStorage.setItem('parties', JSON.stringify(uniqueParties));

      // Load notes and tasks
      setNotes(JSON.parse(localStorage.getItem('notes') || '[]'));
      setTasks(JSON.parse(localStorage.getItem('tasks') || '[]'));

      // Generate alerts from movements
      const newAlerts: Alert[] = [];
      const today = new Date();
      const nextWeek = addDays(today, 7);

      data.forEach(proc => {
        proc.Movimentacoes.forEach(mov => {
          // Look for dates in the description like dd/mm/yyyy
          const dateRegex = /(\d{2}\/\d{2}\/\d{4})/g;
          let match;
          while ((match = dateRegex.exec(mov.description)) !== null) {
            const dateStr = match[1];
            try {
              const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
              if (isAfter(parsedDate, today) && isBefore(parsedDate, nextWeek)) {
                newAlerts.push({
                  id: crypto.randomUUID(),
                  processId: proc.Numero_Processo,
                  date: dateStr,
                  description: mov.description,
                  daysUntil: differenceInDays(parsedDate, today)
                });
              }
            } catch (e) {
              // Ignore invalid dates
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

  const updateParty = (party: Party) => {
    const updatedParties = parties.map(p => p.id === party.id ? party : p);
    setParties(updatedParties);
    localStorage.setItem('parties', JSON.stringify(updatedParties));
  };

  return (
    <AppContext.Provider value={{ processes, parties, notes, tasks, alerts, loading, addNote, addTask, toggleTask, updateParty }}>
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
