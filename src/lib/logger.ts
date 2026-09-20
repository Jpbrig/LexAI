/**
 * Módulo de Logger Estruturado e Observabilidade para LexAI.
 * Formata logs em JSON estruturado para Vercel Logs, Datadog, Sentry e APM.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  workspaceId?: string | null;
  userId?: string | null;
  scope?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export function sanitizeLogData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ["key", "token", "password", "secret", "authorization", "apikey"];

  for (const [key, value] of Object.entries(data)) {
    const isSensitive = sensitiveKeys.some((s) => key.toLowerCase().includes(s));
    if (isSensitive && typeof value === "string") {
      sanitized[key] = value.length > 8 ? `${value.slice(0, 4)}...***` : "***";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeLogData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function formatLog(level: LogLevel, message: string, context?: LogContext, error?: unknown): string {
  const timestamp = new Date().toISOString();
  const env = process.env.NODE_ENV || "development";

  const payload: Record<string, unknown> = {
    timestamp,
    level,
    env,
    message,
  };

  if (context) {
    const sanitizedContext = sanitizeLogData(context as Record<string, unknown>);
    Object.assign(payload, sanitizedContext);
  }

  if (error) {
    if (error instanceof Error) {
      payload.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      };
    } else {
      payload.error = String(error);
    }
  }

  return JSON.stringify(payload);
}

export const logger = {
  info(message: string, context?: LogContext): void {
    console.log(formatLog("info", message, context));
  },

  warn(message: string, context?: LogContext, error?: unknown): void {
    console.warn(formatLog("warn", message, context, error));
  },

  error(message: string, context?: LogContext, error?: unknown): void {
    console.error(formatLog("error", message, context, error));
  },

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatLog("debug", message, context));
    }
  },

  /**
   * Utilitário para medir tempo de execução de chamadas assíncronas (ex: Gemini, DataJud)
   */
  async trace<T>(
    scope: string,
    action: string,
    fn: () => Promise<T>,
    context?: LogContext,
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      logger.info(`[${scope}] ${action} concluído com sucesso`, {
        ...context,
        scope,
        durationMs,
      });
      return result;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      logger.error(`[${scope}] ${action} falhou`, { ...context, scope, durationMs }, err);
      throw err;
    }
  },
};

