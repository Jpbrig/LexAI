import { Resend } from "resend";
import { getWorkspaceIntegrationValue } from "@/lib/integration-credentials";
import { requireServerSecret } from "@/lib/env";

export async function sendWorkspaceInvite(input: { workspaceId: string; email: string; name: string; inviteLink: string }) {
  const apiKey = await getWorkspaceIntegrationValue(input.workspaceId, "RESEND", "RESEND_API_KEY") || requireServerSecret("RESEND_API_KEY");
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;
  await new Resend(apiKey).emails.send({
    from, to: input.email, subject: "Você foi convidado para o LexAI",
    text: `Olá${input.name ? `, ${input.name}` : ""}. Aceite seu convite: ${input.inviteLink}. Ele expira em 7 dias.`,
    html: `<p>Olá${input.name ? `, ${input.name}` : ""}.</p><p>Você foi convidado para um escritório no LexAI.</p><p><a href="${input.inviteLink}">Aceitar convite</a></p><p>Este link expira em 7 dias e pode ser usado uma única vez.</p>`,
  });
  return true;
}
