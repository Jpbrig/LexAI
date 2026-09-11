export type JsonObject = Record<string, unknown>;

export function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null;
}

export function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export type ProcessoMovimentacao = {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
  resumoIa?: string | null;
  complemento?: string | null;
};

export type ProcessoListItem = {
  id: string;
  numeroCnj: string;
  tribunal: string;
  classe: string | null;
  assunto: string | null;
  status: string;
  movimentacoes?: ProcessoMovimentacao[];
};

export type ProcessoDetalhe = ProcessoListItem & {
  orgaoJulgador: string | null;
  dataDistribuicao: string | null;
  movimentacoes: ProcessoMovimentacao[];
};

export function isProcessoDetalhe(value: unknown): value is ProcessoDetalhe {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.numeroCnj === "string" &&
    typeof value.tribunal === "string" &&
    Array.isArray(value.movimentacoes)
  );
}

export type DashboardMovimentacao = ProcessoMovimentacao & {
  processoId: string;
  processo: string;
  tribunal: string;
  urgente: boolean;
};

export type DashboardResponse = {
  user?: {
    name?: string | null;
  };
  stats?: {
    totalProcessos?: number;
    processosAtivos?: number;
    movimentacoesHoje?: number;
    totalAlertas?: number;
  };
  onboardingState?: Record<string, boolean>;
  processos?: ProcessoListItem[];
  recentMovimentacoes?: DashboardMovimentacao[];
};

export type ClienteApiItem = {
  id: string;
  nome: string;
  tipo: string;
  documento: string;
  email: string;
  telefone: string;
  cidade: string;
  processosCount?: number;
  processos?: Array<{ id: string }>;
  totalPago?: number;
  status?: string;
  createdAt?: string;
  observacoes?: string | null;
};

export type EventoAgenda = {
  id: string;
  titulo: string;
  tipo: "Prazo Processual" | "Audiência" | "Reunião" | "Perícia";
  data: string;
  hora: string;
  processo: string;
  cliente: string;
  status: "Pendente" | "Concluído";
  prioridade: "Alta" | "Média" | "Baixa";
};

export type AlertaItem = {
  id: string;
  ativo: boolean;
  tipo: string;
  canal: string;
  processo?: {
    numeroCnj?: string | null;
    tribunal?: string | null;
    classe?: string | null;
  } | null;
};

export type ProcessoBuscaResult = {
  numeroCnj: string;
  tribunal: string;
  classe: string;
  assunto: string;
  orgaoJulgador: string;
  parteRequerente?: string;
};

export type DataJudLookupResponse = {
  numeroCnj?: string;
  tribunal?: string;
  classe?: string;
  assunto?: string;
  orgaoJulgador?: string;
  error?: string;
};

export type GovQueryResponse = {
  sucesso?: boolean;
  tipo?: string;
  fonte?: string;
  dados?: unknown;
  data?: Array<{
    title: string;
    source: string;
    snippet: string;
    url?: string;
  }>;
  error?: string;
};
