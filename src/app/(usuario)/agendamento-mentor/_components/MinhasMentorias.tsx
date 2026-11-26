"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, Check, Copy, Link2, X } from "lucide-react";
import type { AgendamentoLocal } from "../_lib/agendamentosLocais";
import { cancelarAgendamento, useAgendamentos } from "../_lib/agendamentosLocais";
import { lerData } from "../_lib/horarios";

export default function MinhasMentorias() {
  const agendamentos = useAgendamentos();
  const [agora] = useState(() => new Date());

  const proximas = agendamentos
    .filter((item) => {
      const dia = lerData(item.dia);
      if (!dia) return false;
      const [h, m] = item.fim.split(":").map(Number);
      return new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), h, m) > agora;
    })
    .sort((a, b) => `${a.dia} ${a.hora}`.localeCompare(`${b.dia} ${b.hora}`));

  if (proximas.length === 0) return null;

  return (
    <section aria-labelledby="titulo-minhas-mentorias" className="flex flex-col gap-3">
      <h2 id="titulo-minhas-mentorias" className="flex items-center gap-2 text-base font-semibold text-[#2d2d2d]">
        <CalendarCheck className="size-5 text-[#0f1b3d]" aria-hidden />
        Suas mentorias
        <span className="rounded-full bg-[#e8edf8] px-2 py-0.5 text-xs text-[#0f1b3d]">{proximas.length}</span>
      </h2>

      <ul className="grid gap-3 md:grid-cols-2">
        {proximas.map((item) => (
          <ItemMentoria key={item.id} agendamento={item} />
        ))}
      </ul>
    </section>
  );
}

function ItemMentoria({ agendamento }: { agendamento: AgendamentoLocal }) {
  const [linkVisivel, setLinkVisivel] = useState(false);
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const dia = lerData(agendamento.dia);
  const semana = dia?.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  const mes = dia?.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(agendamento.link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sem permissão para copiar
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-[16px] border border-[#d9d9d9] bg-white p-4 shadow-[0px_2px_6px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-[10px] bg-[#0f1b3d] py-1.5 text-white">
          <span className="text-[11px] font-semibold uppercase opacity-70">{semana}</span>
          <span className="text-xl leading-tight font-semibold">{dia?.getDate()}</span>
          <span className="text-[11px] uppercase opacity-70">{mes}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-semibold text-[#2d2d2d]">{agendamento.servicoNome}</p>
          <p className="text-sm text-[#595959]">
            {agendamento.hora} às {agendamento.fim}
          </p>
          <Link
            href={`/agendamento-mentor/${agendamento.mentorId}`}
            className="flex w-fit items-center gap-1.5 text-sm text-[#595959] hover:text-[#0f1b3d]"
          >
            <Image src={agendamento.fotoUrl} alt="" width={20} height={20} className="size-5 rounded-full object-cover" />
            com {agendamento.mentorNome}
          </Link>
        </div>
      </div>

      {linkVisivel && (
        <div className="flex items-center gap-2 rounded-lg bg-[#e8edf8] px-3 py-2">
          <a
            href={agendamento.link}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-xs font-medium text-[#0f1b3d] underline underline-offset-2"
          >
            {agendamento.link}
            <span className="sr-only">(abre em outra aba)</span>
          </a>
          <button
            type="button"
            onClick={copiar}
            aria-label="Copiar link"
            className="shrink-0 rounded-md p-1 text-[#0f1b3d] transition hover:bg-white"
          >
            {copiado ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-[#e5e5e5] pt-3">
        {confirmandoCancelamento ? (
          <>
            <span className="text-sm text-[#595959]">Cancelar esta mentoria?</span>
            <span className="flex gap-1">
              <button
                type="button"
                onClick={() => setConfirmandoCancelamento(false)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#595959] transition hover:bg-[#f1f3f7]"
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => cancelarAgendamento(agendamento.id)}
                className="rounded-lg bg-[#c62828] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#a52020]"
              >
                Sim, cancelar
              </button>
            </span>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setLinkVisivel((atual) => !atual)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#0f1b3d] transition hover:bg-[#f1f3f7]"
            >
              <Link2 className="size-4" aria-hidden />
              {linkVisivel ? "Esconder link" : "Ver link da mentoria"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoCancelamento(true)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-[#8a8a8a] transition hover:bg-[#fdecec] hover:text-[#c62828]"
            >
              <X className="size-4" aria-hidden />
              Cancelar
            </button>
          </>
        )}
      </div>
    </li>
  );
}
