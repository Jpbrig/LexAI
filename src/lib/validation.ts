import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  password: z.string().min(8).max(128),
  oab: z.string().trim().max(40).optional().default(""),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: emailSchema.optional(),
  oab: z.string().trim().max(40).optional(),
  image: z.string().max(1_000_000).nullable().optional(),
  currentPassword: z.string().min(1).max(128).optional(),
  newPassword: z.string().min(8).max(128).optional(),
}).superRefine((value, context) => {
  if (value.newPassword && !value.currentPassword) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["currentPassword"],
      message: "A senha atual é obrigatória para trocar a senha.",
    });
  }
});

export const processoSchema = z.object({
  numeroCnj: z.string().trim().min(10).max(40),
  tribunal: z.string().trim().min(2).max(20),
  classe: z.string().trim().max(200).optional(),
  assunto: z.string().trim().max(200).optional(),
  orgaoJulgador: z.string().trim().max(200).optional(),
  notas: z.string().max(20_000).optional(),
});

export const clienteSchema = z.object({
  nome: z.string().trim().min(2).max(160),
  tipo: z.enum(["PF", "PJ"]).default("PF"),
  documento: z.string().trim().min(5).max(30),
  email: z.string().trim().email().max(254).or(z.literal("")),
  telefone: z.string().trim().max(40),
  cep: z.string().trim().max(10).optional().default(""),
  logradouro: z.string().trim().max(200).optional().default(""),
  numero: z.string().trim().max(20).optional().default(""),
  complemento: z.string().trim().max(100).optional().default(""),
  bairro: z.string().trim().max(100).optional().default(""),
  cidade: z.string().trim().max(120),
  uf: z.string().trim().max(2).optional().default(""),
  observacoes: z.string().max(20_000).optional().default(""),
});

export const agendaSchema = z.object({
  titulo: z.string().trim().min(2).max(200),
  tipo: z.string().trim().min(2).max(80),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  processo: z.string().trim().max(60).default("N/A"),
  cliente: z.string().trim().max(160).default("Geral"),
  prioridade: z.enum(["Alta", "Média", "Baixa"]).default("Alta"),
});

export const agendaPatchSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["Pendente", "Concluído"]),
});

export const alertaSchema = z.object({
  processoId: z.string().cuid(),
  tipo: z.enum(["QUALQUER_MOVIMENTACAO", "SENTENCA", "ACORDAO", "DESPACHO", "AUDIENCIA"]).default("QUALQUER_MOVIMENTACAO"),
  canal: z.enum(["EMAIL", "WHATSAPP"]).default("EMAIL"),
});

export const alertaPatchSchema = z.object({
  id: z.string().cuid(),
  ativo: z.boolean(),
});
