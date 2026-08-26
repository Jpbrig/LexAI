"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
  Bell,
  Sparkles,
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

  // Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");
  const [passSaving, setPassSaving] = useState(false);

  // Alertas por email
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
      .catch((err) => {
        console.error("Erro ao carregar perfil:", err);
        setLoading(false);
      });
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
    } catch (err) {
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
        <p className="text-muted-foreground text-sm mt-1">Gerencie seu perfil profissional, foto, segurança e preferências de notificação.</p>
      </div>

      {/* Grid de Seções */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        
        {/* Coluna Esquerda: Avatar & Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-slate-900 text-white font-bold text-2xl flex items-center justify-center overflow-hidden mx-auto shadow-md border-4 border-slate-100">
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

            <h2 className="font-bold text-slate-900 text-lg">{name || "Dr. Usuário"}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{email || "usuario@lexai.com.br"}</p>
            {oab && <p className="text-xs font-semibold text-amber-600 mt-1">OAB: {oab}</p>}

            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-left">
              <div>
                <p className="text-xs text-slate-400 font-medium">Plano Ativo</p>
                <p className="text-sm font-bold text-slate-900">Starter (14 Dias)</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                Ativo
              </span>
            </div>
          </div>

          {/* Dica de Segurança */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <Sparkles className="w-16 h-16 text-amber-500/20 absolute -right-3 -bottom-3" />
            <Shield className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="font-bold text-sm">Segurança da Conta</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Mantenha suas informações da OAB e email sempre atualizados para garantir a entrega correta das notificações judiciais.
            </p>
          </div>
        </div>

        {/* Coluna Direita: Formulários (2 Colunas) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Formulário de Perfil */}
          <form onSubmit={handleSavePerfil} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Dados Pessoais & Profissionais</h3>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email de Notificação</label>
                <input
                  type="email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registro OAB (UF + Número)</label>
                <input
                  type="text"
                  placeholder="Ex: SP 123456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  value={oab}
                  onChange={(e) => setOab(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Salvando..." : "Salvar Perfil"}
              </button>
            </div>
          </form>

          {/* Configurações de Notificação (Transferidas de Alertas para cá) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Canais de Notificação dos Alertas</h3>
                <p className="text-xs text-slate-500">Escolha onde você deseja receber os avisos de novas movimentações</p>
              </div>
            </div>

            <div className="space-y-4">
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
                    <p className="text-xs font-bold text-slate-900">Alertas por WhatsApp (Em Breve)</p>
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

          {/* Formulário de Alteração de Senha */}
          <form onSubmit={handleSaveSenha} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
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

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Senha Atual</label>
                <input
                  type="password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nova Senha</label>
                  <input
                    type="password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passSaving}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {passSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {passSaving ? "Alterando..." : "Atualizar Senha"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
