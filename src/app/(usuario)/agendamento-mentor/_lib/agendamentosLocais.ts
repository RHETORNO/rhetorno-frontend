"use client";

import { useSyncExternalStore } from "react";

// Provisório: os agendamentos ficam no navegador até ligarmos no Supabase.
export type AgendamentoLocal = {
  id: string;
  mentorId: string;
  mentorNome: string;
  fotoUrl: string;
  servicoNome: string;
  dia: string;
  hora: string;
  fim: string;
  link: string;
};

const CHAVE = "rhetorno:agendamentos-mentoria";
const NENHUM: AgendamentoLocal[] = [];
const ouvintes = new Set<() => void>();

let ultimoTexto: string | null = null;
let ultimaLista: AgendamentoLocal[] = NENHUM;

function ler(): AgendamentoLocal[] {
  let texto: string | null = null;
  try {
    texto = window.localStorage.getItem(CHAVE);
  } catch {
    return NENHUM;
  }

  if (texto === ultimoTexto) return ultimaLista;

  ultimoTexto = texto;
  try {
    const lista: unknown = texto ? JSON.parse(texto) : [];
    ultimaLista = Array.isArray(lista) ? (lista as AgendamentoLocal[]) : NENHUM;
  } catch {
    ultimaLista = NENHUM;
  }
  return ultimaLista;
}

function gravar(lista: AgendamentoLocal[]) {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    // sem espaço ou bloqueado
  }
  ouvintes.forEach((avisar) => avisar());
}

function ouvir(avisar: () => void) {
  ouvintes.add(avisar);
  const outraAba = (evento: StorageEvent) => {
    if (evento.key === CHAVE) avisar();
  };
  window.addEventListener("storage", outraAba);
  return () => {
    ouvintes.delete(avisar);
    window.removeEventListener("storage", outraAba);
  };
}

export function salvarAgendamento(novo: Omit<AgendamentoLocal, "id">) {
  const agendamento = { ...novo, id: `${novo.mentorId}-${novo.dia}-${novo.hora}` };
  gravar([...ler().filter((item) => item.id !== agendamento.id), agendamento]);
}

export function cancelarAgendamento(id: string) {
  gravar(ler().filter((item) => item.id !== id));
}

export function useAgendamentos() {
  return useSyncExternalStore(ouvir, ler, () => NENHUM);
}
