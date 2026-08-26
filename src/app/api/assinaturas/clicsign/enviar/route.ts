import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nomeSignatario, emailSignatario, cpfSignatario, nomeDocumento, conteudoDocumento, metodoAutenticacao, clicsignKey, environment } = body;

    if (!clicsignKey) {
      return NextResponse.json(
        { error: "Token da API ClicSign não configurado. Acesse Configurações → Conectores & Credenciais." },
        { status: 400 }
      );
    }

    if (!nomeSignatario || !emailSignatario || !cpfSignatario || !conteudoDocumento) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios: Nome, E-mail, CPF e documento." },
        { status: 400 }
      );
    }

    const baseUrl = environment === "production" 
      ? "https://app.clicsign.com/api/v1" 
      : "https://sandbox.clicsign.com/api/v1";

    // 1. Criar Documento na ClicSign
    // Transforma o conteúdo de texto em base64 data URI de PDF simulação ou texto
    const contentBase64 = Buffer.from(conteudoDocumento).toString("base64");
    const dataUri = `data:text/plain;base64,${contentBase64}`;

    const docRes = await fetch(`${baseUrl}/documents?access_token=${clicsignKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document: {
          path: `/${nomeDocumento || "Contrato_LexAI"}.txt`,
          content_base64: dataUri,
          deadline_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          auto_close: true,
          locale: "pt-BR",
          sequence_enabled: false
        }
      })
    });

    const docData = await docRes.json().catch(() => ({}));

    if (!docRes.ok) {
      const msg = docData?.errors?.[0] || docData?.message || `Erro ao criar documento na ClicSign (HTTP ${docRes.status}). Verifique seu token nas Configurações.`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const documentKey = docData?.document?.key;

    // 2. Criar / Localizar Signatário na ClicSign
    const signerRes = await fetch(`${baseUrl}/signers?access_token=${clicsignKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signer: {
          email: emailSignatario,
          auths: [metodoAutenticacao || "icp_brasil"], // icp_brasil / email
          name: nomeSignatario,
          documentation: cpfSignatario.replace(/\D/g, ""),
          has_documentation: true,
          delivery: "email"
        }
      })
    });

    const signerData = await signerRes.json().catch(() => ({}));

    if (!signerRes.ok) {
      const msg = signerData?.errors?.[0] || signerData?.message || "Erro ao cadastrar signatário na ClicSign.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const signerKey = signerData?.signer?.key;

    // 3. Associar Signatário ao Documento
    const listRes = await fetch(`${baseUrl}/lists?access_token=${clicsignKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        list: {
          document_key: documentKey,
          signer_key: signerKey,
          sign_as: "party",
          refusal_enabled: true
        }
      })
    });

    if (!listRes.ok) {
      const listData = await listRes.json().catch(() => ({}));
      const msg = listData?.errors?.[0] || "Erro ao vincular signatário ao documento na ClicSign.";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    // 4. Disparar E-mail de Solicitação de Assinatura
    await fetch(`${baseUrl}/notifications?access_token=${clicsignKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request: {
          document_key: documentKey,
          signer_key: signerKey,
          message: "Prezado(a), solicitamos a gentileza de assinar digitalmente o documento anexo com o Selo ICP-Brasil."
        }
      })
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: "Documento enviado com sucesso! O cliente receberá o e-mail de assinatura da ClicSign.",
      documentKey,
      signerKey
    });

  } catch (err) {
    console.error("[clicsign/enviar]", err);
    return NextResponse.json(
      { error: "Erro interno ao conectar com a API da ClicSign." },
      { status: 500 }
    );
  }
}
