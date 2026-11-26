import Image from 'next/image';
import Link from "next/link";
import {Accessibility, CalendarDays,Clock,GraduationCap, Languages, Star } from "lucide-react";
import type {Mentor} from "../_lib/tipos";
import { NOMES_FORMACAO } from "../_lib/tipos";
import {buscarServicos, formatarDuracao, formatarPreco} from "../_lib/utils";

export default function CardMentor({mentor}: {mentor: Mentor}){
    const atual = mentor.experiencias[0];

    const servicos = buscarServicos (mentor.servicos);
    const visiveis = servicos.slice(0,3);
    const restantes = servicos.length - visiveis.length;
   
    return(
     <article className="group relative flex h-full flex-col overflow-hidden rounded-[16px] border border-[#d9d9d9] bg-white shadow-[0px_2px_6px_rgba(0,0,0,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#0f1b3d]/40 hover:shadow-[0_12px_28px_-12px_rgba(15,27,61,0.28)]">
   
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={mentor.fotoUrl}
          alt={`Foto de ${mentor.nome}`}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#2d2d2d] shadow-sm">
          <Star className="size-3.5 fill-[#f5a524] text-[#f5a524]" aria-hidden />
          {mentor.avaliacao.toFixed(1).replace(".", ",")}
          <span className="sr-only">de 5 estrelas</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-lg font-semibold text-[#2d2d2d]">
            <Link
              href={`/agendamento-mentor/${mentor.id}`}
              className="outline-none after:absolute after:inset-0 after:content-[''] decoration-2 underline-offset-4 transition-colors duration-200 group-hover:text-blue-800 group-hover:underline"
            >
              {mentor.nome}
            </Link>
          </h3>
          {atual && (
            <p className="text-sm text-[#595959]">
              {atual.cargo} · <span className="font-medium text-[#2d2d2d]">{atual.empresa}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f3f7] px-2.5 py-1 text-xs font-semibold text-[#0f1b3d]">
            <GraduationCap className="size-3.5" aria-hidden />
            {NOMES_FORMACAO[mentor.formacaoPrincipal]}
          </span>
          {mentor.atendeLibras && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#0f1b3d]/20 px-2.5 py-1 text-xs font-semibold text-[#0f1b3d]">
              <Accessibility className="size-3.5" aria-hidden />
              Atende em Libras
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#8a8a8a]">Tipos de mentoria</p>
          <ul className="flex flex-wrap gap-1.5">
            {visiveis.map((servico) => (
              <li
                key={servico.id}
                className="rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-1 text-xs text-[#454545]"
              >
                {servico.nome}
              </li>
            ))}
            {restantes > 0 && (
              <li className="rounded-lg px-2 py-1 text-xs font-semibold text-[#0f1b3d]">+{restantes}</li>
            )}
          </ul>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-[#8a8a8a]" aria-hidden />
            <dt className="sr-only">Duração</dt>
            <dd className="text-[#2d2d2d]">{formatarDuracao(mentor.duracaoMinutos)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="size-4 shrink-0 text-[#8a8a8a]" aria-hidden />
            <dt className="sr-only">Idiomas</dt>
            <dd className="truncate text-[#2d2d2d]">{mentor.idiomas.join(", ")}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e5e5e5] pt-4">
          <p className="flex flex-col">
            <span className="text-lg font-bold text-[#2d2d2d]">{formatarPreco(mentor.valorSessao)}</span>
            <span className="text-xs text-[#8a8a8a]">por sessão</span>
          </p>
          <Link
            href={`/agendamento-mentor/${mentor.id}#agendar`}
            className="relative z-10 inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#0f1b3d] px-4 text-sm font-semibold text-white transition duration-200 hover:bg-[#1c2d5c] hover:shadow-[0_4px_12px_-2px_rgba(15,27,61,0.25)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f1b3d]"
          >
            <CalendarDays className="size-4" aria-hidden />
            Ver horários
          </Link>
        </div>
      </div>
    </article>
  );
}
