import Link from "next/link";
import { FileSearch, PartyPopper, SearchX, Sparkles, Sprout } from "lucide-react";
import type { Lacunas } from "../_lib/buscarLacunas";
import { juntarNomes, LIMITE_TRILHA_RAPIDA_H } from "../_lib/utils";

type Props = {
  lacunas: Lacunas;
  trilhaLonga: string[];
  semCurso: string[];
};

export default function ResumoLacunas({ lacunas, trilhaLonga, semCurso }: Props) {
  if (!lacunas.temAnalise) {
    return (
      <section className="flex flex-col items-start gap-4 rounded-[16px] border border-[#d9d9d9] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <FileSearch className="mt-0.5 size-5 shrink-0 text-[#1a56db]" aria-hidden />
          <div>
            <h2 className="font-semibold text-[#2d2d2d]">
              Descubra quais cursos combinam com você
            </h2>
            <p className="text-sm text-[#595959]">
              Para recomendar cursos alinhados aos seus objetivos, precisamos conhecer seu perfil
              profissional.
            </p>
          </div>
        </div>
        <Link 
          href="/analise-curriculo"
          className="shrink-0 rounded-full bg-[#1a56db] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1546b3]"
        >
          Analisar meu currículo
        </Link>
      </section>
    );
  }

  if (lacunas.habilidades.length === 0) {
    return (
      <section className="flex items-start gap-3 rounded-[16px] border border-[#cdebd5] bg-[#f3fbf5] p-5">
        <PartyPopper className="mt-0.5 size-5 shrink-0 text-[#1e7b34]" aria-hidden />
        <div>
          <h2 className="font-semibold text-[#2d2d2d]">
            Sua análise não encontrou lacunas
          </h2>
          <p className="text-sm text-[#595959]">
            Quer continuar evoluindo? Veja{" "}
            <Link href="/cursos?aba=todos" className="font-semibold text-[#1a56db] underline">
              todos os cursos
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-[16px] border border-[#cfe0ff] bg-[#f5f8ff] p-5">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-[#1a56db]" aria-hidden />
        <div>
          {/* Aviso para ninguém confundir o modo de teste com uma análise real. */}
          {lacunas.simulada && (
            <span className="mb-1 inline-flex rounded-full bg-[#fff4d6] px-2.5 py-0.5 text-xs font-semibold text-[#8a5a00]">
              Análise simulada (modo de teste)
            </span>
          )}
          <h2 className="font-semibold text-[#2d2d2d]">Sua trilha de desenvolvimento</h2>
          <p className="text-sm text-[#595959]">
            Identificamos habilidades que podem fortalecer seu perfil
            {lacunas.cargoAlvo ? ` para a vaga de ${lacunas.cargoAlvo}` : ""}.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-[#595959] uppercase">
          Habilidades a desenvolver
        </h3>
        <ul className="flex flex-wrap gap-2">
          {lacunas.habilidades.map((habilidade) => (
            <li
              key={habilidade.id}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1a56db] ring-1 ring-[#cfe0ff]"
            >
              {habilidade.nome}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-[#595959]">
        As recomendações abaixo consideram as lacunas identificadas na sua análise.
      </p>

      {trilhaLonga.length > 0 && (
        <div className="flex items-start gap-3 rounded-[12px] bg-white p-4 ring-1 ring-[#cdebd5]">
          <Sprout className="mt-0.5 size-5 shrink-0 text-[#1e7b34]" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-[#2d2d2d]">
              Uma trilha para construir com calma
            </h3>
            <p className="text-sm text-[#595959]">
              {juntarNomes(trilhaLonga)}{" "}
              {trilhaLonga.length === 1 ? "pede um curso mais longo" : "pedem cursos mais longos"}{" "}
              (mais de {LIMITE_TRILHA_RAPIDA_H}h). Vá no seu ritmo, cada passo conta.
            </p>
          </div>
        </div>
      )}

      {semCurso.length > 0 && (
        <div className="flex items-start gap-3 rounded-[12px] bg-white p-4 ring-1 ring-[#e5e5e5]">
          <SearchX className="mt-0.5 size-5 shrink-0 text-[#595959]" aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-[#2d2d2d]">
              Não foi possível encontrar um curso gratuito com certificado para{" "}
              {semCurso.length === 1 ? "esta habilidade" : "estas habilidades"} no momento.
            </h3>
            <p className="text-sm text-[#595959]">
              {juntarNomes(semCurso)}. Assim que encontrarmos uma opção, ela aparece aqui.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
