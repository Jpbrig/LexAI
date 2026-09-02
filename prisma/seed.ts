import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando criação de contas de teste...");

  const passwordHashAdmin = await bcrypt.hash("AdminMaster123!", 10);
  const passwordHashAdvogado = await bcrypt.hash("Advogado123!", 10);

  // 1. Criar Super Admin (Admin Master)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@lexai.com.br" },
    update: {
      passwordHash: passwordHashAdmin,
      platformRole: "PLATFORM_ADMIN",
    },
    create: {
      name: "Dr. Admin Master (LexAI)",
      email: "admin@lexai.com.br",
      passwordHash: passwordHashAdmin,
      oab: "SP 999999",
      platformRole: "PLATFORM_ADMIN",
      plano: "ESCRITORIO",
    },
  });

  // Criar Workspace do Admin Master
  const adminWs = await prisma.workspace.upsert({
    where: { id: "ws-admin-master" },
    update: {},
    create: {
      id: "ws-admin-master",
      name: "LexAI Platform HQ",
      ownerId: adminUser.id,
      plano: "ESCRITORIO",
    },
  });

  await prisma.membership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: adminWs.id,
        userId: adminUser.id,
      },
    },
    update: { status: "ACTIVE", role: "OWNER" },
    create: {
      workspaceId: adminWs.id,
      userId: adminUser.id,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  // 2. Criar Advogado Cliente (Para testar como usuário comum)
  const advUser = await prisma.user.upsert({
    where: { email: "advogado@escritorio.com.br" },
    update: {
      passwordHash: passwordHashAdvogado,
      platformRole: "USER",
    },
    create: {
      name: "Dr. Roberto Silva (Advogado)",
      email: "advogado@escritorio.com.br",
      passwordHash: passwordHashAdvogado,
      oab: "SP 123456",
      platformRole: "USER",
      plano: "PROFESSIONAL",
    },
  });

  // Criar Workspace do Advogado
  const advWs = await prisma.workspace.upsert({
    where: { id: "ws-silva-associados" },
    update: {},
    create: {
      id: "ws-silva-associados",
      name: "Silva & Associados Advocacia",
      ownerId: advUser.id,
      plano: "PROFESSIONAL",
    },
  });

  await prisma.membership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: advWs.id,
        userId: advUser.id,
      },
    },
    update: { status: "ACTIVE", role: "OWNER" },
    create: {
      workspaceId: advWs.id,
      userId: advUser.id,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  console.log("✅ Contas de teste criadas com sucesso!");
  console.log("------------------------------------------------");
  console.log("👑 ADMIN MASTER:");
  console.log("   E-mail: admin@lexai.com.br");
  console.log("   Senha:  AdminMaster123!");
  console.log("------------------------------------------------");
  console.log("👨‍⚖️ ADVOGADO CLIENTE:");
  console.log("   E-mail: advogado@escritorio.com.br");
  console.log("   Senha:  Advogado123!");
  console.log("------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao criar contas de teste:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
