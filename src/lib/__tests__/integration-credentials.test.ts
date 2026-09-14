import { describe, expect, test } from "vitest";

describe("integration credential encryption", () => {
  test("encrypts values with authenticated encryption and restores the original", async () => {
    process.env.INTEGRATION_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const { decryptIntegrationValue, encryptIntegrationValue } = await import("../integration-credentials");

    const secret = "sk-live-sensitive-value";
    const encrypted = encryptIntegrationValue(secret);

    expect(encrypted).toMatch(/^v1:/);
    expect(encrypted).not.toContain(secret);
    expect(decryptIntegrationValue(encrypted)).toBe(secret);
  });
});
