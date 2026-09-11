"use client";

import { useState } from "react";
import { Calculator, Calendar, DollarSign } from "lucide-react";

function toDateInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function parseDateInput(value: string) {
  return new Date(`${value}T12:00:00`);
}

function addBusinessDays(startDate: Date, days: number) {
  const nextDate = new Date(startDate);
  let remainingDays = Math.max(0, days);

  while (remainingDays > 0) {
    nextDate.setDate(nextDate.getDate() + 1);

    if (nextDate.getDay() !== 0 && nextDate.getDay() !== 6) {
      remainingDays -= 1;
    }
  }

  return nextDate;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function TabCalculadoras() {
  const [selectedCalc, setSelectedCalc] = useState<string>("trabalhista");
  const [salario, setSalario] = useState<string>("3500");
  const [mesesTrabalhados, setMesesTrabalhados] = useState<number>(12);
  const [tipoDemissao, setTipoDemissao] = useState<string>("sem_justa_causa");
  const [avisoPrevio, setAvisoPrevio] = useState<boolean>(true);

  const [valorBase, setValorBase] = useState<string>("");
  const [taxaJuros, setTaxaJuros] = useState<string>("");
  const [meses, setMeses] = useState<string>("");
  const [debitoIndice, setDebitoIndice] = useState<string>("tjsp");
  const [aplicarMulta523, setAplicarMulta523] = useState<boolean>(true);
  const [aplicarHonorarios523, setAplicarHonorarios523] = useState<boolean>(true);

  const [prazoDataBase, setPrazoDataBase] = useState<string>(toDateInputValue(new Date()));
  const [prazoDias, setPrazoDias] = useState<number>(15);
  const [prazoAdicional, setPrazoAdicional] = useState<number>(0);
  const [prazoTipo, setPrazoTipo] = useState<string>("judicial");
  const [prazoAlertaDias, setPrazoAlertaDias] = useState<number>(3);

  const [valorCausa, setValorCausa] = useState<string>("150000");
  const [percentualHonorarios, setPercentualHonorarios] = useState<number>(20);
  const [taxaJurosHonorarios, setTaxaJurosHonorarios] = useState<number>(1);
  const [mesesHonorarios, setMesesHonorarios] = useState<number>(6);

  // Cálculos Trabalhistas Mock
  const salarioNum = parseFloat(salario) || 0;
  const saldoSalario = (salarioNum / 30) * 15; // Supondo 15 dias trabalhados
  const decimoTerceiroProp = (salarioNum / 12) * Math.min(mesesTrabalhados, 12);
  const feriasProp = (salarioNum / 12) * Math.min(mesesTrabalhados, 12);
  const tercoFerias = feriasProp / 3;
  const avisoPrevioValor = avisoPrevio ? salarioNum : 0;
  
  let totalTrabalhista = saldoSalario + decimoTerceiroProp + feriasProp + tercoFerias;
  if (tipoDemissao === "sem_justa_causa") {
    totalTrabalhista += avisoPrevioValor;
    totalTrabalhista += (salarioNum * 0.08 * mesesTrabalhados) * 0.4; // Multa 40% FGTS (Simplificado)
  }

  // Cálculos Atualização Débito Mock
  const vb = parseFloat(valorBase) || 0;
  const tj = parseFloat(taxaJuros) || 0;
  const m = parseFloat(meses) || 0;

  const jurosValor = vb * (tj / 100) * m;
  const correcaoMonetaria = vb * 0.05; // Fixo 5% para exemplo
  const subtotal = vb + jurosValor + correcaoMonetaria;
  const multa523 = aplicarMulta523 ? subtotal * 0.1 : 0;
  const honorarios523 = aplicarHonorarios523 ? subtotal * 0.1 : 0;
  const totalDebito = subtotal + multa523 + honorarios523;

  const prazoTotalDias = Math.max(0, prazoDias + prazoAdicional);
  const dataBasePrazo = parseDateInput(prazoDataBase);
  const vencimentoPrazo = addBusinessDays(dataBasePrazo, prazoTotalDias);
  const dataAlertaPrazo = addBusinessDays(vencimentoPrazo, -Math.max(0, prazoAlertaDias));

  const valorCausaNum = parseFloat(valorCausa) || 0;
  const honorariosBase = valorCausaNum * (percentualHonorarios / 100);
  const jurosHonorarios = honorariosBase * (taxaJurosHonorarios / 100) * (mesesHonorarios / 12);
  const totalHonorarios = honorariosBase + jurosHonorarios;

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex items-center gap-4 shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-7 h-7 text-indigo-400" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Calculadoras Jurídicas</h2>
          <p className="text-slate-300 text-sm">Cálculos trabalhistas, atualização de débitos, honorários e prazos.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["trabalhista", "debito", "prazos", "honorarios"].map((calc) => (
          <button
            key={calc}
            onClick={() => setSelectedCalc(calc)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedCalc === calc
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            {calc === "trabalhista" && "Rescisão Trabalhista"}
            {calc === "debito" && "Atualização de Débitos (Art. 523)"}
            {calc === "prazos" && "Prazos Processuais"}
            {calc === "honorarios" && "Honorários Sucumbenciais"}
          </button>
        ))}
      </div>

      {selectedCalc === "trabalhista" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="card space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Dados do Vínculo
              </h3>
              
              <div>
                <label className="label">Salário Base (R$)</label>
                <input type="number" className="input" value={salario} onChange={(e) => setSalario(e.target.value)} />
              </div>
              
              <div>
                <label className="label">Meses Trabalhados</label>
                <input type="number" className="input" value={mesesTrabalhados} onChange={(e) => setMesesTrabalhados(Number(e.target.value))} />
              </div>

              <div>
                <label className="label">Motivo da Rescisão</label>
                <select className="input" value={tipoDemissao} onChange={(e) => setTipoDemissao(e.target.value)}>
                  <option value="sem_justa_causa">Demissão sem Justa Causa</option>
                  <option value="com_justa_causa">Demissão por Justa Causa</option>
                  <option value="pedido">Pedido de Demissão</option>
                  <option value="acordo">Acordo (Reforma Trabalhista)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="aviso" checked={avisoPrevio} onChange={(e) => setAvisoPrevio(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                <label htmlFor="aviso" className="text-sm font-medium text-slate-700 cursor-pointer">Aviso Prévio Indenizado</label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Resumo da Rescisão
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Saldo de Salário (15 dias)</span>
                  <span className="text-sm font-bold text-slate-900">R$ {saldoSalario.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">13º Salário Proporcional</span>
                  <span className="text-sm font-bold text-slate-900">R$ {decimoTerceiroProp.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Férias Proporcionais + 1/3</span>
                  <span className="text-sm font-bold text-slate-900">R$ {(feriasProp + tercoFerias).toFixed(2)}</span>
                </div>
                {tipoDemissao === "sem_justa_causa" && avisoPrevio && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm text-slate-600">Aviso Prévio Indenizado</span>
                    <span className="text-sm font-bold text-slate-900">R$ {avisoPrevioValor.toFixed(2)}</span>
                  </div>
                )}
                {tipoDemissao === "sem_justa_causa" && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm text-slate-600">Multa 40% FGTS (Est.)</span>
                    <span className="text-sm font-bold text-slate-900">R$ {((salarioNum * 0.08 * mesesTrabalhados) * 0.4).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="mt-4 p-4 bg-indigo-100 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-indigo-900">Total Líquido Estimado</span>
                  <span className="text-xl font-black text-indigo-700">R$ {totalTrabalhista.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="btn-outline">Gerar PDF</button>
                <button className="btn-primary">Salvar Cálculo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCalc === "debito" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="card space-y-4">
              <h3 className="font-bold text-slate-900">Dados do Débito</h3>
              
              <div>
                <label className="label">Valor Histórico (R$)</label>
                <input type="number" className="input" value={valorBase} onChange={(e) => setValorBase(e.target.value)} placeholder="1000.00" />
              </div>
              
              <div>
                <label className="label">Índice de Correção</label>
                <select className="input" value={debitoIndice} onChange={(e) => setDebitoIndice(e.target.value)}>
                  <option value="tjsp">Tabela Prática TJSP</option>
                  <option value="inpc">INPC (IBGE)</option>
                  <option value="ipca">IPCA-E</option>
                  <option value="selic">Taxa Selic</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Juros (% a.m.)</label>
                  <input type="number" className="input" value={taxaJuros} onChange={(e) => setTaxaJuros(e.target.value)} placeholder="1.0" />
                </div>
                <div>
                  <label className="label">Qtd. Meses</label>
                  <input type="number" className="input" value={meses} onChange={(e) => setMeses(e.target.value)} placeholder="12" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={aplicarMulta523} onChange={(e) => setAplicarMulta523(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                  <span className="text-sm font-medium text-slate-700">Multa 10% (Art. 523, §1º CPC)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={aplicarHonorarios523} onChange={(e) => setAplicarHonorarios523(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                  <span className="text-sm font-medium text-slate-700">Honorários 10% (Art. 523, §1º CPC)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Demonstrativo de Atualização</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Valor Original</span>
                  <span className="text-sm font-bold text-slate-900">R$ {vb.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Correção Monetária (Est. 5%)</span>
                  <span className="text-sm font-bold text-slate-900 text-emerald-600">+ R$ {correcaoMonetaria.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Juros Moratórios</span>
                  <span className="text-sm font-bold text-slate-900 text-emerald-600">+ R$ {jurosValor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200 bg-slate-100 px-2 rounded">
                  <span className="text-sm font-bold text-slate-800">Subtotal</span>
                  <span className="text-sm font-bold text-slate-900">R$ {subtotal.toFixed(2)}</span>
                </div>
                
                {aplicarMulta523 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm text-slate-600">Multa Art. 523 (10%)</span>
                    <span className="text-sm font-bold text-slate-900 text-red-600">+ R$ {multa523.toFixed(2)}</span>
                  </div>
                )}
                {aplicarHonorarios523 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-sm text-slate-600">Honorários Art. 523 (10%)</span>
                    <span className="text-sm font-bold text-slate-900 text-indigo-600">+ R$ {honorarios523.toFixed(2)}</span>
                  </div>
                )}

                <div className="mt-4 p-4 bg-indigo-100 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-indigo-900">Total Atualizado</span>
                  <span className="text-xl font-black text-indigo-700">R$ {totalDebito.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCalc === "prazos" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="card space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Dados do Prazo
              </h3>

              <div>
                <label className="label">Data de Início</label>
                <input
                  type="date"
                  className="input"
                  value={prazoDataBase}
                  onChange={(e) => setPrazoDataBase(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Prazo Original (dias)</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  value={prazoDias}
                  onChange={(e) => setPrazoDias(Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="label">Prazo Adicional (dias)</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  value={prazoAdicional}
                  onChange={(e) => setPrazoAdicional(Number(e.target.value) || 0)}
                />
              </div>

              <div>
                <label className="label">Tipo de Prazo</label>
                <select
                  className="input"
                  value={prazoTipo}
                  onChange={(e) => setPrazoTipo(e.target.value)}
                >
                  <option value="judicial">Judicial</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="recurso">Recurso</option>
                </select>
              </div>

              <div>
                <label className="label">Dias para alerta antecipado</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  value={prazoAlertaDias}
                  onChange={(e) => setPrazoAlertaDias(Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Resultado do Prazo Processual
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Tipo</span>
                  <span className="text-sm font-bold text-slate-900">
                    {prazoTipo === "judicial" ? "Judicial" : prazoTipo === "administrativo" ? "Administrativo" : "Recurso"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Prazo total</span>
                  <span className="text-sm font-bold text-slate-900">{prazoTotalDias} dias</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Data limite</span>
                  <span className="text-sm font-bold text-slate-900">{formatDate(vencimentoPrazo)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Alerta antecipado</span>
                  <span className="text-sm font-bold text-amber-700">{formatDate(dataAlertaPrazo)}</span>
                </div>

                <div className="mt-4 p-4 bg-amber-100 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-900">Status</span>
                    <span className="text-xl font-black text-amber-700">
                      {prazoAlertaDias > 0 ? "Alerta ativo" : "Sem alerta"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCalc === "honorarios" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="card space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Dados dos Honorários
              </h3>

              <div>
                <label className="label">Valor da Causa (R$)</label>
                <input
                  type="number"
                  className="input"
                  value={valorCausa}
                  onChange={(e) => setValorCausa(e.target.value)}
                  placeholder="150000"
                />
              </div>

              <div>
                <label className="label">Percentual de Honorários (%)</label>
                <input
                  type="number"
                  className="input"
                  min={0}
                  step={0.1}
                  value={percentualHonorarios}
                  onChange={(e) => setPercentualHonorarios(Number(e.target.value) || 0)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Juros (% a.m.)</label>
                  <input
                    type="number"
                    className="input"
                    min={0}
                    step={0.1}
                    value={taxaJurosHonorarios}
                    onChange={(e) => setTaxaJurosHonorarios(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="label">Meses</label>
                  <input
                    type="number"
                    className="input"
                    min={0}
                    value={mesesHonorarios}
                    onChange={(e) => setMesesHonorarios(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Demonstrativo de Honorários Sucumbenciais</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Valor da causa</span>
                  <span className="text-sm font-bold text-slate-900">R$ {valorCausaNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Honorários base</span>
                  <span className="text-sm font-bold text-emerald-700">R$ {honorariosBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Juros acumulados</span>
                  <span className="text-sm font-bold text-emerald-700">R$ {jurosHonorarios.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="mt-4 p-4 bg-emerald-100 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-emerald-900">Total estimado</span>
                  <span className="text-xl font-black text-emerald-700">R$ {totalHonorarios.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
