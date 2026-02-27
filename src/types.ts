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
}

export interface Party {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Alert {
  id: string;
  processId: string;
  date: string;
  description: string;
  daysUntil: number;
}
