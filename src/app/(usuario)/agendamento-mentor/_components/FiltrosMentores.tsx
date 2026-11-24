"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LoaderCircle, X } from "lucide-react";
import type { Filtros } from "../_lib/filtros";
import { servicosDaFormacao, temFiltro } from "../_lib/filtros";
import { TURNOS } from "../_lib/horarios";
import type { Formacao } from "../_lib/tipos";
import { NOMES_FORMACAO, NOMES_TURNO } from "../_lib/tipos";
import SeletorData from "./SeletorData";

type Campo = "formacao" | "servico" | "libras" | "turno" | "data";

const campo =
  "h-11 w-full rounded-[10px] border border-[#d9d9d9] bg-white px-3 text-sm text-[#2d2d2d] outline-none transition hover:border-[#bfbfbf] focus:border-[#0f1b3d] focus:ring-2 focus:ring-[#0f1b3d]/15 disabled:cursor-not-allowed disabled:bg-[#f8fafc] disabled:text-[#9aa3b2]";

export default function FiltrosMentores({ filtros, hoje }: { filtros: Filtros; hoje: string }) {
  const router = useRouter();
  const [atualizando, iniciarTransicao] = useTransition();

  function atualizar(mudancas: Partial<Record<Campo, string>>) {
    const valores: Record<Campo, string> = {
      formacao: filtros.formacao,
      servico: filtros.servico ? String(filtros.servico) : "",
      libras: filtros.libras ? "sim" : "",
      turno: filtros.turno,
      data: filtros.data,
      ...mudancas,
    };

    const parametros = new URLSearchParams();
    for (const [chave, valor] of Object.entries(valores)) {
      if (valor) parametros.set(chave, valor);
    }

    const busca = parametros.toString();
    iniciarTransicao(() => {
      router.replace(busca ? `/agendamento-mentor?${busca}` : "/agendamento-mentor", { scroll: false });
    });
  }

  const formacao = filtros.formacao;
  const servicos = formacao ? servicosDaFormacao(formacao) : [];
  const daFormacao = servicos.filter((servico) => servico.grupo !== "inicio-carreira");
  const inicioCarreira = servicos.filter((servico) => servico.grupo === "inicio-carreira");

  return (
    <section
      aria-label="Filtros"
      className="flex flex-col gap-4 rounded-[16px] border border-[#d9d9d9] bg-white p-4 shadow-[0px_2px_6px_rgba(0,0,0,0.06)] md:p-5"
    >
      <div key={JSON.stringify(filtros)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Seletor titulo="Formação" valor={filtros.formacao} aoMudar={(valor) => atualizar({ formacao: valor, servico: "" })}>
          <option value="">Todas as formações</option>
          {(Object.keys(NOMES_FORMACAO) as Formacao[]).map((chave) => (
            <option key={chave} value={chave}>
              {NOMES_FORMACAO[chave]}
            </option>
          ))}
        </Seletor>

        <Seletor
          titulo="Tipo de mentoria"
          valor={filtros.servico ? String(filtros.servico) : ""}
          desativado={!formacao}
          aoMudar={(valor) => atualizar({ servico: valor })}
        >
          <option value="">{formacao ? "Todos os tipos" : "Escolha a formação primeiro"}</option>
          {formacao && (
            <>
              <optgroup label={NOMES_FORMACAO[formacao]}>
                {daFormacao.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Início de Carreira">
                {inicioCarreira.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome}
                  </option>
                ))}
              </optgroup>
            </>
          )}
        </Seletor>

        <Seletor titulo="Acessibilidade" valor={filtros.libras ? "sim" : ""} aoMudar={(valor) => atualizar({ libras: valor })}>
          <option value="">Todos os mentores</option>
          <option value="sim">Atende em Libras</option>
        </Seletor>

        <Seletor titulo="Turno" valor={filtros.turno} aoMudar={(valor) => atualizar({ turno: valor })}>
          <option value="">Qualquer turno</option>
          {TURNOS.map((turno) => (
            <option key={turno.id} value={turno.id}>
              {NOMES_TURNO[turno.id]} ({turno.faixa})
            </option>
          ))}
        </Seletor>

        <SeletorData valor={filtros.data} hoje={hoje} classeCampo={campo} aoMudar={(valor) => atualizar({ data: valor })} />
      </div>

      {(temFiltro(filtros) || atualizando) && (
        <div className="flex items-center justify-between gap-3 border-t border-[#e5e5e5] pt-3">
          <p className="flex items-center gap-2 text-xs text-[#595959]" aria-live="polite">
            {atualizando && <LoaderCircle className="size-3.5 animate-spin" aria-hidden />}
            {atualizando ? "Atualizando mentores..." : "Filtros aplicados"}
          </p>
          {temFiltro(filtros) && (
            <button
              type="button"
              onClick={() => atualizar({ formacao: "", servico: "", libras: "", turno: "", data: "" })}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-[#0f1b3d] transition hover:bg-[#f1f3f7]"
            >
              <X className="size-3.5" aria-hidden />
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </section>
  );
}

type SeletorProps = {
  titulo: string;
  valor: string;
  desativado?: boolean;
  aoMudar: (valor: string) => void;
  children: React.ReactNode;
};

function Seletor({ titulo, valor, desativado, aoMudar, children }: SeletorProps) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-[#595959]">
      {titulo}
      <span className="relative">
        <select
          defaultValue={valor}
          disabled={desativado}
          onChange={(evento) => aoMudar(evento.target.value)}
          className={`${campo} appearance-none truncate pr-9`}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#8a8a8a]"
          aria-hidden
        />
      </span>
    </label>
  );
}
