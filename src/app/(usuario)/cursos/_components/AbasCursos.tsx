import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Filtros } from "../_lib/tipos";
import { ABAS, hrefCursos } from "../_lib/utils";

export default function AbasCursos({ filtros }: { filtros: Filtros }) {
  return (
    <nav
      aria-label="Seções da trilha de cursos"
      className="flex gap-6 border-b border-[#e5e5e5]"
    >
      {ABAS.map((aba) => {
        const ativa = filtros.aba === aba.valor;

        return (
          <Link
            key={aba.valor}
            href={hrefCursos(filtros, aba.valor)}
            scroll={false}
            aria-current={ativa ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
              ativa
                ? "border-[#1a56db] text-[#1a56db]"
                : "border-transparent text-[#595959] hover:text-[#2d2d2d]",
            )}
          >
            {aba.titulo}
          </Link>
        );
      })}
    </nav>
  );
}
