"use client"

import {
  useEffect,
  useRef,
  type RefObject
} from "react"

import type {
  VisionResult
} from "@/hooks/useVisionTracker"

import {
  criarConversa,
  criarDetector,
  criarLeitor,
  montarResumo,
  regras,
  type Detector,
  type Quem,
  type Resumo
} from "@/lib/comportamento"

type Opcoes = {
  ativo: () => boolean
  quemFala: () => Quem
}

const useComportamento = (visao: RefObject<VisionResult>, opcoes: Opcoes) => {
  const opcoesRef = useRef(opcoes)
  const resumoRef = useRef<(() => Resumo) | null>(null)

  useEffect(() => {
    opcoesRef.current = opcoes
  })

  useEffect(() => {
    const d: Record<string, Detector> = Object.fromEntries(
      regras.map((r) => [r.nome, criarDetector(r.entrar, r.sair, r.minimoMs)])
    )
    const ler = criarLeitor()
    const conversa = criarConversa()
    let inicio = performance.now()
    let estavaAtivo = false

    resumoRef.current = () => montarResumo(d, conversa, inicio, performance.now())

    let id = 0

    const loop = () => {
      const agora = performance.now()
      const { ativo, quemFala } = opcoesRef.current
      const s = ler(visao.current, agora)
      const ligado = ativo()

      if (ligado && !estavaAtivo) {
        for (const detector of Object.values(d)) detector.zerar()
        conversa.zerar()
        inicio = agora
      }
      estavaAtivo = ligado

      for (const r of regras) {
        if (d[r.nome].atualizar(r.ler(s), agora) && !r.silencioso && process.env.NODE_ENV === "development")
          console.log(r.rotulo, d[r.nome].vezes)
      }

      if (ligado) conversa.atualizar(quemFala(), s.olhandoCamera === 1, d.gesticulou.ativo, agora)

      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(id)
      resumoRef.current = null
    }
  }, [visao])

  const getResumo = () => resumoRef.current?.() ?? null

  return { getResumo }
}

export default useComportamento
