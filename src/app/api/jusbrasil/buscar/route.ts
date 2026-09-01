import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { env } from "@/lib/env";

const requestSchema = z.object({
  termo: z.string().trim().min(3).max(160),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthContext())) return unauthorizedResponse();

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Informe um CPF, CNPJ ou nome válido com pelo menos 3 caracteres." },
        { status: 400 },
      );
    }

    if (!env.JUSBRASIL_API_URL || !env.JUSBRASIL_API_KEY) {
      return NextResponse.json(
        { error: "A busca por CPF/nome está indisponível até a configuração de um provedor autorizado." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "O adaptador Jusbrasil ainda precisa ser habilitado com o contrato e o formato oficial do provedor." },
      { status: 503 },
    );
  } catch (error) {
    console.error("Erro na busca processual por CPF/nome:", error);
    return NextResponse.json({ error: "Erro ao realizar a busca processual." }, { status: 500 });
  }
}
