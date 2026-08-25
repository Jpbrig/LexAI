import { prisma } from "@/lib/prisma";

export async function seedDatabase() {
  const existingUser = await prisma.user.findFirst({
    where: { email: "teste@lexai.com.br" },
  });

  let user = existingUser;

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Dr. Usuário Teste",
        email: "teste@lexai.com.br",
        oab: "SP 123456",
        plano: "STARTER",
      },
    });
  }

  // Verificar se possui processos
  const count = await prisma.processo.count({
    where: { userId: user.id },
  });

  if (count === 0) {
    const p1 = await prisma.processo.create({
      data: {
        userId: user.id,
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
        alertas: {
          create: {
            userId: user.id,
            tipo: "QUALQUER_MOVIMENTACAO",
            canal: "EMAIL",
            ativo: true,
          },
        },
      },
    });

    const p2 = await prisma.processo.create({
      data: {
        userId: user.id,
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

  return user;
}
