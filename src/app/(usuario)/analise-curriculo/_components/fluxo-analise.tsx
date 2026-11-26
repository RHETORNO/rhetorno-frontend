"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Upload, { type SessaoAnaliseIniciada } from "./upload"
import PerguntasAdicionais from "./perguntas-adicionais"
import { salvarAnaliseCompleta } from "@/app/(usuario)/actions"
import {
  finalizarAvaliacaoCurriculo,
  type PreferenciasEstudo,
  type RespostaContexto,
} from "@/services/curriculo-api"

const FluxoAnalise = () => {
  const router = useRouter()
  const [sessao, setSessao] = useState<SessaoAnaliseIniciada | null>(null)
  const [finalizando, setFinalizando] = useState(false)
  const [erroFinal, setErroFinal] = useState<string>()

  const concluir = async (
    respostas: RespostaContexto[],
    preferencias: PreferenciasEstudo
  ) => {
    if (!sessao) return
    setFinalizando(true)
    setErroFinal(undefined)

    try {
      const avaliacao = await finalizarAvaliacaoCurriculo({
        textoCurriculo: sessao.diagnostico.textoCurriculoExtraido,
        cargoDesejado: sessao.cargoParaIa,
        resumoVagaConsolidado: sessao.diagnostico.resumoVagaConsolidado,
        respostasExperiencia: respostas,
        preferenciasEstudo: preferencias,
        metaCompatibilidade: 90,
      })

      const formData = new FormData()
      formData.append("arquivo", sessao.arquivo)
      formData.append("cargo", sessao.cargoInput)
      formData.append("empresa", sessao.empresaInput)

      const salvamento = await salvarAnaliseCompleta({
        formData,
        avaliacao,
      })

      if (salvamento.error || !salvamento.analiseId) {
        setErroFinal(salvamento.error || "Não foi possível salvar a análise.")
        return
      }

      router.push(`/analise-curriculo/${salvamento.analiseId}`)
    } catch (err) {
      setErroFinal(
        err instanceof Error ? err.message : "Erro ao finalizar a análise do currículo."
      )
    } finally {
      setFinalizando(false)
    }
  }

  if (!sessao) {
    return <Upload onDiagnosticoConcluido={(dados) => setSessao(dados)} />
  }

  return (
    <PerguntasAdicionais
      diagnostico={sessao.diagnostico}
      enviando={finalizando}
      erro={erroFinal}
      onVoltar={() => setSessao(null)}
      onFinalizar={concluir}
    />
  )
}

export default FluxoAnalise