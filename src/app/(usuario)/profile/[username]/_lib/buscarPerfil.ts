import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"

type PerfilRow = Database["public"]["Tables"]["perfil"]["Row"]

export type PerfilPublico = Pick<
  PerfilRow,
  "id" | "username" | "nome_completo" | "foto_url" | "bio" | "cidade" | "uf" | "linkedin_url" | "tipo" | "criado_em"
>

export type TipoEvento = "analise" | "entrevista" | "curso" | "candidatura"

export type Evento = {
  chave: string
  tipo: TipoEvento
  data: string
  titulo: string
  detalhe: string | null
  concluido: boolean
  pontuacao: number | null
  href: string | null
}

export type DadosPerfil = {
  perfil: PerfilPublico
  ehDono: boolean
  contato: { telefone: string | null; email: string } | null
  cargoAlvo: string | null
  pontosFortes: string[]
  habilidades: string[]
  eventos: Evento[]
  contagem: { analises: number; entrevistas: number; cursosConcluidos: number }
}

const formatoUsername = /^[a-z0-9-]{3,48}$/
const formatoUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Curso = { id: string; titulo: string; instituicao_nome: string }

type CursoInscrito = {
  id: number
  status: Database["public"]["Enums"]["status_inscricao"]
  inscrito_em: string
  curso: Curso | null
}

type AnaliseLinha = {
  id: number
  cargo_alvo: string | null
  empresa_alvo: string | null
  pontuacao_geral: number | null
  pontos_fortes: string[]
  criada_em: string
}

type EntrevistaLinha = {
  id: number
  cargo_foco: string
  pontuacao_geral: number | null
  criada_em: string
}

type CandidaturaLinha = {
  id: number
  criada_em: string
  vagas: { id: number; titulo: string; cidade: string; uf: string } | null
}

export async function usernameDoId(id: string): Promise<string | null> {
  if (!formatoUuid.test(id)) return null
  const supabase = await createClient()
  const { data } = await supabase.from("perfil_publico").select("username").eq("id", id).maybeSingle()
  return data?.username ?? null
}

function eventoDeCurso(i: CursoInscrito): Evento[] {
  if (!i.curso) return []
  return [{
    chave: `curso-${i.id}`,
    tipo: "curso",
    data: i.inscrito_em,
    titulo: i.status === "concluido" ? `Concluiu ${i.curso.titulo}` : `Começou ${i.curso.titulo}`,
    detalhe: i.curso.instituicao_nome,
    concluido: i.status === "concluido",
    pontuacao: null,
    href: `/cursos/${i.curso.id}`,
  }]
}

async function habilidadesDosCursos(idsCursos: string[]): Promise<string[]> {
  if (idsCursos.length === 0) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from("desenvolve")
    .select("habilidade(nome)")
    .in("idcurso", idsCursos)

  const linhas = (data ?? []) as unknown as { habilidade: { nome: string } | null }[]
  return [...new Set(linhas.map((l) => l.habilidade?.nome).filter((n): n is string => Boolean(n)))]
}

export async function buscarPerfil(username: string, idUsuario: string): Promise<DadosPerfil | null> {
  if (!formatoUsername.test(username)) return null

  const supabase = await createClient()

  const { data: linha } = await supabase
    .from("perfil_publico")
    .select("id, username, nome_completo, foto_url, bio, cidade, uf, linkedin_url, tipo, criado_em")
    .eq("username", username)
    .maybeSingle()

  if (!linha?.id || !linha.username || !linha.nome_completo || !linha.criado_em) return null

  const perfil: PerfilPublico = {
    id: linha.id,
    username: linha.username,
    nome_completo: linha.nome_completo,
    foto_url: linha.foto_url,
    bio: linha.bio,
    cidade: linha.cidade,
    uf: linha.uf,
    linkedin_url: linha.linkedin_url,
    tipo: linha.tipo,
    criado_em: linha.criado_em,
  }

  return perfil.id === idUsuario ? dadosDoDono(perfil) : dadosDoVisitante(perfil)
}

async function dadosDoVisitante(perfil: PerfilPublico): Promise<DadosPerfil> {
  const supabase = await createClient()

  const [cursos, preparacao] = await Promise.all([
    supabase
      .from("cursos_publicos")
      .select("id, status, inscrito_em, idcurso, titulo, instituicao_nome")
      .eq("idperfil", perfil.id)
      .order("inscrito_em", { ascending: false })
      .limit(20),
    supabase
      .from("preparacao_publica")
      .select("analises, entrevistas")
      .eq("idperfil", perfil.id)
      .maybeSingle(),
  ])

  const inscritos: CursoInscrito[] = (cursos.data ?? []).flatMap((c) =>
    c.id != null && c.status && c.inscrito_em
      ? [{
          id: c.id,
          status: c.status,
          inscrito_em: c.inscrito_em,
          curso: c.idcurso && c.titulo
            ? { id: c.idcurso, titulo: c.titulo, instituicao_nome: c.instituicao_nome ?? "" }
            : null,
        }]
      : [],
  )

  const concluidos = inscritos.filter((i) => i.status === "concluido")

  return {
    perfil,
    ehDono: false,
    contato: null,
    cargoAlvo: null,
    pontosFortes: [],
    habilidades: await habilidadesDosCursos(concluidos.flatMap((i) => (i.curso ? [i.curso.id] : []))),
    eventos: inscritos.flatMap(eventoDeCurso),
    contagem: {
      analises: preparacao.data?.analises ?? 0,
      entrevistas: preparacao.data?.entrevistas ?? 0,
      cursosConcluidos: concluidos.length,
    },
  }
}

async function dadosDoDono(perfil: PerfilPublico): Promise<DadosPerfil> {
  const supabase = await createClient()
  const id = perfil.id

  const [contato, analises, entrevistas, inscricoes, candidaturas] = await Promise.all([
    supabase.from("perfil").select("telefone, email_contato").eq("id", id).maybeSingle(),
    supabase
      .from("analise_curriculo")
      .select("id, cargo_alvo, empresa_alvo, pontuacao_geral, pontos_fortes, criada_em, curriculo!inner(idperfil)")
      .eq("curriculo.idperfil", id)
      .eq("status", "concluida")
      .order("criada_em", { ascending: false })
      .limit(20),
    supabase
      .from("entrevista_ia")
      .select("id, cargo_foco, pontuacao_geral, criada_em")
      .eq("idperfil", id)
      .eq("status", "concluida")
      .order("criada_em", { ascending: false })
      .limit(20),
    supabase
      .from("inscricao_curso")
      .select("id, status, inscrito_em, curso(id, titulo, instituicao_nome)")
      .eq("idperfil", id)
      .in("status", ["inscrito", "concluido"])
      .order("inscrito_em", { ascending: false })
      .limit(20),
    supabase
      .from("vaga_interacao")
      .select("id, criada_em, vagas(id, titulo, cidade, uf)")
      .eq("idperfil", id)
      .eq("status", "candidatou")
      .order("criada_em", { ascending: false })
      .limit(20),
  ])

  const listaAnalises = (analises.data ?? []) as unknown as AnaliseLinha[]
  const listaEntrevistas = (entrevistas.data ?? []) as unknown as EntrevistaLinha[]
  const listaInscricoes = (inscricoes.data ?? []) as unknown as CursoInscrito[]
  const listaCandidaturas = (candidaturas.data ?? []) as unknown as CandidaturaLinha[]
  const concluidos = listaInscricoes.filter((i) => i.status === "concluido")

  const eventos: Evento[] = [
    ...listaAnalises.map((a): Evento => ({
      chave: `analise-${a.id}`,
      tipo: "analise",
      data: a.criada_em,
      titulo: a.cargo_alvo ? `Currículo analisado para ${a.cargo_alvo}` : "Currículo analisado",
      detalhe: a.empresa_alvo,
      concluido: true,
      pontuacao: a.pontuacao_geral,
      href: `/analise-curriculo/${a.id}`,
    })),
    ...listaEntrevistas.map((e): Evento => ({
      chave: `entrevista-${e.id}`,
      tipo: "entrevista",
      data: e.criada_em,
      titulo: e.cargo_foco && e.cargo_foco !== "Geral"
        ? `Entrevista simulada para ${e.cargo_foco}`
        : "Entrevista simulada",
      detalhe: null,
      concluido: true,
      pontuacao: e.pontuacao_geral,
      href: `/mentoria-ia/relatorio/${e.id}`,
    })),
    ...listaInscricoes.flatMap(eventoDeCurso),
    ...listaCandidaturas.flatMap((c): Evento[] =>
      c.vagas
        ? [{
            chave: `candidatura-${c.id}`,
            tipo: "candidatura",
            data: c.criada_em,
            titulo: `Candidatou-se a ${c.vagas.titulo}`,
            detalhe: `${c.vagas.cidade}, ${c.vagas.uf}`,
            concluido: true,
            pontuacao: null,
            href: null,
          }]
        : [],
    ),
  ].sort((a, b) => b.data.localeCompare(a.data))

  return {
    perfil,
    ehDono: true,
    contato: contato.data ? { telefone: contato.data.telefone, email: contato.data.email_contato } : null,
    cargoAlvo: listaAnalises[0]?.cargo_alvo ?? null,
    pontosFortes: listaAnalises[0]?.pontos_fortes ?? [],
    habilidades: await habilidadesDosCursos(concluidos.flatMap((i) => (i.curso ? [i.curso.id] : []))),
    eventos,
    contagem: {
      analises: listaAnalises.length,
      entrevistas: listaEntrevistas.length,
      cursosConcluidos: concluidos.length,
    },
  }
}
