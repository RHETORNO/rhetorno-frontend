"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  FileText,
  GraduationCap,
  Lock,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { alternarConclusaoCurso } from "@/app/(usuario)/actions"
import {
  baixarCurriculoAtsPdf,
  montarTextoCurriculoAts,
  type DadosCabecalhoAts,
} from "@/lib/gerar-pdf-ats"

export interface CursoTrilhaSalvo {
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
  concluido: boolean
}

export interface DadosAtsSalvos {
  curriculoOtimizadoAts: string
  palavrasChaveAtsAplicadas: string[]
  melhoriasAtsAplicadas: string[]
  compatibilidadeVagaProjetada?: number
  metaDesejada?: number
  curriculoOtimizadoLiberado?: boolean
  motivoLiberacaoOuBloqueio?: string
  resumoTempoTrilha?: {
    textoTempoConsolidado?: string
    excedeLimiteAviso?: boolean
    avisoAmigavelTempo?: string | null
  }
}

interface TrilhaECurriculoAtsProps {
  analiseId: number
  cargoAlvo?: string | null
  compatibilidadeBase: number
  cursos: CursoTrilhaSalvo[]
  dadosAts: DadosAtsSalvos
  perfilInicial: DadosCabecalhoAts
}

const TrilhaECurriculoAts = ({
  analiseId,
  cargoAlvo,
  compatibilidadeBase,
  cursos: cursosIniciais,
  dadosAts,
  perfilInicial,
}: TrilhaECurriculoAtsProps) => {
  const [cursos, setCursos] = useState<CursoTrilhaSalvo[]>(cursosIniciais)
  const [dadosPessoais, setDadosPessoais] = useState<DadosCabecalhoAts>(perfilInicial)
  const [previewComDados, setPreviewComDados] = useState(true)
  const [copiado, setCopiado] = useState(false)
  const [isPending, startTransition] = useTransition()

  const meta = dadosAts.metaDesejada ?? 90
  const concluidosCount = cursos.filter((c) => c.concluido).length
  const todosConcluidos = cursos.length === 0 || concluidosCount === cursos.length

  const ganhoConcluido = cursos.reduce(
    (acc, c) => (c.concluido ? acc + c.ganhoPercentualChance : acc),
    0
  )
  const ganhoTotalTrilha = cursos.reduce((acc, c) => acc + c.ganhoPercentualChance, 0)

  const compatibilidadeAtual = Math.min(100, compatibilidadeBase + ganhoConcluido)
  const compatibilidadeFinal = Math.min(
    100,
    dadosAts.compatibilidadeVagaProjetada ?? compatibilidadeBase + ganhoTotalTrilha
  )

  const liberado =
    Boolean(dadosAts.curriculoOtimizadoLiberado) ||
    compatibilidadeBase >= meta ||
    todosConcluidos

  const handleAlternarCurso = (cursoId: string, atualConcluido: boolean) => {
    const proximo = !atualConcluido
    setCursos((prev) =>
      prev.map((c) => (c.id === cursoId ? { ...c, concluido: proximo } : c))
    )
    startTransition(async () => {
      await alternarConclusaoCurso(cursoId, proximo, analiseId)
    })
  }

  const textoExibido = montarTextoCurriculoAts(
    dadosAts.curriculoOtimizadoAts,
    previewComDados,
    dadosPessoais
  )

  const copiarTexto = async () => {
    if (!textoExibido) return
    await navigator.clipboard.writeText(textoExibido)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const ganhoMedio =
    cursos.length > 0 ? Math.round(ganhoTotalTrilha / cursos.length) : 10

  return (
    <div className="flex flex-col gap-6">
      {/* BLOCO IGUAL AO PROTÓTIPO: "Próximo passo — Habilidades que faltaram para a vaga..." */}
      {cursos.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <GraduationCap className="size-3.5" /> Próximo passo
                </span>
                <CardTitle className="text-lg">
                  {cargoAlvo
                    ? `Habilidades que faltaram para a vaga de ${cargoAlvo}`
                    : "Habilidades que faltaram para esta vaga"}
                </CardTitle>
                <CardDescription>
                  Cada curso cobre uma habilidade que faltou · conclua os {cursos.length} cursos ({concluidosCount}/{cursos.length}) para liberar seu currículo otimizado
                </CardDescription>
              </div>

              <Link
                href="/cursos"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0b1437] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#13265e] dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                Ir para a trilha de cursos <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {/* BARRA SEGMENTADA: Hoje X% -> Com os N cursos Y% */}
            <div className="mt-4 flex items-center gap-4 rounded-xl border bg-muted/25 px-4 py-3">
              <div className="shrink-0">
                <span className="block text-[11px] text-muted-foreground">Hoje</span>
                <span className="text-lg font-bold tabular-nums text-blue-700 dark:text-blue-300">
                  {compatibilidadeAtual}%
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex h-2.5 w-full gap-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-l-full bg-blue-700 transition-all duration-300 dark:bg-blue-400"
                    style={{ width: `${compatibilidadeBase}%` }}
                  />
                  {cursos.map((c) => (
                    <div
                      key={c.id}
                      className={`h-full transition-all duration-300 ${
                        c.concluido ? "bg-emerald-600" : "bg-emerald-400/50"
                      }`}
                      style={{
                        width: `${Math.max(4, c.ganhoPercentualChance || ganhoMedio)}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-blue-700 dark:bg-blue-400" />
                    O que você já tem
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    +{ganhoMedio}% a cada curso concluído
                  </span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="block text-[11px] text-muted-foreground">
                  Com os {cursos.length} {cursos.length === 1 ? "curso" : "cursos"}
                </span>
                <span className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {compatibilidadeFinal}%
                </span>
              </div>
            </div>

            {dadosAts.resumoTempoTrilha?.excedeLimiteAviso && (
              <p className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                {dadosAts.resumoTempoTrilha.avisoAmigavelTempo}
              </p>
            )}
          </CardHeader>

          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cursos.map((curso) => (
              <div
                key={curso.id}
                className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
                  curso.concluido
                    ? "border-emerald-500/60 bg-emerald-500/5"
                    : "bg-card"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate font-medium">{curso.instituicao}</span>
                    {curso.cargaHorariaHoras && (
                      <span className="shrink-0 tabular-nums">{curso.cargaHorariaHoras}h</span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold leading-snug text-foreground">
                    {curso.titulo}
                  </h4>

                  <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3.5" strokeWidth={2.5} />
                    {[
                      curso.gratuito ? "Gratuito" : null,
                      curso.emiteCertificado ? "Certificado" : null,
                      curso.modalidade || "Online",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <div className="mt-4 space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {curso.habilidadeCoberta && (
                      <span className="rounded-md bg-orange-500/12 px-2.5 py-1 text-[11px] font-semibold text-orange-700 dark:text-orange-300">
                        Falta: {curso.habilidadeCoberta}
                      </span>
                    )}
                    {curso.ganhoPercentualChance > 0 && (
                      <span className="rounded-md bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        +{curso.ganhoPercentualChance}% de chance
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAlternarCurso(curso.id, curso.concluido)}
                    className={`flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-colors hover:cursor-pointer ${
                      curso.concluido
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-input bg-muted/40 hover:bg-muted"
                    }`}
                  >
                    {curso.concluido ? (
                      <>
                        <Check className="size-3.5" /> Curso concluído
                      </>
                    ) : (
                      "Marcar como concluído"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* CURRÍCULO APERFEIÇOADO PARA ATS (1 PÁGINA A4) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600" />
            <CardTitle className="text-lg">
              Currículo Aperfeiçoado para Filtros ATS (1 Página A4)
            </CardTitle>
          </div>
          <CardDescription>
            Adaptado à vaga selecionada, sem tabelas e sem rótulos de nível (Gupy, LinkedIn e Indeed).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {liberado ? (
            <>
              <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold">
                    Dados pessoais no topo do currículo
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Pré-preenchido com os dados do seu perfil. Baixe a versão completa ou a versão sem dados pessoais.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field>
                    <FieldLabel htmlFor="ats-nome">Nome completo</FieldLabel>
                    <Input
                      id="ats-nome"
                      value={dadosPessoais.nome}
                      onChange={(e) =>
                        setDadosPessoais((p) => ({ ...p, nome: e.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ats-email">E-mail</FieldLabel>
                    <Input
                      id="ats-email"
                      value={dadosPessoais.email}
                      onChange={(e) =>
                        setDadosPessoais((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ats-tel">Telefone</FieldLabel>
                    <Input
                      id="ats-tel"
                      value={dadosPessoais.telefone}
                      onChange={(e) =>
                        setDadosPessoais((p) => ({ ...p, telefone: e.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ats-local">Cidade / UF</FieldLabel>
                    <Input
                      id="ats-local"
                      value={dadosPessoais.localizacao}
                      onChange={(e) =>
                        setDadosPessoais((p) => ({ ...p, localizacao: e.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ats-linkedin">LinkedIn</FieldLabel>
                    <Input
                      id="ats-linkedin"
                      value={dadosPessoais.linkedin}
                      onChange={(e) =>
                        setDadosPessoais((p) => ({ ...p, linkedin: e.target.value }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="ats-portfolio">GitHub / Portfólio</FieldLabel>
                    <Input
                      id="ats-portfolio"
                      placeholder="github.com/seu-usuario"
                      value={dadosPessoais.portfolio}
                      onChange={(e) =>
                        setDadosPessoais((p) => ({ ...p, portfolio: e.target.value }))
                      }
                    />
                  </Field>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewComDados(true)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold hover:cursor-pointer ${
                        previewComDados
                          ? "bg-[#0b1437] text-white dark:bg-blue-500"
                          : "border border-input bg-background hover:bg-muted"
                      }`}
                    >
                      Prévia: Com Dados Pessoais
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewComDados(false)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold hover:cursor-pointer ${
                        !previewComDados
                          ? "bg-[#0b1437] text-white dark:bg-blue-500"
                          : "border border-input bg-background hover:bg-muted"
                      }`}
                    >
                      Prévia: Sem Dados (Cego)
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        baixarCurriculoAtsPdf({
                          textoBase: dadosAts.curriculoOtimizadoAts,
                          comDadosPessoais: true,
                          dados: dadosPessoais,
                          cargoAlvo,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 hover:cursor-pointer"
                    >
                      <Download className="size-3.5" /> Baixar PDF Com Dados
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        baixarCurriculoAtsPdf({
                          textoBase: dadosAts.curriculoOtimizadoAts,
                          comDadosPessoais: false,
                          cargoAlvo,
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1437] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#13265e] dark:bg-blue-500 hover:cursor-pointer"
                    >
                      <FileText className="size-3.5" /> Baixar PDF Sem Dados
                    </button>
                    <button
                      type="button"
                      onClick={copiarTexto}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold hover:bg-muted hover:cursor-pointer"
                    >
                      <Copy className="size-3.5" />
                      {copiado ? "Copiado!" : "Copiar Texto"}
                    </button>
                  </div>
                </div>
              </div>

              <pre className="max-h-[34rem] overflow-auto whitespace-pre-wrap rounded-xl border bg-background p-5 font-sans text-xs leading-relaxed">
                {textoExibido}
              </pre>
            </>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center space-y-2">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                <Lock className="size-5" />
              </div>
              <h4 className="text-sm font-semibold">
                Currículo aperfeiçoado aguardando conclusão da trilha
              </h4>
              <p className="mx-auto max-w-md text-xs text-muted-foreground">
                Conclua os {cursos.length - concluidosCount} curso(s) restante(s) acima para liberar o download do seu currículo ATS de 1 página.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TrilhaECurriculoAts