import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthContext, unauthorizedResponse } from "@/lib/auth-guard";
import { env } from "@/lib/env";

const requestSchema = z.object({
  nomeSignatario: z.string().trim().min(2).max(160),
  emailSignatario: z.string().trim().email().max(254),
  cpfSignatario: z.string().trim().min(5).max(30),
  nomeDocumento: z.string().trim().min(2).max(160),
  conteudoDocumento: z.string().trim().min(1).max(500_000),
  metodoAutenticacao: z.enum(["icp_brasil", "email"]).default("icp_brasil"),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!(await getAuthContext())) return unauthorizedResponse();

    if (!env.CLICSIGN_API_KEY) {
      return NextResponse.json(
        { error: "A assinatura eletrônica está indisponível até a configuração do ClicSign no servidor." },
        { status: 503 },
      );
    }

    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados do documento ou signatário inválidos." }, { status: 400 });
    }

    const {
      nomeSignatario,
      emailSignatario,
      cpfSignatario,
      nomeDocumento,
      conteudoDocumento,
      metodoAutenticacao,
    } = parsed.data;
    const baseUrl = env.CLICSIGN_ENV === "production"
      ? "https://app.clicsign.com/api/v1"
      : "https://sandbox.clicsign.com/api/v1";
    const accessToken = encodeURIComponent(env.CLICSIGN_API_KEY);
    const contentBase64 = Buffer.from(conteudoDocumento, "utf8").toString("base64");
    const dataUri = `data:text/plain;base64,${contentBase64}`;

    const documentResponse = await fetch(`${baseUrl}/documents?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document: {
          path: `/${nomeDocumento}.txt`,
          content_base64: dataUri,
          deadline_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          auto_close: true,
          locale: "pt-BR",
          sequence_enabled: false,
        },
      }),
      cache: "no-store",
    });
    const documentData = await documentResponse.json().catch(() => ({}));
    if (!documentResponse.ok) {
      console.error("ClicSign recusou a criação do documento", { status: documentResponse.status });
      return NextResponse.json({ error: "O ClicSign não aceitou o documento." }, { status: 502 });
    }

    const documentKey = documentData?.document?.key;
    if (!documentKey) {
      return NextResponse.json({ error: "O ClicSign não retornou um identificador de documento." }, { status: 502 });
    }

    const signerResponse = await fetch(`${baseUrl}/signers?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signer: {
          email: emailSignatario,
          auths: [metodoAutenticacao],
          name: nomeSignatario,
          documentation: cpfSignatario.replace(/\D/g, ""),
          has_documentation: true,
          delivery: "email",
        },
      }),
      cache: "no-store",
    });
    const signerData = await signerResponse.json().catch(() => ({}));
    if (!signerResponse.ok) {
      console.error("ClicSign recusou o signatário", { status: signerResponse.status });
      return NextResponse.json({ error: "O ClicSign não aceitou o signatário." }, { status: 502 });
    }

    const signerKey = signerData?.signer?.key;
    if (!signerKey) {
      return NextResponse.json({ error: "O ClicSign não retornou um identificador de signatário." }, { status: 502 });
    }

    const listResponse = await fetch(`${baseUrl}/lists?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        list: {
          document_key: documentKey,
          signer_key: signerKey,
          sign_as: "party",
          refusal_enabled: true,
        },
      }),
      cache: "no-store",
    });
    if (!listResponse.ok) {
      console.error("ClicSign recusou o vínculo do signatário", { status: listResponse.status });
      return NextResponse.json({ error: "Não foi possível vincular o signatário ao documento." }, { status: 502 });
    }

    const notificationResponse = await fetch(`${baseUrl}/notifications?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request: {
          document_key: documentKey,
          signer_key: signerKey,
          message: "Solicitamos a assinatura digital do documento enviado pelo LexAI.",
        },
      }),
      cache: "no-store",
    });
    if (!notificationResponse.ok) {
      console.error("ClicSign não conseguiu disparar a notificação", { status: notificationResponse.status });
      return NextResponse.json({ error: "Documento criado, mas o convite de assinatura não foi enviado." }, { status: 502 });
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Documento enviado para assinatura.",
      documentKey,
      signerKey,
    });
  } catch (error) {
    console.error("Erro ao enviar documento ao ClicSign:", error);
    return NextResponse.json({ error: "Erro interno ao conectar com o ClicSign." }, { status: 500 });
  }
}
