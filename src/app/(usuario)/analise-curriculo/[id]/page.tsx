import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import VisaoGeral from "./_components/visao-geral"
import Header from "./_components/header"
import Cards from "./_components/cards"
import Section from "./_components/section"
import TrilhaECurriculoAts, {
  type CursoTrilhaSalvo,
  type DadosAtsSalvos,
} from "./_components/trilha-e-curriculo-ats"

const Page = ({ params }: PageProps<"/analise-curriculo/[id]">) => {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Carregando análise...</p>}>
      <Resultado params={params} />
    </Suspense>
  )
}

export default Page

const Resultado = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  if (!/^\d+$/.test(id)) notFound()

  const analiseId = Number(id)
  const supabase = await createClient()

  const { data: analise } = await supabase
    .from("analise_curriculo")
    .select(`
      id, status, cargo_alvo, empresa_alvo, pontuacao_geral,
      classificacao, resumo, pontos_fortes, pontos_melhoria, criada_em,
      compatibilidade_cargo,
      curriculo ( nome_arquivo, enviado_em ),
      criterio_analise ( criterio, nota ),
      aponta_falta ( habilidade ( id, nome ) )
    `)
    .eq("id", analiseId)
    .maybeSingle()

  if (!analise) notFound()

  if (analise.status === "processando") {
    return <p>Estamos analisando seu currículo...</p>
  }
  if (analise.status === "erro") {
    return <p>Não conseguimos analisar seu currículo.</p>
  }

  const habilidadesObj = analise.aponta_falta
    .map((f: { habilidade: unknown }) => f.habilidade as { id: number; nome: string } | null)
    .filter((h): h is { id: number; nome: string } => Boolean(h?.nome))

  const habilidadesFaltando = habilidadesObj.map((h) => h.nome)
  const idsHabilidades = habilidadesObj.map((h) => h.id)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: perfil }, { data: interacaoAts }, { data: ligacoesCursos }, { data: inscricoes }] =
    await Promise.all([
      user
        ? supabase
            .from("perfil")
            .select("nome_completo, email_contato, telefone, cidade, uf, linkedin_url")
            .eq("id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from("interacao_ia")
            .select("resposta")
            .eq("idperfil", user.id)
            .eq("pergunta", `ats_analise:${analiseId}`)
            .order("id", { ascending: false })
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      idsHabilidades.length > 0
        ? supabase
            .from("desenvolve")
            .select(
              "habilidade ( nome ), curso ( id, titulo, instituicao_nome, modalidade, carga_horaria_h, gratuito, emite_certificado, descricao )"
            )
            .in("idhabilidade", idsHabilidades)
        : Promise.resolve({ data: [] }),
      user
        ? supabase
            .from("inscricao_curso")
            .select("idcurso, status")
            .eq("idperfil", user.id)
        : Promise.resolve({ data: [] }),
    ])

  let dadosAts: (DadosAtsSalvos & { cursosSnapshot?: Omit<CursoTrilhaSalvo, "concluido">[] }) | null =
    null

  if (interacaoAts?.resposta) {
    try {
      dadosAts = JSON.parse(interacaoAts.resposta)
    } catch {}
  }

  const mapaStatusInscricao = new Map<string, string>(
    (inscricoes ?? []).map((i) => [i.idcurso, i.status])
  )

  const cursosMap = new Map<string, CursoTrilhaSalvo>()

  // 1. Preenche a partir do snapshot salvo da análise (garante ordem e ganho %)
  for (const snap of dadosAts?.cursosSnapshot ?? []) {
    cursosMap.set(snap.id, {
      ...snap,
      concluido: mapaStatusInscricao.get(snap.id) === "concluido",
    })
  }

  // 2. Complementa com os vínculos da tabela 'desenvolve' do banco
  for (const row of ligacoesCursos ?? []) {
    const c = row.curso as {
      id: string
      titulo: string
      instituicao_nome: string
      modalidade: string | null
      carga_horaria_h: number | null
      gratuito: boolean
      emite_certificado: boolean
      descricao: string
    } | null
    const h = row.habilidade as { nome: string } | null

    if (!c || cursosMap.has(c.id)) continue

    cursosMap.set(c.id, {
      id: c.id,
      titulo: c.titulo,
      instituicao: c.instituicao_nome,
      modalidade: c.modalidade,
      cargaHorariaHoras: c.carga_horaria_h,
      gratuito: c.gratuito,
      emiteCertificado: c.emite_certificado,
      sobreOCurso: c.descricao,
      habilidadeCoberta: h?.nome || "",
      ganhoPercentualChance: 10,
      concluido: mapaStatusInscricao.get(c.id) === "concluido",
    })
  }

  const localizacaoPerfil = [perfil?.cidade, perfil?.uf].filter(Boolean).join(", ")

  return (
    <div className="flex flex-col gap-8">
      <Header
        nomeArquivo={analise.curriculo?.nome_arquivo}
        enviadoEm={analise.curriculo?.enviado_em}
        cargoAlvo={analise.cargo_alvo}
      />
      <VisaoGeral
        PontuacaoGeral={analise.pontuacao_geral}
        classificacao={analise.classificacao}
        criterios={analise.criterio_analise}
        resumo={analise.resumo}
        cargoAlvo={analise.cargo_alvo}
        empresaAlvo={analise.empresa_alvo}
      />
      <Cards
        analiseId={analise.id}
        pontosFortes={analise.pontos_fortes}
        pontosMelhoria={analise.pontos_melhoria}
        habilidadesFaltando={habilidadesFaltando}
        compatibilidade={analise.compatibilidade_cargo}
        cargoAlvo={analise.cargo_alvo}
      />
      {dadosAts?.curriculoOtimizadoAts && (
        <TrilhaECurriculoAts
          analiseId={analise.id}
          cargoAlvo={analise.cargo_alvo}
          compatibilidadeBase={analise.compatibilidade_cargo ?? 0}
          cursos={[...cursosMap.values()]}
          dadosAts={dadosAts}
          perfilInicial={{
            nome: perfil?.nome_completo ?? "",
            email: perfil?.email_contato ?? "",
            telefone: perfil?.telefone ?? "",
            localizacao: localizacaoPerfil,
            linkedin: perfil?.linkedin_url ?? "",
            portfolio: "",
          }}
        />
      )}
      <Section
        totalAjustes={analise.pontos_melhoria?.length}
        habilidadesFaltando={habilidadesFaltando}
        cargoAlvo={analise.cargo_alvo}
      />
    </div>
  )
}