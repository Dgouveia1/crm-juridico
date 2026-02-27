import Papa from 'papaparse';
import { Process, Movement } from '../types';

export const parseCurrency = (value: string): number => {
  if (!value || value === 'N/A') return 0;
  const cleaned = value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(cleaned) || 0;
};

export const parseMovements = (movementsStr: string): Movement[] => {
  if (!movementsStr || movementsStr === 'N/A') return [];
  const movements = movementsStr.split('||').map(m => m.trim()).filter(m => m);
  return movements.map(m => {
    const match = m.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      return {
        date: match[1],
        description: match[2],
        fullText: m
      };
    }
    return {
      date: '',
      description: m,
      fullText: m
    };
  });
};

export const parseParties = (partiesStr: string): string[] => {
  if (!partiesStr || partiesStr === 'N/A') return [];
  return partiesStr.split(/[,;]/).map(p => p.trim()).filter(p => p);
};

export const loadProcessesData = async (): Promise<Process[]> => {
  try {
    const response = await fetch('/processos_esaj.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const processes: Process[] = results.data.map((row: any) => ({
            Numero_Processo: row.Numero_Processo || '',
            Classe: row.Classe || '',
            Assunto: row.Assunto || '',
            Foro: row.Foro || '',
            Vara: row.Vara || '',
            Juiz: row.Juiz || '',
            Valor_Acao: parseCurrency(row.Valor_Acao),
            Partes_Envolvidas: parseParties(row.Partes_Envolvidas),
            Movimentacoes: parseMovements(row.Movimentacoes)
          }));
          resolve(processes);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Error loading CSV:", error);
    return [];
  }
};
