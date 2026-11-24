import { atendeNoDia, dentroDoPeriodo, lerData } from "./horarios";
import { SERVICOS } from "./servicos";
import type { Formacao, Mentor, Turno } from "./tipos";
import { NOMES_FORMACAO, NOMES_TURNO } from "./tipos";

export type Filtros = {
  formacao: Formacao | "";
  servico: number | null;
  libras: boolean;
  turno: Turno | "";
  data: string;
};

type ParametrosUrl = Record<string, string | string[] | undefined>;

function texto(valor: string | string[] | undefined) {
  return typeof valor === "string" ? valor : "";
}

export function servicosDaFormacao(formacao: Formacao) {
  return SERVICOS.filter((servico) => servico.grupo === formacao || servico.grupo === "inicio-carreira");
}

// Lê a URL e só aceita valores que existem.
export function lerFiltros(parametros: ParametrosUrl, hoje: Date): Filtros {
  const formacao = texto(parametros.formacao);
  const turno = texto(parametros.turno);
  const data = texto(parametros.data);
  const servico = Number(texto(parametros.servico));
  const dia = lerData(data);

  const formacaoValida = Object.hasOwn(NOMES_FORMACAO, formacao) ? (formacao as Formacao) : "";

  const servicoValido =
    formacaoValida && servicosDaFormacao(formacaoValida).some((item) => item.id === servico)
      ? servico
      : null;

  return {
    formacao: formacaoValida,
    servico: servicoValido,
    libras: texto(parametros.libras) === "sim",
    turno: Object.hasOwn(NOMES_TURNO, turno) ? (turno as Turno) : "",
    data: dia && dentroDoPeriodo(dia, hoje) ? data : "",
  };
}

export function temFiltro(filtros: Filtros) {
  return Boolean(filtros.formacao || filtros.servico || filtros.libras || filtros.turno || filtros.data);
}

export function filtrarMentores(mentores: Mentor[], filtros: Filtros) {
  const dia = lerData(filtros.data);

  return mentores.filter((mentor) => {
    if (filtros.formacao && mentor.formacaoPrincipal !== filtros.formacao) return false;
    if (filtros.servico && !mentor.servicos.includes(filtros.servico)) return false;
    if (filtros.libras && !mentor.atendeLibras) return false;
    if (filtros.turno && !mentor.agenda.turnos.includes(filtros.turno)) return false;
    if (dia && !atendeNoDia(mentor, dia)) return false;
    return true;
  });
}

