import { createClient } from "@/lib/supabase/server";
import type { Habilidade } from "./tipos";
import { LIMITE_TRILHA_RAPIDA_H } from "./utils";

// A trilha responde: "para as lacunas desta pessoa, quais cursos servem?"
// PONTO DE ENCAIXE DA IA: hoje a resposta vem de uma regra simples
// (tabela desenvolve: curso -> habilidade). Quando a IA chegar, ela pode
// devolver este mesmo objeto, e as telas continuam funcionando sem mudança.
export type Trilha = {
  // Cursos que desenvolvem pelo menos uma lacuna (a aba Recomendados).
  idsCursos: string[];
  // O curso mais curto de cada lacuna (selo ⚡ Mais rápido).
  idsMaisRapidos: Set<string>;
  // Lacunas cujo curso MAIS CURTO passa de 160h (aviso "construir com calma").
  trilhaLonga: string[];
  // Lacunas sem nenhum curso gratuito com certificado.
  semCurso: string[];
};

type Ligacao = {
  idhabilidade: number;
  curso: { id: string; carga_horaria_h: number | null };
};

// Importante: aqui NÃO entram a busca nem os filtros da tela.
// Assim, o selo e os avisos olham todos os cursos de cada lacuna,
// e não só os que sobraram depois de a pessoa filtrar.

export async function montarTrilha(habilidades: Habilidade[]): Promise<Trilha> {
  if (habilidades.length === 0) {
    return { idsCursos: [], idsMaisRapidos: new Set(), trilhaLonga: [], semCurso: [] };
  }

  const supabase = await createClient();

  // Regra do produto: só cursos gratuitos e com certificado.
  const { data, error } = await supabase
    .from("desenvolve")
    .select("idhabilidade, curso!inner(id, carga_horaria_h)")
    .in(
      "idhabilidade",
      habilidades.map((habilidade) => habilidade.id),
    )
    .eq("curso.gratuito", true)
    .eq("curso.emite_certificado", true);

  if (error) throw new Error(error.message);

  const ligacoes = (data ?? []) as unknown as Ligacao[];

  const idsCursos = new Set<string>();
  const habilidadesComCurso = new Set<number>();
  // Para cada habilidade: o curso mais curto e as horas dele.
  const maisCurto = new Map<number, { id: string; carga: number }>();

  for (const { idhabilidade, curso } of ligacoes) {
    idsCursos.add(curso.id);
    habilidadesComCurso.add(idhabilidade);

    // Curso sem carga horária no banco não disputa o selo.
    if (curso.carga_horaria_h === null) continue;

    const atual = maisCurto.get(idhabilidade);
    if (!atual || curso.carga_horaria_h < atual.carga) {
      maisCurto.set(idhabilidade, { id: curso.id, carga: curso.carga_horaria_h });
    }
  }

  return {
    idsCursos: [...idsCursos],
    idsMaisRapidos: new Set([...maisCurto.values()].map((item) => item.id)),
    trilhaLonga: habilidades
      .filter((habilidade) => {
        const curso = maisCurto.get(habilidade.id);
        return curso !== undefined && curso.carga > LIMITE_TRILHA_RAPIDA_H;
      })
      .map((habilidade) => habilidade.nome),
    semCurso: habilidades
      .filter((habilidade) => !habilidadesComCurso.has(habilidade.id))
      .map((habilidade) => habilidade.nome),
  };
}
