import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { buscarCurso } from "../_lib/buscarCursos";
import { buscarLacunas } from "../_lib/buscarLacunas";
import { montarTrilha } from "../_lib/montarTrilha";
import DetalheCurso from "../_components/DetalheCurso";

// O id do curso no Supabase é um uuid. Se não tiver esse formato, nem consultamos o banco.
const FORMATO_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function PaginaCurso({ params }: PageProps<"/cursos/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-[#595959]">Carregando curso...</p>}>
      {params.then(({ id }) => (
        <CarregarCurso id={id} />
      ))}
    </Suspense>
  );
}

async function CarregarCurso({ id }: { id: string }) {
  if (!FORMATO_ID.test(id)) notFound();

  // Mesmo caminho da página /cursos: lacunas -> trilha -> curso.
  // Assim o selo ⚡ e o "desenvolve o que falta para você" ficam iguais nas duas telas.
  const [user, lacunas] = await Promise.all([getCurrentUser(), buscarLacunas()]);
  const trilha = await montarTrilha(lacunas.habilidades);
  const curso = await buscarCurso(id, { idPerfil: user.id, lacunas, trilha });

  if (!curso) notFound();

  return <DetalheCurso curso={curso} />;
}
