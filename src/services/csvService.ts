import Papa from 'papaparse';
import { Process, Movement, ProcessStage, AlertType } from '../types';

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

/**
 * Infers the current stage of a process from the last 3 movements.
 */
export const inferProcessStage = (movements: Movement[]): ProcessStage => {
  if (!movements.length) return 'Petição Inicial';

  // Scan the last 3 movements for keywords
  const recent = movements.slice(0, 3).map(m => (m.description + ' ' + m.fullText).toLowerCase());
  const combined = recent.join(' ');

  if (combined.includes('trânsito em julgado') || combined.includes('arquivado')) {
    return 'Arquivado';
  }
  if (combined.includes('recurso') || combined.includes('apelação') || combined.includes('agravo') || combined.includes('embargos')) {
    return 'Recurso';
  }
  if (combined.includes('sentença') || combined.includes('julgad') || combined.includes('procedente') || combined.includes('improcedente')) {
    return 'Sentença';
  }
  if (combined.includes('penhora') || combined.includes('execução') || combined.includes('execut') || combined.includes('cumprimento de sentença') || combined.includes('bloqueio')) {
    return 'Execução';
  }
  if (combined.includes('audiência') || combined.includes('perícia') || combined.includes('instrução') || combined.includes('prova')) {
    return 'Instrução';
  }

  return 'Petição Inicial';
};

/**
 * Detects alert type from movement description keywords.
 */
export const inferAlertType = (description: string): AlertType => {
  const lower = description.toLowerCase();
  if (lower.includes('prazo') || lower.includes('manifestar') || lower.includes('prosseguimento')) return 'prazo';
  if (lower.includes('intimação') || lower.includes('intimado') || lower.includes('intime-se') || lower.includes('portal')) return 'intimacao';
  if (lower.includes('publicad') || lower.includes('relação:') || lower.includes('dje') || lower.includes('diário')) return 'publicacao';
  if (lower.includes('decisão') || lower.includes('despacho') || lower.includes('sentença') || lower.includes('julgad')) return 'decisao';
  return 'geral';
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
          const processes: Process[] = results.data.map((row: any) => {
            const movs = parseMovements(row.Movimentacoes);
            const stage = inferProcessStage(movs);
            const classe = row.Classe || '';
            return {
              Numero_Processo: row.Numero_Processo || '',
              Classe: classe,
              Assunto: row.Assunto || '',
              Foro: row.Foro || '',
              Vara: row.Vara || '',
              Juiz: row.Juiz || '',
              Valor_Acao: parseCurrency(row.Valor_Acao),
              Partes_Envolvidas: parseParties(row.Partes_Envolvidas),
              Movimentacoes: movs,
              stage,
            };
          });
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
