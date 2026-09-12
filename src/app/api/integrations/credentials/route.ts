import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const supportedProviders = [
  "DATAJUD",
  "GEMINI",
  "OPENAI",
  "RESEND",
  "CLICSIGN",
  "JUSBRASIL",
  "SERPRO",
  "SENATRAN",
  "INPI",
  "IEPTB",
] as const;

const providerSchema = z.enum(supportedProviders);

const requestSchema = z.object({
  provider: providerSchema,
  value: z.string().trim().optional().default(""),
});

export async function GET() {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();

    const rows = await prisma.integrationCredential.findMany({
      where: { workspaceId: context.workspaceId },
      select: {
        provider: true,
        encryptedValue: true,
        status: true,
      },
    });

    const items = supportedProviders.map((provider) => {
      const row = rows.find((item) => item.provider === provider);
      return {
        provider,
        configured: Boolean(row?.encryptedValue?.trim()),
        value: row?.encryptedValue ?? "",
      };
    });

    return NextResponse.json({ providers: items });
  } catch (error) {
    console.error("Erro ao carregar credenciais de integrações:", error);
    return NextResponse.json({ error: "Erro ao carregar integrações." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const context = await getAuthContext();
    if (!context) return unauthorizedResponse();

    const body = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos para a integração." }, { status: 400 });
    }

    const { provider, value } = parsed.data;
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      await prisma.integrationCredential.deleteMany({
        where: {
          workspaceId: context.workspaceId,
          provider,
        },
      });

      return NextResponse.json({ success: true, configured: false });
    }

    await prisma.integrationCredential.upsert({
      where: {
        workspaceId_provider: {
          workspaceId: context.workspaceId,
          provider,
        },
      },
      create: {
        workspaceId: context.workspaceId,
        provider,
        encryptedValue: normalizedValue,
        status: "CONFIGURED",
      },
      update: {
        encryptedValue: normalizedValue,
        status: "CONFIGURED",
        lastCheckedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, configured: true });
  } catch (error) {
    console.error("Erro ao salvar credenciais de integrações:", error);
    return NextResponse.json({ error: "Erro ao salvar a integração." }, { status: 500 });
  }
}
