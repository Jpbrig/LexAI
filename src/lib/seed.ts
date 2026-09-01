import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "teste@lexai.com.br";

export async function seedDatabase() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("O seed da conta demo está desabilitado em produção.");
  }

  const demoPassword = process.env.DEMO_PASSWORD;
  if (!demoPassword) {
    throw new Error("DEMO_PASSWORD é obrigatória para executar o seed local.");
  }

  let user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  const passwordHash = await bcrypt.hash(demoPassword, 12);

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Dr. Usuário Teste",
        email: DEMO_EMAIL,
        oab: "SP 123456",
        plano: "STARTER",
        passwordHash,
      },
    });
  } else if (!user.passwordHash) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  }

  let membership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    const workspace = await prisma.workspace.create({
      data: {
        name: "Escritório Demo LexAI",
        ownerId: user.id,
        plano: "STARTER",
      },
    });

    membership = await prisma.membership.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });
  }

  const workspaceId = membership.workspaceId;
  const countProcessos = await prisma.processo.count({
    where: { workspaceId },
  });

  if (countProcessos === 0) {
    const processoUm = await prisma.processo.create({
      data: {
        userId: user.id,
        workspaceId,
        numeroCnj: "0012345-67.2023.8.26.0100",
        tribunal: "TJSP",
        classe: "Ação de Indenização por Danos Morais",
        assunto: "Responsabilidade Civil / Dano Moral",
        orgaoJulgador: "14ª Vara Cível — Foro Central",
        dataDistribuicao: new Date("2023-03-12"),
        status: "ATIVO",
        movimentacoes: {
          create: [
            {
              data: new Date("2026-08-25T10:30:00Z"),
              tipo: "Sentença",
              descricao:
                "Vistos. Trata-se de ação de reparação de danos morais proposta por João da Silva em face de Empresa XYZ Ltda. Julgo PROCEDENTE o pedido inicial para condenar o réu ao pagamento de R$ 15.000,00 de danos morais. Prazo de recurso: 15 dias.",
              resumoIa:
                "✅ DECISÃO FAVORÁVEL: O juiz deu ganho de causa ao autor. O réu foi condenado a pagar R$ 15.000,00 de danos morais. Prazo de recurso: 15 dias.",
            },
            {
              data: new Date("2026-07-10T14:00:00Z"),
              tipo: "Audiência",
              descricao:
                "Realizada audiência de instrução e julgamento com oitiva de testemunhas. Feito concluso para sentença.",
              resumoIa:
                "📋 AUDIÊNCIA REALIZADA: Testemunhas ouvidas e processo encaminhado para sentença.",
            },
          ],
        },
      },
    });

    await prisma.alerta.create({
      data: {
        userId: user.id,
        workspaceId,
        processoId: processoUm.id,
        tipo: "QUALQUER_MOVIMENTACAO",
        canal: "EMAIL",
        ativo: true,
      },
    });

    await prisma.processo.create({
      data: {
        userId: user.id,
        workspaceId,
        numeroCnj: "0098765-43.2022.4.03.6100",
        tribunal: "TRF3",
        classe: "Mandado de Segurança",
        assunto: "Direito Tributário",
        orgaoJulgador: "2ª Vara Cível Federal",
        dataDistribuicao: new Date("2022-07-05"),
        status: "ATIVO",
        movimentacoes: {
          create: [
            {
              data: new Date("2026-08-25T09:15:00Z"),
              tipo: "Despacho",
              descricao:
                "Intimem-se as partes para manifestação sobre a proposta de conciliação no prazo de 15 dias.",
              resumoIa:
                "📅 MANIFESTAÇÃO SOLICITADA: O juiz deu 15 dias para as partes se manifestarem sobre acordo de conciliação.",
            },
          ],
        },
      },
    });
  }

  const countClientes = await prisma.cliente.count({ where: { workspaceId } });
  if (countClientes === 0) {
    await prisma.cliente.createMany({
      data: [
        {
          userId: user.id,
          workspaceId,
          nome: "Carlos Eduardo Silva",
          tipo: "PF",
          documento: "123.456.789-00",
          email: "carlos.silva@email.com",
          telefone: "(11) 98765-4321",
          cidade: "São Paulo / SP",
          totalPago: 11700,
          status: "Ativo",
          observacoes: "Cliente em ação trabalhista e revisão contratual. Preferência de contato por WhatsApp.",
        },
        {
          userId: user.id,
          workspaceId,
          nome: "Empresa XYZ S/A",
          tipo: "PJ",
          documento: "12.345.678/0001-99",
          email: "juridico@xyzsa.com.br",
          telefone: "(11) 3344-5566",
          cidade: "Campinas / SP",
          totalPago: 45000,
          status: "Ativo",
          observacoes: "Contrato de assessoria mensalista (Retainer). Faturamento todo dia 05.",
        },
        {
          userId: user.id,
          workspaceId,
          nome: "Mariana Souza Santos",
          tipo: "PF",
          documento: "987.654.321-11",
          email: "mariana.santos@email.com",
          telefone: "(21) 99887-6655",
          cidade: "Rio de Janeiro / RJ",
          totalPago: 3500,
          status: "Ativo",
          observacoes: "Ação indenizatória contra cia aérea (extravio de bagagem).",
        },
      ],
    });
  }

  const countAgenda = await prisma.eventoAgenda.count({ where: { workspaceId } });
  if (countAgenda === 0) {
    await prisma.eventoAgenda.createMany({
      data: [
        {
          userId: user.id,
          workspaceId,
          titulo: "Contestação — Ação Trabalhista",
          tipo: "Prazo Processual",
          data: "2026-08-28",
          hora: "23:59",
          processo: "0012345-67.2023.8.26.0100",
          cliente: "Carlos Eduardo Silva",
          status: "Pendente",
          prioridade: "Alta",
        },
        {
          userId: user.id,
          workspaceId,
          titulo: "Audiência de Conciliação Virtual",
          tipo: "Audiência",
          data: "2026-08-30",
          hora: "14:30",
          processo: "0098765-43.2022.4.03.6100",
          cliente: "Empresa XYZ S/A",
          status: "Pendente",
          prioridade: "Alta",
        },
        {
          userId: user.id,
          workspaceId,
          titulo: "Reunião de Alinhamento de Contrato",
          tipo: "Reunião",
          data: "2026-09-01",
          hora: "10:00",
          processo: "N/A",
          cliente: "Mariana Souza Santos",
          status: "Pendente",
          prioridade: "Média",
        },
      ],
    });
  }

  return user;
}
