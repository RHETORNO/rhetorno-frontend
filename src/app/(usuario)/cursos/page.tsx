import { Suspense } from "react";
import ConteudoCursos from "./_components/ConteudoCursos";

export default function Cursos({ searchParams }: PageProps<"/cursos">) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<p className="text-sm text-[#595959]">Carregando cursos...</p>}>
        <ConteudoCursos searchParams={searchParams} />
      </Suspense>
    </div>
  );
}