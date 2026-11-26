"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { chaveDia, dentroDoPeriodo, lerData, mesesAgendaveis } from "../_lib/horarios";
import CalendarioMes from "./CalendarioMes";

type Props = {
  valor: string;
  hoje: string;
  classeCampo: string;
  aoMudar: (valor: string) => void;
};

export default function SeletorData({ valor, hoje, classeCampo, aoMudar }: Props) {
  const diaHoje = lerData(hoje) ?? new Date();
  const meses = mesesAgendaveis(diaHoje);
  const escolhido = lerData(valor);

  const [aberto, setAberto] = useState(false);
  const [mes, setMes] = useState(() =>
    escolhido ? new Date(escolhido.getFullYear(), escolhido.getMonth(), 1) : meses[0],
  );

  const caixaRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const idPainel = useId();

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!aberto) return;

    function cliqueFora(evento: MouseEvent) {
      if (!caixaRef.current?.contains(evento.target as Node)) setAberto(false);
    }
    function tecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", cliqueFora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", cliqueFora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  function escolher(dia: Date) {
    setAberto(false);
    aoMudar(chaveDia(dia));
  }

  const texto = escolhido
    ? escolhido.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replaceAll(".", "")
    : "Qualquer dia";

  return (
    <div ref={caixaRef} className="relative flex flex-col gap-1.5 text-xs font-medium text-[#595959]">
      <span id={`${idPainel}-titulo`}>Dia em que você está livre</span>

      <button
        ref={botaoRef}
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-controls={idPainel}
        aria-labelledby={`${idPainel}-titulo ${idPainel}-valor`}
        className={`${classeCampo} flex items-center gap-2 pr-9 text-left`}
      >
        <CalendarDays className="size-4 shrink-0 text-[#8a8a8a]" aria-hidden />
        <span id={`${idPainel}-valor`} className={`truncate ${escolhido ? "" : "text-[#8a8a8a]"}`}>
          {texto}
        </span>
        <ChevronDown
          className={`pointer-events-none absolute right-3 bottom-3.5 size-4 text-[#8a8a8a] transition ${aberto ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {aberto && (
        <div
          id={idPainel}
          role="dialog"
          aria-label="Escolher dia"
          className="absolute top-full right-0 z-30 mt-2 w-75 max-w-[calc(100vw-2rem)] rounded-[16px] border border-[#d9d9d9] bg-white p-4 font-normal shadow-[0_16px_40px_-12px_rgba(15,27,61,0.3)]"
        >
          <CalendarioMes
            meses={meses}
            mes={mes}
            aoTrocarMes={setMes}
            hoje={diaHoje}
            selecionado={escolhido}
            disponivel={(dia) => dentroDoPeriodo(dia, diaHoje)}
            aoEscolher={escolher}
          />

          {escolhido && (
            <button
              type="button"
              onClick={() => {
                setAberto(false);
                aoMudar("");
              }}
              className="mt-3 w-full rounded-lg py-2 text-sm font-medium text-[#0f1b3d] transition hover:bg-[#f1f3f7]"
            >
              Qualquer dia
            </button>
          )}
        </div>
      )}
    </div>
  );
}
