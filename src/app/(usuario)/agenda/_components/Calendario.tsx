"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DIAS_DA_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function mesmoDia(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default function Calendario() {
  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );
  const [diaSelecionado, setDiaSelecionado] = useState(hoje); //Bem legal faz começar hoje, já abre com a data que a pessoa se encontra.
  const [direcao, setDirecao] = useState<"anterior" | "proximo">("proximo");

  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();

  const espacosVazios = new Date(ano, mes, 1).getDay();
  const totalDeDias = new Date(ano, mes + 1, 0).getDate();

  const dias = Array.from(
    { length: totalDeDias },
    (_, i) => new Date(ano, mes, i + 1)
  );

  const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
  const diasMesAnterior = Array.from(
    { length: espacosVazios },
    (_, i) => ultimoDiaMesAnterior - espacosVazios + 1 + i
  );

  const sobraNaUltimaLinha = (espacosVazios + totalDeDias) % 7;
  const diasProximoMes = Array.from(
    { length: sobraNaUltimaLinha === 0 ? 0 : 7 - sobraNaUltimaLinha },
    (_, i) => i + 1
  );

  const nomeDoMes = mesAtual.toLocaleDateString("pt-BR", { month: "long" });

  const dataPorExtenso = diaSelecionado.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const hojeEstaSelecionado = mesmoDia(diaSelecionado, hoje);
  const hojeEstaNaTela =
    ano === hoje.getFullYear() && mes === hoje.getMonth();// aqui que (voltar) o botão para hoje aparece, e bem legal.

  function mudarMes(passo: number) {
    setDirecao(passo < 0 ? "anterior" : "proximo");
    setMesAtual(new Date(ano, mes + passo, 1));
  }

  function voltarParaHoje() {
    const inicioDoMesDeHoje = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    setDirecao(inicioDoMesDeHoje < mesAtual ? "anterior" : "proximo");
    setMesAtual(inicioDoMesDeHoje);
    setDiaSelecionado(hoje);
  }

  const animacaoDoMes =
    direcao === "proximo" ? "slide-in-from-right-4" : "slide-in-from-left-4";

  return (
    <section className="w-full max-w-[95%] overflow-hidden rounded-[20px] border border-[#e6eaf2] bg-white shadow-[0_18px_40px_-24px_rgba(11,20,55,0.35)]">
      <header className="flex items-center justify-between bg-[#0b1437] px-8 pt-7 pb-6">
        <h2 className="flex items-baseline gap-2 text-white" aria-live="polite">
          <span className="text-[32px] font-semibold tracking-tight first-letter:uppercase">
            {nomeDoMes}
          </span>
          <span className="text-[32px] font-light text-white/45">{ano}</span>
        </h2>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => mudarMes(-1)}
            aria-label="Mês anterior"
            className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronLeft size={26} />
          </button>
          <button
            type="button"
            onClick={() => mudarMes(1)}
            aria-label="Próximo mês"
            className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ChevronRight size={26} />
          </button>
        </div>
      </header>

      <div className="px-6 pt-5 pb-3">
        <div className="grid grid-cols-7 pb-2 text-center">
          {DIAS_DA_SEMANA.map((nome, i) => (
            <span
              key={nome}
              className={`text-[16px] font-medium ${
                i === 0 || i === 6 ? "text-[#9aa3b2]" : "text-[#595959]"
              }`}
            >
              {nome}
            </span>
          ))}
        </div>

        <div
          key={`${ano}-${mes}`}
          className={`grid grid-cols-7 gap-1 text-center animate-in fade-in-0 duration-300 motion-reduce:animate-none ${animacaoDoMes}`}
        >
          {diasMesAnterior.map((numero) => (
            <span
              key={`anterior-${numero}`}
              aria-hidden="true"
              className="flex aspect-square items-center justify-center text-[18px] text-[#c9cfd9] tabular-nums"
            >
              {numero}
            </span>
          ))}

          {dias.map((dia) => {
            const ehSelecionado = mesmoDia(dia, diaSelecionado);

            return (
              <button
                key={dia.getDate()}
                type="button"
                onClick={() => setDiaSelecionado(dia)}
                aria-pressed={ehSelecionado}
                aria-label={dia.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                className={`aspect-square rounded-[14px] text-[18px] tabular-nums transition duration-150 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0b1437] ${
                  ehSelecionado
                    ? "bg-[#c3d1ef] font-semibold text-[#0b1437] ring-1 ring-[#0b1437]/30"
                    : "text-[#2d2d2d] hover:bg-[#e8edf8] hover:text-[#0b1437af]"
                }`}
              >
                {dia.getDate()}
              </button>
            );
          })}

          {diasProximoMes.map((numero) => (
            <span
              key={`proximo-${numero}`}
              aria-hidden="true"
              className="flex aspect-square items-center justify-center text-[18px] text-[#c9cfd9] tabular-nums"
            >
              {numero}
            </span>
          ))}
        </div>
      </div>

      <footer className="mx-6 flex min-h-[68px] items-center justify-between gap-3 border-t border-[#eef1f6] py-3">
        <p className="pl-2 text-[16px] font-medium text-[#0b1437] first-letter:uppercase">
          {dataPorExtenso}
        </p>

        {!(hojeEstaSelecionado && hojeEstaNaTela) && (
          <button
            type="button"
            onClick={voltarParaHoje}
            className="rounded-full border border-[#c3d1ef] px-4 py-2 text-[14px] font-medium text-[#0b1437] transition hover:bg-[#e8edf8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b1437]"
          >
            Voltar para hoje
          </button>
        )}
      </footer>
    </section>
  );
}
