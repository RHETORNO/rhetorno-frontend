import { createClient } from "@/lib/supabase/server";
import { analiseSimuladaLigada, buscarLacunasSimuladas } from "./analiseSimulada";
import type { Habilidade } from "./tipos";

// DE ONDE VÊM AS LACUNAS (contrato com a IA da análise de currículo):
// a IA grava a análise em analise_curriculo e as habilidades que faltam em
// aponta_falta. Esta página só LÊ: pega a análise "concluida" mais recente.
// Depois, montarTrilha.ts escolhe os cursos para essas lacunas.
export type Lacunas = {
  temAnalise: boolean;
  cargoAlvo: string | null;
  habilidades: Habilidade[];
  // true = veio do modo de teste (analiseSimulada.ts), não de uma análise real.
  simulada: boolean;
};

type AnaliseComFaltas = {
  cargo_alvo: string | null;
  aponta_falta: { habilidade: Habilidade | null }[];
};

export async function buscarLacunas(): Promise<Lacunas> {
  // Modo de teste ligado no .env? Usa a análise simulada (só em desenvolvimento).
  if (analiseSimuladaLigada()) return buscarLacunasSimuladas();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analise_curriculo")
    .select("cargo_alvo, aponta_falta(habilidade(id, nome))")
    .eq("status", "concluida")
    .order("criada_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Se o banco falhar, mostramos a tela de erro (error.tsx).
  // Antes, o erro virava "você não tem análise", o que enganava a pessoa.
  if (error) throw new Error(error.message);

  const analise = data as unknown as AnaliseComFaltas | null;

  if (!analise) {
    return { temAnalise: false, cargoAlvo: null, habilidades: [], simulada: false };
  }

  const habilidades = analise.aponta_falta
    .map((item) => item.habilidade)
    .filter((habilidade): habilidade is Habilidade => habilidade !== null);

  return { temAnalise: true, cargoAlvo: analise.cargo_alvo, habilidades, simulada: false };
}
