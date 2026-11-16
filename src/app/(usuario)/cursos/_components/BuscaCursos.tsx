import Form from "next/form";
import Link from "next/link";
import { MapPin, Search, X } from "lucide-react";
import type { Filtros } from "../_lib/tipos";
import { hrefCursos, lerFiltros, MODALIDADES, rotulo, TURNOS } from "../_lib/utils";

const campo =
  "h-11 rounded-[10px] border border-[#d9d9d9] bg-white px-3 text-sm text-[#2d2d2d] outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/20";

export default function BuscaCursos({ filtros }: { filtros: Filtros }) {
  return (
    <Form
      action="/cursos"
      scroll={false}
      className="flex flex-col gap-4 rounded-[16px] border border-[#d9d9d9] bg-white p-4 shadow-[0px_2px_6px_rgba(0,0,0,0.06)]"
    >
      {/* Mantém a aba atual depois de buscar */}
      {filtros.aba !== "recomendados" && (
        <input type="hidden" name="aba" value={filtros.aba} />
      )}
      {/* Mantém a habilidade que veio da análise */}
      {filtros.habilidade && (
        <input type="hidden" name="habilidade" value={filtros.habilidade} />
      )}

      {filtros.habilidade && (
        <Link
          href={hrefCursos({ ...filtros, habilidade: "" })}
          scroll={false}
          aria-label={`Remover filtro da habilidade ${filtros.habilidade}`}
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#eaf1ff] px-3 py-1 text-xs font-semibold text-[#1a56db] transition-colors hover:bg-[#d6e4ff]"
        >
          Habilidade: {filtros.habilidade}
          <X className="size-3.5" aria-hidden />
        </Link>
      )}

      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Curso ou instituição</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#595959]"
            aria-hidden
          />
          <input
            name="q"
            defaultValue={filtros.q}
            placeholder="Curso ou instituição (ex.: Excel, Senac)"
            className={`${campo} w-full pl-9`}
          />
        </label>

        <label className="relative flex-1">
          <span className="sr-only">Cidade</span>
          <MapPin
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#595959]"
            aria-hidden
          />
          <input
            name="local"
            defaultValue={filtros.local}
            placeholder="Cidade"
            className={`${campo} w-full pl-9`}
          />
        </label>

        <button
          type="submit"
          className="h-11 cursor-pointer rounded-[10px] bg-gradient-to-r from-black to-blue-800/95 px-6 text-sm font-semibold text-white transition duration-200 hover:shadow-lg hover:brightness-125 active:scale-95"
        >
          Buscar cursos
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Seletor nome="modalidade" titulo="Formato" opcoes={MODALIDADES} valor={filtros.modalidade} />
        <Seletor nome="turno" titulo="Turno" opcoes={TURNOS} valor={filtros.turno} />

        <Link
          href={hrefCursos(lerFiltros({}), filtros.aba)}
          scroll={false}
          className="pb-3 text-sm font-medium text-[#1a56db] hover:underline"
        >
          Limpar filtros
        </Link>
      </div>
    </Form>
  );
}

type SeletorProps = {
  nome: string;
  titulo: string;
  opcoes: string[];
  valor: string;
};

function Seletor({ nome, titulo, opcoes, valor }: SeletorProps) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-[#595959]">
      {titulo}
      <select name={nome} defaultValue={valor} className={campo}>
        <option value="">Todos</option>
        {opcoes.map((opcao) => (
          <option key={opcao} value={opcao}>
            {rotulo(opcao)}
          </option>
        ))}
      </select>
    </label>
  );
}
