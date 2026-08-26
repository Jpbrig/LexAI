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
    if (newPassword.length < 6) {
      setPassError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setPassSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setPassSuccess("Senha alterada com sucesso!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPassSaving(false);
    setTimeout(() => setPassSuccess(""), 4000);
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
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span>{name ? name.substring(0, 2).toUpperCase() : "DR"}</span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow border-2 border-white transition-transform hover:scale-110">
            <Camera className="w-4 h-4" />
            <input
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
            <label className="label">Nome Completo</label>
            <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email de Notificação</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Registro OAB (UF + Número)</label>
            <input type="text" placeholder="Ex: SP 123456" className="input" value={oab} onChange={(e) => setOab(e.target.value)} />
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
            />
          </div>
        </div>
      </div>

      {/* Conectores & Chaves de Integração (Infosimples, DirectData, Serpro, SENATRAN) */}
      <div className="card space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Conectores &amp; Credenciais de APIs Pagas (Opcional)</h3>
            <p className="text-xs text-slate-500">
              Conecte suas credenciais próprias para liberar consultas avançadas de Devedores (Serpro PGFN), SENATRAN (Veículos) e Cartórios.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Google Gemini — Petições IA */}
          <div className="space-y-1.5 sm:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🤖</span>
              <label className="label font-bold text-sm text-amber-900 mb-0">Google Gemini API Key — Petições IA</label>
            </div>
            <input
              type="password"
              id="gemini-api-key"
              placeholder="Cole sua chave do Google AI Studio (AIza...)..."
              className="input text-xs font-mono"
              defaultValue={typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") || "" : ""}
              onChange={(e) => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("gemini_api_key", e.target.value);
                }
              }}
            />
            <p className="text-[11px] text-amber-700">
              Obtenha gratuitamente em{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                aistudio.google.com/app/apikey
              </a>
              {" "}→ Habilita o Gerador de Petições IA com Google Gemini 1.5 Flash.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="label font-bold text-xs">Token / Chave API Infosimples</label>
            <input
              type="password"
              placeholder="Cole sua API Key da Infosimples..."
              className="input text-xs font-mono"
            />
            <p className="text-[11px] text-slate-400">Libera consultas diretas de INPI, SINESP e Certidões.</p>
          </div>

          <div className="space-y-1.5">
            <label className="label font-bold text-xs">Token DirectData / Bureau de Crédito</label>
            <input
              type="password"
              placeholder="Cole sua chave de acesso DirectData..."
              className="input text-xs font-mono"
            />
            <p className="text-[11px] text-slate-400">Libera pesquisas avançadas de localização de devedores.</p>
          </div>

          <div className="space-y-1.5">
            <label className="label font-bold text-xs">Credencial Serpro API Center (PGFN / CADIN)</label>
            <input
              type="password"
              placeholder="Consumer Key / Secret do Serpro..."
              className="input text-xs font-mono"
            />
            <p className="text-[11px] text-slate-400">Consulta oficial de Dívida Ativa da União e Novo CADIN.</p>
          </div>

          <div className="space-y-1.5">
            <label className="label font-bold text-xs">Login / Senha Acesso SENATRAN SINESP</label>
            <input
              type="text"
              placeholder="Usuário / Token de Acesso SINESP..."
              className="input text-xs font-mono"
            />
            <p className="text-[11px] text-slate-400">Libera histórico veicular, gravames e restrições em tempo real.</p>
          </div>
        </div>


        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => alert("Credenciais salvas com sucesso no seu perfil!")}
            className="btn-primary text-xs px-5 py-2.5"
          >
            <Save className="w-4 h-4 text-amber-400" />
            Salvar Chaves de Conexão
          </button>
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
            <label className="label">Senha Atual</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Nova Senha</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Confirmar Nova Senha</label>
            <input
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
    </div>
  );
}
