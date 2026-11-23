"use client";

import { Check } from "lucide-react";

export interface PlanoCardData {
  id: number | string;
  tag: string;
  nome: string;
  subtitulo: string;
  precoFormatado: string;
  periodo: string;
  destaque: boolean;
  textoBotao: string;
  beneficios: string[];
}

interface CardPlanoProps {
  plano: PlanoCardData;
  ehPlanoAtual?: boolean;
  onSelecionar?: (plano: PlanoCardData) => void;
}

export default function CardPlano({
  plano,
  ehPlanoAtual = false,
  onSelecionar,
}: CardPlanoProps) {
  return (
    <article
      className={`flex flex-col justify-between rounded-2xl p-5 transition-all ${
        plano.destaque
          ? "border-2 border-[#212D62] bg-[#F5F7FA] shadow-md"
          : "border border-[#E2E8F0] shadow-2xs hover:border-[#CBD5E1] bg-white" 
      }`}
    >
      <div>
        {/* Tag superior do card */}
        <div
          className={`rounded-md px-3 py-1 text-[11px] font-medium ${
            plano.destaque
              ? "bg-[#E2E8F4] font-semibold text-[#212D62]"
              : "bg-[#F1F5F9] text-[#64748B]"
          }`}
        >
          {plano.tag}
        </div>

        {/* Nome e subtítulo */}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-[#0F172A]">{plano.nome}</h3>
            {ehPlanoAtual && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Atual
              </span>
            )}
          </div>
          <p className="mt-1 min-h-[34px] text-xs leading-relaxed text-[#64748B]">
            {plano.subtitulo}
          </p>
        </div>

        {/* Preço */}
        <div className="mt-4">
          <div className="text-[28px] font-extrabold tracking-tight text-[#0F172A]">
            {plano.precoFormatado}
          </div>
          <p className="text-[11px] text-[#64748B]">{plano.periodo}</p>
        </div>

        {/* Divisor */}
        <hr className="my-4 border-[#E2E8F0]" />

        {/* Lista de benefícios */}
        <ul className="space-y-2.5">
          {plano.beneficios.map((beneficio) => (
            <li
              key={beneficio}
              className="flex items-start gap-2 text-xs text-[#334155]"
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#475569]" />
              <span>{beneficio}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Botão de ação */}
      <button
        type="button"
        onClick={() => onSelecionar?.(plano)}
        disabled={ehPlanoAtual}
        className={`mt-7 w-full rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors ${
          ehPlanoAtual
            ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700"
            : plano.destaque
              ? "bg-[#0F1E3A] text-white hover:bg-[#192E54]"
              : "border border-[#CBD5E1] bg-[#F8FAFC] text-[#1E293B] hover:bg-[#F1F5F9]"
        }`}
      >
        {ehPlanoAtual ? "Plano atual" : plano.textoBotao}
      </button>
    </article>
  );
}