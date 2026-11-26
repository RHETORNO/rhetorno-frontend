"use client"

import { useState } from "react"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import type {
  DiagnosticoInicialResponse,
  PreferenciasEstudo,
  RespostaContexto,
} from "@/services/curriculo-api"

interface PerguntasAdicionaisProps {
  diagnostico: DiagnosticoInicialResponse
  enviando: boolean
  erro?: string
  onVoltar: () => void
  onFinalizar: (respostas: RespostaContexto[], preferencias: PreferenciasEstudo) => void
}

const PerguntasAdicionais = ({
  diagnostico,
  enviando,
  erro,
  onVoltar,
  onFinalizar,
}: PerguntasAdicionaisProps) => {
  const [respostas, setRespostas] = useState<string[]>(() =>
    diagnostico.perguntasExperiencia.map(() => "")
  )
  const [priorizaCertificado, setPriorizaCertificado] = useState(true)
  const [apenasGratuito, setApenasGratuito] = useState(true)
  const [modalidade, setModalidade] =
    useState<PreferenciasEstudo["modalidade"]>("ApenasOnline")
  const [formatoCurso, setFormatoCurso] =
    useState<PreferenciasEstudo["formatoCurso"]>("ApenasCursosLivres")

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()

    const respostasFormatadas: RespostaContexto[] = diagnostico.perguntasExperiencia.map(
      (item, idx) => ({
        pergunta: item.pergunta,
        resposta:
          respostas[idx]?.trim() || "Ainda não possuo experiência prática nesta habilidade.",
      })
    )

    onFinalizar(respostasFormatadas, {
      priorizaCertificado,
      apenasGratuito,
      modalidade,
      formatoCurso,
    })
  }

  return (
    <form onSubmit={enviar} className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-1.5">
        <span className="inline-block rounded-full text-xs font-bold text-blue-600 dark:text-blue-400">
          Etapa 2 de 2 • Diagnóstico Complementar
        </span>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {diagnostico.mensagemOrientacao}
        </p>
      </div>

      {diagnostico.perguntasExperiencia.length > 0 && (
        <div className="flex flex-col gap-4">
          {diagnostico.perguntasExperiencia.map((item, idx) => (
            <div key={idx} className="rounded-xl border bg-card p-5 shadow-xs space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-900 dark:text-orange-400">
                {item.habilidadeAlvo}
              </span>
              <Field>
                <FieldLabel htmlFor={`pergunta-${idx}`}>{item.pergunta}</FieldLabel>
                <FieldDescription>{item.motivo}</FieldDescription>
                <textarea
                  id={`pergunta-${idx}`}
                  rows={2}
                  disabled={enviando}
                  value={respostas[idx] ?? ""}
                  onChange={(e) => {
                    const copia = [...respostas]
                    copia[idx] = e.target.value
                    setRespostas(copia)
                  }}
                  placeholder="Responda brevemente com suas experiências ou projetos..."
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                />
              </Field>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-card p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold">Preferências da sua trilha de estudos</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="certificado">Certificado</FieldLabel>
            <select
              id="certificado"
              disabled={enviando}
              value={priorizaCertificado ? "sim" : "nao"}
              onChange={(e) => setPriorizaCertificado(e.target.value === "sim")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="sim">Priorizar cursos com certificado</option>
              <option value="nao">Com ou sem certificado</option>
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="gratuito">Investimento</FieldLabel>
            <select
              id="gratuito"
              disabled={enviando}
              value={apenasGratuito ? "sim" : "nao"}
              onChange={(e) => setApenasGratuito(e.target.value === "sim")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="sim">Apenas cursos gratuitos</option>
              <option value="nao">Gratuitos ou pagos</option>
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="modalidade">Modalidade</FieldLabel>
            <select
              id="modalidade"
              disabled={enviando}
              value={modalidade}
              onChange={(e) =>
                setModalidade(e.target.value as PreferenciasEstudo["modalidade"])
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ApenasOnline">100% Online</option>
              <option value="PodeEnvolverPresencial">Online ou Presencial</option>
              <option value="DeveSerPresencial">Apenas Presencial</option>
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="formato">Formato das aulas</FieldLabel>
            <select
              id="formato"
              disabled={enviando}
              value={formatoCurso}
              onChange={(e) =>
                setFormatoCurso(e.target.value as PreferenciasEstudo["formatoCurso"])
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ApenasCursosLivres">Cursos livres (no meu ritmo)</option>
              <option value="PodeEnvolverSincrono">Pode ter aulas ao vivo / horário fixo</option>
            </select>
          </Field>
        </div>
      </div>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={enviando}
          onClick={onVoltar}
          className="flex h-12 items-center justify-center rounded-lg border border-input bg-background px-5 text-sm font-medium hover:bg-muted disabled:opacity-50 hover:cursor-pointer"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={enviando}
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-[#0b1437] text-sm font-medium text-white outline-none transition-colors hover:bg-[#13265e] disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400 hover:cursor-pointer"
        >
          {enviando
            ? "Gerando avaliação, trilha e currículo ATS..."
            : "Concluir análise e salvar resultado"}
        </button>
      </div>
    </form>
  )
}

export default PerguntasAdicionais