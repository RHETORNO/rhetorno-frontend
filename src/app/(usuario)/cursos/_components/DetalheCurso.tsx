import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Building2,
  CheckCircle2,
  Gift,
  ListChecks,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { CursoComDados } from "../_lib/tipos";
import { formatarCarga, formatarLocal, rotulo } from "../_lib/utils";
import BotoesCurso from "./BotoesCurso";

// "Linha 1\nLinha 2" -> ["Linha 1", "Linha 2"]
function emLinhas(texto: string | null): string[] {
  if (!texto) return [];
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

export default function DetalheCurso({ curso }: { curso: CursoComDados }) {
  const etiquetas = [
    rotulo(curso.modalidade),
    rotulo(curso.turno),
    formatarCarga(curso.carga_horaria_h, true),
  ].filter(Boolean);

  const licoes = emLinhas(curso.licoes);
  const beneficios = emLinhas(curso.beneficios);
  const habilidades = curso.desenvolve
    .map((item) => item.habilidade)
    .filter((habilidade) => habilidade !== null);

  return (
    <article className="flex flex-col gap-6 rounded-[16px] border border-[#d9d9d9] bg-white p-6 shadow-[0px_2px_6px_rgba(0,0,0,0.06)]">
      <Link
        href="/cursos"
        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-[#1a56db] hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden /> Voltar para os cursos
      </Link>

      <header className="flex flex-col gap-3">
        {curso.faltantes.length > 0 && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#eaf1ff] px-2.5 py-1 text-xs font-semibold text-[#1a56db]">
            <Sparkles className="size-3.5" aria-hidden />
            Desenvolve o que falta para você: {curso.faltantes.join(", ")}
          </span>
        )}

        <h1 className="text-[26px] font-semibold text-[#0f1b3d]">{curso.titulo}</h1>

        <ul className="flex flex-col gap-1.5 text-sm text-[#454545]">
          <li className="flex items-center gap-2">
            <Building2 className="size-4" aria-hidden />
            {curso.site_instituicao_url ? (
              <a
                href={curso.site_instituicao_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1a56db] hover:underline"
              >
                {curso.instituicao_nome}
              </a>
            ) : (
              curso.instituicao_nome
            )}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-4" aria-hidden />
            {formatarLocal(curso.cidade, curso.uf)}
          </li>
          <li className="flex items-center gap-2">
            <Award className="size-4" aria-hidden />
            Certificado gratuito
          </li>
        </ul>

        {etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {etiquetas.map((etiqueta) => (
              <span
                key={etiqueta}
                className="rounded-[8px] bg-[#f1f3f7] px-2.5 py-1 text-xs font-medium text-[#454545]"
              >
                {etiqueta}
              </span>
            ))}
          </div>
        )}
      </header>

      <BotoesCurso
        idCurso={curso.id}
        link={curso.link_externo_curso}
        status={curso.status}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-[#2d2d2d]">Sobre o curso</h2>
        <p className="text-sm leading-relaxed text-[#454545]">{curso.descricao}</p>
      </section>

      {licoes.length > 0 && (
        <Secao titulo="O que você vai aprender" icone={<ListChecks className="size-5 text-[#1a56db]" aria-hidden />}>
          {licoes}
        </Secao>
      )}

      {beneficios.length > 0 && (
        <Secao titulo="Benefícios" icone={<Gift className="size-5 text-[#1a56db]" aria-hidden />}>
          {beneficios}
        </Secao>
      )}

      {habilidades.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-[#2d2d2d]">Habilidades que desenvolve</h2>
          <ul className="flex flex-wrap gap-2">
            {habilidades.map((habilidade) => {
              const faltaParaVoce = curso.faltantes.includes(habilidade.nome);
              return (
                <li
                  key={habilidade.id}
                  className={
                    faltaParaVoce
                      ? "rounded-full bg-[#eaf1ff] px-3 py-1 text-xs font-semibold text-[#1a56db]"
                      : "rounded-full bg-[#f1f3f7] px-3 py-1 text-xs font-medium text-[#454545]"
                  }
                >
                  {habilidade.nome}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}

type SecaoProps = {
  titulo: string;
  icone: React.ReactNode;
  children: string[];
};

function Secao({ titulo, icone, children }: SecaoProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2d2d2d]">
        {icone}
        {titulo}
      </h2>
      <ul className="flex flex-col gap-1.5">
        {children.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-[#454545]">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#1e7b34]" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
