import { prisma } from "@/lib/prisma";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { requireServerSecret } from "@/lib/env";

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

const ENCRYPTION_PREFIX = "v1:";

function getEncryptionKey(): Buffer {
  const rawKey = requireServerSecret("INTEGRATION_ENCRYPTION_KEY");
  if (!rawKey) throw new Error("INTEGRATION_ENCRYPTION_KEY não configurada.");

  const key = /^[0-9a-f]{64}$/i.test(rawKey)
    ? Buffer.from(rawKey, "hex")
    : Buffer.from(rawKey, "base64");

  if (key.length !== 32) {
    throw new Error("INTEGRATION_ENCRYPTION_KEY deve ter 32 bytes em base64 ou 64 caracteres hexadecimais.");
  }
  return key;
}

export function encryptIntegrationValue(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENCRYPTION_PREFIX}${Buffer.concat([iv, tag, encrypted]).toString("base64")}`;
}

export function decryptIntegrationValue(value: string): string {
  if (!value.startsWith(ENCRYPTION_PREFIX)) {
    // Compatibilidade temporária com registros anteriores. Eles são
    // regravados criptografados no primeiro uso quando a chave existir.
    return value;
  }

  const payload = Buffer.from(value.slice(ENCRYPTION_PREFIX.length), "base64");
  if (payload.length < 29) throw new Error("Credencial criptografada inválida.");
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), payload.subarray(0, 12));
  decipher.setAuthTag(payload.subarray(12, 28));
  return Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString("utf8");
}

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
      const decrypted = decryptIntegrationValue(storedValue);
      if (!storedValue.startsWith(ENCRYPTION_PREFIX)) {
        await prisma.integrationCredential.update({
          where: { workspaceId_provider: { workspaceId, provider } },
          data: { encryptedValue: encryptIntegrationValue(decrypted) },
        });
      }
      return decrypted;
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
