import { prisma } from "./src/lib/prisma";

async function runApiTests() {
  console.log("==================================================");
  console.log("API AUDIT — FASE 2: Validações e IA em Produção");
  console.log("==================================================\n");

  // 1. Authenticate / get session
  console.log("Step 1: Autenticando...");
  const csrfRes = await fetch("http://localhost:3000/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const setCookies = csrfRes.headers.getSetCookie();
  const cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');

  const loginRes = await fetch("http://localhost:3000/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieHeader,
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({
      email: "teste@lexai.com.br",
      password: "Password123!",
      csrfToken: csrfData.csrfToken,
      callbackUrl: "http://localhost:3000/dashboard",
      json: "true",
    }).toString(),
    redirect: "manual",
  });

  const sessionCookies = loginRes.headers.getSetCookie();
  const authCookieHeader = sessionCookies.map(c => c.split(';')[0]).join('; ');
  console.log("Autenticado:", loginRes.status, "\n");

  const results: Array<{ endpoint: string; method: string; status: number; ok: boolean; summary: string }> = [];

  async function testApi(label: string, endpoint: string, method = "GET", body?: Record<string, unknown>) {
    try {
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          "Cookie": authCookieHeader,
        },
      };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(`http://localhost:3000${endpoint}`, options);
      const data = await res.json().catch(() => ({}));
      const ok = res.status >= 200 && res.status < 400;
      const summary = ok
        ? JSON.stringify(data).slice(0, 120) + "..."
        : `Error: ${data.error || res.statusText}`;

      results.push({ endpoint: label, method, status: res.status, ok, summary });
      console.log(`${ok ? "✅" : "❌"} [${method}] ${label} => ${res.status} | ${summary}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ endpoint: label, method, status: 500, ok: false, summary: msg });
      console.error(`❌ [${method}] ${label} => EXCEPTION: ${msg}`);
    }
  }

  // ===== CRUD CORE =====
  console.log("\n── CRUD CORE ────────────────────────────────────");
  await testApi("dashboard", "/api/dashboard");
  await testApi("processos GET", "/api/processos");
  await testApi("processos POST", "/api/processos", "POST", {
    numeroCnj: "9900001-12.2024.8.26.0050",
    tribunal: "TJSP",
    classe: "Procedimento Comum Cível",
    assunto: "Responsabilidade Civil",
  });
  await testApi("clientes GET", "/api/clientes");

  // CORREÇÃO: tipo deve ser "PF" ou "PJ" (não "Pessoa Física")
  await testApi("clientes POST (correto)", "/api/clientes", "POST", {
    nome: "Maria Souza Teste",
    tipo: "PF",
    documento: "987.654.321-00",
    email: "maria.souza@exemplo.com.br",
    telefone: "(21) 98765-4321",
    cidade: "Rio de Janeiro/RJ",
    // observacoes agora é opcional (corrigido no schema)
  });

  await testApi("agenda GET", "/api/agenda");
  await testApi("agenda POST", "/api/agenda", "POST", {
    titulo: "Audiência Instrução - Teste",
    tipo: "Audiência",
    data: "2026-10-10",
    hora: "09:00",
  });
  await testApi("alertas GET", "/api/alertas");

  // ===== APIS PÚBLICAS =====
  console.log("\n── APIS PÚBLICAS REAIS ──────────────────────────");
  await testApi("CEP via ViaCEP", "/api/consultas/gov", "POST", {
    tipo: "cep",
    termo: "04578-000",
  });
  await testApi("CNPJ via BrasilAPI", "/api/consultas/gov", "POST", {
    tipo: "empresas",
    termo: "60.872.504/0001-23", // Bradesco SA (empresa real)
  });
  await testApi("Buscador Processual (DataJud)", "/api/consultas/gov", "POST", {
    tipo: "buscador",
    termo: "1000123-45.2024.8.26.0100",
  });
  await testApi("Jurisprudência (Links Oficiais)", "/api/jurisprudencia/buscar", "POST", {
    termo: "dano moral cancelamento voo",
    tribunal: "STJ",
  });

  // ===== IA (requer GEMINI_API_KEY em produção) =====
  console.log("\n── IA (503 se GEMINI_API_KEY vazio no local) ───");
  await testApi("AI Resumo", "/api/ai/resumo", "POST", {
    texto: "Decisão: Julgo procedente o pedido para condenar o réu ao pagamento de R$ 10.000,00 a título de danos morais. Prazo de 15 dias para cumprimento voluntário.",
    tipo: "Sentença",
  });
  await testApi("AI Assistente", "/api/ai/assistente", "POST", {
    text: "Qual é o prazo para apelação no CPC brasileiro?",
    messages: [],
  });
  await testApi("Petição Gerar (inicial)", "/api/peticoes/gerar", "POST", {
    tipoPeca: "inicial",
    requerente: "Ana Paula",
    requerido: "Operadora de Saúde Beta",
    fatos: "A requerente teve plano de saúde cancelado indevidamente após 12 anos de contribuição sem qualquer inadimplência.",
    pedidos: "Reintegração ao plano, indenização por danos morais de R$ 15.000,00.",
  });

  // ===== RELATÓRIO FINAL =====
  console.log("\n==================================================");
  console.log("RELATÓRIO FINAL");
  console.log("==================================================");
  const total = results.length;
  const passed = results.filter(r => r.ok).length;
  const failed = total - passed;
  console.log(`Total: ${total} | ✅ Passou: ${passed} | ❌ Falhou: ${failed}`);

  if (failed > 0) {
    console.log("\n── Endpoints com Falha:");
    results.filter(r => !r.ok).forEach(r =>
      console.log(`  ❌ [${r.method}] ${r.endpoint} => ${r.status}: ${r.summary}`)
    );
  }

  await prisma.$disconnect();
}

runApiTests();
