import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CursoComDados, StatusInscricao } from "../_lib/tipos";
import { formatarCarga, formatarLocal, rotulo } from "../_lib/utils";
import BotaoSalvar from "./BotaoSalvar";

// Etiquetas para quem já se inscreveu. Vêm do enum status_inscricao do Supabase.
// "inscrito" = a pessoa INFORMOU que se inscreveu na instituição.
// Não dizemos "em andamento", porque não acompanhamos o curso (ele é externo).
// ("salvo" não está aqui: para ele o card mostra o próprio botão Salvar, marcado.)
const ETAPAS: Record<
  Extract<StatusInscricao, "inscrito" | "concluido">,
  { texto: string; cor: string; icone: React.ReactNode }
> = {
  inscrito: {
    texto: "Inscrito",
    cor: "bg-[#fff4d6] text-[#8a5a00]",
    icone: <ClipboardCheck className="size-3.5" aria-hidden />,
  },
  concluido: {
    texto: "Concluído",
    cor: "bg-[#e6f6ea] text-[#1e7b34]",
    icone: <CheckCircle2 className="size-3.5" aria-hidden />,
  },
};

export default function CardCurso({ curso }: { curso: CursoComDados }) {
  const href = `/cursos/${curso.id}`;

  const habilidades = curso.desenvolve
    .map((item) => item.habilidade)
    .filter((habilidade) => habilidade !== null);

  // Formato + turno: "Presencial · Manhã" ou só "Online (EAD)".
  const formato = [rotulo(curso.modalidade), rotulo(curso.turno)].filter(Boolean).join(" · ");
  const online = curso.modalidade === "EAD";

  const etapa =
    curso.status === "inscrito" || curso.status === "concluido" ? ETAPAS[curso.status] : null;

  return (
    <article className="flex h-full flex-col gap-3 rounded-[16px] border border-[#d9d9d9] bg-white p-5 shadow-[0px_2px_6px_rgba(0,0,0,0.06)] transition duration-300 hover:border-[#1a56db] hover:shadow-md">
      {/* Regra do produto: todo curso da trilha é gratuito e tem certificado gratuito. */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f6ea] px-2.5 py-1 text-xs font-semibold text-[#1e7b34]">
          <BadgeCheck className="size-3.5" aria-hidden />
          Gratuito
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f3f7] px-2.5 py-1 text-xs font-semibold text-[#454545]">
          <Award className="size-3.5" aria-hidden />
          Certificado gratuito
        </span>
        {curso.maisRapido && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4d6] px-2.5 py-1 text-xs font-semibold text-[#8a5a00]">
            <Zap className="size-3.5" aria-hidden />
            Mais rápido
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-[18px] font-semibold text-[#2d2d2d]">
          <Link href={href} className="hover:text-[#1a56db] hover:underline">
            {curso.titulo}
          </Link>
        </h3>
        <p className="flex items-center gap-2 text-sm text-[#595959]">
          <Building2 className="size-4 shrink-0" aria-hidden />
          {curso.instituicao_nome}
        </p>
      </div>

      {/* line-clamp-2: mostra só 2 linhas; o texto inteiro está na página do curso. */}
      <p className="line-clamp-2 text-sm text-[#454545]">{curso.descricao}</p>

      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-[#595959]">Carga horária</dt>
          <dd className="font-semibold text-[#2d2d2d]">
            {formatarCarga(curso.carga_horaria_h, true) || "Não informada"}
          </dd>
        </div>
        <div>
          <dt className="text-[#595959]">Formato</dt>
          <dd className="font-semibold text-[#2d2d2d]">{formato || "Não informado"}</dd>
        </div>
        {!online && (
          <div className="col-span-2">
            <dt className="text-[#595959]">Local</dt>
            <dd className="font-semibold text-[#2d2d2d]">
              {formatarLocal(curso.cidade, curso.uf)}
            </dd>
          </div>
        )}
      </dl>

      {/* Habilidades do curso. As que faltam no SEU currículo ficam em destaque. */}
      {habilidades.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-[#595959]">
            {habilidades.length === 1 ? "Habilidade desenvolvida" : "Habilidades desenvolvidas"}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {habilidades.map((habilidade) => {
              const faltaParaVoce = curso.faltantes.includes(habilidade.nome);
              return (
                <li
                  key={habilidade.id}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                    faltaParaVoce
                      ? "bg-[#eaf1ff] text-[#1a56db]"
                      : "bg-[#f1f3f7] text-[#454545]",
                  )}
                >
                  {faltaParaVoce && <Sparkles className="size-3.5" aria-hidden />}
                  {habilidade.nome}
                  {faltaParaVoce && <span className="sr-only">(falta no seu currículo)</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e5e5e5] pt-3">
        {etapa ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${etapa.cor}`}
          >
            {etapa.icone}
            {etapa.texto}
          </span>
        ) : (
          <BotaoSalvar idCurso={curso.id} salvo={curso.status === "salvo"} tamanho="pequeno" />
        )}

        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a56db] hover:underline"
        >
          Ver curso
          <ArrowRight className="size-4" aria-hidden />
          <span className="sr-only">: {curso.titulo}</span>
        </Link>
      </div>
    </article>
  );
}
