import { describe, it, expect, vi } from "vitest";
import { logger, sanitizeLogData } from "../logger";

describe("Logger Module", () => {
  it("deve sanitizar chaves sensíveis como tokens, senhas e chaves de API", () => {
    const input = {
      apiKey: "AIzaSy1234567890abcdef",
      secretToken: "super_secret_jwt_token",
      user: "advogado@lexai.com",
      nested: {
        authorizationHeader: "Bearer 123456789",
        normalField: "ok",
      },
    };

    const sanitized = sanitizeLogData(input);

    expect(sanitized.apiKey).toBe("AIza...***");
    expect(sanitized.secretToken).toBe("supe...***");
    expect(sanitized.user).toBe("advogado@lexai.com");
    expect((sanitized.nested as Record<string, unknown>).authorizationHeader).toBe("Bear...***");
    expect((sanitized.nested as Record<string, unknown>).normalField).toBe("ok");
  });

  it("deve formatar log de erro corretamente sem expor dados sensíveis", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("Falha na conexão com DataJud");

    logger.error("Erro na busca", { scope: "datajud", workspaceId: "ws_123" }, err);

    expect(consoleSpy).toHaveBeenCalled();
    const loggedStr = consoleSpy.mock.calls[0]?.[0];
    const parsed = JSON.parse(loggedStr);

    expect(parsed.level).toBe("error");
    expect(parsed.message).toBe("Erro na busca");
    expect(parsed.scope).toBe("datajud");
    expect(parsed.error.message).toBe("Falha na conexão com DataJud");

    consoleSpy.mockRestore();
  });

  it("deve medir o tempo de execução no logger.trace", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = await logger.trace("gemini", "gerarResumo", async () => {
      return "Resumo gerado";
    });

    expect(result).toBe("Resumo gerado");
    expect(consoleSpy).toHaveBeenCalled();
    const parsed = JSON.parse(consoleSpy.mock.calls[0]?.[0]);
    expect(parsed.scope).toBe("gemini");
    expect(parsed.durationMs).toBeGreaterThanOrEqual(0);

    consoleSpy.mockRestore();
  });
});
