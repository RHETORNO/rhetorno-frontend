const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "") || "http://localhost:5155"

export interface EnviarDiagnosticoParams {
  arquivoPdf: File
  cargoDesejado: string
  tipoOrigem?: "titulo" | "interna" | "url"
  vagaInternaId?: string
  urlVaga?: string
  descricaoComplementar?: string
}

export interface PerguntaInvestigativa {
  habilidadeAlvo: string
  pergunta: string
  motivo: string
}

export interface DiagnosticoInicialResponse {
  textoCurriculoExtraido: string
  resumoVagaConsolidado: string
  mensagemOrientacao: string
  perguntasExperiencia: PerguntaInvestigativa[]
  perguntasPreferenciasEstudo: string[]
}

export interface RespostaContexto {
  pergunta: string
  resposta: string
}

export interface PreferenciasEstudo {
  priorizaCertificado: boolean
  apenasGratuito: boolean
  modalidade: "ApenasOnline" | "PodeEnvolverPresencial" | "DeveSerPresencial"
  formatoCurso: "ApenasCursosLivres" | "PodeEnvolverSincrono"
}

export interface AvaliacaoFinalPayload {
  textoCurriculo: string
  cargoDesejado: string
  resumoVagaConsolidado: string
  respostasExperiencia: RespostaContexto[]
  preferenciasEstudo: PreferenciasEstudo
  metaCompatibilidade?: number
}

export interface CriterioNota {
  nota: number
  status: string
}

export interface CursoTrilha {
  titulo: string
  instituicao: string
  localizacao: string
  tipoCurso: string
  modalidade: string
  ritmoOuTurno: string
  cargaHorariaHoras: number
  periodoDuracao: string | null
  duracaoFormatada: string
  gratuito: boolean
  possuiCertificado: boolean
  habilidadeCoberta: string
  ganhoPercentualChance: number
  sobreOCurso: string
  licoesEnsinadas: string[]
  beneficios: string[]
}

export interface AvaliacaoCurriculoResponse {
  pontuacaoGeral: number
  classificacaoGeral: string
  pontuacaoProjetadaComAjustes: number
  resumoPontuacaoGeral: string
  criterios: {
    objetivo: CriterioNota
    experiencia: CriterioNota
    formacao: CriterioNota
    competencias: CriterioNota
  }
  oQueJaEstaBom: string[]
  oQuePrecisaMelhorar: string[]
  compatibilidadeVagaAtual: number
  compatibilidadeVagaProjetada: number
  metaDesejada: number
  curriculoOtimizadoLiberado: boolean
  motivoLiberacaoOuBloqueio: string
  habilidadesFaltantes: string[]
  palavrasChaveAtsAplicadas: string[]
  melhoriasAtsAplicadas: string[]
  resumoTempoTrilha: {
    totalHorasEstimadas: number
    totalDiasEstimados: number
    textoTempoConsolidado: string
    excedeLimiteAviso: boolean
    avisoAmigavelTempo: string | null
  }
  trilhaCursos: CursoTrilha[]
  curriculoOtimizadoAts: string
}

async function processarResposta<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const mensagemErro = data?.detalhe
      ? `${data.erro} (${data.detalhe})`
      : data?.erro || `Erro HTTP ${response.status} ao comunicar com a API.`
    throw new Error(mensagemErro)
  }

  return data as T
}

export async function iniciarDiagnosticoCurriculo(
  params: EnviarDiagnosticoParams
): Promise<DiagnosticoInicialResponse> {
  const formData = new FormData()
  formData.append("arquivoPdf", params.arquivoPdf)
  formData.append("cargoDesejado", params.cargoDesejado)
  formData.append("tipoOrigem", params.tipoOrigem ?? "titulo")

  if (params.vagaInternaId) formData.append("vagaInternaId", params.vagaInternaId)
  if (params.urlVaga) formData.append("urlVaga", params.urlVaga)
  if (params.descricaoComplementar) {
    formData.append("descricaoComplementar", params.descricaoComplementar)
  }

  const response = await fetch(`${API_BASE_URL}/api/curriculo/diagnostico`, {
    method: "POST",
    body: formData,
  })

  return processarResposta<DiagnosticoInicialResponse>(response)
}

export async function finalizarAvaliacaoCurriculo(
  payload: AvaliacaoFinalPayload
): Promise<AvaliacaoCurriculoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/curriculo/avaliar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      metaCompatibilidade: payload.metaCompatibilidade ?? 90,
    }),
  })

  return processarResposta<AvaliacaoCurriculoResponse>(response)
}