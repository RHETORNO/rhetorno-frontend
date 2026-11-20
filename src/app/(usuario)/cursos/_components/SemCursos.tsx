import Link from "next/link";
import { SearchX } from "lucide-react";
import type { Aba, Filtros } from "../_lib/tipos";
import { hrefCursos, lerFiltros, temFiltroAtivo } from "../_lib/utils";

const TEXTOS: Record<Aba, { titulo: string; texto: string }> = {
  recomendados: {
    titulo: "Nenhum curso recomendado por enquanto",
    texto: "Enquanto isso, explore todos os cursos gratuitos da plataforma.",
  },
  todos: {
    titulo: "Nenhum curso encontrado",
    texto: "Novos cursos gratuitos entram na plataforma com frequência.",
  },
  meus: {
    titulo: "Você ainda não salvou nenhum curso",
    texto: "Salve um curso ou informe sua inscrição e ele aparece aqui.",
  },
};

const botaoContorno =
  "rounded-full border border-[#1a56db] px-4 py-2 text-sm font-semibold text-[#1a56db] transition-colors hover:bg-[#eaf1ff]";
const botaoCheio =
  "rounded-full bg-[#1a56db] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1546b3]";

export default function SemCursos({ filtros }: { filtros: Filtros }) {
  const comFiltros = temFiltroAtivo(filtros);
  const naAbaTodos = filtros.aba === "todos";

  // Com filtro, o título fala da busca (e não "você ainda não salvou nenhum curso").
  const titulo = comFiltros ? "Nenhum curso encontrado com esses filtros" : TEXTOS[filtros.aba].titulo;
  const texto = comFiltros
    ? "Tente mudar ou limpar os filtros da busca."
    : TEXTOS[filtros.aba].texto;

  return (
    <section className="flex flex-col items-center gap-3 rounded-[16px] border border-dashed border-[#d9d9d9] bg-white px-6 py-12 text-center">
      <SearchX className="size-8 text-[#9ca3af]" aria-hidden />
      <h2 className="font-semibold text-[#2d2d2d]">{titulo}</h2>
      <p className="max-w-md text-sm text-[#595959]">{texto}</p>

      <div className="flex flex-wrap justify-center gap-3">
        {/* Apaga os filtros e fica na mesma aba. */}
        {comFiltros && (
          <Link href={hrefCursos(lerFiltros({}), filtros.aba)} scroll={false} className={botaoContorno}>
            Limpar filtros
          </Link>
        )}

        {/* Leva para a aba Todos. Se havia filtros, eles continuam valendo lá. */}
        {!naAbaTodos && (
          <Link href={hrefCursos(filtros, "todos")} scroll={false} className={botaoCheio}>
            {comFiltros ? "Buscar em todos os cursos" : "Ver todos os cursos"}
          </Link>
        )}
      </div>
    </section>
  );
}
