import { createClient } from "@/lib/supabase/server";
import type { Lacunas } from "./buscarLacunas";
import type { Habilidade } from "./tipos";

// ─────────────────────────────────────────────────────────────────────────────
// MODO DE TESTE — análise de currículo SIMULADA
//
// Enquanto a IA da análise não funciona, as análises ficam paradas em
// "processando" e a aba Recomendados não tem o que mostrar.
// Este modo finge uma análise concluída para podermos testar a trilha.
//
// Como ligar: no arquivo .env, adicione a linha
//   CURSOS_ANALISE_SIMULADA=true
// e reinicie o `npm run dev`.
//
// Segurança:
// - Só funciona em desenvolvimento (npm run dev). No site publicado é ignorado.
// - Não grava nada no banco: só LÊ a tabela habilidade.
//
// Quando a IA da análise funcionar: apague este arquivo e a linha do .env.
// ─────────────────────────────────────────────────────────────────────────────

const CARGO_SIMULADO = "Desenvolvedor Front-end";

// Precisam ter o mesmo nome das habilidades cadastradas na tabela habilidade.
const HABILIDADES_SIMULADAS = ["Next.js", "Testes automatizados", "Acessibilidade web"];

export function analiseSimuladaLigada(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.CURSOS_ANALISE_SIMULADA === "true"
  );
}

export async function buscarLacunasSimuladas(): Promise<Lacunas> {
  const supabase = await createClient();

  // Pegamos os ids reais das habilidades, para a trilha funcionar igual à de verdade.
  const { data, error } = await supabase
    .from("habilidade")
    .select("id, nome")
    .in("nome", HABILIDADES_SIMULADAS);

  if (error) throw new Error(error.message);

  const habilidades: Habilidade[] = data ?? [];

  return {
    temAnalise: true,
    cargoAlvo: CARGO_SIMULADO,
    habilidades,
    simulada: true,
  };
}
