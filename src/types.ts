export type ProcessStage =
  | 'Petição Inicial'
  | 'Instrução'
  | 'Sentença'
  | 'Recurso'
  | 'Execução'
  | 'Arquivado';

export type AlertType = 'prazo' | 'intimacao' | 'publicacao' | 'decisao' | 'geral';

export interface Movement {
  date: string;
  description: string;
  fullText: string;
}

export interface Process {
  Numero_Processo: string;
  Classe: string;
  Assunto: string;
  Foro: string;
  Vara: string;
  Juiz: string;
  Valor_Acao: number;
  Partes_Envolvidas: string[];
  Movimentacoes: Movement[];
  stage: ProcessStage;
  successProbability: number;
}

export interface Note {
  id: string;
  processId?: string;
  partyId?: string;
  content: string;
  date: string;
}

export interface Task {
  id: string;
  processId?: string;
  partyId?: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority?: 'alta' | 'media' | 'baixa';
}

export type PartyTipo = 'PF' | 'PJ';
export type PartyStatus = 'ativo' | 'inativo' | 'prospecto';

export interface Party {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  cpfCnpj?: string;
  tipo?: PartyTipo;
  status?: PartyStatus;
  processCount?: number;
  notes?: string;
}

export interface Alert {
  id: string;
  processId: string;
  date: string;
  description: string;
  daysUntil: number;
  type: AlertType;
  dismissed?: boolean;
}
