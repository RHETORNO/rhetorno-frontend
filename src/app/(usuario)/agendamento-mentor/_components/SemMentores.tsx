import Link from "next/link";
import { SearchX } from "lucide-react";

export default function SemMentores() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[16px] border border-dashed border-[#d9d9d9] bg-white px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-[#e8edf8] text-[#0f1b3d]">
        <SearchX className="size-6" aria-hidden />
      </span>
      <h2 className="text-lg font-semibold text-[#2d2d2d]">Nenhum mentor encontrado</h2>
      <p className="max-w-sm text-sm text-[#595959]">
        Nenhum mentor atende com todos esses filtros. Tente tirar um deles ou escolher outro dia.
      </p>
      <Link
        href="/agendamento-mentor"
        scroll={false}
        className="mt-1 rounded-[10px] border border-[#0f1b3d] bg-white px-[18px] py-3 text-sm font-semibold text-[#0f1b3d] transition hover:bg-gray-200/90"
      >
        Ver todos os mentores
      </Link>
    </div>
  );
}
