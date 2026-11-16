import { createClient } from "@/lib/supabase/server";
import type { Lacunas } from "./buscarLacunas";
import type { Trilha } from "./montarTrilha";
import type { Curso, CursoComDados, Filtros, StatusInscricao } from "./tipos";
import { TAMANHO_PAGINA } from "./utils";

const COLUNAS =
  "id, titulo, descricao, carga_horaria_h, modalidade, cidade, uf, turno, gratuito, emite_certificado, link_externo_curso, instituicao_nome, site_instituicao_url, licoes, beneficios, desenvolve(habilidade(id, nome))";

// O que já sabemos sobre a pessoa antes de buscar os cursos.
export type Contexto = {
  idPerfil: string;
  lacunas: Lacunas;
  trilha: Trilha;
};

export type ResultadoCursos = {
  cursos: CursoComDados[];
  // Ainda há cursos para mostrar? (botão "Carregar mais", só na aba Todos)
  temMais: boolean;
};

const NENHUM_CURSO: ResultadoCursos = { cursos: [], temMais: false };

// Junta em cada curso: o status da pessoa, as lacunas que ele cobre e o selo ⚡.
async function completarCursos(
  cursos: Curso[],
  contexto: Contexto,
): Promise<CursoComDados[]> {
  if (cursos.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inscricao_curso")
    .select("idcurso, status")
    .eq("idperfil", contexto.idPerfil)
    .in(
      "idcurso",
      cursos.map((curso) => curso.id),
    );

  if (error) throw new Error(error.message);

  const statusPorCurso = new Map<string, StatusInscricao>();
  for (const item of data ?? []) {
    statusPorCurso.set(item.idcurso, item.status);
  }

  const idsLacunas = new Set(contexto.lacunas.habilidades.map((habilidade) => habilidade.id));

  return cursos.map((curso) => {
    const faltantes: string[] = [];
    for (const item of curso.desenvolve) {
      if (item.habilidade && idsLacunas.has(item.habilidade.id)) {
        faltantes.push(item.habilidade.nome);
      }
    }

    return {
      ...curso,
      status: statusPorCurso.get(curso.id) ?? null,
      faltantes,
      maisRapido: contexto.trilha.idsMaisRapidos.has(curso.id),
    };
  });
}

// Quem fecha mais lacunas vem primeiro; empatou, vem o de menos horas.
// Curso sem carga horária no banco vai para o final.
function compararPeloMaisRapido(a: CursoComDados, b: CursoComDados) {
  if (a.faltantes.length !== b.faltantes.length) {
    return b.faltantes.length - a.faltantes.length;
  }

  const cargaA = a.carga_horaria_h ?? Number.MAX_SAFE_INTEGER;
  const cargaB = b.carga_horaria_h ?? Number.MAX_SAFE_INTEGER;
  return cargaA - cargaB;
}

// Cursos que a pessoa salvou ou em que se inscreveu (a aba Meus cursos).
async function idsDosMeusCursos(idPerfil: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inscricao_curso")
    .select("idcurso")
    .eq("idperfil", idPerfil)
    .neq("status", "cancelado");

  if (error) throw new Error(error.message);

  return (data ?? []).map((item) => item.idcurso);
}

// Cursos que desenvolvem a habilidade escolhida (ex.: vindo da análise com ?habilidade=Next.js).
async function idsDaHabilidade(nome: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("desenvolve")
    .select("idcurso, habilidade!inner(nome)")
    .ilike("habilidade.nome", nome);

  if (error) throw new Error(error.message);

  return (data ?? []).map((ligacao) => ligacao.idcurso);
}

export async function buscarCursos(
  filtros: Filtros,
  contexto: Contexto,
): Promise<ResultadoCursos> {
  const supabase = await createClient();

  // Regra do produto: o candidato só vê cursos gratuitos e com certificado.
  let consulta = supabase
    .from("curso")
    .select(COLUNAS)
    .eq("gratuito", true)
    .eq("emite_certificado", true);

  // 1º) Escolhe os cursos da aba ANTES de qualquer limite.
  //     (Antes, pegávamos 60 cursos quaisquer e só depois separávamos,
  //     então um curso recomendado podia ficar de fora.)
  if (filtros.aba === "recomendados") {
    if (contexto.trilha.idsCursos.length === 0) return NENHUM_CURSO;
    consulta = consulta.in("id", contexto.trilha.idsCursos);
  }

  if (filtros.aba === "meus") {
    const ids = await idsDosMeusCursos(contexto.idPerfil);
    if (ids.length === 0) return NENHUM_CURSO;
    consulta = consulta.in("id", ids);
  }

  // 2º) Busca e filtros da tela.
  if (filtros.q) {
    // Vírgula e parênteses quebram o filtro "or" do Supabase, então tiramos.
    const termo = filtros.q.replace(/[,()]/g, " ");
    consulta = consulta.or(`titulo.ilike.%${termo}%,instituicao_nome.ilike.%${termo}%`);
  }
  if (filtros.local) consulta = consulta.ilike("cidade", `%${filtros.local}%`);
  if (filtros.modalidade) consulta = consulta.eq("modalidade", filtros.modalidade);
  if (filtros.turno) consulta = consulta.eq("turno", filtros.turno);

  if (filtros.habilidade) {
    const ids = await idsDaHabilidade(filtros.habilidade);
    if (ids.length === 0) return NENHUM_CURSO;
    consulta = consulta.in("id", ids);
  }

  // 3º) Aba Todos: o catálogo pode ser grande, então vem em partes,
  //     em ordem alfabética ("Carregar mais" traz a próxima parte).
  if (filtros.aba === "todos") {
    const limite = filtros.pagina * TAMANHO_PAGINA;

    // Pedimos 1 curso a mais só para saber se ainda existe outra parte.
    const { data, error } = await consulta.order("titulo").range(0, limite);
    if (error) throw new Error(error.message);

    const encontrados = (data ?? []) as unknown as Curso[];
    const cursos = await completarCursos(encontrados.slice(0, limite), contexto);

    return { cursos, temMais: encontrados.length > limite };
  }

  // Recomendados e Meus cursos: a lista já é pequena (só as lacunas
  // ou só os cursos da pessoa), então vem inteira e ordenamos pela regra.
  const { data, error } = await consulta;
  if (error) throw new Error(error.message);

  const cursos = await completarCursos((data ?? []) as unknown as Curso[], contexto);

  return { cursos: cursos.sort(compararPeloMaisRapido), temMais: false };
}

export async function buscarCurso(
  id: string,
  contexto: Contexto,
): Promise<CursoComDados | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("curso")
    .select(COLUNAS)
    .eq("id", id)
    .eq("gratuito", true)
    .eq("emite_certificado", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const [curso] = await completarCursos([data as unknown as Curso], contexto);
  return curso;
}
