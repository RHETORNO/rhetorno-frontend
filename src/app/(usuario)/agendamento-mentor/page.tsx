import { Suspense } from "react";
import ConteudoMentores from "./_components/ConteudoMentores";

export default function AgendamentoMentor({ searchParams }: PageProps<"/agendamento-mentor">) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="py-1 text-3xl font-semibold text-black">Mentores de RH</h1>
        <p className="text-sm text-[#64748b]">
          Escolha quem combina com você e marque um horário para conversar sobre a sua carreira.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-[#595959]">Carregando mentores...</p>}>
        <ConteudoMentores searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
