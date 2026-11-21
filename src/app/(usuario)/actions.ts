"use server"

import { revalidatePath } from "next/cache"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"
import type { AvaliacaoCurriculoResponse } from "@/services/curriculo-api"

const limite = 5 * 1024 * 1024 // 5MB

function obterClienteEscrita(supabaseUsuario: Awaited<ReturnType<typeof createClient>>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (url && serviceKey) {
    return createSupabaseAdmin<Database>(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return supabaseUsuario
}

export async function salvarAnaliseCompleta(params: {
  formData: FormData
  avaliacao: AvaliacaoCurriculoResponse
}): Promise<{ error?: string; analiseId?: number }> {
  const { formData, avaliacao } = params
  const arquivo = formData.get("arquivo")
  const cargo = String(formData.get("cargo") ?? "").trim()
  const empresa = String(formData.get("empresa") ?? "").trim()

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { error: "Selecione um arquivo PDF para enviar." }
  }
  if (arquivo.type !== "application/pdf" && !arquivo.name.toLowerCase().endsWith(".pdf")) {
    return { error: "O arquivo precisa ser um PDF." }
  }
  if (arquivo.size > limite) {
    return { error: "O arquivo ultrapassa o limite de 5MB." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Sua sessão expirou. Entre novamente." }

  const db = obterClienteEscrita(supabase)

  // 1. Upload do PDF no bucket 'curriculos'
  const caminho = `${user.id}/${crypto.randomUUID()}.pdf`
  const { error: erroUpload } = await supabase.storage
    .from("curriculos")
    .upload(caminho, arquivo, { contentType: "application/pdf" })

  if (erroUpload) {
    return { error: `Falha ao enviar PDF para o Storage: ${erroUpload.message}` }
  }

  // 2. Cria registro na tabela 'curriculo'
  const { data: curriculo, error: erroCurriculo } = await db
    .from("curriculo")
    .insert({
      idperfil: user.id,
      nome_arquivo: arquivo.name,
      storage_url: caminho,
      formato: "pdf",
      tamanho_bytes: arquivo.size,
      status: "enviado",
    })
    .select("id")
    .single()

  if (erroCurriculo || !curriculo) {
    await supabase.storage.from("curriculos").remove([caminho])
    return { error: `Erro ao salvar currículo: ${erroCurriculo?.message || "desconhecido"}` }
  }

  // 3. Insere 'analise_curriculo' JÁ CONCLUÍDA (evita bloqueio de RLS em UPDATE)
  const { data: analise, error: erroAnalise } = await db
    .from("analise_curriculo")
    .insert({
      idcurriculo: curriculo.id,
      cargo_alvo: cargo || null,
      empresa_alvo: empresa || null,
      status: "concluida",
      pontuacao_geral: Math.round(avaliacao.pontuacaoGeral),
      classificacao: avaliacao.classificacaoGeral,
      resumo: avaliacao.resumoPontuacaoGeral,
      pontos_fortes: avaliacao.oQueJaEstaBom ?? [],
      pontos_melhoria: avaliacao.oQuePrecisaMelhorar ?? [],
      compatibilidade_cargo: Math.round(avaliacao.compatibilidadeVagaAtual),
    })
    .select("id")
    .single()

  if (erroAnalise || !analise) {
    return { error: `Erro ao gravar análise: ${erroAnalise?.message || "desconhecido"}` }
  }

  const analiseId = analise.id

  // 4. Grava os 4 critérios em 'criterio_analise'
  await db.from("criterio_analise").insert([
    { idanalise_curriculo: analiseId, criterio: "Objetivo", nota: Math.round(avaliacao.criterios.objetivo.nota) },
    { idanalise_curriculo: analiseId, criterio: "Experiência", nota: Math.round(avaliacao.criterios.experiencia.nota) },
    { idanalise_curriculo: analiseId, criterio: "Formação", nota: Math.round(avaliacao.criterios.formacao.nota) },
    { idanalise_curriculo: analiseId, criterio: "Competências", nota: Math.round(avaliacao.criterios.competencias.nota) },
  ])

  // 5. Cadastra habilidades faltantes em 'habilidade' + 'aponta_falta'
  const nomesHabilidades = Array.from(
    new Set([
      ...(avaliacao.habilidadesFaltantes ?? []),
      ...(avaliacao.trilhaCursos ?? []).map((c) => c.habilidadeCoberta),
    ])
  )
    .map((h) => h.trim())
    .filter(Boolean)

  const mapaHabilidadesId = new Map<string, number>()

  for (const nomeHab of nomesHabilidades) {
    const { data: existente } = await db
      .from("habilidade")
      .select("id, nome")
      .ilike("nome", nomeHab)
      .limit(1)
      .maybeSingle()

    let habId = existente?.id

    if (!habId) {
      const { data: novaHab } = await db
        .from("habilidade")
        .insert({ nome: nomeHab, categoria: "Técnica" })
        .select("id")
        .maybeSingle()
      habId = novaHab?.id
    }

    if (habId) {
      mapaHabilidadesId.set(nomeHab.toLowerCase(), habId)
      await db
        .from("aponta_falta")
        .upsert(
          { idanalise_curriculo: analiseId, idhabilidade: habId },
          { onConflict: "idanalise_curriculo,idhabilidade", ignoreDuplicates: true }
        )
    }
  }

  // 6. Grava cursos em 'curso', vincula em 'desenvolve' e salva em 'inscricao_curso'
  const cursosPersistidos: Array<{
    id: string
    titulo: string
    instituicao: string
    modalidade: string | null
    cargaHorariaHoras: number | null
    gratuito: boolean
    emiteCertificado: boolean
    sobreOCurso: string
    habilidadeCoberta: string
    ganhoPercentualChance: number
  }> = []

  for (const cursoIa of avaliacao.trilhaCursos ?? []) {
    const tituloLimpo = cursoIa.titulo.trim()
    const instLimpa = cursoIa.instituicao.trim() || "Plataforma Online"

    const { data: cursoExistente } = await db
      .from("curso")
      .select("id")
      .ilike("titulo", tituloLimpo)
      .ilike("instituicao_nome", instLimpa)
      .limit(1)
      .maybeSingle()

    let cursoId = cursoExistente?.id

    if (!cursoId) {
      const { data: novoCurso } = await db
        .from("curso")
        .insert({
          titulo: tituloLimpo,
          instituicao_nome: instLimpa,
          cidade: cursoIa.localizacao?.trim() || "Online",
          descricao:
            cursoIa.sobreOCurso?.trim() ||
            `Curso recomendado para desenvolver ${cursoIa.habilidadeCoberta}.`,
          carga_horaria_h:
            cursoIa.cargaHorariaHoras > 0 ? Math.round(cursoIa.cargaHorariaHoras) : null,
          emite_certificado: Boolean(cursoIa.possuiCertificado),
          gratuito: Boolean(cursoIa.gratuito),
          licoes: cursoIa.licoesEnsinadas?.length ? cursoIa.licoesEnsinadas.join("\n") : null,
          beneficios: cursoIa.beneficios?.length ? cursoIa.beneficios.join("\n") : null,
          modalidade: cursoIa.modalidade || "Online",
          turno: cursoIa.ritmoOuTurno || "Autodidata",
        })
        .select("id")
        .maybeSingle()

      cursoId = novoCurso?.id
    }

    if (cursoId) {
      const habId = mapaHabilidadesId.get(cursoIa.habilidadeCoberta?.trim().toLowerCase() ?? "")
      if (habId) {
        await db
          .from("desenvolve")
          .upsert(
            { idcurso: cursoId, idhabilidade: habId },
            { onConflict: "idcurso,idhabilidade", ignoreDuplicates: true }
          )
      }

      const { data: inscricaoExistente } = await db
        .from("inscricao_curso")
        .select("id")
        .eq("idperfil", user.id)
        .eq("idcurso", cursoId)
        .maybeSingle()

      if (!inscricaoExistente) {
        await db.from("inscricao_curso").insert({
          idperfil: user.id,
          idcurso: cursoId,
          status: "salvo",
        })
      }
    }

    cursosPersistidos.push({
      id: cursoId || `local-${crypto.randomUUID()}`,
      titulo: tituloLimpo,
      instituicao: instLimpa,
      modalidade: cursoIa.modalidade || "Online",
      cargaHorariaHoras: cursoIa.cargaHorariaHoras > 0 ? Math.round(cursoIa.cargaHorariaHoras) : null,
      gratuito: Boolean(cursoIa.gratuito),
      emiteCertificado: Boolean(cursoIa.possuiCertificado),
      sobreOCurso: cursoIa.sobreOCurso || "",
      habilidadeCoberta: cursoIa.habilidadeCoberta || "",
      ganhoPercentualChance: cursoIa.ganhoPercentualChance ?? 0,
    })
  }

  // 7. Salva currículo ATS + snapshot da trilha em 'interacao_ia'
  await db.from("interacao_ia").insert({
    idperfil: user.id,
    pergunta: `ats_analise:${analiseId}`,
    resposta: JSON.stringify({
      curriculoOtimizadoAts: avaliacao.curriculoOtimizadoAts,
      palavrasChaveAtsAplicadas: avaliacao.palavrasChaveAtsAplicadas ?? [],
      melhoriasAtsAplicadas: avaliacao.melhoriasAtsAplicadas ?? [],
      compatibilidadeVagaProjetada: avaliacao.compatibilidadeVagaProjetada,
      metaDesejada: avaliacao.metaDesejada ?? 90,
      curriculoOtimizadoLiberado: avaliacao.curriculoOtimizadoLiberado,
      motivoLiberacaoOuBloqueio: avaliacao.motivoLiberacaoOuBloqueio,
      resumoTempoTrilha: avaliacao.resumoTempoTrilha,
      cursosSnapshot: cursosPersistidos,
    }),
  })

  revalidatePath("/cursos")
  revalidatePath(`/analise-curriculo/${analiseId}`)

  return { analiseId }
}

export async function alternarConclusaoCurso(
  cursoId: string,
  concluido: boolean,
  analiseId: number
): Promise<{ error?: string }> {
  if (cursoId.startsWith("local-")) return {}

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "Sessão expirada." }

  const db = obterClienteEscrita(supabase)
  const novoStatus = concluido ? "concluido" : "salvo"

  const { data: existente } = await db
    .from("inscricao_curso")
    .select("id")
    .eq("idperfil", user.id)
    .eq("idcurso", cursoId)
    .maybeSingle()

  if (existente) {
    const { error } = await db
      .from("inscricao_curso")
      .update({ status: novoStatus })
      .eq("id", existente.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await db.from("inscricao_curso").insert({
      idperfil: user.id,
      idcurso: cursoId,
      status: novoStatus,
    })
    if (error) return { error: error.message }
  }

  revalidatePath(`/analise-curriculo/${analiseId}`)
  revalidatePath("/cursos")
  return {}
}