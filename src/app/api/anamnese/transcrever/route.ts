import { NextRequest, NextResponse } from "next/server";
import { getAuthContext, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-guard";
import { getWorkspaceIntegrationValue } from "@/lib/integration-credentials";
import { isRateLimited } from "@/lib/rate-limit";
import { hasPermission, PERMISSIONS } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthContext();
    if (!authContext) return unauthorizedResponse();
    if (!hasPermission(authContext, PERMISSIONS.AI_TOOLS_USE)) return forbiddenResponse();
    if (await isRateLimited(req, "anamnese-transcrever", 10, 60_000)) {
      return NextResponse.json({ error: "Limite de transcrições por minuto atingido. Aguarde um momento." }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("text") as string | null;

    if (!file && !textInput) {
      return NextResponse.json({ error: "Envie um arquivo de áudio/documento ou texto para transcrição." }, { status: 400 });
    }

    const apiKey = await getWorkspaceIntegrationValue(authContext.workspaceId, "GEMINI", "GEMINI_API_KEY");
    if (!apiKey) {
      return NextResponse.json(
        { error: "A chave de IA (GEMINI_API_KEY) não está configurada para transcrição multimodal." },
        { status: 503 }
      );
    }

    let transcricao = "";

    if (file) {
      const bytes = await file.arrayBuffer();
      const base64Data = Buffer.from(bytes).toString("base64");
      const mimeType = file.type || "audio/mp3";

      // Chamada multimodal nativa ao Gemini 1.5 Flash
      const promptText = `Você é um assistente de transcrição jurídica para advogados.
Analise este arquivo de mídia ou documento enviado pelo cliente/advogado e extraia todo o relato dos fatos com o máximo de precisão em Português do Brasil.
Retorne apenas o texto limpo, corrigido ortograficamente e organizado em parágrafos claros.`;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
          }),
        }
      );

      if (!geminiResponse.ok) {
        throw new Error(`Gemini Multimodal respondeu com status ${geminiResponse.status}`);
      }

      const data = await geminiResponse.json();
      transcricao = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível transcrever o áudio.";
    } else if (textInput) {
      transcricao = textInput.trim();
    }

    return NextResponse.json({ transcricao });
  } catch (error) {
    console.error("Erro na transcrição de áudio/documento:", error);
    return NextResponse.json({ error: "Falha ao processar arquivo ou áudio com a IA." }, { status: 500 });
  }
}
