import { Suspense } from "react";
import { notFound } from "next/navigation";
import PerfilMentor from "../_components/PerfilMentor";
import { MENTORES } from "../_lib/mentoresMock";

export default function PaginaMentor({ params }: PageProps<"/agendamento-mentor/[id]">) {
  return (
    <Suspense fallback={<p className="text-sm text-[#595959]">Carregando mentor...</p>}>
      {params.then(({ id }) => (
        <CarregarMentor id={id} />
      ))}
    </Suspense>
  );
}

function CarregarMentor({ id }: { id: string }) {
  const mentor = MENTORES.find((item) => item.id === id);
  if (!mentor) notFound();
  return <PerfilMentor mentor={mentor} />;
}
