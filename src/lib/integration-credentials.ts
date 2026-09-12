import { prisma } from "@/lib/prisma";

export type IntegrationProviderKey =
  | "DATAJUD"
  | "GEMINI"
  | "OPENAI"
  | "RESEND"
  | "CLICSIGN"
  | "JUSBRASIL"
  | "SERPRO"
  | "SENATRAN"
  | "INPI"
  | "IEPTB";

export async function getWorkspaceIntegrationValue(
  workspaceId: string | null | undefined,
  provider: IntegrationProviderKey,
  fallbackEnvName?: string,
): Promise<string | null> {
  if (workspaceId) {
    const row = await prisma.integrationCredential.findUnique({
      where: {
        workspaceId_provider: {
          workspaceId,
          provider,
        },
      },
      select: {
        encryptedValue: true,
      },
    });

    const storedValue = row?.encryptedValue?.trim();
    if (storedValue) {
      return storedValue;
    }
  }

  if (!fallbackEnvName) {
    return null;
  }

  const envValue = process.env[fallbackEnvName]?.trim();
  return envValue || null;
}

export function parseIntegrationValue(value: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // Ignora JSON inválido e usa o valor como string simples.
  }

  return trimmed;
}
