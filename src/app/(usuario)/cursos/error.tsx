"use client";

import { useEffect } from "react";
import { WifiOff } from "lucide-react";

type Props = {
  error: unknown;
  retry: () => void;
};

export default function ErroCursos({ error, retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-col items-center gap-4 rounded-[16px] border border-[#d9d9d9] bg-white px-6 py-12 text-center">
      <WifiOff className="size-8 text-[#1a56db]" aria-hidden />

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[#2d2d2d]">
          Não conseguimos carregar os cursos agora
        </h2>
        <p className="text-sm text-[#595959]">
          Pode ser a sua conexão ou uma instabilidade do nosso lado. Tente de novo em instantes.
        </p>
      </div>

      <button
        type="button"
        onClick={() => retry()}
        className="cursor-pointer rounded-full bg-[#1a56db] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1546b3]"
      >
        Tentar de novo
      </button>
    </section>
  );
}
