import { connection } from "next/server";
import { filtrarMentores, lerFiltros } from "../_lib/filtros";
import { chaveDia } from "../_lib/horarios";
import { MENTORES } from "../_lib/mentoresMock";
import CardMentor from "./CardMentor";
import FiltrosMentores from "./FiltrosMentores";
import MinhasMentorias from "./MinhasMentorias";
import SemMentores from "./SemMentores";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConteudoMentores({ searchParams }: Props) {
  await connection();
  const hoje = new Date();
  const filtros = lerFiltros(await searchParams, hoje);
  const mentores = filtrarMentores(MENTORES, filtros);

  return (
    <>
      <MinhasMentorias />

      <FiltrosMentores filtros={filtros} hoje={chaveDia(hoje)} />

      {mentores.length === 0 ? (
        <SemMentores />
      ) : (
        <>
          <p className="text-sm text-[#595959]" aria-live="polite">
            {mentores.length} {mentores.length === 1 ? "mentor disponível" : "mentores disponíveis"}
          </p>

          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {mentores.map((mentor) => (
              <li key={mentor.id}>
                <CardMentor mentor={mentor} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
