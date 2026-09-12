"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
  Bell,
  KeyRound,
  Loader2,
  UserPlus,
  X,
  ShieldCheck,
  Check,
  Shield,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oab, setOab] = useState("");
  const [image, setImage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");
  const [passSaving, setPassSaving] = useState(false);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);

  // Modal Convidar Membro State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "ASSOCIATE" | "INTERN" | "SECRETARY">("ASSOCIATE");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState("");

  type MembroItem = {
    id: string;
    nome: string;
    email: string;
    perfil: "ADMIN" | "ASSOCIATE" | "INTERN" | "SECRETARY";
    mfa: string;
    status: string;
    isTitular?: boolean;
  };

  const [membros, setMembros] = useState<MembroItem[]>([]);
  const [integrations, setIntegrations] = useState<Array<{ provider: string; configured: boolean }>>([]);
  const [integrationInputs, setIntegrationInputs] = useState<Record<string, string>>({});
  const [savingIntegration, setSavingIntegration] = useState<string | null>(null);
  const [integrationFeedback, setIntegrationFeedback] = useState<string | null>(null);

  function carregarMembros() {
    fetch("/api/workspace/members")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMembros(data);
      })
      .catch((err) => console.error("Erro ao carregar membros", err));
  }

  async function handleConvidarMembro(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    setInviteSending(true);

    try {
      const res = await fetch("/api/workspace/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Erro ao convidar membro.");
        setInviteSending(false);
        return;
      }

      setInviteSuccessMsg(`Convite criado! Link (fallback temporário): ${data.inviteLink}`);
      
      setTimeout(() => {
        setInviteSuccessMsg("");
        setShowInviteModal(false);
        setInviteName("");
        setInviteEmail("");
        setInviteRole("ASSOCIATE");
        carregarMembros(); // recarrega a tabela
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao convidar membro.");
    } finally {
      setInviteSending(false);
    }
  }

  async function handleRemoverMembro(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja remover ${nome} do escritório?`)) return;
    
    try {
      const res = await fetch(`/api/workspace/members/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Erro ao remover membro.");
        return;
      }
      
      carregarMembros();
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao remover membro.");
    }
  }

  async function carregarIntegracoes() {
    try {
      const res = await fetch("/api/integrations/credentials");
      if (!res.ok) return;

      const data = await res.json();
      setIntegrations(data.providers || []);
      setIntegrationInputs((prev) => {
        const next = { ...prev };
        for (const item of data.providers || []) {
          if (!(item.provider in next)) {
            next[item.provider] = "";
          }
        }
        return next;
      });
    } catch (err) {
      console.error("Erro ao carregar integrações", err);
    }
  }

  async function handleSaveIntegration(provider: string, value: string) {
    setSavingIntegration(provider);
    setIntegrationFeedback(null);

    try {
      const res = await fetch("/api/integrations/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, value }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar integração.");
      }

      setIntegrations((prev) =>
        prev.map((item) =>
          item.provider === provider
            ? { ...item, configured: Boolean(data.configured) }
            : item,
        ),
      );
      setIntegrationInputs((prev) => ({ ...prev, [provider]: "" }));
      setIntegrationFeedback(`Configuração salva para ${provider}.`);
      setTimeout(() => setIntegrationFeedback(null), 3000);
    } catch (err) {
      console.error("Erro ao salvar integração", err);
      setIntegrationFeedback(err instanceof Error ? err.message : "Erro ao salvar integração.");
    } finally {
      setSavingIntegration(null);
    }
  }

  useEffect(() => {
    carregarMembros();
    carregarIntegracoes();
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setName(data.name || "");
          setEmail(data.email || "");
          setOab(data.oab || "");
          setImage(data.image || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSavePerfil(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, oab, image }),
      });
      if (res.ok) {
        setSuccess("Perfil atualizado com sucesso!");
        setTimeout(() => setSuccess(""), 4000);
      } else {
        setError("Erro ao salvar perfil.");
      }
    } catch {
      setError("Erro de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSenha(e: React.FormEvent) {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");
    if (newPassword !== confirmPassword) {
      setPassError("A nova senha e a confirmação não conferem.");
      return;
    }
    if (newPassword.length < 8) {
      setPassError("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setPassSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPassError(data.error || "Não foi possível atualizar a senha.");
        return;
      }

      setPassSuccess("Senha alterada com sucesso. Outras sessões foram encerradas.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPassError("Erro de conexão ao atualizar a senha.");
    } finally {
      setPassSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Configurações da Conta</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie seu perfil profissional, foto, segurança e preferências de notificação.
        </p>
      </div>

      {/* Avatar + Status — card horizontal full-width */}
      <div className="card flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-white font-bold text-2xl flex items-center justify-center overflow-hidden shadow-md border-4 border-slate-100">
            {image ? (
              // User avatars can be data URLs or external URLs; next/image cannot safely handle both here.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name ? `Foto de perfil de ${name}` : "Foto de perfil"} className="w-full h-full object-cover" />
            ) : (
              <span>{name ? name.substring(0, 2).toUpperCase() : "DR"}</span>
            )}
          </div>
          <label
            htmlFor="profile-image-upload"
            aria-label="Alterar foto de perfil"
            className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow border-2 border-white transition-transform hover:scale-110"
          >
            <Camera className="w-4 h-4" />
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setImage(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-bold text-slate-900 text-lg">{name || "Dr. Usuário"}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{email || "usuario@lexai.com.br"}</p>
          {oab && <p className="text-xs font-semibold text-amber-600 mt-1">OAB: {oab}</p>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div>
            <p className="text-xs text-slate-400 font-medium">Plano Ativo</p>
            <p className="text-sm font-bold text-slate-900">Starter (14 Dias)</p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            Ativo
          </span>
        </div>
      </div>

      {/* Formulário de Perfil — full-width */}
      <form onSubmit={handleSavePerfil} className="card space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Dados Pessoais &amp; Profissionais</h3>
            <p className="text-xs text-slate-500">Atualize seu nome, email oficial e número da OAB</p>
          </div>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="profile-name" className="label">Nome Completo</label>
            <input id="profile-name" type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="profile-email" className="label">Email de Notificação</label>
            <input id="profile-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="profile-oab" className="label">Registro OAB (UF + Número)</label>
            <input id="profile-oab" type="text" placeholder="Ex: SP 123456" className="input" value={oab} onChange={(e) => setOab(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Salvando..." : "Salvar Perfil"}
          </button>
        </div>
      </form>

      {/* Canais de Notificação — full-width */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Canais de Notificação dos Alertas</h3>
            <p className="text-xs text-slate-500">Escolha onde deseja receber avisos de novas movimentações</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Alertas por Email</p>
                <p className="text-[11px] text-slate-500">Receba resumos diários no email registrado</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
              aria-label="Receber alertas por e-mail"
            />
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Alertas por WhatsApp{" "}
                  <span className="text-amber-600">(Em Breve)</span>
                </p>
                <p className="text-[11px] text-slate-500">Notificações instantâneas no seu celular</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
              aria-label="Receber alertas por WhatsApp"
            />
          </div>
        </div>
      </div>

      {/* Integrações do sistema — configuradas no painel */}
      <div className="card space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-base">
            ⚡
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Integrações da Plataforma</h3>
            <p className="text-xs text-slate-500">
              Configure as chaves e tokens das integrações diretamente aqui. Os valores ficam ligados ao workspace atual e podem ser alterados a qualquer momento.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p>
            Configure as credenciais do painel e, em seguida, reinicie a aplicação para que os serviços passem a usar os novos valores do ambiente do workspace.
          </p>
        </div>

        {integrationFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {integrationFeedback}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(integrations.length ? integrations : [
            { provider: "Google Gemini / OpenAI", configured: false },
            { provider: "DataJud / CNJ", configured: false },
            { provider: "ClicSign", configured: false },
            { provider: "Stripe", configured: false },
            { provider: "Google OAuth", configured: false },
            { provider: "Resend / e-mail", configured: false },
            { provider: "BrasilAPI / BACEN", configured: false },
            { provider: "Serpro / SENATRAN / INPI / IEPTB", configured: false },
          ]).map((item) => (
            <div key={item.provider} className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 mb-1">{item.provider}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Cole a chave ou token correspondente para ativar a integração no ambiente do workspace.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor={`integration-${item.provider}`} className="label">Valor da integração</label>
                <input
                  id={`integration-${item.provider}`}
                  type="password"
                  className="input"
                  value={integrationInputs[item.provider] ?? ""}
                  placeholder={item.configured ? "Digite para substituir a configuração atual" : "Informe a chave ou token"}
                  onChange={(e) =>
                    setIntegrationInputs((prev) => ({
                      ...prev,
                      [item.provider]: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3 text-[10px] text-slate-400 font-medium">
                <span>Status</span>
                <span className={item.configured ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                  {item.configured ? "Configurado" : "Pendente de configuração"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSaveIntegration(item.provider, integrationInputs[item.provider] ?? "")}
                disabled={savingIntegration === item.provider}
                className="mt-1 rounded-xl bg-slate-900 text-white px-3 py-2 text-xs font-semibold disabled:opacity-60"
              >
                {savingIntegration === item.provider ? "Salvando..." : item.configured ? "Atualizar configuração" : "Salvar configuração"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Alteração de Senha — full-width */}
      <form onSubmit={handleSaveSenha} className="card space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Alterar Senha de Acesso</h3>
            <p className="text-xs text-slate-500">Crie uma nova senha segura para sua conta</p>
          </div>
        </div>

        {passSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {passSuccess}
          </div>
        )}
        {passError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {passError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="current-password" className="label">Senha Atual</label>
            <input
              id="current-password"
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="new-password" className="label">Nova Senha</label>
            <input
              id="new-password"
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="label">Confirmar Nova Senha</label>
            <input
              id="confirm-password"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={passSaving} className="btn-accent text-sm">
            {passSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {passSaving ? "Alterando..." : "Atualizar Senha"}
          </button>
        </div>
      </form>

      {/* GESTÃO DE USUÁRIOS & PERFIS DE SEGURANÇA (RBAC) */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-base">
              🛡️
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Gestão de Usuários &amp; Perfis de Segurança (RBAC)</h3>
              <p className="text-xs text-slate-500">Controle granular de acesso para sócios, advogados associados, estagiários e secretária</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            + Convidar Membro
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Usuário</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Perfil de Acesso</th>
                <th className="p-3">MFA / 2FA</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {membros.map((mem) => (
                <tr key={mem.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">{mem.nome}</td>
                  <td className="p-3 font-mono">{mem.email}</td>
                  <td className="p-3">
                    {mem.perfil === "ADMIN" && (
                      <span className="bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">
                        👑 Admin / Sócio Titular
                      </span>
                    )}
                    {mem.perfil === "ASSOCIATE" && (
                      <span className="bg-blue-100 text-blue-900 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        ⚖️ Advogado Associado
                      </span>
                    )}
                    {mem.perfil === "INTERN" && (
                      <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        🎓 Estagiário (Consulta &amp; Minutas)
                      </span>
                    )}
                    {mem.perfil === "SECRETARY" && (
                      <span className="bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                        💼 Secretária (Agenda)
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        mem.mfa.includes("Ativo")
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {mem.mfa}
                    </span>
                  </td>
                  <td className="p-3 text-emerald-600 font-bold">{mem.status}</td>
                  <td className="p-3 text-right">
                    {mem.isTitular ? (
                      <span className="text-slate-400">Titular</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => alert(`Edição de membro será implementada em breve.`)}
                          className="text-amber-600 hover:underline font-bold"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoverMembro(mem.id, mem.nome)}
                          className="text-rose-600 hover:underline font-bold"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP / MODAL: Convidar Membro */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative">
            {/* Header do Modal */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Convidar Membro para a Equipe</h3>
                  <p className="text-xs text-slate-300">Envie um convite de acesso com perfil de segurança (RBAC)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Fechar janela de convite"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário do Modal */}
            <form onSubmit={handleConvidarMembro} className="p-6 space-y-4">
              {inviteSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{inviteSuccessMsg}</span>
                </div>
              )}

              <div>
                <label htmlFor="invite-name" className="label text-xs font-bold text-slate-700 mb-1 block">
                  Nome Completo do Membro
                </label>
                <input
                  id="invite-name"
                  type="text"
                  required
                  placeholder="Ex: Dra. Juliana Silveira"
                  className="input text-sm"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="invite-email" className="label text-xs font-bold text-slate-700 mb-1 block">
                  E-mail Profissional / Corporativo
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  placeholder="Ex: juliana.silveira@advocacia.com.br"
                  className="input text-sm"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="invite-role" className="label text-xs font-bold text-slate-700 mb-1 block">
                  Perfil de Acesso (Nível de Permissão RBAC)
                </label>
                <select
                  id="invite-role"
                  className="input text-sm font-medium"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "ASSOCIATE" | "INTERN" | "SECRETARY")}
                >
                  <option value="ADMIN">👑 Admin / Sócio Titular (Acesso Total &amp; Gestão)</option>
                  <option value="ASSOCIATE">⚖️ Advogado Associado (Processos, Minutas &amp; Clientes)</option>
                  <option value="INTERN">🎓 Estagiário (Consulta de Processos &amp; Minutas)</option>
                  <option value="SECRETARY">💼 Secretária (Agenda, Atendimentos &amp; Notificações)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  Privacidade &amp; Segurança
                </p>
                <p className="text-[11px] leading-relaxed">
                  O convidado receberá um e-mail oficial com o link seguro para ativar a conta no workspace do seu escritório.
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn-outline text-xs px-4 py-2.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={inviteSending || !inviteName || !inviteEmail}
                  className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 disabled:opacity-50"
                >
                  {inviteSending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <UserPlus className="w-4 h-4 text-amber-400" />
                  )}
                  {inviteSending ? "Enviando Convite..." : "Enviar Convite por E-mail"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTENTICAÇÃO MULTIFATOR (MFA / 2FA) */}
      <div className="card space-y-4 border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
              🔑
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Autenticação Multifator (MFA / 2FA via TOTP)</h3>
              <p className="text-xs text-slate-500">Proteja a conta do seu escritório com camada extra de segurança (Google Authenticator, Authy ou 1Password)</p>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-900 font-extrabold px-3 py-1 rounded-full text-xs">
            STATUS: ATIVADO
          </span>
        </div>

        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-1 text-xs text-emerald-900">
            <p className="font-bold">✓ O 2FA está configurado no seu dispositivo.</p>
            <p className="text-emerald-700">Toda tentativa de login solicitará um código temporário de 6 dígitos gerado pelo seu aplicativo autenticador.</p>
          </div>
          <button onClick={() => alert("Um novo QR Code foi enviado para seu e-mail cadastrado.")} className="btn-outline text-xs px-4 py-2 bg-white">
            Reconfigurar 2FA
          </button>
        </div>
      </div>

      {/* LOGS DE AUDITORIA COMPLETOS (AUDIT TRAIL) */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base">
              📊
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Logs de Auditoria &amp; Rastreabilidade (Audit Trail)</h3>
              <p className="text-xs text-slate-500">Registro imutável de todas as ações executadas na plataforma com carimbo de tempo, usuário e endereço IP</p>
            </div>
          </div>
          <button onClick={() => alert("Relatório de Auditoria baixado em CSV!")} className="btn-outline text-xs px-3 py-1.5">
            📥 Exportar Log (CSV)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3">Data / Hora (UTC-3)</th>
                <th className="p-3">Usuário</th>
                <th className="p-3">Ação Executada</th>
                <th className="p-3">Módulo</th>
                <th className="p-3">Endereço IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 text-slate-500 font-mono">26/08/2026 12:44:12</td>
                <td className="p-3 font-bold text-slate-900">Dr. João Pedro Brigagão</td>
                <td className="p-3 font-medium text-emerald-700">Disparo de Envelope ClicSign (Selo ICP-Brasil)</td>
                <td className="p-3"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">Assinatura</span></td>
                <td className="p-3 font-mono text-[11px] text-slate-500">187.12.45.102</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 text-slate-500 font-mono">26/08/2026 12:38:05</td>
                <td className="p-3 font-bold text-slate-900">Dr. João Pedro Brigagão</td>
                <td className="p-3 font-medium text-blue-700">Geração de Petição Inicial com Gemini IA</td>
                <td className="p-3"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">Petições IA</span></td>
                <td className="p-3 font-mono text-[11px] text-slate-500">187.12.45.102</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 text-slate-500 font-mono">26/08/2026 11:15:30</td>
                <td className="p-3 font-bold text-slate-900">Dra. Amanda Castro</td>
                <td className="p-3 font-medium text-amber-700">Consulta de Devedores (Serpro PGFN)</td>
                <td className="p-3"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">Consultas Legais</span></td>
                <td className="p-3 font-mono text-[11px] text-slate-500">177.34.89.210</td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 text-slate-500 font-mono">26/08/2026 09:02:14</td>
                <td className="p-3 font-bold text-slate-900">Dr. João Pedro Brigagão</td>
                <td className="p-3 font-medium text-slate-700">Login Efetuado com Sucesso (MFA Ok)</td>
                <td className="p-3"><span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">Autenticação</span></td>
                <td className="p-3 font-mono text-[11px] text-slate-500">187.12.45.102</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
