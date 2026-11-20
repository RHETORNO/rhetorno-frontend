import Link from "next/link";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { buscarCursos } from "../_lib/buscarCursos";
import { buscarLacunas } from "../_lib/buscarLacunas";
import { montarTrilha } from "../_lib/montarTrilha";
import { hrefCursos, lerFiltros } from "../_lib/utils";
import AbasCursos from "./AbasCursos";
import BuscaCursos from "./BuscaCursos";
import CardCurso from "./CardCurso";
import ResumoLacunas from "./ResumoLacunas";
import SemCursos from "./SemCursos";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConteudoCursos({ searchParams }: Props) {
  await connection();
  const filtros = lerFiltros(await searchParams);

  // 1. Quem é a pessoa e o que falta no currículo dela (as duas buscas ao mesmo tempo).
  const [user, lacunas] = await Promise.all([getCurrentUser(), buscarLacunas()]);
  // 2. Quais cursos cobrem essas lacunas (sem os filtros da tela).
  const trilha = await montarTrilha(lacunas.habilidades);
  // 3. A lista da aba escolhida, já com busca e filtros.
  const { cursos, temMais } = await buscarCursos(filtros, {
    idPerfil: user.id,
    lacunas,
    trilha,
  });

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="py-1 text-3xl font-semibold text-black">Trilha de Cursos</h1>
        <p className="text-sm text-[#64748b]">
          Cursos gratuitos para desenvolver o que falta no seu currículo
        </p>
      </header>

      <BuscaCursos filtros={filtros} />

      <AbasCursos filtros={filtros} />

      {filtros.aba === "recomendados" && (
        <ResumoLacunas
          lacunas={lacunas}
          trilhaLonga={trilha.trilhaLonga}
          semCurso={trilha.semCurso}
        />
      )}

      {cursos.length === 0 ? (
        <SemCursos filtros={filtros} />
      ) : (
        <>
          <p className="text-sm text-[#595959]">
            {temMais
              ? `Mostrando os primeiros ${cursos.length} cursos`
              : `${cursos.length} ${cursos.length === 1 ? "curso encontrado" : "cursos encontrados"}`}
          </p>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cursos.map((curso) => (
              <li key={curso.id}>
                <CardCurso curso={curso} />
              </li>
            ))}
          </ul>

          {temMais && (
            <Link
              href={hrefCursos(filtros, filtros.aba, filtros.pagina + 1)}
              scroll={false}
              className="self-center rounded-full border border-[#1a56db] px-5 py-2 text-sm font-semibold text-[#1a56db] transition-colors hover:bg-[#eaf1ff]"
            >
              Carregar mais cursos
            </Link>
          )}
        </>
      )}
    </div>
  );
}
