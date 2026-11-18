import { Suspense } from "react";
import Calendario from "./_components/Calendario";

export default function Agenda() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-[40px] font-semibold text-[#2d2d2d]">Agenda</h1>
        <p className="text-xl text-[#595959]">
          Veja seus agendamentos com nossos mentores através do calendário.
        </p>
      </header>

      <Suspense fallback={<p className="text-sm text-[#595959]">Carregando calendário...</p>}>
        <Calendario />
      </Suspense>
    </div>
  );
}