"use client";

import { useState, useTransition } from "react";
import { ClipboardCheck, ExternalLink } from "lucide-react";
import type { StatusInscricao } from "../_lib/tipos";
import { informarInscricao } from "../actions";
import BotaoSalvar from "./BotaoSalvar";

type Props = {
  idCurso: string;
  link: string | null;
  status: StatusInscricao | null;
};

export default function BotoesCurso({ idCurso, link, status }: Props) {
  const [pendente, iniciarTransicao] = useTransition();
  const [erro, setErro] = useState("");

  const jaInscrito = status === "inscrito" || status === "concluido";

  // Só a pessoa sabe se concluiu a inscrição no site da instituição,
  // então quem registra é ela, clicando aqui.
  function informar() {
    setErro("");
    iniciarTransicao(async () => {
      const resultado = await informarInscricao(idCurso);
      if (resultado?.erro) setErro(resultado.erro);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start gap-3">
        {/* Só abre o site da instituição. NÃO grava nada no nosso banco. */}
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-gradient-to-r from-black to-blue-800/95 px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-125 active:scale-95"
          >
            Acessar curso
            <ExternalLink className="size-4" aria-hidden />
            <span className="sr-only">(abre o site da instituição em nova aba)</span>
          </a>
        ) : (
          <span className="inline-flex h-11 items-center rounded-[10px] bg-[#f1f3f7] px-5 text-sm font-semibold text-[#595959]">
            Link do curso indisponível
          </span>
        )}

        {/* Depois de inscrita, a pessoa não "salva" mais: o curso já está em Meus cursos. */}
        {!jaInscrito && <BotaoSalvar idCurso={idCurso} salvo={status === "salvo"} />}

        {!jaInscrito && (
          <button
            type="button"
            onClick={informar}
            disabled={pendente}
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-[#d9d9d9] bg-white px-5 text-sm font-semibold text-[#2d2d2d] transition duration-200 hover:border-[#1a56db] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ClipboardCheck className="size-5" aria-hidden />
            {pendente ? "Registrando..." : "Já me inscrevi"}
          </button>
        )}
      </div>

      {jaInscrito && (
        <p className="flex items-center gap-1.5 text-sm text-[#1e7b34]">
          <ClipboardCheck className="size-4" aria-hidden />
          Você informou que se inscreveu neste curso. Ele está em Meus cursos.
        </p>
      )}

      {!jaInscrito && link && (
        <p className="text-xs text-[#595959]">
          A inscrição é feita no site da instituição. Depois de se inscrever, volte aqui e
          clique em &quot;Já me inscrevi&quot;.
        </p>
      )}

      {erro && (
        <p role="alert" className="text-xs text-red-600">
          {erro}
        </p>
      )}
    </div>
  );
}
