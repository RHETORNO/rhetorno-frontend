import Image from "next/image";
import Link from "next/link";
import { Accessibility, ArrowLeft, Briefcase, ExternalLink, GraduationCap, Languages, Star } from "lucide-react";
import type { Mentor } from "../_lib/tipos";
import { NOMES_FORMACAO } from "../_lib/tipos";
import { buscarServicos } from "../_lib/utils";
import AgendarMentoria from "./AgendarMentoria";

const caixa =
  "rounded-[16px] border border-[#d9d9d9] bg-white px-6 pt-5 pb-6 shadow-[0px_2px_6px_rgba(0,0,0,0.06)]";
const tituloSecao = "text-base font-semibold text-black";

export default function PerfilMentor({ mentor }: { mentor: Mentor }) {
  const atual = mentor.experiencias[0];
  const servicos = buscarServicos(mentor.servicos);
  const primeiroNome = mentor.nome.split(" ")[0];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
      <Link
        href="/agendamento-mentor"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#595959] transition hover:text-[#0f1b3d]"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar para mentores
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="overflow-hidden rounded-[16px] border border-[#d9d9d9] bg-white shadow-[0px_2px_6px_rgba(0,0,0,0.06)]">
            <div className="relative aspect-video md:aspect-21/9">
              <Image
                src={mentor.fotoUrl}
                alt={`Foto de ${mentor.nome}`}
                fill
                preload
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent" />

              <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-[#2d2d2d] shadow-sm">
                <Star className="size-4 fill-[#f5a524] text-[#f5a524]" aria-hidden />
                {mentor.avaliacao.toFixed(1).replace(".", ",")}
                <span className="sr-only">de 5 estrelas</span>
              </span>

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 md:p-6">
                <h1 className="text-2xl font-semibold text-white md:text-3xl">{mentor.nome}</h1>
                {atual && (
                  <p className="text-sm text-white/85 md:text-base">
                    {atual.cargo} · {atual.empresa}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
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
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f3f7] px-2.5 py-1 text-xs font-semibold text-[#454545]">
                  <Languages className="size-3.5" aria-hidden />
                  {mentor.idiomas.join(", ")}
                </span>
              </div>

              <a
                href={mentor.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#0f1b3d] bg-white px-4 py-2.5 text-sm font-semibold text-[#0f1b3d] transition hover:bg-gray-200/90 hover:shadow-[0_4px_12px_-2px_rgba(15,27,61,0.18)]"
              >
                Ver LinkedIn
                <ExternalLink className="size-3.5" aria-hidden />
                <span className="sr-only">(abre em outra aba)</span>
              </a>
            </div>
          </section>

          <section className={caixa}>
            <h2 className={tituloSecao}>Por que {primeiroNome} está aqui</h2>
            <p className="mt-3 border-l-[3px] border-[#0f1b3d] pl-4 text-[15px] leading-7 text-[#2d2d2d]">{mentor.bio}</p>

            <h2 className={`${tituloSecao} mt-6`}>Como é a mentoria com {primeiroNome}</h2>
            <p className="mt-2 text-[15px] leading-7 text-[#595959]">{mentor.abordagem}</p>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className={caixa}>
              <h2 className={tituloSecao}>Formação</h2>
              <ul className="mt-4 flex flex-col gap-4">
                {mentor.formacoes.map((formacao, posicao) => (
                  <li key={formacao.curso} className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f1f3f7] text-[#0f1b3d]">
                      <GraduationCap className="size-4" aria-hidden />
                    </span>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-[#2d2d2d]">{formacao.curso}</p>
                      <p className="text-sm text-[#595959]">{formacao.instituicao}</p>
                      <p className="mt-0.5 text-xs text-[#8a8a8a]">{posicao === 0 ? "Formação principal" : "Complementar"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className={caixa}>
              <h2 className={tituloSecao}>Experiência</h2>
              <ul className="mt-4 flex flex-col gap-4">
                {mentor.experiencias.map((experiencia) => (
                  <li key={`${experiencia.empresa}-${experiencia.periodo}`} className="flex gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#f1f3f7] text-[#0f1b3d]">
                      <Briefcase className="size-4" aria-hidden />
                    </span>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-[#2d2d2d]">{experiencia.cargo}</p>
                      <p className="text-sm text-[#595959]">{experiencia.empresa}</p>
                      <p className="mt-0.5 text-xs text-[#8a8a8a]">{experiencia.periodo}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className={caixa}>
            <h2 className={tituloSecao}>O que {primeiroNome} oferece</h2>
            <p className="mt-1 text-sm text-[#595959]">
              Escolha um destes temas na hora de agendar. Cada sessão é focada em um tema.
            </p>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {servicos.map((servico) => (
                <li
                  key={servico.id}
                  className="flex flex-col gap-3 rounded-[12px] border border-[#e5e5e5] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#0f1b3d]/40 hover:shadow-[0_8px_20px_-10px_rgba(15,27,61,0.25)]"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-[#2d2d2d]">{servico.nome}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#595959]">{servico.oQueFaz}.</p>
                  </div>
                  <p className="mt-auto border-t border-[#eeeeee] pt-3 text-sm leading-6 text-[#2d2d2d]">
                    <span className="font-semibold text-[#0f1b3d]">Você leva: </span>
                    {servico.candidatoRecebe}.
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside id="agendar" className="scroll-mt-6 lg:sticky lg:top-6">
          <AgendarMentoria mentor={mentor} servicos={servicos} />
        </aside>
      </div>
    </div>
  );
}
