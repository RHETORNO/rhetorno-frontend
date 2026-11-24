"use client";

import { useState } from "react";
import { CalendarCheck, Check, ChevronDown, Clock, Copy, ExternalLink, Link2 } from "lucide-react";
import { salvarAgendamento, useAgendamentos } from "../_lib/agendamentosLocais";
import type { Horario } from "../_lib/horarios";
import {
  TURNOS,
  chaveDia,
  dentroDoPeriodo,
  gerarLinkMentoria,
  horariosDoDia,
  inicioDoDia,
  mesesAgendaveis,
  somarMinutos,
} from "../_lib/horarios";
import type { Mentor, Servico, Turno } from "../_lib/tipos";
import { NOMES_TURNO } from "../_lib/tipos";
import { formatarDuracao, formatarPreco } from "../_lib/utils";
import CalendarioMes from "./CalendarioMes";

const NOMES_DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

type Situacao = "livre" | "reservado" | "seu" | "conflito";

function emMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

type Props = { mentor: Mentor; servicos: Servico[] };

export default function AgendarMentoria({ mentor, servicos }: Props) {
  const [agora] = useState(() => new Date());
  const hoje = inicioDoDia(agora);
  const meses = mesesAgendaveis(hoje);

  const agendamentos = useAgendamentos();

  const [mes, setMes] = useState(meses[0]);
  const [servicoId, setServicoId] = useState("");
  const [dia, setDia] = useState<Date | null>(null);
  const [turno, setTurno] = useState<Turno | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [linkVisivel, setLinkVisivel] = useState(false);
  const [copiado, setCopiado] = useState(false);

  function situacao(data: Date, horario: Horario): Situacao {
    if (horario.ocupado) return "reservado";

    const chave = chaveDia(data);
    const inicio = emMinutos(horario.hora);
    const fim = inicio + mentor.duracaoMinutos;

    for (const item of agendamentos) {
      if (item.dia !== chave) continue;
      if (item.mentorId === mentor.id && item.hora === horario.hora) return "seu";
      if (inicio < emMinutos(item.fim) && fim > emMinutos(item.hora)) return "conflito";
    }
    return "livre";
  }

  function temVaga(data: Date) {
    if (!dentroDoPeriodo(data, hoje)) return false;
    return horariosDoDia(mentor, data, agora).some((item) => situacao(data, item) === "livre");
  }

  const horariosDia = dia ? horariosDoDia(mentor, dia, agora) : [];
  const turnosDoMentor = TURNOS.filter((item) => mentor.agenda.turnos.includes(item.id));
  const horariosTurno = horariosDia.filter((item) => item.turno === turno);

  function escolherDia(data: Date) {
    setDia(data);
    setHora(null);
    const livre = horariosDoDia(mentor, data, agora).find((item) => situacao(data, item) === "livre");
    setTurno(livre ? livre.turno : null);
  }

  const servicoEscolhido = servicos.find((item) => String(item.id) === servicoId);
  const podeConfirmar = Boolean(servicoEscolhido && dia && hora);

  const dataPorExtenso = dia?.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const fim = hora ? somarMinutos(hora, mentor.duracaoMinutos) : "";
  const link = dia && hora ? gerarLinkMentoria(mentor, dia, hora) : "";

  function confirmar() {
    if (!dia || !hora || !servicoEscolhido) return;
    salvarAgendamento({
      mentorId: mentor.id,
      mentorNome: mentor.nome,
      fotoUrl: mentor.fotoUrl,
      servicoNome: servicoEscolhido.nome,
      dia: chaveDia(dia),
      hora,
      fim,
      link,
    });
    setConfirmado(true);
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sem permissão para copiar
    }
  }

  function agendarOutro() {
    setConfirmado(false);
    setLinkVisivel(false);
    setDia(null);
    setTurno(null);
    setHora(null);
  }

  if (confirmado && dia && hora && servicoEscolhido) {
    return (
      <section
        aria-live="polite"
        className="flex flex-col gap-5 rounded-[16px] border border-[#d9d9d9] bg-white p-6 shadow-[0px_2px_6px_rgba(0,0,0,0.06)]"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-[#e8edf8] text-[#0f1b3d]">
            <CalendarCheck className="size-7" aria-hidden />
          </span>
          <h2 className="text-xl font-semibold text-[#2d2d2d]">Mentoria agendada</h2>
          <p className="text-sm text-[#595959]">Sua sessão com {mentor.nome.split(" ")[0]} está confirmada.</p>
        </div>

        <dl className="flex flex-col gap-3 rounded-[12px] bg-[#f1f3f7] p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[#595959]">Dia</dt>
            <dd className="text-right font-semibold text-[#2d2d2d] first-letter:uppercase">{dataPorExtenso}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#595959]">Horário</dt>
            <dd className="font-semibold text-[#2d2d2d]">
              {hora} às {fim}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#595959]">Mentoria</dt>
            <dd className="text-right font-semibold text-[#2d2d2d]">{servicoEscolhido.nome}</dd>
          </div>
        </dl>

        {linkVisivel ? (
          <div className="flex flex-col gap-2 rounded-[12px] border border-[#d9d9d9] p-4">
            <p className="text-sm font-semibold text-[#0f1b3d]">Seu link de mentoria</p>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm break-all text-[#0f1b3d] underline underline-offset-2"
            >
              {link}
              <span className="sr-only">(abre em outra aba)</span>
            </a>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={copiarLink}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#0f1b3d] px-3 text-sm font-semibold text-white transition hover:bg-[#0f1b3d]/90"
              >
                {copiado ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copiado ? "Copiado!" : "Copiar link"}
              </button>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#0f1b3d] bg-white px-3 text-sm font-semibold text-[#0f1b3d] transition hover:bg-gray-200/90"
              >
                <ExternalLink className="size-4" aria-hidden />
                Abrir
              </a>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLinkVisivel(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#0f1b3d] px-4 text-sm font-semibold text-white transition duration-200 hover:bg-[#1c2d5c] hover:shadow-[0_4px_12px_-2px_rgba(15,27,61,0.25)] active:scale-95"
          >
            <Link2 className="size-4" aria-hidden />
            Obtenha seu link de mentoria agora
          </button>
        )}

        <button
          type="button"
          onClick={agendarOutro}
          className="text-sm font-medium text-[#595959] underline-offset-2 hover:text-[#0f1b3d] hover:underline"
        >
          Agendar outro horário
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5 rounded-[16px] border border-[#d9d9d9] bg-white p-5 shadow-[0px_2px_6px_rgba(0,0,0,0.06)] md:p-6">
      <header className="flex items-end justify-between gap-3 border-b border-[#e5e5e5] pb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#2d2d2d]">Agendar mentoria</h2>
          <p className="flex items-center gap-1.5 text-sm text-[#595959]">
            <Clock className="size-3.5" aria-hidden />
            {formatarDuracao(mentor.duracaoMinutos)} por sessão
          </p>
        </div>
        <p className="text-right">
          <span className="block text-xl font-bold text-[#2d2d2d]">{formatarPreco(mentor.valorSessao)}</span>
          <span className="text-xs text-[#8a8a8a]">por sessão</span>
        </p>
      </header>

      <label className="flex flex-col gap-1.5">
        <Passo numero={1} titulo="Tipo de mentoria" />
        <span className="relative">
          <select
            value={servicoId}
            onChange={(evento) => setServicoId(evento.target.value)}
            className="h-11 w-full appearance-none truncate rounded-[10px] border border-[#d9d9d9] bg-white pr-9 pl-3 text-sm text-[#2d2d2d] outline-none transition focus:border-[#0f1b3d] focus:ring-2 focus:ring-[#0f1b3d]/15"
          >
            <option value="">Escolha o que você quer trabalhar</option>
            {servicos.map((servico) => (
              <option key={servico.id} value={servico.id}>
                {servico.nome}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#8a8a8a]"
            aria-hidden
          />
        </span>
      </label>

      <div className="flex flex-col gap-2">
        <Passo numero={2} titulo="Dia" />
        <p className="text-xs text-[#8a8a8a]">
          Atende {mentor.agenda.diasSemana.map((numero) => NOMES_DIAS[numero]).join(", ")}
        </p>
        <div className="rounded-[12px] border border-[#e5e5e5] p-3">
          <CalendarioMes
            meses={meses}
            mes={mes}
            aoTrocarMes={setMes}
            hoje={hoje}
            selecionado={dia}
            disponivel={temVaga}
            aoEscolher={escolherDia}
          />
        </div>
      </div>

      {dia && (
        <div className="flex flex-col gap-2">
          <Passo numero={3} titulo="Turno e horário" />

          <div className="flex gap-1 rounded-xl bg-[#f1f3f7] p-1" role="group" aria-label="Turno">
            {turnosDoMentor.map((item) => {
              const temLivre = horariosDia.some((h) => h.turno === item.id && situacao(dia, h) === "livre");
              const ativo = turno === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!temLivre}
                  onClick={() => {
                    setTurno(item.id);
                    setHora(null);
                  }}
                  aria-pressed={ativo}
                  className={`flex flex-1 flex-col items-center rounded-lg px-2 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    ativo ? "bg-white font-semibold text-[#0f1b3d] shadow-sm" : "text-[#595959] hover:text-[#2d2d2d]"
                  }`}
                >
                  {NOMES_TURNO[item.id]}
                  <span className="text-[11px] font-normal text-[#8a8a8a]">{item.faixa}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {horariosTurno.map((item) => {
              const estado = situacao(dia, item);
              const escolhido = hora === item.hora;
              return (
                <button
                  key={item.hora}
                  type="button"
                  disabled={estado !== "livre"}
                  onClick={() => setHora(item.hora)}
                  aria-pressed={escolhido}
                  className={`flex flex-col items-center rounded-[10px] border px-3 py-2 text-sm tabular-nums transition ${
                    escolhido
                      ? "border-[#0f1b3d] bg-[#0f1b3d] font-semibold text-white"
                      : estado === "livre"
                        ? "border-[#d9d9d9] text-[#2d2d2d] hover:border-[#0f1b3d]"
                        : estado === "seu"
                          ? "cursor-not-allowed border-[#c3d1ef] bg-[#e8edf8] text-[#0f1b3d]"
                          : "cursor-not-allowed border-[#eeeeee] text-[#c9cfd9]"
                  }`}
                >
                  <span className={estado === "reservado" ? "line-through" : ""}>{item.hora}</span>
                  {estado !== "livre" && (
                    <span className="text-[10px] font-medium">
                      {estado === "seu" ? "Agendado por você" : estado === "conflito" ? "Você tem outra mentoria" : "Reservado"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-[#e5e5e5] pt-4">
        {dia && hora && (
          <p className="text-sm text-[#595959]">
            <span className="font-semibold text-[#2d2d2d] first-letter:uppercase">{dataPorExtenso}</span>, das {hora} às{" "}
            {fim}
          </p>
        )}
        <button
          type="button"
          disabled={!podeConfirmar}
          onClick={confirmar}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#0f1b3d] px-4 text-sm font-semibold text-white transition duration-200 hover:bg-[#1c2d5c] hover:shadow-[0_4px_12px_-2px_rgba(15,27,61,0.25)] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#e5e5e5] disabled:text-[#8a8a8a] disabled:hover:shadow-none disabled:hover:bg-[#e5e5e5] disabled:active:scale-100"
        >
          <CalendarCheck className="size-4" aria-hidden />
          Confirmar agendamento
        </button>
        {!podeConfirmar && (
          <p className="text-center text-xs text-[#8a8a8a]">
            {!servicoEscolhido ? "Escolha o tipo de mentoria" : !dia ? "Escolha um dia" : "Escolha um horário"} para continuar
          </p>
        )}
      </div>
    </section>
  );
}

function Passo({ numero, titulo }: { numero: number; titulo: string }) {
  return (
    <span className="flex items-center gap-2 text-sm font-semibold text-[#2d2d2d]">
      <span className="flex size-5 items-center justify-center rounded-full bg-[#0f1b3d] text-[11px] text-white">
        {numero}
      </span>
      {titulo}
    </span>
  );
}
