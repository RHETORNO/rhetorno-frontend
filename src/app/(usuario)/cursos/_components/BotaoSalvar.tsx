"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { alternarCursoSalvo } from "../actions";

type Props = {
  idCurso: string;
  salvo: boolean;
  // "pequeno" no card; "normal" na página de detalhes.
  tamanho?: "normal" | "pequeno";
};

// Botão reaproveitado no card e na página de detalhes.
// Clicar de novo tira o curso dos salvos.
export default function BotaoSalvar({ idCurso, salvo, tamanho = "normal" }: Props) {
  const [pendente, iniciarTransicao] = useTransition();
  const [erro, setErro] = useState("");

  function alternar() {
    setErro("");
    iniciarTransicao(async () => {
      const resultado = await alternarCursoSalvo(idCurso);
      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={alternar}
        disabled={pendente}
        aria-pressed={salvo}
        className={cn(
          "inline-flex cursor-pointer items-center gap-2 rounded-[10px] border font-semibold transition duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60",
          tamanho === "pequeno" ? "h-9 px-3 text-xs" : "h-11 px-5 text-sm",
          salvo
            ? "border-[#1a56db] bg-[#eaf1ff] text-[#1a56db]"
            : "border-[#d9d9d9] bg-white text-[#2d2d2d] hover:border-[#1a56db]",
        )}
      >
        <Bookmark
          className={cn(tamanho === "pequeno" ? "size-4" : "size-5", salvo && "fill-current")}
          strokeWidth={2}
          aria-hidden
        />
        {pendente ? "Salvando..." : salvo ? "Salvo" : "Salvar"}
      </button>

      {erro && (
        <p role="alert" className="text-xs text-red-600">
          {erro}
        </p>
      )}
    </div>
  );
}
