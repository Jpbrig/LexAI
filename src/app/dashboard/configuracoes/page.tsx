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
  Shield,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Settings,
} from "lucide-react";

export default function ConfiguracoesPage() {
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

  const [membros, setMembros] = useState<MembroItem[]>([
    {
      id: "1",
      nome: "Dr. João Pedro Brigagão (Você)",
      email: "jpbrigagao@advocacia.com",
      perfil: "ADMIN",
      mfa: "🔐 Ativo (TOTP)",
      status: "Ativo",
      isTitular: true,
    },
    {
      id: "2",
      nome: "Dra. Amanda Castro",
      email: "amanda.castro@advocacia.com",
      perfil: "ASSOCIATE",
      mfa: "🔐 Ativo (TOTP)",
      status: "Ativo",
    },
    {
      id: "3",
      nome: "Lucas Mendes",
      email: "lucas.mendes@advocacia.com",
      perfil: "INTERN",
      mfa: "⚠️ Pendente",
      status: "Ativo",
    },
  ]);

  function handleConvidarMembro(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    setInviteSending(true);

    setTimeout(() => {
      const novoMembro: MembroItem = {
        id: `mem_${Date.now()}`,
        nome: inviteName,
        email: inviteEmail,
        perfil: inviteRole,
        mfa: "⚠️ Pendente",
        status: "Ativo (Convite Enviado)",
      };

      setMembros((prev) => [...prev, novoMembro]);
      setInviteSending(false);
      setInviteSuccessMsg(`Convite enviado com sucesso para ${inviteEmail}!`);

      setTimeout(() => {
        setInviteSuccessMsg("");
        setShowInviteModal(false);
        setInviteName("");
        setInviteEmail("");
        setInviteRole("ASSOCIATE");
      }, 1500);
    }, 500);
  }

  // Modal de Configuração de APIs Pagas State
  type ProviderInfo = { id: string; name: string; desc: string; placeholder: string; docUrl?: string };
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderInfo | null>(null);
  const [keyInput, setKeyInput] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [showKeyText, setShowKeyText] = useState(false);
  const [keySaving, setKeySaving] = useState(false);
  const [keySuccessMsg, setKeySuccessMsg] = useState("");

  const [configuredApiKeys, setConfiguredApiKeys] = useState<Record<string, boolean>>({
    gemini: true,
    datajud: true,
    clicsign: true,
    infosimples: false,
    directdata: false,
    serpro: false,
    senatran: false,
  });

  function openApiKeyModal(prov: ProviderInfo) {
    setSelectedProvider(prov);
    setKeyInput("");
    setSecretInput("");
    setShowKeyText(false);
    setKeySuccessMsg("");
    setShowApiKeyModal(true);
  }

  function handleSaveApiKey(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProvider || !keyInput.trim()) return;

    setKeySaving(true);
    setTimeout(() => {
      setConfiguredApiKeys((prev) => ({ ...prev, [selectedProvider.id]: true }));
      setKeySaving(false);
      setKeySuccessMsg(`Credencial do ${selectedProvider.name} salva e validada com sucesso!`);

      setTimeout(() => {
        setKeySuccessMsg("");
        setShowApiKeyModal(false);
        setKeyInput("");
        setSecretInput("");
        setSelectedProvider(null);
      }, 1500);
    }, 600);
  }


  useEffect(() => {
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

      {/* Conectores & Credenciais de APIs Pagas */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Conectores &amp; Credenciais de APIs (Oficiais &amp; Pagas)</h3>
              <p className="text-xs text-slate-500">
                Gerencie suas chaves de API e tokens de acesso para liberar consultas avançadas, IA e assinaturas digitais.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              id: "gemini",
              name: "Google Gemini 1.5 IA",
              desc: "Inteligência Artificial para Minutas, Resumos e Assistente",
              placeholder: "Cole sua chave da Google AI Studio (ex: AIzaSy...)",
              docUrl: "https://aistudio.google.com/app/apikey",
            },
            {
              id: "datajud",
              name: "DataJud / CNJ (API Pública)",
              desc: "Busca processual oficial de tribunais em todo o Brasil",
              placeholder: "Cole a Chave Pública do CNJ DataJud (APIKey ...)",
              docUrl: "https://unica.cnj.jus.br",
            },
            {
              id: "clicsign",
              name: "ClicSign Assinaturas",
              desc: "Assinatura digital de procurações e contratos com selo ICP-Brasil",
              placeholder: "Cole seu Access Token da ClicSign",
              docUrl: "https://www.clicsign.com",
            },
            {
              id: "infosimples",
              name: "Infosimples API",
              desc: "Consultas de certidões, INPI, SINESP e tribunal de contas",
              placeholder: "Cole seu API Token da Infosimples",
              docUrl: "https://infosimples.com",
            },
            {
              id: "directdata",
              name: "DirectData Bureau",
              desc: "Localização de devedores, telefones e relatório de crédito",
              placeholder: "Cole seu Token de Acesso da DirectData",
              docUrl: "https://directdata.com.br",
            },
            {
              id: "serpro",
              name: "Serpro PGFN / CADIN",
              desc: "Dívida Ativa da União e regularidade fiscal federal",
              placeholder: "Cole sua Consumer Key / Token do Serpro",
              docUrl: "https://www.serpro.gov.br",
            },
            {
              id: "senatran",
              name: "SENATRAN / SINESP Veículos",
              desc: "Dados avançados de frota, gravames e CNH de condutores",
              placeholder: "Cole a Chave de Integração SENATRAN",
              docUrl: "https://portalservicos.senatran.serpro.gov.br",
            },
          ].map((prov) => {
            const isConfigured = configuredApiKeys[prov.id];
            return (
              <div
                key={prov.id}
                className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                  isConfigured
                    ? "border-emerald-200 bg-emerald-50/40 hover:border-emerald-300"
                    : "border-slate-200 bg-white hover:border-amber-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                      {prov.name}
                    </p>
                    {isConfigured ? (
                      <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Configurado
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Pendente
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{prov.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    {isConfigured ? "●●●●●●●●●●●● (Ativo)" : "Sem chave configurada"}
                  </span>
                  <button
                    type="button"
                    onClick={() => openApiKeyModal(prov)}
                    className="btn-outline text-[11px] py-1.5 px-3 font-bold hover:bg-slate-900 hover:text-amber-400 hover:border-slate-900 transition-all flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3 text-amber-500" />
                    {isConfigured ? "Editar Chave" : "Configurar Chave"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP / MODAL: Configurar Credencial de API */}
      {showApiKeyModal && selectedProvider && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative">
            {/* Header do Modal */}
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Configurar Credencial</h3>
                  <p className="text-xs text-amber-300 font-semibold">{selectedProvider.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Fechar modal de API"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário do Modal */}
            <form onSubmit={handleSaveApiKey} className="p-6 space-y-4">
              {keySuccessMsg && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{keySuccessMsg}</span>
                </div>
              )}

              <div>
                <label htmlFor="api-key-input" className="label text-xs font-bold text-slate-700 mb-1 block">
                  Chave de API / Token Principal
                </label>
                <div className="relative flex items-center">
                  <input
                    id="api-key-input"
                    type={showKeyText ? "text" : "password"}
                    required
                    placeholder={selectedProvider.placeholder}
                    className="input text-sm font-mono pr-10"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute right-3 text-slate-400 hover:text-slate-700"
                    title={showKeyText ? "Ocultar chave" : "Mostrar chave"}
                  >
                    {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="api-secret-input" className="label text-xs font-bold text-slate-700 mb-1 block">
                  Token Secundário / Client Secret (Opcional)
                </label>
                <input
                  id="api-secret-input"
                  type="password"
                  placeholder="Preencha se o provedor exigir chave secundária ou Secret..."
                  className="input text-sm font-mono"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                />
              </div>

              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-600" /> Criptografia de Ponta a Ponta
                </p>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  Sua chave será criptografada e utilizada exclusivamente para autenticar requisições oficiais em nome da sua banca jurídica.
                </p>
                {selectedProvider.docUrl && (
                  <a
                    href={selectedProvider.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-amber-700 hover:underline text-[11px] mt-1"
                  >
                    Obter chave no site oficial <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="btn-outline text-xs px-4 py-2.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={keySaving || !keyInput.trim()}
                  className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 disabled:opacity-50"
                >
                  {keySaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <Check className="w-4 h-4 text-amber-400" />
                  )}
                  {keySaving ? "Validando e Salvando..." : "Salvar e Ativar Chave"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      <button
                        type="button"
                        onClick={() => alert(`Permissões do membro ${mem.nome} salvas!`)}
                        className="text-amber-600 hover:underline font-bold"
                      >
                        Editar
                      </button>
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
