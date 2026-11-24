import type { Mentor, Turno } from "./tipos";

export const TURNOS: { id: Turno; faixa: string; horarios: string[] }[] = [
  { id: "manha", faixa: "6h às 12h", horarios: ["08:00", "10:00"] },
  { id: "tarde", faixa: "12h às 18h", horarios: ["13:00", "15:00"] },
  { id: "noite", faixa: "18h às 22h", horarios: ["18:30", "20:30"] },
];

export type Horario = {
  hora: string;
  turno: Turno;
  ocupado: boolean;
};

export function chaveDia(dia: Date) {
  const mes = String(dia.getMonth() + 1).padStart(2, "0");
  const numero = String(dia.getDate()).padStart(2, "0");
  return `${dia.getFullYear()}-${mes}-${numero}`;
}

export function lerData(texto: string) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!partes) return null;

  const dia = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  return chaveDia(dia) === texto ? dia : null;
}

export function mesmoDia(a: Date, b: Date) {
  return chaveDia(a) === chaveDia(b);
}

export const MESES_DISPONIVEIS = 3;

export function inicioDoDia(data: Date) {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

export function mesesAgendaveis(hoje: Date) {
  return Array.from(
    { length: MESES_DISPONIVEIS },
    (_, i) => new Date(hoje.getFullYear(), hoje.getMonth() + i, 1),
  );
}

export function dentroDoPeriodo(dia: Date, hoje: Date) {
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + MESES_DISPONIVEIS, 0);
  return dia >= inicioDoDia(hoje) && dia <= ultimoDia;
}

export function atendeNoDia(mentor: Mentor, dia: Date) {
  return mentor.agenda.diasSemana.includes(dia.getDay());
}

export function horariosDoDia(mentor: Mentor, dia: Date, agora: Date): Horario[] {
  if (!atendeNoDia(mentor, dia)) return [];

  const horarios: Horario[] = [];

  for (const turno of TURNOS) {
    if (!mentor.agenda.turnos.includes(turno.id)) continue;

    turno.horarios.forEach((hora, posicao) => {
      const [h, m] = hora.split(":").map(Number);
      const inicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), h, m);
      if (inicio <= agora) return;

      // Dados de mentira: alguns horários aparecem como já reservados.
      const ocupado = (dia.getDate() + posicao * 3 + Number(mentor.id)) % 4 === 0;

      horarios.push({ hora, turno: turno.id, ocupado });
    });
  }

  return horarios;
}

export function somarMinutos(hora: string, minutos: number) {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function gerarLinkMentoria(mentor: Mentor, dia: Date, hora: string) {
  return `https://meet.jit.si/rhetorno-mentoria-${mentor.id}-${chaveDia(dia)}-${hora.replace(":", "")}`;
}
